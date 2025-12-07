# Docker Setup Guide for Uitutive

## Overview

This guide shows you how to run the entire Uitutive application using Docker containers with Docker Compose.

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Network                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐   ┌──────────────┐  ┌────────────┐  │
│  │   Frontend   │   │   Backend    │  │   Ollama   │  │
│  │  (Nginx)     │──▶│  (Node.js)   │──▶│ (Local AI) │  │
│  │  Port 4200   │   │  Port 3000   │  │ Port 11434 │  │
│  └──────────────┘   └──────────────┘  └────────────┘  │
│                           │                             │
│                           ▼                             │
│                    ┌──────────────┐                     │
│                    │  Database    │                     │
│                    │ (SQLite/PG)  │                     │
│                    └──────────────┘                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Production Build (Recommended for Deployment)

```bash
# Copy environment file
Copy-Item .env.docker .env

# Build and start all services
docker-compose up --build

# In another terminal, download Ollama model (first time only)
docker exec uitutive-ollama ollama pull llama2
```

Access the app at:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api/v1
- **Ollama**: http://localhost:11434

### 2. Development Build (With Hot-Reload)

```bash
# Start with development compose file
docker-compose -f docker-compose.dev.yml up --build

# Download Ollama model
docker exec uitutive-ollama-dev ollama pull llama2
```

## Individual Service Commands

### Start all services (production)
```bash
docker-compose up -d
```

### Stop all services
```bash
docker-compose down
```

### Stop and remove data/volumes
```bash
docker-compose down -v
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ollama
```

### Rebuild containers
```bash
docker-compose up --build
```

## Configuration

### Using Different Database

**Edit `.env` or `docker-compose.yml`:**

```bash
# Use SQLite (default)
DB_TYPE=sqlite

# Use PostgreSQL
DB_TYPE=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=uitutive
```

### Using Different Ollama Model

Edit `.env`:
```bash
OLLAMA_MODEL=mistral
# Other options: neural-chat, llama2-uncensored, orca-mini, dolphin-mixtral
```

## Advanced: Customizing Containers

### Backend Dockerfile Customization

Edit `Dockerfile.backend` to:
- Change Node.js version
- Add additional dependencies
- Change build process

### Frontend Dockerfile Customization

Edit `Dockerfile.frontend` to:
- Change Nginx configuration
- Adjust build arguments
- Modify Angular build settings

### Nginx Configuration

Edit `nginx.conf` to:
- Change ports
- Add SSL/TLS
- Modify caching behavior
- Add authentication

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs ollama
```

### Ollama not responding
```bash
# Check if Ollama is healthy
docker ps | grep ollama

# Test Ollama connection
curl http://localhost:11434/api/tags
```

### Backend can't reach Ollama
- Make sure services are on the same network: `uitutive-network`
- Check DNS resolution: `docker exec uitutive-backend ping ollama`
- Verify environment variable: `docker exec uitutive-backend env | grep OLLAMA`

### Port already in use
```bash
# Find process using port 3000, 4200, etc.
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Database connection issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker-compose logs postgres
```

## Production Deployment

### 1. Use production compose file
```bash
docker-compose up -d
```

### 2. Set strong environment variables
```bash
POSTGRES_PASSWORD=strongpassword
CORS_ORIGIN=https://yourdomain.com
```

### 3. Add reverse proxy (optional)
Use Traefik or Nginx reverse proxy for SSL/TLS

### 4. Persistent volumes
- Data persists in Docker volumes automatically
- Backup volumes regularly:
```bash
docker run --rm -v uitutive_postgres-data:/data -v C:\backups:/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .
```

## Scaling

### Run multiple backend instances
```yaml
backend:
  deploy:
    replicas: 3
```

Then use a load balancer like Nginx.

## Performance Tips

1. **Allocate sufficient memory** to Docker (at least 4GB)
2. **Use SQLite for single-user**, PostgreSQL for production
3. **Cache Ollama models** as Docker volumes to avoid re-downloading
4. **Use multi-stage builds** to reduce image size

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Ollama Documentation](https://github.com/ollama/ollama)
