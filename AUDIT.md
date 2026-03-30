# Tarnished / FreshLast — Jira Backlog Audit

**Audit Date:** 2026-03-30
**Auditor:** Claude Code (automated)
**Repo root:** `/Tarnished/`
**Scope:** `freshlast/src/` (frontend), `backend/app/` (FastAPI), `supabase/migrations/`

---

## Repo Structure Confirmed

```
Tarnished/
├── freshlast/          # React + Vite frontend
│   └── src/
│       ├── api/        # Axios API call modules
│       ├── components/ # Reusable UI components
│       ├── lib/        # Supabase + Axios singletons
│       └── pages/      # Route-level page components
├── backend/            # FastAPI backend
│   └── app/
│       ├── api/        # Route handlers (listings, profile, admin)
│       ├── models/     # Pydantic models
│       └── core/       # Config, Supabase client
└── supabase/
    └── migrations/     # Schema SQL (merchant + listing tables)
```

---

## Story Audit Results

---

### SCRUM-9 — Vendor signup and login
**Jira Status:** Sprint Backlog
**Classification:** ✅ COMPLETED
**Flag:** Ahead of Jira

| Criterion | Status | Evidence |
|---|---|---|
| Register with name, email, password | ✅ | `freshlast/src/pages/CreateProfile/CreateProfile.jsx` — calls `supabase.auth.signUp()` with email/password; collects stall name via `ProfileForm` |
| Email uniqueness + format validated | ✅ | Enforced by Supabase Auth (signUp rejects duplicates and invalid formats) |
| Vendor can log in with credentials | ✅ | `freshlast/src/components/AuthForm/AuthForm.jsx` — calls `supabase.auth.signInWithPassword()` |
| Invalid login rejected | ✅ | AuthForm surfaces Supabase auth errors to UI |
| Redirect to dashboard on success | ✅ | `freshlast/src/App.jsx` — auth state machine routes authenticated user to `/dashboard` |

---

### SCRUM-2 — Vendor creates listing
**Jira Status:** Sprint Backlog
**Classification:** 🔶 PARTIAL

| Criterion | Status | Evidence |
|---|---|---|
| Title, price, image upload, quantity, unit fields | ✅ | `freshlast/src/components/ListingForm/ListingForm.jsx` — product name, original price, discounted price, image upload, quantity stepper, unit (kg/lbs) |
| **Expiry date field** | ❌ | Not present in `ListingForm`, `CreateListing.jsx`, or DB schema (`listing` table has no expiry column) |
| Required fields validated | ✅ | `freshlast/src/pages/CreateListing/CreateListing.jsx` — validates required fields; checks discounted price < original price |
| Listing visible after creation | ✅ | `freshlast/src/api/listings.js:createListing()` → `POST /api/listings`; OfferList fetches all listings on mount |

**Missing:** Expiry date is an explicit acceptance criterion but has no field in the form, no column in the DB schema, and no backend handling.

---

### SCRUM-3 — Vendor edits and deletes listings
**Jira Status:** Sprint Backlog
**Classification:** 🔶 PARTIAL

| Criterion | Status | Evidence |
|---|---|---|
| Vendor can delete a listing manually | ✅ | `freshlast/src/pages/CreateListing/CreateListing.jsx` — delete button in edit mode calls `deleteListing()` with confirmation |
| **Auto-remove when stock = 0** | ❌ | No trigger, hook, or check for this in frontend or backend |
| Vendor can update price, quantity, item details | ✅ | `/edit/:id` route loads existing listing into form; `freshlast/src/api/listings.js:updateListing()` → `PUT /api/listings/{id}` |
| System validates edited values | ✅ | Same validation logic in `CreateListing.jsx` applies in edit mode |

**Missing:** Auto-removal when quantity reaches zero is not implemented anywhere.

---

### SCRUM-22 — Vendor edits profile information
**Jira Status:** Sprint Backlog
**Classification:** 🔶 PARTIAL

