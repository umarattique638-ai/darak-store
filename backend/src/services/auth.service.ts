import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { env, isProd } from "../config/env.js";
import { mailService } from "./mail.service.js";
import { otpService } from "./otp.service.js";
import { User, Session, TokenBlacklist, type Role } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { toSessionDTO, toUserDTO } from "../dto/index.js";
import { sha256, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, type AccessPayload } from "./token.service.js";
import type { ChangePasswordInput, LoginInput, RegisterInput, ResetPasswordInput } from "../validators/auth.validator.js";

export interface ClientMeta { ip: string; userAgent: string }
export interface AuthContext { userId: string; role: Role; sid: string; jti: string; exp: number }

/** A valid hash to compare against when the email doesn't exist (uniform timing). */
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8.Y5Gx6b3xA8kVfF8lQ0bZ5yZrQe1W";
/** Two tabs refreshing at the same moment may present the previous refresh token. */
const ROTATION_GRACE_MS = 15_000;

async function issueTokens(userId: string, role: Role, sid: string) {
  const [access, refresh] = await Promise.all([signAccessToken({ userId, role, sid }), signRefreshToken({ userId, sid })]);
  return { accessToken: access.token, refreshToken: refresh.token, refreshJti: refresh.jti };
}

async function createSession(user: { _id: unknown; role: string }, meta: ClientMeta) {
  const sid = randomUUID();
  const tokens = await issueTokens(String(user._id), user.role as Role, sid);
  await Session.create({
    _id: sid, user: String(user._id), refreshTokenHash: sha256(tokens.refreshJti),
    userAgent: meta.userAgent, ip: meta.ip, expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL * 1000),
  });
  return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
}

/** Sends a verification OTP; in development the code is also returned so you can test without SMTP. */
async function sendVerifyCode(user: { email: string; name: string }) {
  const code = await otpService.issue(user.email, "verify_email");
  await mailService.sendOtp(user.email, user.name, code, "verify_email");
  return isProd ? undefined : code;
}

const revokeAllSessions = (userId: string, reason: string) =>
  Session.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date(), revokedReason: reason });

