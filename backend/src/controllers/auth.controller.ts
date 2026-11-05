import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { getAccessToken } from "../middlewares/auth.middleware.js";
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from "../utils/cookies.js";
import { clientMeta } from "../utils/request.js";
import { ok, created } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";

/** Only redirect back to our own pages. */
const safeNext = (v: unknown) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/account");

export const authController = {
  async register(req: Request, res: Response) {
    created(res, { ...(await authService.register(req.body)), message: "Account created — enter the code we emailed you." });
  },
  async verifyEmail(req: Request, res: Response) {
    const { user, ...tokens } = await authService.verifyEmail(req.body.email, req.body.code, clientMeta(req));
    setAuthCookies(res, tokens);
    ok(res, { user });
  },
  async resendVerification(req: Request, res: Response) {
    ok(res, { ...(await authService.resendVerification(req.body.email)), message: "If the account needs verifying, a new code is on its way." });
  },
  async login(req: Request, res: Response) {
    const { user, ...tokens } = await authService.login(req.body, clientMeta(req));
    setAuthCookies(res, tokens);
    ok(res, { user });
  },
  async forgotPassword(req: Request, res: Response) {
    ok(res, { ...(await authService.forgotPassword(req.body.email)), message: "If an account exists for that email, a reset code is on its way." });
  },
  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body);
    clearAuthCookies(res);
    ok(res, { message: "Password updated — you can sign in now." });
  },
  async changePassword(req: Request, res: Response) {
    await authService.changePassword(req.auth!, req.body);
    ok(res, { message: "Password changed. Other devices were signed out." });
  },
  async refresh(req: Request, res: Response) {
    try {
      const { user, ...tokens } = await authService.refresh(req.cookies?.[REFRESH_COOKIE] ?? req.body?.refreshToken, clientMeta(req));
      setAuthCookies(res, tokens);
      ok(res, { user });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) clearAuthCookies(res);
      throw err;
    }
  },
  /** GET /refresh?next=/account — rotate during a page visit, then bounce back. */
  async refreshAndRedirect(req: Request, res: Response) {
    const next = safeNext(req.query.next);
    try {
      const tokens = await authService.refresh(req.cookies?.[REFRESH_COOKIE], clientMeta(req));
      setAuthCookies(res, tokens);
      res.redirect(303, next);
    } catch {
      clearAuthCookies(res);
      res.redirect(303, `/login?next=${encodeURIComponent(next)}`);
    }
  },
  async logout(req: Request, res: Response) {
    await authService.logout({ accessToken: getAccessToken(req), refreshToken: req.cookies?.[REFRESH_COOKIE] });
    clearAuthCookies(res);
    ok(res, { loggedOut: true });
  },
  async logoutAll(req: Request, res: Response) {
    const r = await authService.logoutAll(req.auth!);
    clearAuthCookies(res);
    ok(res, r);
  },
  async me(req: Request, res: Response) {
    ok(res, { user: await authService.me(req.auth!.userId) });
  },
  async sessions(req: Request, res: Response) {
    ok(res, { sessions: await authService.listSessions(req.auth!) });
  },
  async revokeSession(req: Request<{ id: string }>, res: Response) {
    await authService.revokeSession(req.auth!, req.params.id);
    ok(res, { revoked: true });
  },
};
