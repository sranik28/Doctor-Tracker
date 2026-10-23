# Deploying Doctor Tracker

Three pieces: **MongoDB Atlas** (database), the **API** (`/server`, Docker) on Render, Railway or Coolify, and the **client** (`/client`) on Vercel.

```
Browser ──► Vercel (Next.js) ──/api/* rewrite──► API (Docker) ──► MongoDB Atlas
```

The browser only ever talks to the Vercel domain. Vercel proxies `/api/*` to the API, so the
auth cookies are set on the Vercel domain (first-party) and no CORS preflight is involved.

Deploy in this order: **Atlas → API → client → seed**.

---

## 1. MongoDB Atlas

1. Create a free **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → _Add New Database User_: password authentication, a strong password,
   built-in role **Read and write to any database** (or `readWrite` on `doctor-tracker` only).
3. **Network Access** → _Add IP Address_:
   - Render/Railway/Vercel have no fixed outbound IPs on free tiers, so use **`0.0.0.0/0`**
     (allow from anywhere). The database user's password is then the only gate, so make it
     long and random. If your platform offers static outbound IPs, allow only those.
4. **Connect** → _Drivers_ → copy the connection string and add the database name:

   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/doctor-tracker?retryWrites=true&w=majority
   ```

   URL-encode special characters in the password (`@` → `%40`, `/` → `%2F`, …).

Indexes are created by the seed scripts (`syncIndexes`). The API runs with `autoIndex` **off** in
production, so seed (or run `syncIndexes`) at least once before serving real traffic.

---

## 2. API (Docker) — Render, Railway or Coolify

The image is built from [`server/Dockerfile`](server/Dockerfile): multi-stage, production
dependencies only, runs as a non-root user, listens on `PORT` (default `5000`), has a
`HEALTHCHECK`, and shuts down gracefully on `SIGTERM`.

### Environment variables

| Variable                   | Value                                                                      |
| -------------------------- | -------------------------------------------------------------------------- |
| `NODE_ENV`                 | `production` (already set in the image)                                    |
| `PORT`                     | leave to the platform; the image defaults to `5000`                        |
| `MONGODB_URI`              | the Atlas connection string from step 1                                    |
| `JWT_ACCESS_SECRET`        | random, 32+ chars                                                          |
| `JWT_REFRESH_SECRET`       | random, 32+ chars, **different** from the access secret                    |
| `ACCESS_TOKEN_EXPIRES_IN`  | `15m`                                                                      |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d`                                                                       |
| `CLIENT_URL`               | your Vercel URL, exactly, no trailing slash: `https://your-app.vercel.app` |
| `COOKIE_DOMAIN`            | **leave empty** (see note below)                                           |
| `TRUST_PROXY`              | `1` to start (see note below)                                              |

Generate each secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The server **refuses to start** if a variable is missing or invalid, if the two JWT secrets are
equal, or (in production) if a secret is still the `replace-with…` placeholder from `.env.example`.

### Platform settings

- **Render**: _New → Web Service_ → connect the repo → _Runtime: Docker_, **Root Directory**
  `server`, **Health Check Path** `/api/health`. Add the variables above.
- **Railway**: _New Project → Deploy from GitHub_ → set **Root Directory** to `server`
  (it detects the Dockerfile). Add the variables; generate a public domain. Health check path
  `/api/health`.
- **Coolify**: _New Resource → Public/Private Repository_, **Build Pack: Dockerfile**,
  **Base Directory** `/server`, **Ports Exposes** `5000`, health check path `/api/health`.

Check it: `curl https://<api-url>/api/health` → `{"success":true,"data":{"status":"ok"}}`.

> `/api/health` is a **liveness** check: it answers as long as the process is up and does not
> touch the database, so a database outage restarts nothing. Watch the logs for `[db]` lines.

### Notes

- **`COOKIE_DOMAIN` stays empty.** Express sets the cookies on its response; Vercel forwards
  them to the browser, which stores them for the _Vercel_ domain. A `COOKIE_DOMAIN` pointing at
  the API's domain would make the browser reject them.
- **`TRUST_PROXY`** is the number of proxies in front of Express whose `X-Forwarded-For` entry is
  trusted. It decides which IP the login rate limiter sees. With Vercel _and_ the platform's own
  proxy in front, the real client IP can be further left in the header; if every user appears to
  share one IP (the per-IP limit triggers too easily), raise it to `2`. The per-account login
  limit protects regardless of this setting.
- API responses are sent `Cache-Control: no-store` and gzip-compressed.

---

## 3. Client (Vercel)

1. _Add New → Project_ → import the repo → **Root Directory** `client` (framework: Next.js).
2. **Environment Variables** (Production **and** Preview):

   | Variable           | Value                                                                               |
   | ------------------ | ----------------------------------------------------------------------------------- |
   | `API_INTERNAL_URL` | your API's public URL, no trailing slash: `https://doctor-tracker-api.onrender.com` |

3. Deploy.

> **`API_INTERNAL_URL` is read at build time.** Next.js bakes the rewrite destination into the
> build (`.next/routes-manifest.json`), so the variable must exist _before_ the build runs, and
> **changing the API URL requires a redeploy**. If it is missing, `next build` prints a warning
> and the app proxies `/api/*` to `http://localhost:5000`, which fails in production.

There is no `NEXT_PUBLIC_*` variable: the browser always calls the relative `/api`.

---

## 4. Seed the production database

The API image contains only production dependencies, so seed **from your machine** against
Atlas (your IP must be allowed in Atlas _Network Access_, or temporarily use `0.0.0.0/0`):

```bash
cd server
cp .env.example .env
# edit .env: set MONGODB_URI to the Atlas string, and a REAL SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
npm install
npm run seed            # creates indexes + the admin user (safe to re-run)
npm run seed:demo       # optional: ~30 doctors and ~1,500 patients of demo data
```

Re-running `npm run seed:demo` does nothing if demo data exists; `npm run seed:demo -- --reset`
replaces only the demo records (doctors on `@demo.doctortracker.dev` and their patients), never
real ones. **Don't leave a default password on a public deployment**: use a strong
`SEED_ADMIN_PASSWORD`.

To check the query plans on the production data:

```bash
npm run explain
```

---

## 5. Smoke test

1. Open the Vercel URL → you're redirected to `/login`.
2. Sign in with the seeded admin → the dashboard loads its charts.
3. DevTools → Application → Cookies: `accessToken` and `refreshToken` are on the **Vercel**
   domain, `HttpOnly`, `Secure`.
4. Add a doctor and a patient; delete the patient.
5. Wait 15 minutes (or shorten `ACCESS_TOKEN_EXPIRES_IN` once to test) and click around: the
   session refreshes silently with no redirect to `/login`.

## Troubleshooting

| Symptom                                                  | Likely cause                                                                |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| Every API call fails, network tab shows `localhost:5000` | `API_INTERNAL_URL` wasn't set at build time; set it and redeploy            |
| Login returns 200 but you're sent back to `/login`       | `COOKIE_DOMAIN` set, or the site isn't served over HTTPS (`Secure` cookies) |
| API exits immediately on start                           | a required env var is missing or invalid; the log lists each one            |
| `ECONNREFUSED` / timeouts to Mongo                       | Atlas _Network Access_ doesn't allow the API's IP                           |
| Login limited too early for everyone                     | `TRUST_PROXY` too low (all users share one IP); raise it                    |
