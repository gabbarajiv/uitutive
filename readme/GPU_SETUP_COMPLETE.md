# Docker GPU Setup Summary

## 🚀 Quick Start (5 minutes)

### Step 1: Enable GPU in Docker Desktop
```powershell
# 1. Open Docker Desktop app
# 2. Settings → Resources → GPU → Enable
# 3. Apply & Restart
```

### Step 2: Verify GPU Works
```powershell
docker run --rm --gpus all nvidia/cuda:12.2.0-base-windows-ltsc2022 nvidia-smi
# Should show your GPU info
```

### Step 3: Start Application with GPU
```powershell
cd C:\Users\rajiv\uitutive

# Option 1: Full GPU optimization (recommended)
docker-compose -f docker-compose.gpu-optimized.yml up --build

# Option 2: Standard with GPU support
docker-compose -f docker-compose.gpu.yml up --build

# Option 3: Enable BuildKit for faster builds
$env:DOCKER_BUILDKIT=1
docker-compose -f docker-compose.gpu-optimized.yml up --build
```

### Step 4: Verify GPU is Being Used
```powershell
# In another terminal, monitor GPU usage:
docker exec uitutive-ollama nvidia-smi -l 1

# Or check Ollama is using GPU:
docker exec uitutive-ollama ollama ps
```

---

## 📊 Available Compose Files

| File | Purpose | GPU | BuildKit | Best For |
|------|---------|-----|----------|----------|
| `docker-compose.yml` | Standard | ❌ | ❌ | Testing/Demo |
| `docker-compose.dev.yml` | Development | ❌ | ❌ | Local development |
| `docker-compose.gpu.yml` | With GPU | ✅ | ❌ | GPU-enabled inference |
| `docker-compose.gpu-optimized.yml` | Full optimization | ✅ | ✅ | **Recommended** |

---

## 🎮 GPU Performance

### Expected Speeds with GPU

| GPU | Model | Speed | VRAM |
|-----|-------|-------|------|
| RTX 3060 | mistral | ~100 tokens/sec | 7GB |
| RTX 3060 | llama2 | ~80 tokens/sec | 9GB |
| RTX 3090 | mistral | ~200 tokens/sec | 7GB |
| RTX 4090 | llama2 | ~300 tokens/sec | 9GB |
| CPU only | llama2 | ~5-10 tokens/sec | RAM |

**With GPU: 10-30x faster than CPU!**

---

## 🔧 Advanced Configuration

### Use Specific GPU (Multi-GPU Systems)
```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            device_ids: ['0']  # Use first GPU
            capabilities: [gpu]
```

### Disable GPU (CPU Fallback)
```yaml
ollama:
  environment:
    - OLLAMA_NUM_GPU=0  # Use CPU
```

### Limit GPU Memory Usage
```yaml
ollama:
  deploy:
    resources:
      limits:
        memory: 12G  # Max memory
      reservations:
        memory: 8G   # Guaranteed memory
        devices:
          - driver: nvidia
            capabilities: [gpu]
```

---

## 📈 Build Acceleration

### Enable Docker BuildKit (Faster Builds)
```powershell
# Set environment variable
$env:DOCKER_BUILDKIT=1

# Then build
docker-compose -f docker-compose.gpu-optimized.yml up --build

# Unset when done
$env:DOCKER_BUILDKIT=0
```

**Build Time Comparison:**
- Without BuildKit: ~3 minutes
- With BuildKit: ~1.5 minutes
- **50% faster!**

---

## ⚙️ Troubleshooting

### GPU Not Detected

```powershell
# 1. Check host GPU
nvidia-smi

# 2. Check Docker GPU access
docker run --rm --gpus all nvidia/cuda:12.2.0-base-windows-ltsc2022 nvidia-smi

# 3. If still failing:
# - Restart Docker Desktop
# - Update NVIDIA drivers: https://nvidia.com/Download/driverDetails.aspx
# - Restart Windows
```

### Out of Memory Errors

```powershell
# Check available VRAM
docker exec uitutive-ollama nvidia-smi

# Solution: Use smaller model
# Edit .env:
OLLAMA_MODEL=mistral  # Smaller than llama2

# Restart
docker-compose restart ollama
```

### Model Download Slow

```powershell
# Pre-download model before starting
docker exec uitutive-ollama ollama pull mistral

# Or use faster model
OLLAMA_MODEL=orca-mini
```

### Ollama API Unresponsive

```powershell
# Check Ollama logs
docker logs uitutive-ollama

# Restart container
docker-compose restart ollama

# If GPU issues:
docker-compose -f docker-compose.gpu-optimized.yml restart ollama
```

---

## 🧪 Testing GPU

### Test GPU in Container
```powershell
# Run GPU test
docker run --rm --gpus all nvidia/cuda:12.2.0-base-windows-ltsc2022 nvidia-smi

# Expected output shows GPU info
```

### Benchmark Ollama
```powershell
# Use included benchmark script
.\benchmark-ollama.ps1

# Or manual test
docker exec uitutive-ollama ollama run mistral "Explain AI in 50 words"

# Time the response (with GPU: 2-5 sec, without GPU: 30-60 sec)
```

### Monitor GPU in Real-Time
```powershell
# Watch GPU usage
docker exec uitutive-ollama nvidia-smi -l 1

# Shows:
# - GPU utilization %
# - VRAM usage
# - Temperature
# - Power draw
```

---

## 🎯 Recommended Setup

For best performance:

```powershell
# 1. Enable GPU in Docker Desktop
# 2. Update drivers
# 3. Create .env file with:
OLLAMA_MODEL=mistral
DB_TYPE=sqlite

# 4. Start with optimized compose
$env:DOCKER_BUILDKIT=1
docker-compose -f docker-compose.gpu-optimized.yml up --build

# 5. Download model (first time only)
docker exec uitutive-ollama ollama pull mistral

# 6. Monitor performance
docker exec uitutive-ollama nvidia-smi -l 1
```

---

## 📚 Resources

- [NVIDIA Docker Docs](https://github.com/NVIDIA/nvidia-docker)
- [Ollama GPU Support](https://github.com/ollama/ollama/blob/main/docs/gpu.md)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Docker BuildKit](https://docs.docker.com/build/buildkit/)

---

## ✅ Verification Checklist

- [ ] GPU enabled in Docker Desktop
- [ ] `nvidia-smi` shows your GPU
- [ ] Docker can access GPU: `docker run --rm --gpus all ... nvidia-smi`
- [ ] Using `docker-compose.gpu-optimized.yml`
- [ ] BuildKit enabled: `$env:DOCKER_BUILDKIT=1`
- [ ] Model downloaded: `docker exec uitutive-ollama ollama list`
- [ ] Ollama responding fast (< 5 sec)
- [ ] GPU utilization visible: `nvidia-smi -l 1`