export const authService = {
  /** Customer sign-up → a 6-digit code is emailed; no session until the email is verified. */
  async register(input: RegisterInput) {
    const existing = await User.findOne({ email: input.email });
    if (existing?.emailVerified) throw ApiError.conflict("An account with this email already exists");
    const password = await bcrypt.hash(input.password, 12);
    const user = existing
      ? Object.assign(existing, { name: input.name, phone: input.phone ?? "", password })
      : new User({ name: input.name, email: input.email, phone: input.phone ?? "", password, role: "customer", emailVerified: false });
    await user.save();
    const devCode = await sendVerifyCode(user).catch((e) => (e instanceof ApiError && e.code === "OTP_COOLDOWN" ? undefined : Promise.reject(e)));
    return { email: user.email, devCode };
  },

  async verifyEmail(email: string, code: string, meta: ClientMeta) {
    await otpService.consume(email, "verify_email", code);
    const user = await User.findOne({ email });
    if (!user) throw ApiError.badRequest("Account not found");
    user.emailVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
    const tokens = await createSession(user, meta);
    return { user: toUserDTO(user), ...tokens };
  },

  /** Same answer whether or not the account exists. */
  async resendVerification(email: string) {
    const user = await User.findOne({ email });
    if (user && !user.emailVerified) return { devCode: await sendVerifyCode(user) };
    return {};
  },

  async login(input: LoginInput, meta: ClientMeta) {
    const user = await User.findOne({ email: input.email }).select("+password");
    const valid = await bcrypt.compare(input.password, user?.password ?? DUMMY_HASH);
    if (!user || !valid) throw ApiError.unauthorized("Incorrect email or password");
    if (user.blocked) throw ApiError.forbidden("This account has been suspended");
    if (!user.emailVerified) {
      const devCode = await sendVerifyCode(user).catch(() => undefined);
      throw new ApiError(403, "Please verify your email — we sent you a new code", "EMAIL_NOT_VERIFIED", devCode ? { devCode } : undefined);
    }
    user.lastLoginAt = new Date();
    await user.save();
    const tokens = await createSession(user, meta);
    return { user: toUserDTO(user), ...tokens };
  },

  /** Always succeeds from the caller's point of view (no account enumeration). */
  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user || user.blocked) return {};
    try {
      const code = await otpService.issue(email, "reset_password");
      await mailService.sendOtp(email, user.name, code, "reset_password");
      return { devCode: isProd ? undefined : code };
    } catch (e) {
      if (e instanceof ApiError && e.code === "OTP_COOLDOWN") throw e;
      throw e;
    }
  },

  /** Verifies the OTP, sets the new password and signs out every device. */
  async resetPassword(input: ResetPasswordInput) {
    await otpService.consume(input.email, "reset_password", input.code);
    const user = await User.findOne({ email: input.email });
    if (!user) throw ApiError.badRequest("Account not found");
    user.set({ password: await bcrypt.hash(input.password, 12), passwordChangedAt: new Date(), emailVerified: true });
    await user.save();
    await revokeAllSessions(String(user._id), "password_reset");
  },

  async changePassword(ctx: AuthContext, input: ChangePasswordInput) {
    const user = await User.findById(ctx.userId).select("+password");
    if (!user || !(await bcrypt.compare(input.currentPassword, user.password))) throw ApiError.badRequest("Current password is incorrect");
    user.set({ password: await bcrypt.hash(input.newPassword, 12), passwordChangedAt: new Date() });
    await user.save();
    // keep this device signed in, sign out all others
    await Session.updateMany({ user: ctx.userId, revokedAt: null, _id: { $ne: ctx.sid } }, { revokedAt: new Date(), revokedReason: "password_changed" });
  },

  /** Refresh-token rotation with reuse detection: a replayed token revokes the session. */
  async refresh(refreshToken: string | undefined, meta: ClientMeta) {
    if (!refreshToken) throw ApiError.unauthorized("Session expired, please log in again");
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) throw ApiError.unauthorized("Session expired, please log in again");

    const session = await Session.findById(payload.sid);
    if (!session || session.revokedAt || session.expiresAt < new Date()) throw ApiError.unauthorized("Session has ended, please log in again");

    const presented = sha256(payload.jti);
    const inGrace = session.previousTokenHash === presented && !!session.rotatedAt && Date.now() - session.rotatedAt.getTime() < ROTATION_GRACE_MS;
    if (session.refreshTokenHash !== presented && !inGrace) {
      session.revokedAt = new Date();
      session.revokedReason = "refresh_token_reuse";
      await session.save();
      throw ApiError.unauthorized("Session was invalidated for security reasons, please log in again");
    }

    const user = await User.findById(payload.sub).lean();
    if (!user || user.blocked) throw ApiError.unauthorized("Account is not available");

    const tokens = await issueTokens(String(user._id), user.role as Role, payload.sid);
    await Session.updateOne(
      { _id: payload.sid },
      { $set: { refreshTokenHash: sha256(tokens.refreshJti), previousTokenHash: session.refreshTokenHash, rotatedAt: new Date(), lastUsedAt: new Date(), ip: meta.ip, userAgent: meta.userAgent } },
    );
    return { user: toUserDTO(user), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
  },

  /** Blacklists the access token's jti until expiry and revokes the session. */
  async logout(tokens: { accessToken?: string; refreshToken?: string }) {
    const access = tokens.accessToken ? await verifyAccessToken(tokens.accessToken) : null;
    const refresh = !access && tokens.refreshToken ? await verifyRefreshToken(tokens.refreshToken) : null;
    if (access) {
      await TokenBlacklist.updateOne(
        { jti: access.jti },
        { $setOnInsert: { jti: access.jti, user: access.sub, reason: "logout", expiresAt: new Date(access.exp * 1000) } },
        { upsert: true },
      );
    }
    const sid = access?.sid ?? refresh?.sid;
    if (sid) await Session.updateOne({ _id: sid, revokedAt: null }, { revokedAt: new Date(), revokedReason: "logout" });
  },

  async logoutAll(ctx: AuthContext) {
    await TokenBlacklist.updateOne(
      { jti: ctx.jti },
      { $setOnInsert: { jti: ctx.jti, user: ctx.userId, reason: "logout_all", expiresAt: new Date(ctx.exp * 1000) } },
      { upsert: true },
    );
    const res = await revokeAllSessions(ctx.userId, "logout_all");
    return { revoked: res.modifiedCount };
  },

  /** Signature + expiry, then blacklist and active-session checks on every request. */
  async authenticate(token: string | undefined): Promise<AuthContext> {
    if (!token) throw ApiError.unauthorized();
    const payload: AccessPayload | null = await verifyAccessToken(token);
    if (!payload) throw ApiError.unauthorized("Access token is invalid or expired");
    const [blacklisted, session] = await Promise.all([
      TokenBlacklist.exists({ jti: payload.jti }),
      Session.findById(payload.sid).select("revokedAt expiresAt").lean(),
    ]);
    if (blacklisted) throw ApiError.unauthorized("Token has been revoked");
    if (!session || session.revokedAt || session.expiresAt < new Date()) throw ApiError.unauthorized("Session has ended");
    return { userId: payload.sub, role: payload.role, sid: payload.sid, jti: payload.jti, exp: payload.exp };
  },

  async me(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) throw ApiError.notFound("User not found");
    return toUserDTO(user);
  },

  async listSessions(ctx: AuthContext) {
    const sessions = await Session.find({ user: ctx.userId, revokedAt: null, expiresAt: { $gt: new Date() } }).sort({ lastUsedAt: -1 }).lean();
    return sessions.map((s) => toSessionDTO(s, ctx.sid));
  },

  async revokeSession(ctx: AuthContext, sid: string) {
    const res = await Session.updateOne({ _id: sid, user: ctx.userId, revokedAt: null }, { revokedAt: new Date(), revokedReason: "revoked_by_user" });
    if (res.matchedCount === 0) throw ApiError.notFound("Session not found");
  },
};
