# Lab Simulator

Lab Simulator is a React/Vite virtual laboratory frontend with an Express REST API and a MySQL database. The experiment simulations, lesson content, quizzes, and immediate result screens remain in React; MySQL stores accounts, experiment availability, complete attempt result payloads, and faculty attendance records.

## Requirements

- Node.js supported by the installed Vite release
- XAMPP with MySQL/MariaDB
- A browser

## Windows setup (XAMPP)

1. Start **MySQL** in the XAMPP Control Panel.
2. Open `http://localhost/phpmyadmin`.
3. Use **Import** to import the project-root `database.sql`. It creates the `labsim` database, tables, four subjects, all 41 experiments, the attendance table, and one faculty account. The backend also adds the `attempts.result_data` column and safely upgrades an existing attendance table at startup.
4. Copy `.env.example` to `.env` in the project root and set your MySQL values. For a default XAMPP installation, `DB_USER=root`, `DB_PASSWORD=` and `DB_PORT=3306` are typical.
5. Set `JWT_SECRET` to a private random value of at least 32 characters. Do not commit `.env`.
6. From the project root, install the dependencies:

   ```powershell
   npm.cmd install
   ```

7. Open two terminals in the project root. Start the API in the first:

   ```powershell
   npm.cmd run server
   ```

   The API is at `http://localhost:5000/api`; its health check is `http://localhost:5000/api/health`.

8. Start Vite in the second terminal:

   ```powershell
   npm.cmd run dev
   ```

   Open the Vite URL printed in the terminal (normally `http://localhost:5173`). Development CORS permits localhost Vite ports such as 5174. To change the API URL, set `VITE_API_URL` in the root `.env` before starting Vite.

The backend loads `.env` by resolving the file relative to `server/config/env.js`, not the current shell directory. It exits with a clear error if required settings are missing or MySQL cannot be reached.

## Test the flows

### Student

1. On the login page select **Student Login**, then use **Register as Student**.
2. Register with a unique roll number and email. Passwords are hashed with bcrypt before storage.
3. Log in using the **Roll Number** and password. The dashboard welcome text comes from the authenticated database profile.
4. Open an enabled experiment and complete the existing simulation/quiz. The app creates an `in_progress` attempt when the experiment starts and completes it from the existing result screen. DST/IFS store the quiz score; DTM/DCN store completion without a score.
5. Edit profile details from **Profile**; changes are saved to MySQL.
6. Use **Forgot password?** on the student login tab to email a one-time reset link. Reset tokens are stored hashed and expire after 30 minutes. For local development without SMTP, the link is printed only in the backend terminal.

### Faculty

The SQL seed creates this development-only account:

Sign in using the Faculty Login tab with the credentials configured by the administrator.

Sign in using the **Faculty Login** tab. Change the password/hash in your local database before any shared or deployed use. Faculty endpoints enforce the faculty role on the server. Faculty can review live student/attempt/progress data, activate or deactivate student accounts, and enable or disable experiments. Disabled experiments remain unavailable to students after refresh.

## REST API overview

All routes are prefixed with `/api`.

| Route | Access | Purpose |
|---|---|---|
| `POST /auth/register` | Public | Create a student account |
| `POST /auth/login` | Public | Student login by roll number |
| `POST /auth/faculty/login` | Public | Faculty login by email |
| `POST /auth/forgot-password` | Public | Request a one-time student password reset link |
| `POST /auth/reset-password` | Public | Set a new student password using a valid reset token |
| `GET /auth/me` | Authenticated | Load the current database profile |
| `PUT /students/me` | Student | Update the student's profile |
| `GET /subjects` | Authenticated | List subjects |
| `GET /subjects/:code/experiments` | Authenticated | List experiment catalogue and enabled flags |
| `GET /experiments/:code/:experimentNo` | Student | Check current experiment availability |
| `POST /attempts/start` | Student | Start the authenticated student's next attempt |
| `POST /attempts/:id/complete` | Student | Complete only an attempt owned by that student |
| `GET /faculty/overview` | Faculty | Load students, subjects, experiments, and attempts |
| `GET /faculty/attendance?date=YYYY-MM-DD&subject=ALL` | Faculty | Load attendance records and per-student progress |
| `PUT /faculty/attendance/:studentId` | Faculty | Mark/update a student's attendance for a subject and date |
| `PATCH /faculty/students/:id` | Faculty | Update student profile fields |
| `PATCH /faculty/students/:id/status` | Faculty | Activate/deactivate a student |
| `PATCH /faculty/experiments/:id` | Faculty | Persist experiment availability |

The browser stores only the JWT for authentication. The API derives student identity from that token; attempt endpoints do not accept a student ID from the client.

### Student password reset email

Only student accounts can request a password reset; faculty credentials are managed directly by the administrator. To send reset links by email, configure these project-root `.env` values and restart the backend:

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-app-password
SMTP_FROM=LabSim <your-verified-sender@example.com>
```

Use your email provider's SMTP/app-password settings; do not use or commit production credentials. When SMTP is not configured in development, request a reset and copy the development-only link from the backend terminal. The forgot-password response does not disclose whether an email belongs to a student account.

## Database

`database.sql` defines five tables:

- `users`: student/faculty profiles, bcrypt password hashes, role, and active state
- `subjects`: semester and assessment type (`quiz` or `completion`)
- `experiments`: subject, experiment number, title, enabled state
- `attempts`: student, experiment, attempt number, status, optional score, full result/answer JSON, and timestamps
- `attendance`: one present/absent record per student, subject, and date, with the faculty member who marked it

Completed attempt JSON includes the existing result payload (quiz questions, selected/correct answers, observations, and simulation result data where supplied) alongside indexed score and completion columns.

Progress is calculated from attempts rather than maintained as duplicate state. Faculty attendance records and subject-wise attendance percentages are read from MySQL; marking attendance updates the existing student/subject/date record rather than creating duplicates.

## Development checks

```powershell
npm.cmd run build
npm.cmd run lint
```

The existing experiment source and media remain in `src/experiments`.
