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

The backend also requires `JWT_SECRET` and MySQL connection settings. It
accepts either `DATABASE_URL` or the individual `DB_HOST`, `DB_PORT`,
`DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` variables.

Google OAuth returns an ID token in the browser. The frontend sends that token
to `POST /api/google/login`; the backend verifies it with Google and stores the
user in MySQL.

## Deploy to Vercel

Set these project environment variables in Vercel and redeploy:

- `VITE_GOOGLE_CLIENT_ID`: the Google OAuth **Web application** client ID
- `GOOGLE_CLIENT_ID`: the same client ID, used by the Node.js API to verify tokens
- `JWT_SECRET` and either `DATABASE_URL` or the `DB_HOST`, `DB_PORT`,
  `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` variables: API signing key and
  production database connection
- `VITE_API_URL`: optional; leave unset to use this deployment's `/api` endpoint

To connect Vercel to Railway MySQL, enable **Public Networking / TCP Proxy** in
the Railway MySQL service's Settings → Networking. In Vercel, add
`MYSQL_PUBLIC_URL` with Railway's generated public MySQL URL, or add
`DATABASE_URL` with the same value, then redeploy. The backend accepts either
complete `mysql://...` URL. If Railway gives you only a TCP proxy hostname,
set it as `MYSQL_PUBLIC_URL` or `DB_HOST`, and set `DB_PORT`, `DB_DATABASE`,
`DB_USERNAME`, and `DB_PASSWORD` separately in Vercel. Railway's private
`MYSQLHOST`/`MYSQL_URL` values are only reachable from services inside Railway,
not from Vercel. They are recognized by the app if its API is hosted in
Railway. Do not set `DB_SOCKET_PATH` on Vercel; it is only for local database
setups, and a configured Railway URL takes precedence. Keep the database
password and URL server-side, never in a `VITE_` variable.

For a new, empty database, create the application tables once by running
`node backend/setup.js` from a trusted environment that has the Railway public
database URL configured as `MYSQL_PUBLIC_URL` (or `DATABASE_URL`). Do not run
the setup against a database containing important data without first taking a
backup; Sequelize's `alter` sync may modify existing tables.

In Google Cloud Console, add `https://tk-horticultural.vercel.app` to the OAuth
client's authorized JavaScript origins. Do not use a placeholder client ID. If
the frontend variable is absent, the Google sign-in controls explain that the
feature is not configured instead of sending users to an invalid OAuth client.

All profiles, bookings, enquiries, gallery records, uploads, and availability
data are managed by the backend. No Firebase Authentication, Firestore, Cloud
Storage, or Firebase Functions are required.
