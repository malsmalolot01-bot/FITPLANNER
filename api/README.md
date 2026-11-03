# FitPlanner API with XAMPP

1. Start **MySQL** in the XAMPP Control Panel.
2. Import `../database/fit-planner.sql` in phpMyAdmin.
   If the database already exists and contains user data, run `../database/migrate-existing.sql` instead; it adds the customer profile table without replacing existing records.
   For an existing installation adding subscriptions, payment proof, and subscription receipts, run `../database/subscription-migration.sql` once in phpMyAdmin after selecting the `fit-planner` database. This migration also adds the onboarding flag used after an approved payment.
   After the migration, existing app users must log out and log in again to receive an API session token.
3. For the PHP development server, from the repository root run:

   ```powershell
   C:\xampp\php\php.exe -S localhost:8000 -t api
   ```

   Set these values in `apps/mobile/.env.local` when using the PHP development server:

   ```dotenv
   VITE_API_BASE_URL=http://localhost:8000
   VITE_API_URL=http://localhost:8000/auth.php
   ```

4. For Apache, copy the API files to `C:\xampp\htdocs\api`:

   ```powershell
   xcopy E:\fit-planner\api\* C:\xampp\htdocs\api\ /E /I /Y
   ```

   The app's default API base URL is `http://localhost/api`.

The API uses the XAMPP MariaDB database `fit-planner` with the default `root` user and blank password. Set `FITPLANNER_DB_PASSWORD` if your XAMPP root account has a password.
Restart the Vite dev server after changing `.env.local` values.