| Criterion | Status | Evidence |
|---|---|---|
| Accessible from dashboard | ✅ | `freshlast/src/components/VendorHeader/VendorHeader.jsx` — profile dropdown has "Edit Profile" → `/profile` |
| Can update personal info (name, contact) | ✅ | `freshlast/src/pages/EditProfile/EditProfile.jsx` + `ProfileForm` — stall_name, phone_number |
| **Can update email** | ❌ | Email field absent from `EditProfile`; not sent to `PUT /api/profile/{id}` |
| Can update stall info (name, image, location) | ✅ | ProfileForm collects stall name, market_location (text), location photo upload |
| **Stall description field** | ❌ | No description field in `ProfileForm`, `merchant` DB table, or backend model |
| Validation before save | ✅ | ProfileForm requires at least one operating day; basic field presence validated |
| Changes reflect immediately | ✅ | EditProfile re-fetches profile on mount; VendorHeader re-renders from state |

**Missing:** Email update and stall description are not supported.

---

### SCRUM-5 — Customer views discounted/near-expiry produce list
**Jira Status:** Sprint Backlog
**Classification:** 🔶 PARTIAL

| Criterion | Status | Evidence |
|---|---|---|
| Discounted produce displayed | ✅ | `freshlast/src/pages/OfferList/OfferList.jsx` — fetches all listings via `getAllListings()`; `ListingItem` shows original + discounted prices |
| All available produce browsable | ✅ | Grid of all listings rendered on `/` and `/offers` routes |
| **Sorting available** | ❌ | No sort controls in OfferList; no sort parameter in `GET /api/listings/all` |
| **Recency shown** | ❌ | `created_at` exists in `listing` schema but is never displayed in `ListingItem` or OfferList |
| **Near-expiry filtering** | ❌ | No expiry date field exists (see SCRUM-2); cannot filter by it |

**Missing:** Sorting, recency display, and near-expiry filtering are all absent.

---

### SCRUM-6 — Customer views vendor details from a listing
**Jira Status:** Sprint Backlog
**Classification:** ❌ NOT STARTED

| Criterion | Status | Evidence |
|---|---|---|
| Open vendor profile from product listing | ❌ | `ListingItem` card has no link or button to a vendor profile page |
| Public vendor profile page exists | ❌ | No `VendorProfile` or `ViewVendor` page in `freshlast/src/pages/` |
| Profile shows stall identification | ❌ | Backend `GET /api/profile/{id}` exists but no UI consumes it for public viewing |
| Profile shows contact and availability | ❌ | Data exists in `merchant` table but unreachable from the customer-facing browse flow |

**Note:** The backend profile endpoint and data model are in place, but zero customer-facing UI exists to surface vendor information from a listing.

---

### SCRUM-45 — Admin creates and deletes vendor accounts on dashboard
**Jira Status:** Sprint Backlog
**Classification:** 🔶 PARTIAL

| Criterion | Status | Evidence |
|---|---|---|
| Backend: create vendor account | ✅ | `backend/app/api/admin.py:POST /api/admin/create` — creates Supabase Auth user with temp password, uploads photo, inserts merchant record |
| Backend: delete vendor account | ✅ | `backend/app/api/admin.py:DELETE /api/admin/delete/{id}` — removes images, auth user, and merchant record |
| **Frontend admin dashboard** | ❌ | `freshlast/src/pages/AdminDashboard/AdminDashboard.jsx` is a stub showing hardcoded mock users (User 1–4); not wired to any API |
| Required fields validated | 🔶 | Backend validates; frontend form not connected |
| New vendor visible in list immediately | ❌ | Admin list is mock data; no live fetch |
| Confirmation prompt before deletion | ❌ | No delete action exists in frontend yet |

**Missing:** The entire admin UI is placeholder-only. Backend is fully implemented; frontend has not been integrated.

---

### SCRUM-1 — Vendor shares stall location within Carbon Market
**Jira Status:** PBI
**Classification:** 🔶 PARTIAL

| Criterion | Status | Evidence |
|---|---|---|
| Vendor can specify stall location | ✅ | `ProfileForm` has `market_location` text field; `backend/app/api/profile.py:PUT /api/profile/{id}` accepts `location`, `latitude`, `longitude` |
| Vendor can upload stall image | ✅ | `ProfileForm` has stall photo upload; stored in Supabase `media` bucket |
| Stall details visible on vendor's own profile | ✅ | `EditProfile.jsx` displays profile data back to the vendor |
| **Customers can access vendor details from listings** | ❌ | No public vendor profile page (see SCRUM-6) |
| **Location appears in browse/search results** | ❌ | `ListingItem` does not show vendor location; OfferList does not link to vendor profile |

