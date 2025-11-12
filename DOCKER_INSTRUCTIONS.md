# Docker Setup Instructions

This project uses Docker to containerize both the frontend and backend services.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Services Overview

1. **Backend Service** - PHP 7.4 with Apache
2. **Frontend Service** - React application with Vite
3. **Redis Service** - For data storage

## Quick Start

### For Production

```bash
# Build and start all services
docker-compose up -d

# Access the application:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### For Development

```bash
# Build and start all services in development mode
docker-compose -f docker-compose.dev.yml up -d

# Access the application:
# Frontend (with hot reloading): http://localhost:3000
# Backend API: http://localhost:8000
```

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

## Viewing Logs

```bash
# View logs for all services
docker-compose logs

# View logs for a specific service
docker-compose logs backend
```

## Project Structure in Docker

- Backend files are mounted to `/var/www/html` in the backend container
- Frontend files are mounted to `/app` in the frontend container
- Redis data is persisted in a Docker volume
- Uploaded files are persisted in a volume mapped to `public/uploads`

## Environment Variables

Environment variables can be set in the docker-compose files or by creating a `.env` file in the root directory.

## Notes

- The frontend is configured to proxy API requests to the backend service
- Uploaded files are persisted in a Docker volume to prevent data loss
- Redis data is also persisted in a Docker volume