# TK Horticultural Services

React, Vite, Tailwind CSS, Google OAuth, and a Node.js/Express API.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

Run the Node.js API in a second terminal:

```sh
cd backend
npm install
npm run dev
```

Create `.env` from `.env.example` and set the same Google OAuth web client ID
in both the frontend and backend:

```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

The backend requires:

```env
GOOGLE_CLIENT_ID=your-google-web-client-id
```

The backend also requires `JWT_SECRET` and MySQL connection settings
(`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`). Set
these in Vercel as server-side environment variables; local `.env` files are
not deployed.

Google OAuth returns an ID token in the browser. The frontend sends that token
to `POST /api/google/login`; the backend verifies it with Google and stores the
user in MySQL.

## Deploy to Vercel

Set these project environment variables in Vercel and redeploy:

- `VITE_GOOGLE_CLIENT_ID`: the Google OAuth **Web application** client ID
- `GOOGLE_CLIENT_ID`: the same client ID, used by the Node.js API to verify tokens
- `JWT_SECRET` and `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`:
  API signing key and production database connection
- `VITE_API_URL`: optional; leave unset to use this deployment's `/api` endpoint

In Google Cloud Console, add `https://tk-horticultural.vercel.app` to the OAuth
client's authorized JavaScript origins. Do not use a placeholder client ID. If
the frontend variable is absent, the Google sign-in controls explain that the
feature is not configured instead of sending users to an invalid OAuth client.

All profiles, bookings, enquiries, gallery records, uploads, and availability
data are managed by the backend. No Firebase Authentication, Firestore, Cloud
Storage, or Firebase Functions are required.
