# Freshlast – Codebase Reference

## Product Overview

**Freshlast** is a web app for vendors in a local market (based in Cebu City, Philippines)
to list items that are near-expiry or have cosmetic defects but are still consumable, selling
them at a discount. Regular users (buyers) browse listings anonymously — no account needed.
Only **vendors** and **admins** authenticate.

---

## Architecture

```
[Browser: React/Vite]
    |-- Supabase JS SDK  (auth, direct DB reads for profile completeness check)
    |-- axios apiClient  --> [FastAPI backend]
                                  |-- supabase-py  --> [Supabase: Postgres + Auth + Storage]
```

Three layers:

| Layer | Tech | Location |
|---|---|---|
| Frontend | React 18, Vite, React Router v6, axios | `freshlast/` |
| Backend | Python, FastAPI, Pydantic v2, supabase-py | `backend/` |
| Platform | Supabase (Postgres, Auth, Storage bucket `media`) | `supabase/` |

---

## User Roles

| Role | Auth? | Can Do |
|---|---|---|
| Buyer/Public | No | Browse and search all listings |
| Vendor | Yes (email+password) | Manage own listings, edit own profile |
| Admin | Yes (same auth, access via `/admin` route) | Create/delete vendor accounts |

> **Note:** There is no role-based access control enforced server-side beyond using the
> admin Supabase client for admin endpoints. The `/admin` route in the frontend is accessible
> to any logged-in user via the `VendorHeader` gear icon — this is an **open security gap**.

---

## Environment Variables

### Backend (`backend/app/.env`)

| Key | Description |
|---|---|
| `DATABASE_URL` | Supabase project URL |
| `SECRET_KEY` | Supabase service role (secret) key |
| `ORIGINS` | Space-separated CORS allowed origins |

### Frontend (`freshlast/.env`)

| Key | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase anon (public) key |
| `VITE_SUPABASE_SECRET_KEY` | Supabase service role key (used for `supabaseAdmin` client) |
| `VITE_API_BASE_URL` | FastAPI base URL |

---

## Database Tables (Supabase/Postgres)

### `merchant`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Same UUID as `auth.users.id` |
| `name` | text | Stall name |
| `latitude` | float | Currently hardcoded to `0` (TODO) |
| `longitude` | float | Currently hardcoded to `0` (TODO) |
| `location` | text | Human-readable location/section |
| `location_photo` | text | Public URL to image in `media` bucket |
| `start_operating_time` | time | |
| `end_operating_time` | time | |
| `operating_days` | text[] | Array of short day codes: `Mon`, `Tue`, etc. |

> The `profiles` table is also referenced directly from the frontend via the Supabase SDK
> to check `stall_name`, `market_location`, and `phone_number` for profile completion.
> `phone_number` is collected in the frontend form but is **not** part of the backend
> `Merchant` Pydantic model or any API endpoint — this is an **inconsistency**.

### `listing`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Auto-generated |
| `merchant_id` | uuid | FK to `merchant.id` |
| `name` | text | Product name |
| `original_price` | float | |
| `discounted_price` | float | Must be less than `original_price` (frontend-validated) |
| `image` | text | Public URL in `media` bucket, nullable |
| `unit` | text | e.g. `kg`, `pcs` |
| `quantity` | int | |

### Supabase Storage Bucket: `media`

- Public bucket.
- Path convention for profile photos: `{merchant_id}/profile/{uuid}`
- Path convention for listing images: `{merchant_id}/listings/{uuid}`
- Backend handles upload, URL retrieval, and cleanup (old image deleted on update).

---

## Backend API Routes

Base prefix: `/api`

### Listings (`/api/listings`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/listings` | Create a listing (multipart form, optional image) |
| `GET` | `/listings/all` | Get all listings (public feed) |
| `GET` | `/listings?merchant_id=` | Get listings for a specific merchant |
| `GET` | `/listings/{listing_id}` | Get a single listing |
| `PUT` | `/listings/{listing_id}` | Update a listing (replaces image if new one provided) |
| `DELETE` | `/listings/{listing_id}` | Delete a listing (also removes image from storage) |

