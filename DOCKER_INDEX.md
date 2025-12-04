# 🐳 Uitutive Docker Setup - Complete Package

**Status**: ✅ Ready to Deploy | **Version**: 1.0.0 | **Date**: December 2024

Your complete Docker containerization solution for Uitutive (Angular Frontend + Node.js Backend).

---

## 📦 What's Been Created

### Core Docker Files (4 files)
| File | Purpose | Use Case |
|------|---------|----------|
| `Dockerfile` | Production multi-stage build | Production deployments |
| `Dockerfile.dev` | Development with hot reload | Local development |
| `docker-compose.yml` | Production services stack | Production environment |
| `docker-compose.dev.yml` | Development services stack | Development environment |
| `.dockerignore` | Build optimization | Speeds up builds |

### Configuration Files (3 files)
| File | Purpose | Environment |
|------|---------|-------------|
| `.env.docker` | Default production-like | General use |
| `.env.docker.dev` | SQLite, debugging | Development |
| `.env.docker.prod` | PostgreSQL, optimized | Production |

### Helper Scripts (2 files)
| File | Platform | Features |
|------|----------|----------|
| `docker-helper.sh` | Linux/macOS | 10 commands with help |
| `docker-helper.bat` | Windows | 10 commands with help |

### Documentation (6 files)
| File | Length | Content |
|------|--------|---------|
| `DOCKER_README.md` | Quick reference | Setup, tasks, troubleshooting |
| `DOCKER_GUIDE.md` | Comprehensive | Detailed guide and configuration |
| `DOCKER_DEPLOYMENT.md` | Advanced | Cloud deployments (AWS, GCP, Azure, etc.) |
| `DOCKER_DEPLOYMENT_CHECKLIST.md` | Operational | Pre/during/post deployment checklist |
| `DOCKER_SETUP_SUMMARY.md` | Executive summary | Files created and quick start |
| This file | Navigation | How to use everything |

---

## 🚀 Quick Start (Choose Your Platform)

### Windows Users
```powershell
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Setup AI model (takes 5-10 minutes)
docker exec ollama-service ollama pull llama2

# View logs
docker-compose logs -f

# Access application
# Frontend: http://localhost:4200
# API: http://localhost:3000/api/v1

# Stop services
docker-compose down
```

### Linux/macOS Users
```bash
# Make helper script executable
chmod +x docker-helper.sh

# Build and start (production)
./docker-helper.sh build
./docker-helper.sh up prod

# Setup AI model
./docker-helper.sh setup-ollama

# View status
./docker-helper.sh status

# View logs
./docker-helper.sh logs

# Stop services
./docker-helper.sh down
```

---

## 📚 Documentation Guide

### Start Here: Quick Reference
**File**: `DOCKER_README.md` (3-5 min read)
- Quick start for all platforms
- Common tasks and commands
- Service overview
- Basic troubleshooting

### Then: Detailed Setup
**File**: `DOCKER_GUIDE.md` (20-30 min read)
- Complete Docker usage guide
- Configuration options
- All services explained
- Advanced features
- Performance optimization
- Security considerations

### For Deployment: Cloud Strategy
**File**: `DOCKER_DEPLOYMENT.md` (30-45 min read)
- Local Docker deployment
- Docker Hub setup
- AWS (EC2, ECS, Lightsail)
- Google Cloud (Cloud Run, GKE)
- Azure (ACI, App Service)
- DigitalOcean
- Kubernetes deployment
- Scaling strategies

### For Production: Checklist
**File**: `DOCKER_DEPLOYMENT_CHECKLIST.md` (Reference)
- Pre-deployment checks
- Build phase verification
- Configuration validation
- Deployment steps
- Post-deployment verification
- Ongoing maintenance
- Troubleshooting guide

---

## 🎯 Common Tasks

### Development Workflow
```bash
# Option 1: Using helper script (Linux/macOS)
./docker-helper.sh up dev

# Option 2: Manual command
docker-compose --env-file .env.docker.dev up -d

# Option 3: Windows
docker-helper.bat up dev
```

### Production Deployment
```bash
# Option 1: Using helper script (Linux/macOS)
./docker-helper.sh up prod

# Option 2: Manual command
docker-compose --env-file .env.docker.prod up -d

# Option 3: With PostgreSQL
docker-compose --profile postgres --env-file .env.docker.prod up -d
```

### View Application Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f uitutive
docker-compose logs -f ollama
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail 100
```

### Access Container Shell
```bash
# Application shell
docker exec -it uitutive-app sh

# Database shell (SQLite)
docker exec -it uitutive-app sqlite3 /app/data/uitutive.db

