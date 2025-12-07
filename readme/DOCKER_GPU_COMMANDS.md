# Docker GPU Commands Reference

## 🚀 Start/Stop

```powershell
# Start with GPU (full optimization)
docker-compose -f docker-compose.gpu-optimized.yml up --build

# Start in background
docker-compose -f docker-compose.gpu-optimized.yml up -d --build

# Stop all containers
docker-compose down

# Stop and remove data
docker-compose down -v
```

## 🔍 Monitoring

```powershell
# Real-time GPU monitoring
docker exec uitutive-ollama nvidia-smi -l 1

# Check model status
docker exec uitutive-ollama ollama ps

# View logs
docker logs -f uitutive-ollama
docker logs -f uitutive-backend
docker logs -f uitutive-frontend

# Check GPU memory
docker exec uitutive-ollama nvidia-smi --query-gpu=memory.used,memory.total --format=csv,nounits,noheader
```

## 📥 Model Management

```powershell
# List installed models
docker exec uitutive-ollama ollama list

# Download model
docker exec uitutive-ollama ollama pull mistral
docker exec uitutive-ollama ollama pull llama2
docker exec uitutive-ollama ollama pull orca-mini

# Remove model (free space)
docker exec uitutive-ollama ollama rm llama2

# Run model interactively
docker exec -it uitutive-ollama ollama run mistral
```

## 🧪 Testing

```powershell
# Test Ollama API
curl http://localhost:11434/api/tags

# Generate text
curl http://localhost:11434/api/generate -d '{
  "model": "mistral",
  "prompt": "Hello, who are you?",
  "stream": false
}'

# Test backend
curl http://localhost:3000/api/v1/health

# Test frontend
curl http://localhost:4200
```

## 🔧 Configuration

```powershell
# View active environment
docker exec uitutive-backend env | Select-String OLLAMA

# Change model (requires restart)
# Edit .env file:
# OLLAMA_MODEL=mistral
# Then: docker-compose restart ollama

# Check config in backend
docker exec uitutive-backend cat /app/backend/dist/config/config.js
```

## 🐛 Debugging

```powershell
# Enable BuildKit for faster debugging builds
$env:DOCKER_BUILDKIT=1

# Rebuild with verbose output
docker-compose -f docker-compose.gpu-optimized.yml build --progress=plain

# Check GPU access in specific container
docker exec uitutive-ollama nvidia-smi

# Test GPU from fresh container
docker run --rm --gpus all nvidia/cuda:12.2.0-base nvidia-smi

# Inspect container details
docker inspect uitutive-ollama | Select-String -Pattern "gpu|driver"
```

## 🧹 Cleanup

```powershell
# Remove containers
docker-compose down

# Remove images
docker image rm uitutive-frontend uitutive-backend

# Remove unused volumes
docker volume prune

# Remove all Docker artifacts
docker system prune -a --volumes

# Clean Docker build cache
docker builder prune
```

## 📊 Performance Benchmarks

```powershell
# Run inference benchmark (using script)
.\benchmark-ollama.ps1

# Manual benchmark
$start = Get-Date
docker exec uitutive-ollama ollama generate --model mistral --prompt "Hello"
$end = Get-Date
Write-Host "Time: $(($end - $start).TotalSeconds) seconds"

# Batch test multiple models
@("mistral", "llama2", "orca-mini") | ForEach-Object {
  $model = $_
  Write-Host "Testing $model..."
  $start = Get-Date
  docker exec uitutive-ollama ollama run $model "test" >$null
  $end = Get-Date
  Write-Host "  Time: $(($end - $start).TotalSeconds)s"
}
```

## 🔐 Security

```powershell
# Check what ports are exposed
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Restrict network access (edit docker-compose.yml)
# Remove public port bindings, use localhost only:
# ports:
#   - "127.0.0.1:11434:11434"  # Only local access

# Check container resource limits
docker stats --no-stream
```

## 📱 Access Points

```
Frontend:     http://localhost:4200
Backend API:  http://localhost:3000/api/v1
Ollama API:   http://localhost:11434
Database:     localhost:5432 (postgres)
```

## 🎯 Common Workflows

### Fresh Start
```powershell
docker-compose down -v
$env:DOCKER_BUILDKIT=1
docker-compose -f docker-compose.gpu-optimized.yml up --build
docker exec uitutive-ollama ollama pull mistral
docker exec -it uitutive-ollama ollama run mistral
```

### Performance Tuning
```powershell
# 1. Check GPU status
docker exec uitutive-ollama nvidia-smi

# 2. Monitor real-time
docker exec uitutive-ollama nvidia-smi -l 1

# 3. Try faster model
docker exec uitutive-ollama ollama pull mistral
docker exec uitutive-ollama ollama run mistral

# 4. Benchmark
.\benchmark-ollama.ps1
```

### Troubleshooting
```powershell
# 1. Check logs
docker logs -f uitutive-ollama

# 2. Test GPU
docker run --rm --gpus all nvidia/cuda:12.2.0-base nvidia-smi

# 3. Restart services
docker-compose restart ollama

# 4. Clean and rebuild
docker-compose down -v
$env:DOCKER_BUILDKIT=1
docker-compose -f docker-compose.gpu-optimized.yml up --build
```

## 💾 Backup/Restore

```powershell
# Backup Ollama models
docker run --rm -v ollama_ollama-data:/data -v C:\backups:/backup `
  alpine tar czf /backup/ollama-backup.tar.gz -C /data .

# Restore Ollama models
docker run --rm -v ollama_ollama-data:/data -v C:\backups:/backup `
  alpine tar xzf /backup/ollama-backup.tar.gz -C /data

# Backup database
docker exec uitutive-postgres pg_dump -U postgres uitutive > backup.sql
```

## 🆘 Quick Fixes

| Issue | Fix |
|-------|-----|
| GPU not detected | `docker restart $(docker ps -q)` then restart Docker Desktop |
| Out of memory | Use smaller model: `OLLAMA_MODEL=mistral` |
| Slow build | Enable BuildKit: `$env:DOCKER_BUILDKIT=1` |
| Ollama unresponsive | `docker-compose restart ollama` |
| Port in use | Change port in docker-compose.yml or `docker-compose down` first |
| Container won't start | Check logs: `docker logs <container-name>` |
