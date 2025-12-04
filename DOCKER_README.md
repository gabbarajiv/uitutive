# Docker Setup for Uitutive

Complete Docker and containerization setup for running Uitutive (Angular Frontend + Node.js Backend) in any environment.

## 📋 What's Included

### Docker Files
- **Dockerfile** - Production multi-stage build
- **Dockerfile.dev** - Development build with hot reload
- **.dockerignore** - Excludes unnecessary files from build

### Docker Compose
- **docker-compose.yml** - Production configuration with all services
- **docker-compose.dev.yml** - Development configuration with hot reload
- **Services included**: Uitutive App, Ollama, PostgreSQL, pgAdmin

### Environment Configuration
- **.env.docker** - Production-like default configuration
- **.env.docker.dev** - Development configuration
- **.env.docker.prod** - Production configuration (PostgreSQL)

### Helper Scripts
- **docker-helper.sh** - Linux/macOS helper script
- **docker-helper.bat** - Windows helper script

### Documentation
- **DOCKER_GUIDE.md** - Comprehensive Docker usage guide
- **DOCKER_DEPLOYMENT.md** - Cloud deployment strategies

## 🚀 Quick Start

### Windows
```powershell
# Build and start
docker-compose build
docker-compose up -d

# View status
docker-compose ps

# Check logs
docker-compose logs -f uitutive

# Setup Ollama
docker exec ollama-service ollama pull llama2

# Stop services
docker-compose down
```

### Linux/macOS
```bash
# Make helper script executable
chmod +x docker-helper.sh

# Build and start
./docker-helper.sh build
./docker-helper.sh up prod

# Setup Ollama
./docker-helper.sh setup-ollama

# View logs
./docker-helper.sh logs

# Stop
./docker-helper.sh down
```

## 🎯 Common Tasks

### Start Development Environment
```bash
# Linux/macOS
./docker-helper.sh up dev

# Windows
docker-helper.bat up dev

# Manual
docker-compose --env-file .env.docker.dev up -d
```

### Start Production Environment
```bash
# Linux/macOS
./docker-helper.sh up prod

# Windows
docker-helper.bat up prod

# Manual
docker-compose --env-file .env.docker.prod up -d
```

### Access Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000/api/v1
- **Ollama**: http://localhost:11434
- **pgAdmin** (if enabled): http://localhost:5050

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f uitutive

# Last 100 lines
docker-compose logs --tail 100
```

### Execute Commands
```bash
# Shell access
docker exec -it uitutive-app sh

# Run npm command
docker exec uitutive-app npm list

# Database operations
docker exec -it uitutive-postgres psql -U postgres -d uitutive
```

## 📊 Services Overview

### Uitutive Application
- **Container**: uitutive-app
- **Ports**: 3000 (Backend), 4200 (Frontend)
- **Technology**: Node.js + Express + Angular
- **Status**: Includes health checks

### Ollama AI Service
- **Container**: ollama-service
- **Port**: 11434
- **Purpose**: AI model serving
- **Default Model**: llama2

### PostgreSQL Database (Optional)
- **Container**: uitutive-postgres
- **Port**: 5432
- **Profile**: postgres
- **Usage**: Production database

### pgAdmin (Optional)
- **Container**: pgadmin
- **Port**: 5050
- **Profile**: postgres
- **Purpose**: Database management UI

## 🔧 Configuration

### Environment Variables

**Database**
```env
DB_TYPE=sqlite              # or postgres
SQLITE_PATH=./data/uitutive.db
POSTGRES_HOST=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=uitutive
```

**Ollama**
```env
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama2
OLLAMA_TIMEOUT=30000
```

**CORS**
```env
CORS_ORIGIN=http://localhost:4200
```

### Database Selection

**Development**: SQLite (default)
- Faster setup
- No external dependencies
- File-based storage at `./data/uitutive.db`

**Production**: PostgreSQL
- More reliable
- Better for scaling
- Managed service option
- Enable with: `--profile postgres`

## 📈 Scaling & Performance

### Horizontal Scaling
```bash
# Multiple instances
docker-compose up -d --scale uitutive=3
```

### Resource Limits
```bash
# Set in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

### Database Connection Pooling
- Configured in backend config
- Uses connection pooling for PostgreSQL
- Improves performance under load

## 🔍 Monitoring & Health

### Health Check
```bash
curl http://localhost:3000/api/v1
```

### Container Status
```bash
docker-compose ps
docker stats
```

### Logs
```bash
docker-compose logs --follow
```

## 🧹 Cleanup

### Remove Containers Only
```bash
docker-compose down
```

### Remove Containers and Volumes
```bash
docker-compose down -v
```

### Deep Clean (Danger!)
```bash
docker system prune -a --volumes
```

## 📚 Documentation

- **DOCKER_GUIDE.md** - Detailed Docker setup and commands
- **DOCKER_DEPLOYMENT.md** - Cloud deployment strategies
- **backend/README.md** - Backend setup
- **Main README.md** - Project overview

## 🐛 Troubleshooting

### Container Won't Start
```bash
docker-compose logs uitutive
docker inspect uitutive-app
```

### Database Connection Error
```bash
docker-compose logs postgres
docker exec utitutive-app npm run typecheck
```

### Port Already in Use
```bash
# Find what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Change port in .env file
APP_PORT=3001
```

### Out of Memory
```bash
docker system prune -a
# Increase Docker memory in Docker Desktop settings
```

## 🔐 Security

- All environment variables use `.env` files
- Never commit `.env` files to git
- Change default PostgreSQL password in production
- Use secrets management for sensitive data
- Enable SSL/TLS for production
- Configure appropriate CORS origins

## 🚀 Deployment

For cloud deployment instructions, see **DOCKER_DEPLOYMENT.md**:
- AWS (EC2, ECS, Lightsail)
- Google Cloud (Cloud Run, GKE)
- Azure (ACI, App Service)
- DigitalOcean
- Kubernetes

## 📞 Support

### Common Commands Reference

```bash
# Build
docker-compose build

# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Status
docker-compose ps

# Shell
docker exec -it <container> sh

# Clean
docker-compose down -v
```

### Helper Scripts

**Linux/macOS**:
```bash
./docker-helper.sh help
./docker-helper.sh up dev
./docker-helper.sh logs
./docker-helper.sh setup-ollama
```

**Windows**:
```cmd
docker-helper.bat help
docker-helper.bat up dev
docker-helper.bat logs
docker-helper.bat setup-ollama
```

## 📝 Notes

- Build is optimized for production (multi-stage, minimal layers)
- Development build includes hot-reload capability
- Ollama model (llama2) must be pulled manually on first run
- SQLite used by default for development
- PostgreSQL recommended for production
- All services communicate through internal network
- Data persists in volumes

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Compatibility**: Docker 20.10+, Docker Compose 2.0+