# Database shell (PostgreSQL)
docker exec -it uitutive-postgres psql -U postgres -d uitutive

# Ollama shell
docker exec -it ollama-service bash
```

### Database Operations
```bash
# SQLite
docker exec -it uitutive-app sqlite3 /app/data/uitutive.db ".schema"

# PostgreSQL - list databases
docker exec -it uitutive-postgres psql -U postgres -l

# PostgreSQL - connect to database
docker exec -it uitutive-postgres psql -U postgres -d uitutive
```

### Monitor Resources
```bash
# View container stats
docker stats

# View container status
docker-compose ps

# View disk usage
docker system df
```

---

## 🔧 Configuration Reference

### Essential Environment Variables

**Database**
```env
DB_TYPE=sqlite|postgres        # Database type
SQLITE_PATH=./data/uitutive.db # SQLite file location
POSTGRES_HOST=postgres         # PostgreSQL host
POSTGRES_PORT=5432            # PostgreSQL port
POSTGRES_USER=postgres        # PostgreSQL user
POSTGRES_PASSWORD=***         # PostgreSQL password (CHANGE THIS!)
POSTGRES_DB=uitutive          # PostgreSQL database name
```

**Ollama AI**
```env
OLLAMA_BASE_URL=http://ollama:11434  # Ollama endpoint
OLLAMA_MODEL=llama2                   # Default model
OLLAMA_TIMEOUT=30000                  # Timeout in ms
```

**Application**
```env
NODE_ENV=production|development|staging  # Environment
PORT=3000                               # Backend port
CORS_ORIGIN=http://localhost:4200       # Frontend URL
```

**PostgreSQL Admin**
```env
PGADMIN_EMAIL=admin@example.com    # pgAdmin email
PGADMIN_PASSWORD=admin             # pgAdmin password (CHANGE THIS!)
PGADMIN_PORT=5050                  # pgAdmin port
```

---

## 📊 Services & Access

| Service | Port | URL | Container | Status |
|---------|------|-----|-----------|--------|
| **Frontend** | 4200 | http://localhost:4200 | uitutive-app | Default |
| **Backend API** | 3000 | http://localhost:3000/api/v1 | uitutive-app | Default |
| **Ollama AI** | 11434 | http://localhost:11434 | ollama-service | Default |
| **PostgreSQL** | 5432 | localhost:5432 | uitutive-postgres | Optional |
| **pgAdmin** | 5050 | http://localhost:5050 | pgadmin | Optional |

### Enabling Optional Services

```bash
# PostgreSQL + pgAdmin (production setup)
docker-compose --profile postgres --env-file .env.docker.prod up -d

# Then access:
# - pgAdmin: http://localhost:5050
# - Add server: hostname=postgres, port=5432
```

---

## 🆘 Troubleshooting Quick Guide

### Container Won't Start
```bash
# Check logs
docker-compose logs uitutive

# Check status
docker-compose ps

# Restart
docker-compose restart
```

### Port Already in Use
```bash
# Check what's using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Change port in .env
APP_PORT=3001

# Restart
docker-compose down && docker-compose up -d
```

### Database Connection Failed
```bash
# Check database logs
docker-compose logs postgres
docker-compose logs uitutive

# Test connection
docker exec -it uitutive-postgres psql -U postgres

# Verify environment variables
docker-compose config | grep POSTGRES
```

### Out of Memory
```bash
# Check resource usage
docker stats

# Clean up
docker system prune -a --volumes

# Increase Docker memory in Docker Desktop settings
```

### Ollama Model Issues
```bash
# Check available models
docker exec ollama-service ollama list

# Re-pull model
docker exec ollama-service ollama pull llama2

# Check Ollama logs
docker-compose logs ollama
```

See `DOCKER_GUIDE.md` for comprehensive troubleshooting.

---

## 🐛 Helper Scripts Usage

### Linux/macOS (`docker-helper.sh`)

```bash
chmod +x docker-helper.sh

