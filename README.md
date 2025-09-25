# Study Group Finder

This repository contains a study group web application with a Java Spring Boot backend and a React + Vite frontend.

Contents
 - Backend: Spring Boot (Java) service
 - Frontend: Vite + React application
 - Local development helpers: `.env.example`, `.env` (local only), and `docker-compose` (when present)

This README documents the repository layout, how to run locally for development, and how environment variables are intended to be used in a secure and professional way.

## Repository structure

Top-level folders and important files:

- `backend/` — Spring Boot application
	- `pom.xml` — Maven manifest
	- `mvnw`, `mvnw.cmd` — Maven wrappers
	- `src/main/java/` — Java source code
		- `com.example.demo` — example/demo scaffolding
		- `com.studygroup` — application packages (controllers, models, services, config)
	- `src/main/resources/application.properties` — application config (reads env vars)

- `studygroup-frontend/` — Vite + React frontend
	- `package.json` — frontend dependencies and scripts
	- `src/` — React source files
		- `pages/`, `components/`, `context/`, `services/` — frontend structure

- `.env.example` — template for local environment variables (safe to commit)
- `.env` — local environment variables (should NOT be committed)
- `.gitignore` — ignores `.env`, build artifacts, node_modules, etc.

## How the project is structured (developer view)

- Backend
	- `controller/` — HTTP endpoints
	- `service/` — business logic and operations
	- `repository/` — persistence interfaces
	- `model/` — domain models and DTOs
	- `config/` — security, WebSocket, JWT utilities

- Frontend
	- `context/` — React Context providers (Auth, Group)
	- `services/` — API wrappers (axios) and socket helpers
	- `components/` — shared UI components (Navbar, ProtectedRoute)
	- `pages/` — route pages (Login, Register, Dashboard, Groups, Chat, Calendar)

## Environment variables (.env usage)

Security note: Secrets (DB passwords, API keys, JWT secrets) must never be committed. Use environment variables for configuration. For local development create a `.env` file from `.env.example` and never commit it.

1) Create your local env file

	- Copy the example and fill values:

		cp .env.example .env

	- Then edit `.env` and provide the real values (Windows PowerShell example):

		copy .env.example .env; notepad .env

2) Variables used by the backend (Spring Boot)

	- `DB_URL` — JDBC URL to your database (default: `jdbc:mysql://localhost:3306/studygroup`)
	- `DB_USERNAME` — DB username (default: `root`)
	- `DB_PASSWORD` — DB password (no default; must be provided in production)

	The backend reads these using Spring property placeholders. Example in `application.properties`:

	spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/studygroup}
	spring.datasource.username=${DB_USERNAME:root}
	spring.datasource.password=${DB_PASSWORD:}

	- In production, set these as environment variables in your host (container orchestration, cloud service settings, or secret manager). Do not rely on `.env` in production.

3) Variables used by the frontend (Vite)

	- `VITE_API_URL` — Base URL for backend API calls (e.g. `http://localhost:8080/api`)
	- `VITE_SOCKET_URL` — Socket server URL for websocket/chat features

	Note: Vite exposes only env vars prefixed with `VITE_` to the client bundle.

4) Good practices

	- Use `.env.example` to show required variables and sensible defaults without secrets.
	- Use platform-native secret stores (GitHub Secrets, AWS Secrets Manager, Azure Key Vault) for CI/CD and production.
	- If a secret was accidentally committed, rotate it immediately and purge it from git history.

## Running locally (quick start)

1) Backend

	- Ensure a MySQL instance is running and reachable at `DB_URL`.
	- From `backend/` directory:

		./mvnw spring-boot:run

2) Frontend

	- From `studygroup-frontend/`:

		npm install
		npm run dev

3) Environment file example (Windows PowerShell copy):

	copy .env.example .env; notepad .env

## Next steps (recommended for production)

- Replace `.env` secrets with a proper secrets store for staging/production.
- Add CI pipeline to run tests and build artifacts (GitHub Actions example can be added).
- Add database migrations (Flyway/Liquibase) and backups.
- Add monitoring, logging aggregation, TLS, and automated deployments.

If you want, I can now:
- Commit these README and env improvements for you, and push to `main`.
- Add a GitHub Actions workflow that builds backend and frontend and runs tests.
- Check git history for any accidentally committed secrets and help remove them.

Which would you like me to do next?