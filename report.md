# Freshlast Codebase Audit Report

**Date:** 2026-05-11  
**Branch:** main

---

## 1. Project Overview

Freshlast is a student marketplace web app (CMSC 129) where vendors at Carbon Market list discounted, near-expiry produce and customers browse/search them. Frontend is React 19 + Vite 7, routing via React Router DOM 7, auth/DB/storage via Supabase. Backend is FastAPI (Python) with Pydantic models. Vendor auth is Supabase email/password; admin auth is a separate HS256 JWT issued by the FastAPI service.

---

## 2. Implementation Status

| ID        | Description                                      | Status      | Notes                                                                                                                                                                                                                                                                                                                                    |
| --------- | ------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SCRUM-1   | Vendor stall location sharing                    | ⚠️ Partial  | MapPicker, stall image, and map view all work. Schedule display in `MerchantInfo.jsx` is hardcoded fake data — real operating hours/days fetched from API are never rendered.                                                                                                                                                            |
| SCRUM-2   | Vendor creates a listing (picture, price, title) | ✅ Complete | All fields present; image uploads persist to Supabase Storage. Minor: debug `console.log` left in `CreateListing.jsx:34`. Route is unguarded (see bugs).                                                                                                                                                                                 |
| SCRUM-3   | Vendor deletes or edits a listing                | ✅ Complete | Edit, delete, and mark-sold-out all fully wired end-to-end.                                                                                                                                                                                                                                                                              |
| SCRUM-4   | Vendor edits/removes stall location pin          | ✅ Complete | `EditProfile.jsx` pre-populates `MapPicker`; clear-pin button sets `lat=0, lng=0`. Stall name/section editable via `ProfileForm`.                                                                                                                                                                                                        |
| SCRUM-5   | Customer sees discounted/near-expiry produce     | ✅ Complete | Browse list renders correctly. Sold-out listings show a badge; behavior accepted as-is.                                                                                                                                                                                                                                                 |
| SCRUM-6   | Customer views vendor details from listing       | ⚠️ Partial  | `ViewListing` and `ViewMerchant` pages work. Inherited bug: schedule shown to customers is hardcoded placeholder text (SCRUM-106/SCRUM-1).                                                                                                                                                                                               |
| SCRUM-7   | Customer searches/filters produce                | ✅ Complete | Keyword search and category filter work in `OfferList`. Price/discount filter not required for MVP.                                                                                                                                                                                                                                      |
| SCRUM-9   | Vendor login                                     | ✅ Complete | Supabase email/password login, OTP magic link, and forced first-login password change all implemented.                                                                                                                                                                                                                                   |
| SCRUM-22  | Vendor edits profile information                 | ⚠️ Partial  | Stall name, section, phone, hours, days, and stall image update all work. Missing: no UI to edit vendor categories (hardcoded to `"vegetable"` in CreateProfile). No personal name/email edit.                                                                                                                                           |
| SCRUM-45  | Admin creates and deletes vendor accounts        | ⚠️ Partial  | Create and delete both work end-to-end. Bug: `CreateProfile.jsx:69` hardcodes `category: "vegetable"` as a string; backend expects a JSON array — this will throw a 422 on category parsing. Comment in code: "TODO: Hardcoded value for debugging purposes."                                                                            |
| SCRUM-71  | Admin login + dashboard access control           | ✅ Complete | Fixed: replaced `navigate("/")` with `window.location.replace("/")` in `AdminLoginPage.jsx` so App remounts and re-verifies the admin token on login.                                                                                                                                                                                   |
| SCRUM-19  | Supabase auth wired to backend                   | ⚠️ Partial  | Vendor auth is Supabase-only (frontend). Backend non-admin routes (`/api/listings`, `/api/profile`) have **no auth or ownership verification** — any caller with a known UUID can modify any merchant's data.                                                                                                                            |
| SCRUM-35  | Listing images persist to Supabase Storage       | ✅ Complete | Uploads, updates (with old-file cleanup), and deletes all confirmed in `listings.py` and `profile.py`.                                                                                                                                                                                                                                   |
| SCRUM-103 | Filter logic in ViewMerchant page                | ❌ Missing  | `CategoryFilter` components rendered but not wired to any state setter. `setSelectedCategory` is defined but never called. Filter logic references `listing.category` — field does not exist; correct field is `listing.type`. Double broken.                                                                                            |
| SCRUM-104 | Show all merchants screen                        | ❌ Missing  | No customer-facing "browse all merchants" page. `ViewMerchant` is a single-merchant detail page. `AdminDashboard` is admin-only. No `/merchants` route in `App.jsx`.                                                                                                                                                                     |
| SCRUM-105 | Customer-facing map view                         | ❌ Missing  | No standalone map showing all stall locations. Per-listing/per-merchant map views exist in `ViewListing` and `ViewMerchant`, but there is no browse-all-vendors-on-map screen.                                                                                                                                                           |
| SCRUM-106 | Assign schedule for each day                     | ⚠️ Partial  | Backend stores `operating_days`, `start_operating_time`, `end_operating_time`. `ProfileForm` lets vendors set these. But `MerchantInfo.jsx` ignores the fetched data and renders hardcoded placeholder strings. Additionally, the current model supports only one time range for all days — not per-day scheduling as the story implies. |

