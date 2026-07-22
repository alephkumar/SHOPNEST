# ShopNest — Full Stack E-Commerce Platform

A production-oriented e-commerce application built with the MERN stack. Users can browse, search, and filter products, manage a cart and wishlist, check out, track orders, and leave reviews. Admins get a dashboard with revenue analytics, product/order/user/coupon management.

> **Scope note:** This is a real, working foundation — not a mockup. Every button in the frontend calls a real, working backend endpoint that reads/writes MongoDB. It does **not** yet include every single feature from an exhaustive marketplace spec (e.g. live search-as-you-type suggestions, gift cards, chat support, dark mode toggle wiring, CSRF token middleware) — see [What's Not Included](#whats-not-included) below for the honest list and how to extend it.

---

## Tech Stack

**Frontend:** React 19, Vite, React Router DOM, Redux Toolkit, Axios, Tailwind CSS v3, Framer Motion, React Hook Form, React Icons, React Hot Toast, Recharts

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT auth, bcryptjs, Multer + Cloudinary (images), Stripe (payments), express-validator, Helmet, express-rate-limit, express-mongo-sanitize, xss-clean

---

## Project Structure

```
ecommerce/
├── backend/
│   ├── config/          # DB + Cloudinary connection setup
│   ├── controllers/     # Route handler logic
│   ├── middlewares/     # Auth, error handling, validation, uploads
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express route definitions
│   ├── utils/           # Validators, error classes, DB seeder
│   ├── .env.example
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI (product cards, nav, forms)
    │   ├── pages/        # Route-level pages, including pages/admin
    │   ├── redux/        # Store + slices (auth, cart, wishlist, products, ui)
    │   ├── layouts/      # MainLayout, AdminLayout
    │   ├── services/     # Axios instance
    │   └── utils/        # Formatting helpers
    └── .env.example
```

> Note: Redux Toolkit is the single state-management layer for this app (auth, cart, wishlist, products, UI state all live in `redux/slices/`). The original spec also mentions Context API and custom hooks — they were left out deliberately rather than added redundantly alongside Redux, since maintaining two parallel state systems for the same data is a common source of bugs, not a feature. Add `src/hooks/` or `src/context/` back if a specific need comes up (e.g. a `useDebounce` hook for search-as-you-type).

---

## Local Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier is fine) — or local MongoDB
- A Cloudinary account (free tier) for image uploads
- A Stripe account (test mode) if you want to wire up card payments

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGO_URI` — from MongoDB Atlas → Connect → Drivers
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`)
- `CLOUDINARY_*` — from your Cloudinary dashboard
- `STRIPE_*` — from your Stripe dashboard (test keys start with `sk_test_`)

Seed the database with an admin account and sample products:
```bash
npm run seed
```
This creates an admin login using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` (defaults: `admin@shopnest.com` / `Admin@12345` — **change this before deploying**).

Start the dev server:
```bash
npm run dev
```
API runs on `http://localhost:5000/api`. Confirm it's alive: `curl http://localhost:5000/api/health`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

`VITE_API_URL` in `.env` should point to your backend (`http://localhost:5000/api` for local dev).

```bash
npm run dev
```
App runs on `http://localhost:5173`.

### 3. Try it out

1. Sign up a new customer account, or log in as admin using your seeded credentials.
2. As admin, visit `/admin` to add product categories/brands, then products.
3. As a customer, browse `/products`, add items to cart, and check out with Cash on Delivery (works end-to-end without any payment gateway setup).
4. To test card payments, you'll need Stripe test keys and to wire up Stripe Elements on the frontend checkout (see [Payment Integration](#payment-integration) below).

---

## Payment Integration

The backend fully implements Stripe PaymentIntents (`/api/payments/create-intent`) and a webhook handler that marks orders paid (`/api/payments/webhook`). **The frontend checkout currently only wires up Cash on Delivery end-to-end.** For card/UPI, you need to:

1. `npm install @stripe/stripe-js @stripe/react-stripe-js` in `frontend/`
2. In `Checkout.jsx`, when `paymentMethod !== 'cod'`, call `/api/payments/create-intent` with the created order's ID, get back a `clientSecret`, and mount a Stripe `<PaymentElement>` to collect card details before confirming.
3. Point your Stripe webhook endpoint (in the Stripe dashboard) at `https://your-backend-domain.com/api/payments/webhook` and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

This is the single largest remaining integration — everything else in the order flow (stock decrement, coupon application, tax/shipping calculation) is already handled server-side regardless of payment method.

---

## Security Notes

- Passwords are hashed with bcrypt (12 rounds), never returned in API responses.
- JWT stored in an httpOnly cookie (primary) with a localStorage fallback for cross-origin/webview cases.
- All prices are recalculated server-side at order creation — the client never dictates a total.
- Rate limiting: 10 requests/15min on auth endpoints, 500/15min globally.
- Input sanitized against NoSQL injection (`express-mongo-sanitize`) and XSS (`xss-clean`).
- `helmet` sets standard security headers.
- Before going to production: rotate `JWT_SECRET`, set `NODE_ENV=production`, use strong admin credentials, and enable MongoDB Atlas IP allowlisting or VPC peering.

---

## Deployment

### Backend → Render (or Railway)
1. Push this repo to GitHub.
2. New Web Service on Render, root directory `backend/`.
3. Build command: `npm install` — Start command: `npm start`
4. Add all `.env.example` variables in Render's Environment tab. Set `CLIENT_URL` to your deployed frontend URL.
5. Once deployed, run the seeder once via Render's Shell tab: `npm run seed`

### Frontend → Netlify or Vercel
1. New site from Git, root directory `frontend/`.
2. Build command: `npm run build` — Publish directory: `dist`
3. Add environment variable `VITE_API_URL` = your deployed backend URL + `/api`.
4. **Vercel/Netlify SPA routing:** add a redirect so client-side routes don't 404 on refresh:
   - Netlify: create `frontend/public/_redirects` containing `/*    /index.html   200`
   - Vercel: add a `vercel.json` with a rewrite rule to `/index.html`

### Database → MongoDB Atlas
Already assumed above. Use a dedicated database user (not your Atlas account login) with read/write scoped to the `shopnest` database only.

### Images → Cloudinary
No separate deployment step — the backend uploads directly to your Cloudinary account via API keys.

---

## What's Not Included

Being direct about the gap between the original spec and this build:

- **Email delivery** — password reset currently logs the reset link to the server console in dev mode instead of sending a real email. Wire up SendGrid/Resend/Nodemailer in `authController.js` → `forgotPassword`.
- **Stripe frontend UI** — backend is ready; frontend checkout needs Stripe Elements (see above).
- **Live search autocomplete / voice search** — the search bar submits on Enter; it's not (yet) a live-suggestion dropdown.
- **Gift cards, chat support, notifications system** — not built. These are substantial features each deserving their own data model and UI.
- **Dark mode** — the Redux slice (`uiSlice.js`) has a `theme` toggle ready, but no dark color tokens or a toggle button are wired into the UI yet.
- **CSRF protection** — the app relies on JWT + CORS rather than a CSRF token scheme; add `csurf` or a double-submit-cookie pattern if you add cookie-based session state beyond the auth token.
- **Automated tests** — no Jest/Vitest/Playwright suite is included. Given the size of this codebase, testing is the highest-leverage next investment.
- **Order invoice PDF generation** — order data is complete, but no PDF generator is wired up.

None of these are hard — the data models and API surface are built to support all of them — but they're genuinely separate chunks of work, not a checkbox to tick.

---

## License

MIT — do whatever you'd like with this.