./docker-helper.sh help              # Show all commands
./docker-helper.sh build             # Build images
./docker-helper.sh up dev            # Start development
./docker-helper.sh up prod           # Start production
./docker-helper.sh down              # Stop all services
./docker-helper.sh logs              # View logs
./docker-helper.sh logs uitutive     # View specific service logs
./docker-helper.sh shell             # Access shell
./docker-helper.sh shell postgres    # Access database shell
./docker-helper.sh status            # Show container status
./docker-helper.sh health            # Check health
./docker-helper.sh setup-ollama      # Setup AI model
./docker-helper.sh clean             # Clean resources
./docker-helper.sh prune             # Deep clean
```

### Windows (`docker-helper.bat`)

```cmd
docker-helper.bat help               # Show all commands
docker-helper.bat build              # Build images
docker-helper.bat up dev             # Start development
docker-helper.bat up prod            # Start production
docker-helper.bat down               # Stop all services
docker-helper.bat logs               # View logs
docker-helper.bat shell              # Access shell
docker-helper.bat status             # Show status
docker-helper.bat health             # Check health
docker-helper.bat setup-ollama       # Setup AI model
docker-helper.bat clean              # Clean resources
```

---

## 📈 Performance Tips

### Development
- Use SQLite (faster)
- Use `.env.docker.dev`
- Enable source maps
- Use hot reload

### Production
- Use PostgreSQL
- Enable connection pooling
- Configure resource limits
- Use `.env.docker.prod`
- Enable caching
- Monitor performance

---

## 🔐 Security Checklist

- [ ] Change PostgreSQL password
- [ ] Change pgAdmin password
- [ ] Set CORS_ORIGIN correctly
- [ ] Use environment files (never hardcode)
- [ ] Don't commit `.env` files
- [ ] Run as non-root
- [ ] Use minimal base images
- [ ] Keep images updated
- [ ] Scan images for vulnerabilities
- [ ] Enable SSL/TLS in production

---

## 📞 Quick Reference Commands

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
docker exec -it uitutive-app sh

# Clean
docker-compose down -v

# Full rebuild
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

---

## 📋 Files Summary

### Total Files Created: 14

**Docker Files**: 5
- Dockerfile
- Dockerfile.dev
- .dockerignore
- docker-compose.yml
- docker-compose.dev.yml

**Configuration Files**: 3
- .env.docker
- .env.docker.dev
- .env.docker.prod

**Helper Scripts**: 2
- docker-helper.sh
- docker-helper.bat

**Documentation**: 5
- DOCKER_README.md
- DOCKER_GUIDE.md
- DOCKER_DEPLOYMENT.md
- DOCKER_DEPLOYMENT_CHECKLIST.md
- DOCKER_SETUP_SUMMARY.md

**Navigation**: 1
- DOCKER_INDEX.md (this file)

---

## 🎓 Learning Path

1. **Start**: Read `DOCKER_README.md` (quick start)
2. **Learn**: Read `DOCKER_GUIDE.md` (detailed setup)
3. **Deploy**: Read `DOCKER_DEPLOYMENT.md` (cloud options)
4. **Operate**: Use `DOCKER_DEPLOYMENT_CHECKLIST.md` (ongoing)
5. **Automate**: Use helper scripts for daily operations

---

## ✅ Next Steps

### Immediate (Next 5 minutes)
1. Read `DOCKER_README.md`
2. Review `.env.docker` configuration
3. Verify Docker is installed

### Short-term (Next 30 minutes)
1. Build images: `docker-compose build`
2. Start services: `docker-compose up -d`
3. Setup Ollama: `docker exec ollama-service ollama pull llama2`
4. Test access to http://localhost:4200

### Medium-term (Next few hours)
1. Read `DOCKER_GUIDE.md`
2. Test all functionality
3. Verify data persistence
4. Test with different databases

### Long-term (For production)
1. Read `DOCKER_DEPLOYMENT.md`
2. Read `DOCKER_DEPLOYMENT_CHECKLIST.md`
3. Plan scaling strategy
4. Deploy to production

---

## 🌐 Resource Links

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Angular Docker Guide](https://angular.io/guide/docker)
- [Express Deployment](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Kubernetes Docs](https://kubernetes.io/docs/)

---

## 📝 Support

### Documentation Files
- `DOCKER_README.md` - Quick reference
- `DOCKER_GUIDE.md` - Detailed guide
- `DOCKER_DEPLOYMENT.md` - Cloud deployment
- `DOCKER_DEPLOYMENT_CHECKLIST.md` - Operations checklist

### Quick Troubleshooting
```bash
# Check what's wrong
docker-compose logs

# Get more details
docker-compose ps

# Restart everything
docker-compose restart

# Start fresh
docker-compose down -v
docker-compose up -d
```

---

## 🎉 You're Ready!

Your Uitutive application is now fully containerized and ready to run in Docker environments. Choose your platform above and get started!

**Any questions?** Refer to the appropriate documentation file or use the helper scripts for guided commands.

---

**Created**: December 2024  
**Status**: ✅ Complete and Ready  
**Version**: 1.0.0  

**Happy containerizing!** 🚀
