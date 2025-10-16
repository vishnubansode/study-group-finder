## Study Group Finder — Group Genius

This repository contains a full-stack study group collaboration platform:

- `group-genius-backend/` — Spring Boot (Java 21, Maven) REST API, JPA, email templates and file uploads.
- `group-genius-frontend/` — Vite + React + TypeScript frontend.

This README explains the project and shows step-by-step commands to run the backend and frontend on Windows (PowerShell). It includes a suggested `.env` for local development.

## Prerequisites

- Java 21 (OpenJDK or other JDK)
- Maven (the project includes the Maven wrapper `mvnw.cmd` so having Maven installed is optional)
- Node.js (recommended v18+)
- npm (or another package manager)
- MySQL (or change `DATABASE_URL` to point to another compatible database)

Optional but useful:

- An SMTP account if you want the backend to send real emails (or set `EMAIL_ENABLED=false` to disable sending).

## Environment (.env)

The backend reads an optional `.env` file (see `group-genius-backend/src/main/resources/application.properties`). Create a `.env` file in the `group-genius-backend` folder (or run from that folder) with values for your environment. Example:

```
# Database
DATABASE_URL=jdbc:mysql://localhost:3306/study_group_finder?createDatabaseIfNotExist=true
DATABASE_USERNAME=root
DATABASE_PASSWORD=change_me

# Backend server port (optional, default 8080)
SERVER_PORT=8080

# Frontend public URL used in email links (adjust to dev URL if necessary)
FRONTEND_URL=http://localhost:5173

# Email (set EMAIL_ENABLED=true and configure SMTP to send real emails)
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

Notes:

- `FRONTEND_URL` should match where you run the frontend locally (Vite default is `http://localhost:5173`). The backend default in code is `http://localhost:3000` — update `FRONTEND_URL` if you use a different port.
- The application will create the database if it can (see `createDatabaseIfNotExist=true` in the example JDBC URL).

## Run the backend (Windows PowerShell)

Open PowerShell and run:

```powershell
cd group-genius-backend
# Install dependencies and run using the Maven wrapper (Windows)
.\n+\mvnw.cmd clean package -DskipTests

# Run the packaged jar
java -jar target\groupgenius-backend-0.0.1-SNAPSHOT.jar

# Or run directly with Spring Boot (dev-friendly)
.\mvnw.cmd spring-boot:run
```

If you prefer to use a system-installed Maven, replace `.\mvnw.cmd` with `mvn`.

By default the backend listens on port 8080. You can change that via `SERVER_PORT` or setting `server.port` in `application.properties`.

## Run the frontend (Windows PowerShell)

Open a second terminal for the frontend:

```powershell
cd group-genius-frontend
npm install
npm run dev
```

This starts Vite's dev server (default port 5173). If you want to build a production bundle:

```powershell
cd group-genius-frontend
npm run build
npm run preview
```

## Development workflow

- Start the backend first so API endpoints are available.
- Then start the frontend and point it at the backend's API (the frontend service code is configured to call the backend base URL — check `group-genius-frontend/src/lib/api` or `services/api.ts` in the frontend for where to configure API base URL if needed).

## Uploads

Uploaded files are stored in the `uploads/` folder by default. That folder is listed in `.gitignore` so user uploads won't be committed.

## Troubleshooting

- If the backend cannot connect to MySQL, confirm `DATABASE_URL`, username/password and that the database server is running and accepting connections.
- If email doesn't send set `EMAIL_ENABLED=false` while developing, or provide correct SMTP credentials and allow less-secure apps as required by your provider.
- If ports are already in use, change the port (backend via `SERVER_PORT` or `server.port`, frontend via Vite config or use environment variable to change the dev server port).

## Notes & Next steps

- You can containerize the app or create a docker-compose for local dev that includes MySQL. If you want, I can add a `docker-compose.yml` that brings up the backend, frontend (or built static files served by a simple server) and a MySQL database.

---