---

## 3. What's Working

- **Vendor auth flow** — Supabase login, OTP magic link, forced password change on first login, session persistence, logout.
- **Listing CRUD** — Create, edit, delete, and mark-sold-out are fully implemented with Supabase Storage image handling (upload on create, swap on edit, cleanup on delete).
- **Stall location** — MapPicker, stall image upload, clear-pin, read-only map on listing/merchant detail pages.
- **Customer browse** — `OfferList` renders all listings with keyword search and category filter. Expiry countdown display works.
- **Vendor detail pages** — `ViewListing` and `ViewMerchant` load and display merchant info, stall photo, map, and that vendor's listings.
- **Admin account management** — Create vendor (with temp password shown in UI) and delete vendor (with storage cleanup) both work. Dashboard lists all merchants.
- **Image storage** — All images (listing + profile) persist to Supabase Storage. Public URLs stored in DB. Old images cleaned up on update/delete.
- **Profile editing** — Stall name, section, phone, hours, days, stall image all update correctly.

---

## 4. What's Incomplete or Broken

### SCRUM-71 — Admin login redirect (critical)

`AdminLoginPage.jsx` calls `navigate("/")` after successful login. React Router navigation does not remount `App.jsx`, so the `useEffect` that calls `verifyAdminToken()` never re-runs. `isAdmin` stays `false` and the guard at `/admin` redirects to `/` in a loop. Admin must reload the page manually.

**Fix:** Replace `navigate("/")` with `window.location.replace("/")` in `AdminLoginPage.jsx`.

### SCRUM-103 / ViewMerchant filter (two bugs)

- `setSelectedCategory` is defined in `ViewMerchant.jsx` but never called — `CategoryFilter` components have no `onClick` connected to it.
- Even if wired, the filter expression checks `listing.category` (does not exist) instead of `listing.type`.

**Files:** `freshlast/src/pages/ViewMerchant/ViewMerchant.jsx` lines 99, 125.

### SCRUM-106 / SCRUM-1 — Fake schedule in MerchantInfo

`MerchantInfo.jsx` receives `operatingDays`, `operatingHoursStart`, `operatingHoursEnd` as props but renders hardcoded strings ("Monday: 10PM-12AM", "Tuesday: CLOSED", etc.). Every vendor displays the same fake schedule to all customers.

**File:** `freshlast/src/components/MerchantInfo/MerchantInfo.jsx` lines 58–76.

### SCRUM-45 — CreateProfile hardcoded category

`CreateProfile.jsx:69` sets `category: "vegetable"` (a string). The backend `CreateMerchant` Pydantic model expects a `list[Category]` (JSON array). The comment reads "TODO: Hardcoded value for debugging purposes." Will throw a 422 on every admin-initiated vendor creation if category field parsing is strict.

**File:** `freshlast/src/pages/CreateProfile/CreateProfile.jsx` line 69.

### SCRUM-104 / SCRUM-105 — Missing screens

No customer-facing "all merchants" browse page and no customer-facing overview map exist. No routes or components for either.

### SCRUM-19 — Backend routes have no auth/ownership check

`PUT /api/profile/{id}` and all listing endpoints (`POST`, `PATCH`, `DELETE`) accept `merchant_id` as a client-supplied form field with no token verification. Any caller who knows a merchant's UUID can modify their profile or listings.

**Files:** `backend/app/api/listings.py`, `backend/app/api/profile.py`.

### Additional bugs not in Jira

| #   | Bug                                                                                                                                                            | File                              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| 1   | `/create` and `/edit/:id` routes have no auth guard — unauthenticated users can reach them; form fails silently with null `merchantId`                         | `App.jsx` lines 154–155           |
| 2   | `error` state in `Home.jsx` and `ViewMerchant.jsx` is set but never rendered — fetch failures are silently swallowed                                           | `Home.jsx`, `ViewMerchant.jsx`    |
| 3   | "Forgot your password?" button in `AuthForm.jsx` has no `onClick` handler                                                                                      | `AuthForm.jsx`                    |
| 4   | `supabaseAdmin` exported from `supabaseClient.jsx` is never imported anywhere; it's a dead export that pulls `VITE_SUPABASE_SECRET_KEY` into the bundle if set | `supabaseClient.jsx`              |
| 5   | Sold-out and expired listings are returned by `GET /api/listings/all` with no server-side filtering                                                            | `backend/app/api/listings.py`     |
| 6   | Dead imports: `adminLogin` in `App.jsx:17`, `supabase` in `profile.js`, `useNavigate` in `AppHeader.jsx`                                                       | Multiple files                    |
| 7   | Debug `console.log(formData)` left in `CreateListing.jsx:34`                                                                                                   | `CreateListing.jsx`               |
| 8   | ESLint config missing `vitest` globals — 221 ESLint errors, mostly in test files                                                                               | `eslint.config.js`                |
| 9   | `ChangePassword.jsx` uses `for` attribute instead of JSX `htmlFor` on `<label>` elements                                                                       | `ChangePassword.jsx` lines 36, 42 |
| 10  | VendorHeader "🔔 Notifications" button has no implementation                                                                                                   | `VendorHeader.jsx`                |