**Missing:** Customer-facing visibility of stall location is not implemented.

---

### SCRUM-4 — Vendor edits or removes stall location pin
**Jira Status:** PBI
**Classification:** 🔶 PARTIAL

| Criterion | Status | Evidence |
|---|---|---|
| Vendor can update stall location | ✅ | `EditProfile.jsx` → `ProfileForm` → `updateProfile()` → `PUT /api/profile/{id}` — `location` (text) field editable |
| Can edit stall name | ✅ | `stall_name` field in ProfileForm |
| **Interactive location pin / stall section selector** | ❌ | Location is a free-text field (`varchar`); no map, pin, or Carbon Market section UI exists |
| Updates reflect across system | 🔶 | Profile update persists to DB; but customer-facing display doesn't exist yet (SCRUM-6 missing) |

**Missing:** The "pin" / map interaction is not implemented; location is plain text only.

---

### SCRUM-7 — Customer searches and filters produce by category/price
**Jira Status:** PBI
**Classification:** 🔶 PARTIAL

| Criterion | Status | Evidence |
|---|---|---|
| Keyword search works | ✅ | `OfferList.jsx` — search bar filters listings client-side by product name |
| Filter by category works | ✅ | `OfferList.jsx` — category buttons: All, Vegetables, Fruits, Others; filters client-side |
| Results update immediately | ✅ | Both filters are reactive state; no page reload needed |
| **Filter by price range** | ❌ | No price range input or slider in OfferList |
| **Filter by discount amount/percentage** | ❌ | No discount filter in OfferList |

**Missing:** Price and discount filters are not implemented.

---

## Summary Table

| Key | Story | Classification | Jira Status | Flag |
|---|---|---|---|---|
| SCRUM-9 | Vendor signup and login | ✅ COMPLETED | Sprint Backlog | **Ahead of Jira** |
| SCRUM-2 | Vendor creates listing | 🔶 PARTIAL | Sprint Backlog | — |
| SCRUM-3 | Vendor edits and deletes listings | 🔶 PARTIAL | Sprint Backlog | — |
| SCRUM-22 | Vendor edits profile information | 🔶 PARTIAL | Sprint Backlog | — |
| SCRUM-5 | Customer views discounted produce list | 🔶 PARTIAL | Sprint Backlog | — |
| SCRUM-6 | Customer views vendor details from listing | ❌ NOT STARTED | Sprint Backlog | — |
| SCRUM-45 | Admin creates and deletes vendor accounts | 🔶 PARTIAL | Sprint Backlog | — |
| SCRUM-1 | Vendor shares stall location | 🔶 PARTIAL | PBI | — |
| SCRUM-4 | Vendor edits or removes stall location pin | 🔶 PARTIAL | PBI | — |
| SCRUM-7 | Customer searches and filters produce | 🔶 PARTIAL | PBI | — |

---

## Mismatch Flags

| Key | Flag | Detail |
|---|---|---|
| SCRUM-9 | **Ahead of Jira** | Jira status is Sprint Backlog but all acceptance criteria are met in code end-to-end |

No "Jira Done / Code Missing" mismatches found (no stories are marked Done in Jira).

---

## Cross-Cutting Observations

1. **`profiles` vs `merchant` table mismatch** — `App.jsx` and `EditProfile.jsx` query `supabase.from("profiles")` but the migration only defines a `merchant` table. This is a latent bug that may cause runtime errors.

2. **No expiry date anywhere** — SCRUM-2 requires expiry date as a first-class field; it is absent from the frontend form, the backend model, and the DB schema.

3. **Admin frontend is a stub** — `AdminDashboard.jsx` renders hardcoded mock data. The backend admin routes (`POST /api/admin/create`, `DELETE /api/admin/delete/{id}`) are fully implemented and ready to wire up.

4. **SCRUM-6 is a blocker for SCRUM-1 and SCRUM-4** — Vendor location data is stored correctly, but there is no customer-facing vendor profile page. Until SCRUM-6 is built, location features have no user-visible impact.

5. **Weekday enum typo** — `backend/app/models/enums/weekday.py` defines `"SATRUDAY"` instead of `"SATURDAY"`. This could cause data integrity issues.

6. **No authentication guard on `/admin` route** — `AdminDashboard` is accessible without any role check.
