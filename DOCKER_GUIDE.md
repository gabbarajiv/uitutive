# Docker Setup Guide for Uitutive

This guide explains how to build and run the Uitutive application using Docker.

## Prerequisites

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- At least 4GB of available RAM
- 10GB of disk space (for container images and data)

## Quick Start

### 1. Build and Run (Development)

```bash
# Build the Docker image
docker-compose build

# Start all services with development configuration
docker-compose --env-file .env.docker.dev up -d

# View logs
docker-compose logs -f uitutive

# Stop services
docker-compose down
```

### 2. Setup Ollama Model

```bash
# Open a shell in the ollama container
docker exec -it ollama-service bash

# Pull the llama2 model (first time, this takes time)
ollama pull llama2

# Exit the container
exit
```

### 3. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api/v1
- **Ollama**: http://localhost:11434

## Configuration

### Environment Files

The project includes three environment configuration files:

- `.env.docker` - Default configuration (production-like)
- `.env.docker.dev` - Development configuration (SQLite)
- `.env.docker.prod` - Production configuration (PostgreSQL)

To use a specific configuration:

```bash
docker-compose --env-file .env.docker.dev up -d
```

### Environment Variables

Key variables can be customized:

```
NODE_ENV=production          # Node environment: production, development, staging
DB_TYPE=sqlite               # Database: sqlite or postgres
OLLAMA_BASE_URL=...         # Ollama service URL
CORS_ORIGIN=...             # Frontend URL for CORS
```

## Services

### Main Application (uitutive)
- **Port**: 3000 (Backend), 4200 (Frontend)
- **Type**: Node.js + Angular
- **Status**: Includes health check

### Ollama
- **Port**: 11434
- **Purpose**: AI model serving (llama2)
- **Storage**: Persistent volume for models

### PostgreSQL (Optional)
- **Port**: 5432
- **Usage**: Enable with `--profile postgres`
- **Storage**: Persistent volume for data

### pgAdmin (Optional)
- **Port**: 5050
- **Usage**: Enable with `--profile postgres`
- **Purpose**: Database management UI

## Common Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs -f uitutive

# Last 100 lines
docker-compose logs --tail 100
```

### Execute Commands in Container
```bash
# Access shell
docker exec -it uitutive-app sh

# Run npm commands
docker exec uitutive-app npm list
```

### Database Management

#### SQLite (Development)
```bash
# Database file location
data/uitutive.db

# Access from container
docker exec -it uitutive-app sqlite3 /app/data/uitutive.db
```

#### PostgreSQL (Production)
```bash
# Start with PostgreSQL
docker-compose --profile postgres --env-file .env.docker.prod up -d

# Connect with psql
docker exec -it uitutive-postgres psql -U postgres -d uitutive

# pgAdmin web interface
# Navigate to http://localhost:5050
```

### Rebuild Everything
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Clean Up
```bash
# Remove containers and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Prune all unused resources
docker system prune -a
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs uitutive

# Check health status
docker-compose ps

# Inspect container
docker inspect uitutive-app
```

### Database Connection Issues
```bash
# Verify database service is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker exec uitutive-app npm run typecheck
```

### Ollama Model Issues
```bash
# Check available models
docker exec ollama-service ollama list

# Re-pull model
docker exec ollama-service ollama pull llama2

# Check ollama logs
docker-compose logs ollama
```

### Out of Memory
```bash
# Increase Docker's memory allocation in Docker Desktop settings
# Or clean up resources
docker system prune -a --volumes
```

## Performance Optimization

### For Development
- Use SQLite (faster for development)
- Enable source maps for debugging
- Use `.env.docker.dev` configuration

### For Production
- Use PostgreSQL (more reliable, scalable)
- Use `.env.docker.prod` configuration
- Set `NODE_ENV=production`
- Use volume mounts for persistent data
- Configure appropriate resource limits

## Deployment Examples

### Docker Stack (Swarm)
```bash
# Deploy as stack
docker stack deploy -c docker-compose.yml uitutive
```

### Kubernetes
```bash
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml -o k8s/
kubectl apply -f k8s/
```

### Cloud Deployment

See `DOCKER_DEPLOYMENT.md` for cloud-specific deployment instructions.

## Security Considerations

1. **Environment Variables**: Always use `.env` files, never commit sensitive data
2. **Database Passwords**: Change default PostgreSQL password in production
3. **CORS**: Configure appropriate CORS origin for your domain
4. **Network**: Use private networks for inter-service communication
5. **Volumes**: Ensure proper permissions on mounted volumes

## Monitoring

### Health Checks
The application includes built-in health checks:

```bash
# Manual health check
curl http://localhost:3000/api/v1

# Via Docker
docker-compose ps
```

### Resource Usage
```bash
# Monitor container stats
docker stats

# CPU and memory info
docker stats --no-stream
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Angular with Docker](https://angular.io/guide/docker)
- [Express.js Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Review this guide
3. Check Docker Desktop settings and resource allocation
4. Ensure all ports are available and not in use

---

Last Updated: December 2024
