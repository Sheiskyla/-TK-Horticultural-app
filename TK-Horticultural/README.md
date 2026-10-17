# TK Horticultural Services

React, Vite, Tailwind CSS, Google OAuth, and a Node.js/Express API.

## Run locally

From this directory:

```sh
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

Google OAuth returns an ID token in the browser. The frontend sends that token
to `POST /api/google/login`; the backend verifies it with Google and stores the
user in MySQL.

All profiles, bookings, enquiries, gallery records, uploads, and availability
data are managed by the backend. No Firebase Authentication, Firestore, Cloud
Storage, or Firebase Functions are required.
