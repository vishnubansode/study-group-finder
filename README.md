# Study Group Finder# Study Group Finder



A full-stack web application for finding and managing study groups, built with Spring Boot backend and React frontend.This repository contains a study group web application with a Java Spring Boot backend and a React + Vite frontend.



## 🚀 Quick Start with DockerContents

 - Backend: Spring Boot (Java) service

The easiest way to run the entire application stack: - Frontend: Vite + React application

 - Local development helpers: `.env.example`, `.env` (local only), and `docker-compose` (when present)

```bash

# Clone the repositoryThis README documents the repository layout, how to run locally for development, and how environment variables are intended to be used in a secure and professional way.

git clone <your-repo-url>

cd study-group-finder## Repository structure



# Start all services (database, backend, frontend)Top-level folders and important files:

docker-compose up --build

- `backend/` — Spring Boot application

# Access the application	- `pom.xml` — Maven manifest

# Frontend: http://localhost:3000	- `mvnw`, `mvnw.cmd` — Maven wrappers

# Backend API: http://localhost:8080/api	- `src/main/java/` — Java source code

# Database: localhost:3306		- `com.example.demo` — example/demo scaffolding

```		- `com.studygroup` — application packages (controllers, models, services, config)

	- `src/main/resources/application.properties` — application config (reads env vars)

## 📁 Project Structure

- `studygroup-frontend/` — Vite + React frontend

```	- `package.json` — frontend dependencies and scripts

study-group-finder/	- `src/` — React source files

├── backend/                    # Spring Boot API server		- `pages/`, `components/`, `context/`, `services/` — frontend structure

│   ├── src/main/java/com/studygroup/

│   │   ├── controller/        # REST controllers- `.env.example` — template for local environment variables (safe to commit)

│   │   ├── service/           # Business logic- `.env` — local environment variables (should NOT be committed)

│   │   ├── repository/        # Data access layer- `.gitignore` — ignores `.env`, build artifacts, node_modules, etc.

│   │   ├── model/             # Entity models

│   │   └── config/            # Security, JWT, WebSocket config## How the project is structured (developer view)

│   ├── Dockerfile             # Backend container config

│   └── pom.xml                # Maven dependencies- Backend

│	- `controller/` — HTTP endpoints

├── studygroup-frontend/        # React + Vite frontend	- `service/` — business logic and operations

│   ├── src/	- `repository/` — persistence interfaces

│   │   ├── components/        # Reusable UI components	- `model/` — domain models and DTOs

│   │   ├── pages/             # Route pages (Login, Dashboard, etc.)	- `config/` — security, WebSocket, JWT utilities

│   │   ├── context/           # React Context providers

│   │   ├── services/          # API calls and utilities- Frontend

│   │   └── App.jsx            # Main app component	- `context/` — React Context providers (Auth, Group)

│   ├── Dockerfile             # Frontend container config	- `services/` — API wrappers (axios) and socket helpers

│   └── package.json           # Node.js dependencies	- `components/` — shared UI components (Navbar, ProtectedRoute)

│	- `pages/` — route pages (Login, Register, Dashboard, Groups, Chat, Calendar)

├── docker-compose.yml          # Multi-container orchestration

├── .github/workflows/          # CI/CD pipeline## Environment variables (.env usage)

├── .env.example               # Environment variables template

└── README.md                  # This fileSecurity note: Secrets (DB passwords, API keys, JWT secrets) must never be committed. Use environment variables for configuration. For local development create a `.env` file from `.env.example` and never commit it.

```

1) Create your local env file

## 🔧 Development Setup

	- Copy the example and fill values:

### Prerequisites

- Docker & Docker Compose (recommended)		cp .env.example .env

- OR: Java 17+, Node.js 20+, MySQL 8+

	- Then edit `.env` and provide the real values (Windows PowerShell example):

### Method 1: Docker Compose (Recommended)

		copy .env.example .env; notepad .env

```bash

# Start all services2) Variables used by the backend (Spring Boot)

docker-compose up --build

	- `DB_URL` — JDBC URL to your database (default: `jdbc:mysql://localhost:3306/studygroup`)

# View logs	- `DB_USERNAME` — DB username (default: `root`)

docker-compose logs -f	- `DB_PASSWORD` — DB password (no default; must be provided in production)



# Stop services	The backend reads these using Spring property placeholders. Example in `application.properties`:

docker-compose down

	spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/studygroup}

# Reset database	spring.datasource.username=${DB_USERNAME:root}

docker-compose down -v && docker-compose up --build	spring.datasource.password=${DB_PASSWORD:}