---

## 5. MVP Readiness

**Verdict: NOT READY**

### Blockers

1. **Admin dashboard inaccessible without page reload** (`AdminLoginPage.jsx`) — the admin cannot get into `/admin` after logging in unless they manually reload. This breaks the admin workflow entirely.

2. **Customer-facing schedule is fake** (`MerchantInfo.jsx`) — every vendor shows the same hardcoded "Monday: 10PM-12AM / Tuesday: CLOSED" schedule. This is a data integrity issue visible to all customers.

3. **ViewMerchant category filter is broken** (`ViewMerchant.jsx`) — wrong field name + disconnected UI. Filter is dead.

4. **CreateProfile hardcoded category** (`CreateProfile.jsx:69`) — admin cannot create a vendor without hitting a 422 if category enum parsing is strict.

5. **SCRUM-104 and SCRUM-105 not started** — no all-merchants page, no overview map. These are listed as MVP requirements in the backlog.

---

## 6. Vercel Deployment Readiness

- [x] **No hardcoded secrets** — `supabaseClient.jsx` and `apiClient.js` use only `import.meta.env.VITE_*` variables. No raw keys in source.
- [x] **Environment variables use `import.meta.env`** — correct for Vite.
- [ ] **`vercel.json` missing** — React Router uses client-side routing. Without a rewrite rule, any direct navigation to `/viewListing/123` returns a 404 on Vercel. **Add `vercel.json`** at repo root:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
  Or configure `freshlast/` as the Vercel root directory and add the rewrite there.
- [x] **Build succeeds** — `npm run build` completes with no errors (1.30s, no missing deps). One warning: main JS chunk is 645 kB (>500 kB), non-blocking but worth splitting for production.
- [x] **No broken imports or missing dependencies** — `package.json` is consistent with all imports.
- [ ] **`VITE_SUPABASE_SECRET_KEY` in `.env.example`** — this variable name starts with `VITE_`, so Vite will embed its value in the public bundle. The `supabaseAdmin` client that uses it is a dead export and never called — but the variable should be removed from `.env.example` and `supabaseClient.jsx` to prevent accidental leakage of a service-role key.

**Deployment blockers:** Missing `vercel.json` (will 404 on direct URL navigation). Everything else is deployable once env vars are configured in Vercel project settings.

---

## 7. Quick Wins

Ordered by impact-to-effort ratio. All estimated under 30 minutes.

| #   | Fix                                                                                                                            | File                                      | Time   |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------ |
| 2   | Add `vercel.json` with SPA rewrite rule at repo root                                                                           | new file                                  | 2 min  |
| 4   | Wire CategoryFilter onClick to `setSelectedCategory` in ViewMerchant                                                           | `ViewMerchant.jsx:125`                    | 15 min |
| 5   | Fix MerchantInfo schedule: render `operatingDays`/`operatingHoursStart`/`operatingHoursEnd` props instead of hardcoded strings | `MerchantInfo.jsx:58–76`                  | 15 min |
| 6   | Add auth guard to `/create` and `/edit/:id` routes                                                                             | `App.jsx:154–155`                         | 5 min  |
| 7   | Remove dead `supabaseAdmin` export and `VITE_SUPABASE_SECRET_KEY`                                                              | `supabaseClient.jsx`                      | 5 min  |
| 8   | Fix `CreateProfile` hardcoded category string → array (add category selector to ProfileForm)                                   | `CreateProfile.jsx:69`, `ProfileForm.jsx` | 25 min |
| 9   | Add `vitest` globals to ESLint config                                                                                          | `eslint.config.js`                        | 5 min  |
| 10  | Remove debug `console.log(formData)`                                                                                           | `CreateListing.jsx:34`                    | 1 min  |
| 11  | Render `error` state in `Home.jsx` and `ViewMerchant.jsx`                                                                      | `Home.jsx`, `ViewMerchant.jsx`            | 10 min |
| 12  | Filter expired + sold-out listings from `GET /api/listings/all`                                                                | `backend/app/api/listings.py`             | 10 min |
