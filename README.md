You are an assistant generating a COMPLETE React frontend for a Blood Donation & Donor Management System.

The backend API already exists and is working. Your job is to build a **clean, professional, simple, and fully functional** frontend that talks to that backend.

The frontend must be understandable for a beginner (no over-complicated patterns), but still structured like a real production app.

---

## 0. TECH STACK & STYLE RULES

- Use **React** with **JavaScript** (NO TypeScript).
- Assume the app is created with **Vite** (but keep code generic React).
- Use **React Router v6+** for routing.
- Use **Tailwind CSS** for styling.
- Use **Axios** for HTTP requests.
- Use only functional components and React hooks.
- Code must be **beginner-friendly**:
  - small, clear components
  - lots of comments explaining what’s happening
  - simple state management (Context + hooks, no Redux)
- No unnecessary complexity: no advanced patterns, no custom hooks unless obvious and helpful.
- Avoid magic; be explicit and clear.

---

## 1. BACKEND BASE URL & APIs

Backend base URL:

```text
http://localhost:5000
All frontend API calls must hit this backend.

1.1 Auth endpoints
POST /api/auth/register

Body: { name, email, password }

Response: { success, message, data: { token, user } }

POST /api/auth/login

Body: { email, password }

Response: { success, message, data: { token, user } }

GET /api/auth/me (requires Bearer token)

Response: { success, data: { user } }

1.2 Donor endpoints (all require Bearer token)
POST /api/donors

Example body:

json
Copy code
{
  "fullName": "Donor One",
  "email": "donor1@example.com",
  "phone": "12345",
  "emergencyContactName": "EC Person",
  "emergencyContactPhone": "9999",
  "bloodGroup": "A+",
  "address": { "city": "Dhaka" },
  "willingToDonate": true
}
GET /api/donors

Optional query params: bloodGroup, city, willing

Returns array of donors.

GET /api/donors/:id

PUT /api/donors/:id

DELETE /api/donors/:id (admin only)

GET /api/donors/:id/eligibility

Returns { success, eligible, daysUntilEligible, reason } (shape can be simple).

1.3 Donation endpoints
POST /api/donations

Body:

json
Copy code
{
  "donorId": "<donorId>",
  "institutionId": "<institutionId optional>",
  "units": 1,
  "location": "Test Clinic",
  "notes": "Routine"
}
GET /api/donations

Optional query: donorId, institutionId, fromDate, toDate

GET /api/donations/donor/:donorId

1.4 Institution endpoints
POST /api/institutions (admin)

GET /api/institutions

GET /api/institutions/ranking

All these require Bearer token.

2. FRONTEND FOLDER STRUCTURE
Create this structure inside src/:

txt
Copy code
src/
│── main.jsx
│── App.jsx
│── index.css
│
├── api/
│   └── apiClient.js        # axios instance with baseURL and interceptors
│
├── context/
│   └── AuthContext.jsx     # auth state, user, token, login/logout/register
│
├── components/
│   ├── Layout/
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx (optional, for desktop)
│   ├── UI/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Select.jsx
│   └── Donors/
│       ├── DonorTable.jsx
│       └── DonorForm.jsx
│
└── pages/
    ├── auth/
    │   ├── LoginPage.jsx
    │   └── RegisterPage.jsx
    ├── DashboardPage.jsx
    ├── DonorsPage.jsx
    ├── DonorDetailPage.jsx
    ├── DonationsPage.jsx
    ├── InstitutionsPage.jsx
    └── NotFoundPage.jsx
3. GLOBAL STYLING & LAYOUT
Use Tailwind classes.

Overall design:

Light, simple, professional.

Main layout: Top Navbar + content area. Optionally a left sidebar for larger screens.

Fully responsive.

3.1 Navbar
Shows site title: "BloodCare" or "Blood Donation Manager".

If user is logged in:

Show links: Dashboard, Donors, Donations, Institutions.

Show logged-in user name and a “Logout” button.

If user is NOT logged in:

Show buttons: Login, Register.

3.2 DashboardPage
Route: /

Protected (requires login).

Shows high-level info:

Welcome message with user name.

Simple cards:

Total donors

Total donations

Maybe number of institutions

Use simple Tailwind cards; Codex can call backend to fetch counts:

You may use /api/donors, /api/donations, /api/institutions and just count lengths.

4. AUTHENTICATION (FRONTEND)
4.1 AuthContext
Create AuthContext.jsx:

Holds:

user (null or user object)

token (string or null)

isLoading (bool)

On initial load, read token from localStorage:

If token exists, call /api/auth/me to get user.

Expose methods:

login(email, password)

Call POST /api/auth/login.

On success, save data.token to localStorage and state.

register(name, email, password)

Call POST /api/auth/register.

On success, save token & user.

logout()

Clear token from state & localStorage.

Redirect to /login.

Use React Context + useContext(AuthContext) to access auth in any component.

4.2 ProtectedRoute component (optional)
Implement a guard so only logged-in users can access app pages:

Either:

In App.jsx, wrap private routes in a check for token.

Or create a small <ProtectedRoute> component that:

If user is not logged in, redirects to /login.

Keep logic simple and well commented.

5. API CLIENT (Axios)
Create src/api/apiClient.js:

Import axios.

Create an axios instance with:

js
Copy code
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});
Add request interceptor:

Read token from localStorage.

If present, set:

js
Copy code
config.headers.Authorization = `Bearer ${token}`;
Add simple response interceptor:

If status is 401, you may optionally redirect to login or clear auth.

Export this instance and use it everywhere for API calls.

6. ROUTING (App.jsx and main.jsx)
Use React Router v6:

In main.jsx, wrap <App /> with BrowserRouter and AuthProvider.

Example structure:

jsx
Copy code
<AuthProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</AuthProvider>
In App.jsx:

Have layout with Navbar.

Define routes:

/login → LoginPage

/register → RegisterPage

/ → DashboardPage (protected)

/donors → DonorsPage (protected)

/donors/:id → DonorDetailPage (protected)

/donations → DonationsPage (protected)

/institutions → InstitutionsPage (protected)

* → NotFoundPage

Redirect unauthenticated users to /login.

7. PAGE DETAILS
7.1 LoginPage.jsx
Simple centered card layout with:

Email input

Password input

Login button

Link to Register page.

On submit:

Call authContext.login(email, password).

Show success or error message.

Navigate to / (Dashboard) on success.

Use Tailwind for styling (max-w-md mx-auto mt-16 p-6 shadow rounded bg-white etc.).

7.2 RegisterPage.jsx
Very similar to Login:

Fields: name, email, password.

On submit:

Call authContext.register(name, email, password).

On success, redirect to /.

7.3 DonorsPage.jsx
Protected route.

Layout:

Page title: “Donors”

Simple filter bar at top:

Select bloodGroup (dropdown with A+, A-, B+, …)

Text input for city

Select for willing (All / Yes / No)

“Filter” button

“Add Donor” button opens a donor form (either modal or collapsible section).

Use apiClient:

On page load, fetch donors via GET /donors with optional query params built from filters.

Show donors in a table:

Name

Blood group

City

Phone

Willing (Yes/No)

Button “View” linking to /donors/:id

For “Add Donor”:

Use DonorForm component with controlled inputs.

On submit, POST to /donors, then refresh list.

7.4 DonorDetailPage.jsx
Route: /donors/:id.

On mount:

Call GET /donors/:id to get donor data.

Call GET /donors/:id/eligibility to show donation eligibility.

Optionally call GET /donations/donor/:donorId to show donation history.

UI:

Donor basic info card.

Eligibility status (green if eligible, red if not, with days until eligible).

Table of past donations (date, institution, units, notes).

Button “Record Donation”:

Opens a small form (donationDate optional, units, location, institution dropdown).

Submits to POST /donations.

On 90-day rule violation, show error from backend.

7.5 DonationsPage.jsx
Route: /donations.

Shows a table of donations:

Donor name

Blood group

Institution name (if any)

Date

Units

Filters:

Donor search (by name or select)

Institution filter

Date range (from – to, use simple input type="date").

Fetch using GET /donations with query params.

7.6 InstitutionsPage.jsx
Route: /institutions.

Show:

Section 1: Institution list (GET /institutions).

Name, type, city, totalDonations.

Section 2: Ranking (GET /institutions/ranking).

A simple table sorted by totalDonations desc.

If current user is admin (assume user.role === "admin"):

Show “Add Institution” form.

POST to /institutions.

7.7 DashboardPage.jsx
Route /.

Use simple cards to show:

Total donors (GET /donors and count).

Total donations (GET /donations and count).

Total institutions (GET /institutions and count).

Optionally display:

A small list of “Recently added donors” (last 5 from /donors).

A small list of “Recent donations” (last 5 from /donations).

7.8 NotFoundPage.jsx
Simple “404 – Page not found” with a button to go back to Dashboard or Login.

8. COMPONENTS
8.1 Reusable UI components
Create small helpers for readability:

Button.jsx – wraps a <button> with Tailwind classes for primary buttons.

Input.jsx – labeled input:

props: label, type, value, onChange, name, placeholder, error.

Select.jsx – labeled select with options.

Add comments to show how to use them.

8.2 DonorTable.jsx
Accepts donors array as prop.

Renders a responsive table (or stacked cards on mobile).

Each row:

Name

Blood group

City

Phone

Link/button → view details.

8.3 DonorForm.jsx
Props:

initialValues (for editing, optional)

onSubmit

onCancel

Fields:

fullName, email, phone

emergencyContactName, emergencyContactPhone

bloodGroup (select)

city (address.city)

willingToDonate (checkbox)

Use basic validation (required where needed).

Call onSubmit(formData) when valid.

9. ERROR & LOADING HANDLING
Show loading spinners or simple “Loading…” text while fetching data.

Display errors from the server in a small alert bar or text under form fields.

Use try/catch with axios and show a generic “Something went wrong” if no message.

10. CODE STYLE & COMMENTS
Use clear names like handleLogin, handleRegister, fetchDonors.

Comment every main block:

What the component does

What effect hooks are doing

What each API call does and which endpoint it hits

Aim for clarity, not cleverness.

END OF SPEC.

yaml
Copy code

---

If you want, next I can help you:

- Turn this into a **ready-made Vite + Tailwind setup checklist**, or  
- Walk file-by-file (e.g. I give you `AuthContext.jsx` implementation, `apiClient.js`, etc.) so you can compare what Codex writes with a reference.
::contentReference[oaicite:0]{index=0}