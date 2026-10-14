# TK Horticultural Services

React, Vite, Tailwind CSS, Google OAuth, and a Laravel/MySQL API.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

Create `.env` from `.env.example` and set the same Google OAuth web client ID
in both the frontend and Laravel applications:

```env
VITE_LARAVEL_API_URL=http://127.0.0.1:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

The Laravel application must contain:

```env
GOOGLE_CLIENT_ID=your-google-web-client-id
```

Google OAuth returns an ID token in the browser. The frontend sends that token
to `POST /api/google/login`; Laravel verifies it with Google and stores the
user in MySQL before returning a Sanctum token.

All profiles, bookings, enquiries, gallery records, uploads, and availability
data are managed by Laravel. No Firebase Authentication, Firestore, Cloud
Storage, or Firebase Functions are required.
