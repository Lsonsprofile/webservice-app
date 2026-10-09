# Web Services Academy

## Run locally

1. Install Node.js and project dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env` and set `APP_SECRET`, `GOOGLE_CLIENT_ID`, and
   `GOOGLE_CLIENT_SECRET`.

   ```powershell
   Copy-Item .env.example .env
   ```

   Generate a strong session secret with:

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

3. Create an OAuth 2.0 Web application client in Google Cloud Console. Add
   `http://localhost:3000/api/auth/google/callback` as an authorized redirect
   URI, then copy the client ID and secret into `.env`.

4. Start the app:

   ```powershell
   npm run dev
   ```

5. Open <http://localhost:3000> and choose **Continue with Google**.

Google sign-in uses a signed, stateless session and does not require a database.
Learning progress remains in memory for now; progress persistence will be
available once database storage is added.
