# Darak Living — furniture e-commerce (Qatar)

Bilingual (English / Qatari Arabic, RTL) furniture store with a staff dashboard.

| Folder | Stack |
| --- | --- |
| `frontend/` | Next.js 16 (App Router), React 19, Redux Toolkit + RTK Query, Tailwind v4, GSAP |
| `backend/`  | Express 5, TypeScript, MongoDB (Mongoose), Zod, JWT (jose), Nodemailer, Cloudinary |

## Features
- **Store**: animated home, shop with filters/sort/search/pagination (URL based), product gallery with zoom, colours, cart drawer, wishlist, checkout (saved addresses, **Cash on delivery** or **bank transfer** – dummy "XXX Bank"), order success, public order tracking, custom design requests with reference photos, about, contact.
- **Accounts**: register → **email OTP verification**, login, forgot / reset password via OTP, change password, active devices list, sign out one device / everywhere.
- **Security**: JWT access (15 min) + rotating refresh token (7 days) in httpOnly cookies, refresh-token reuse detection, **access-token blacklist on logout**, sessions revoked on password reset, rate limits (login, register, OTP, contact, orders, tracking, uploads + global), CSRF origin check, NoSQL-injection sanitising, Helmet, Zod validation on every input, prices always taken from the database, open-redirect safe `next=` links, upload magic-byte checks.
- **Orders & stock**: stock reserved atomically on checkout (rolled back on failure), released on cancel, every movement logged; validated status flow (pending → confirmed → processing → shipped → delivered / cancelled); emails to customer + admin on every new order and status change; low-stock alert emails.
- **Dashboard** (`/dashboard`, staff & admin): KPIs + 30-day revenue chart, orders (status, tracking, payment), products (bilingual, Cloudinary images, colours, materials, dimensions), categories, inventory (adjust + history), custom design requests (quote + email customer), leads, customers (roles, block).

## Images
Product and room images are 3D renders bundled in `frontend/public/images` (scripts in `tools/renders`). Running `npm run seed` also swaps any old stock-photo links on the sample products for these images.

## Run locally
```bash
# 1. API
cd backend
npm install
cp .env.example .env      # fill in your values (already filled in the delivered copy)
npm run seed              # creates the admin user + sample catalogue (db: darak_store)
npm run dev               # http://localhost:5000/api

# 2. Storefront (new terminal)
cd frontend
npm install
npm run dev               # http://localhost:3000
```
Sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` → you land on `/dashboard`.
Without SMTP settings, emails (OTP codes, order mails) are printed in the API terminal, and in `npm run dev` the code is also shown on the verify page.

## Deploy on Vercel (two projects)
1. **Backend** – root directory `backend`, framework preset **Other**. Add every variable from `backend/.env` (set `NODE_ENV=production`, `CLIENT_URL=https://<your-store>.vercel.app`).
2. **Frontend** – root directory `frontend`, preset **Next.js**. Variables: `BACKEND_URL=https://<your-api>.vercel.app`, `NEXT_PUBLIC_SITE_URL=https://<your-store>.vercel.app`.
3. MongoDB Atlas → Network Access must allow Vercel (`0.0.0.0/0`).
4. Run `npm run seed` once locally against the production database.

The browser only talks to the storefront domain; `/api/*` is proxied to the API, so auth cookies are first-party.
