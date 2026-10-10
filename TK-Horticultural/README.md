# TK Horticultural Services

React, Vite, Tailwind CSS, Firebase Authentication, Cloud Firestore and Cloud Storage.

## Run locally

From this directory:

```sh
npm install
npm run dev
```

Firebase web configuration can be supplied with the `VITE_FIREBASE_*` variables shown in `.env.example`.
Enable Firebase Authentication (Email/Password), Cloud Firestore and Cloud Storage in the selected Firebase project.

## Firebase deployment and admin access

The app uses the Firebase custom claim `admin: true` for admin-route checks. An email address alone is not an admin role.

To grant the requested admin account access:

1. Create `gmail-tkhorticulture@gmail.com` under **Firebase Console → Authentication → Users**.
2. In Google Cloud Console, create/download a service-account key with permission to manage Firebase Authentication. Store it outside this repository and never commit it.
3. From this directory, install the Admin SDK once and set its credential/project environment variables in your local terminal:

   ```sh
   npm install
   # Set GOOGLE_APPLICATION_CREDENTIALS to the absolute service-account JSON path.
   # Optionally set FIREBASE_PROJECT_ID if the target project is not tk-horticultural.
   node scripts/grant-admin-role.js
   ```

   An alternate email can be supplied as the first argument. The script preserves existing custom claims while adding `admin: true`.
4. Sign out and sign back in to refresh the Firebase ID token.

Service-account credentials are privileged server-side secrets. Do not put them in `src/`, a `VITE_*` variable, or a public web bundle.

The `firestore.rules` and `storage.rules` files protect user-owned records and restrict admin operations to accounts with that claim. Frontend route checks are for user experience only; these server-enforced rules are the actual security boundary. Select the intended Firebase project with the Firebase CLI, then deploy from this directory:

```sh
firebase deploy --only firestore:rules,storage
```

New email/password and Google accounts create their `users/{uid}` profile in the authenticated client flow. The `functions/index.js` `onUserCreated` Authentication trigger syncs every newly-created Firebase Auth user to Firestore. The admin dashboard also runs the protected `syncAllUsers` callable when opened and offers a manual **Sync Firebase users** action to backfill existing Firebase Authentication accounts. Deploy Cloud Functions to enable the trigger and the backfill:

```sh
firebase deploy --only functions
```

The admin dashboard listens to `users` with a Firestore real-time subscription, so newly written profiles appear without refreshing. If an account is in Firebase Authentication but not visible, check the dashboard's user-list error message and confirm the signed-in admin has Firestore read access under the deployed rules.

## Firestore collections

- `users/{uid}` stores the account profile and a 45-second activity heartbeat.
- `bookings/{bookingId}` stores each scheduled service request, including `userId`, customer contact fields, service, date, `slotId`, slot label, address, status and server creation timestamp.
- `slots/{date_slotId}` reserves a slot atomically so only one customer can book it; IDs use `{date}_{slotId}`.
- `availability/{YYYY-MM-DD}` stores optional date overrides as `slot1`, `slot2`, and `slot3` booleans. Missing fields inherit their weekday default.
- `availability_defaults/{0-6}` stores Sunday-through-Saturday weekly defaults, also as `slot1`–`slot3` booleans. Unconfigured slots default to available.
- `time_slots/{date_slotId}` remains supported for older data, but the admin dashboard and booking forms use `availability` and `availability_defaults`.
- `quotes/{quoteId}` stores quote request details and attachment download URLs.
- `enquiries/{enquiryId}` stores public contact requests (`name`, `email`, optional `phone`, `message`, `createdAt`); only admins can read or manage them.
- `gallery/{itemId}` stores public media metadata (`url`, `type`, `title`, `category`, `caption`, `storagePath`, `createdAt`); media files are in Cloud Storage under `gallery/`.

Admin filters are applied to real-time collection snapshots in the browser, so no composite Firestore indexes are required by this dashboard. The booking reservation and booking document are created in one Firestore transaction; availability settings are checked again inside that transaction to prevent submitting a disabled time slot.

The admin console requires a verified admin custom claim. User booking, quote, and profile routes require Firebase sign-in and redirect admin accounts back to the admin console.