### Profile (`/api/profile`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/profile/{id}` | Get merchant details |
| `PUT` | `/profile/{id}` | Update merchant details (replaces image if new one provided) |

### Admin (`/api/admin`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/admin/create` | Create a new vendor account (generates temp password, returns credentials) |
| `DELETE` | `/admin/delete/{id}` | Delete a vendor account and all their storage files |

> Admin endpoints use `supabase_admin` client (service role), but there is **no auth middleware**
> protecting these routes on the backend. Anyone who knows the URL can call them.

---

## Frontend Routes

| Path | Component | Access |
|---|---|---|
| `/` or `/offers` | `OfferList` | Public |
| `/dashboard` | `Home` | Vendor only (redirects to `/` if not logged in, to `/profile` if profile incomplete) |
| `/profile` | `EditProfile` | Vendor only (redirects to `/` if not logged in) |
| `/create` | `CreateListing` | Unguarded (no redirect) |
| `/edit/:id` | `CreateListing` (edit mode) | Unguarded (no redirect) |
| `/changePass` | `ChangePassword` | Unguarded |
| `/admin` | `AdminDashboard` | Unguarded (no redirect) |
| `/createProfile` | `CreateProfile` | Unguarded (no redirect) |

> Several routes that should be protected are **not guarded** in the router
> (see `/create`, `/admin`, `/createProfile`).

---

## Auth Flow

1. All auth is handled via **Supabase Auth** (email+password only).
2. The `App.jsx` root component manages session state globally.
3. On every auth state change, two checks run:
   - `checkPasswordFlag` — if `user.user_metadata.password_changed === false`, the vendor is
     forced to the `ChangePassword` screen before anything else.
   - `checkProfileComplete` — checks if the `profiles` table row has `stall_name`,
     `market_location`, and `phone_number`. If incomplete, `/dashboard` redirects to `/profile`.
4. When an admin creates a vendor account via `POST /api/admin/create`:
   - A Supabase Auth user is created with `email_confirm: true` and an auto-generated 8-char password.
   - The temp password is returned in the API response (the admin is expected to hand it to the vendor).
   - The `password_changed` metadata flag is **not** set to `false` on account creation — so the forced
     password-change screen will **not trigger** for new accounts unless this flag is explicitly set.
5. Password change is done entirely client-side via `supabase.auth.updateUser`.

---

## Key Frontend Components

| Component | File | Purpose |
|---|---|---|
| `OfferList` | `pages/OfferList/OfferList.jsx` | Public landing page; search + category filter; login modal trigger |
| `Home` | `pages/Home/Home.jsx` | Vendor dashboard; lists own listings with Edit button |
| `CreateListing` | `pages/CreateListing/CreateListing.jsx` | Dual-mode (create/edit) listing form |
| `EditProfile` | `pages/EditProfile/EditProfile.jsx` | Vendor edits their own profile |
| `CreateProfile` | `pages/CreateProfile/CreateProfile.jsx` | Admin creates a new vendor profile |
| `AdminDashboard` | `pages/AdminDashboard/AdminDashboard.jsx` | Placeholder UI; currently shows hardcoded "User 1–4" |
| `ChangePassword` | `pages/ChangePassword/ChangePassword.jsx` | First-login forced password reset |
| `AuthModal` | `components/AuthModal/AuthModal.jsx` | Modal wrapper around `AuthForm` |
| `AuthForm` | `components/AuthForm/AuthForm.jsx` | Email+password sign-in form |
| `ProfileForm` | `components/ProfileForm/ProfileForm.jsx` | Shared form for create/edit vendor profile |
| `ListingForm` | `components/ListingForm/ListingForm.jsx` | Listing create/edit form fields |
| `ListingItem` | `components/ListingItem/ListingItem.jsx` | Single listing card (shows Edit button for vendor view) |
| `VendorHeader` | `components/VendorHeader/VendorHeader.jsx` | Top nav for authenticated vendor pages; links to admin dashboard |

---

## Known Issues / TODOs