```

	- In production, set these as environment variables in your host (container orchestration, cloud service settings, or secret manager). Do not rely on `.env` in production.

### Method 2: Manual Setup

3) Variables used by the frontend (Vite)

1. **Database Setup**

   ```bash	- `VITE_API_URL` — Base URL for backend API calls (e.g. `http://localhost:8080/api`)

   # Create MySQL database	- `VITE_SOCKET_URL` — Socket server URL for websocket/chat features

   mysql -u root -p

   CREATE DATABASE studygroup;	Note: Vite exposes only env vars prefixed with `VITE_` to the client bundle.

   ```

4) Good practices

2. **Backend Setup**

   ```bash	- Use `.env.example` to show required variables and sensible defaults without secrets.

   cd backend	- Use platform-native secret stores (GitHub Secrets, AWS Secrets Manager, Azure Key Vault) for CI/CD and production.

   cp ../.env.example ../.env  # Edit with your database credentials	- If a secret was accidentally committed, rotate it immediately and purge it from git history.

   ./mvnw spring-boot:run      # Starts on http://localhost:8080

   ```## Running locally (quick start)



3. **Frontend Setup**1) Backend

   ```bash

   cd studygroup-frontend	- Ensure a MySQL instance is running and reachable at `DB_URL`.

   npm install	- From `backend/` directory:

   npm run dev                 # Starts on http://localhost:5173

   ```		./mvnw spring-boot:run



## 🔐 Environment Variables2) Frontend



### Required Variables	- From `studygroup-frontend/`:



Copy `.env.example` to `.env` and configure:		npm install

		npm run dev

```bash

# Database (for local development)3) Environment file example (Windows PowerShell copy):

SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/studygroup

SPRING_DATASOURCE_USERNAME=root	copy .env.example .env; notepad .env

SPRING_DATASOURCE_PASSWORD=your_mysql_password

## Next steps (recommended for production)

# Security

JWT_SECRET=your-super-secret-jwt-key-here- Replace `.env` secrets with a proper secrets store for staging/production.

- Add CI pipeline to run tests and build artifacts (GitHub Actions example can be added).

# CORS- Add database migrations (Flyway/Liquibase) and backups.

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173- Add monitoring, logging aggregation, TLS, and automated deployments.



# Frontend API endpointIf you want, I can now:

VITE_API_URL=http://localhost:8080/api- Commit these README and env improvements for you, and push to `main`.

VITE_SOCKET_URL=http://localhost:8080- Add a GitHub Actions workflow that builds backend and frontend and runs tests.

```- Check git history for any accidentally committed secrets and help remove them.



### Production Security NotesWhich would you like me to do next?

- **Never commit `.env`** - it's gitignored for security
- Use strong, unique passwords and JWT secrets
- In production, use environment variables or secret management (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate secrets regularly

## 🧪 Testing & Quality

```bash
# Run all tests
npm run test           # From root (runs both backend & frontend tests)

# Individual test suites
cd backend && ./mvnw test              # Backend tests
cd studygroup-frontend && npm test    # Frontend tests

# Code quality
npm run lint           # Frontend linting
```

## 🚀 Deployment

### CI/CD Pipeline

The project includes GitHub Actions for:
- ✅ Automated testing on PR/push
- 🐳 Docker image building & publishing
- 🔒 Security vulnerability scanning
- 📦 Artifact generation

### Required GitHub Secrets

Set these in **Settings → Secrets and Variables → Actions**:

```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_password
```

### Deployment Flow

1. **Feature Development**: Work on feature branches
2. **Pull Requests**: Create PR → automated tests run
3. **Development**: Merge to `dev` branch → tests run
4. **Production**: Merge to `main` → tests + build Docker images → push to registry

### Production Deployment

```bash
# Pull and run latest images
docker-compose pull
docker-compose up -d

# Or deploy to cloud platforms:
# - AWS ECS/Fargate
# - Azure Container Instances
# - Google Cloud Run
# - Kubernetes cluster
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Study Groups
- `GET /api/groups` - List all groups
- `POST /api/groups` - Create new group
- `GET /api/groups/{id}` - Get group details
- `PUT /api/groups/{id}` - Update group
- `DELETE /api/groups/{id}` - Delete group

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Database**: MySQL 8
- **Security**: Spring Security + JWT
- **Real-time**: WebSocket support
- **Build**: Maven

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router
- **State**: React Context API
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS (inline styles)
- **Build**: Vite

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Database**: MySQL (containerized for dev)

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check if ports are in use
   netstat -tulpn | grep :8080  # Backend
   netstat -tulpn | grep :3000  # Frontend
   netstat -tulpn | grep :3306  # MySQL
   ```

2. **Database connection issues**
   ```bash
   # Test MySQL connection
   mysql -u root -p -h localhost studygroup
   
   # Check Docker container logs
   docker-compose logs db
   ```

3. **Docker issues**
   ```bash
   # Clean up Docker resources
   docker-compose down -v
   docker system prune -f
   docker-compose up --build
   ```

## 📈 Next Steps

- [ ] Add comprehensive unit tests
- [ ] Implement real-time chat functionality
- [ ] Add user profile management
- [ ] Implement file sharing in groups
- [ ] Add email notifications
- [ ] Set up monitoring and logging
- [ ] Add database migrations (Flyway/Liquibase)
- [ ] Implement caching (Redis)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding! 🎉**