| Location | Issue |
|---|---|
| `CreateProfile.jsx` L65-66 | Calls `onSave?.()` and `navigate()` but neither `onSave` nor `navigate` are defined in scope — will crash on success |
| `EditProfile.jsx` L77-78 | `latitude` and `longitude` are hardcoded to `0` — map integration is pending |
| `CreateProfile.jsx` L47-48 | Same — lat/lng hardcoded to `0` |
| `EditProfile.jsx` L18-19 | `emailAddress` and `password` fields in `formData` are noted as TODO to remove |
| `AdminDashboard.jsx` | Entirely placeholder — user list is hardcoded; no real API calls |
| `OfferList.jsx` L25 | `CATEGORIES` filter includes `Vegetables`, `Fruits`, `Others` but the `listing` table has no `category` column — filter will never match anything |
| `backend/app/core/supabase.py` | `supabase` and `supabase_admin` are created from the same credentials — no actual distinction between clients |
| Auth | No server-side protection on admin or vendor-only routes |
| Auth | `password_changed` flag not set to `false` on account creation, so forced password change may not trigger for new vendor accounts |
| `AuthForm.jsx` | "Forgot password" button has no handler |

---

## Testing

- Tests run against a **local Supabase instance** (`npx supabase start`).
- Test env: `backend/tests/.env.test` (copy from `tests/.env.test.example`).
- `conftest.py` seeds a merchant (`11111111-1111-1111-1111-111111111111`) before the suite
  and cleans up any records not in `SEEDED_IDS` after each individual test.
- Test files:
  - `backend/tests/api/test_admin.py` — create/delete merchant tests
  - `backend/tests/api/test_profile.py` — get/update merchant tests
- Run with: `pytest` from `backend/` with the venv activated.

---

## File Map

```
Tarnished/
├── README.md
├── AUDIT.md
├── CODEBASE.md                # this file
├── package.json               # root — only contains supabase CLI dev dep
├── supabase/
│   ├── config.toml
│   ├── seed.sql               # seeds dummy merchant for local dev/test
│   └── migrations/
│       └── 20260326034212_remote_schema.sql
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, router registration, CORS
│   │   ├── core/
│   │   │   ├── config.py      # pydantic-settings Config (reads .env)
│   │   │   └── supabase.py    # supabase + supabase_admin clients
│   │   ├── api/
│   │   │   ├── listings.py    # CRUD for listings
│   │   │   ├── profile.py     # GET/PUT for merchant profile
│   │   │   └── admin.py       # POST create / DELETE delete merchant
│   │   └── models/
│   │       ├── listing.py     # Listing pydantic model
│   │       ├── profile.py     # Merchant pydantic model
│   │       ├── admin.py       # CreateMerchantRequestPayloadModel
│   │       └── enums/
│   │           └── weekday.py # Weekday enum (Sun–Sat short codes)
│   └── tests/
│       ├── conftest.py        # fixtures: supabase_local, client, cleanup
│       └── api/
│           ├── test_admin.py
│           └── test_profile.py
└── freshlast/
    ├── src/
    │   ├── main.jsx           # React entry point
    │   ├── App.jsx            # Root: session state, auth checks, routing
    │   ├── lib/
    │   │   ├── supabaseClient.jsx  # supabase + supabaseAdmin browser clients
    │   │   └── apiClient.js        # axios instance pointing to VITE_API_BASE_URL
    │   ├── api/               # thin wrappers over apiClient
    │   │   ├── listings.js
    │   │   ├── profile.js
    │   │   └── admin.js
    │   ├── pages/
    │   │   ├── OfferList/     # public landing + search
    │   │   ├── Home/          # vendor dashboard
    │   │   ├── CreateListing/ # create + edit listing (dual-mode via :id param)
    │   │   ├── EditProfile/   # vendor edits their profile
    │   │   ├── CreateProfile/ # admin creates a new vendor
    │   │   ├── AdminDashboard/# placeholder admin UI
    │   │   └── ChangePassword/# first-login password reset
    │   └── components/
    │       ├── AuthModal/     # modal shell for login
    │       ├── AuthForm/      # email+password sign-in form
    │       ├── ProfileForm/   # shared vendor profile form (create + edit)
    │       ├── ListingForm/   # listing form fields
    │       ├── ListingItem/   # single listing card
    │       └── VendorHeader/  # top nav for vendor-facing pages
    └── vite.config.js
```
