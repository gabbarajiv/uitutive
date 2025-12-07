# GPU Setup - Complete Guide Index

## 🎯 Start Here

Choose your path based on how much detail you want:

### ⚡ **I just want it to work (5 min)**
→ Read: `GPU_QUICK_START.md`

### 📖 **I want to understand everything**
→ Read: `GPU_SETUP_COMPLETE.md`

### 🔧 **I need specific commands**
→ Reference: `DOCKER_GPU_COMMANDS.md`

### 📚 **Deep dive into GPU acceleration**
→ Read: `GPU_ACCELERATION.md`

---

## 📋 File Reference

### Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| `GPU_QUICK_START.md` | Quick setup (5-10 min) | 3 min |
| `GPU_SETUP_COMPLETE.md` | Full guide with troubleshooting | 10 min |
| `DOCKER_GPU_COMMANDS.md` | Command reference & cheat sheet | 5 min |
| `GPU_ACCELERATION.md` | Detailed GPU setup & optimization | 15 min |

### Configuration Files

| File | Purpose | Use When |
|------|---------|----------|
| `docker-compose.gpu.yml` | Basic GPU support | First time setup |
| `docker-compose.gpu-optimized.yml` | **Recommended** - Full optimization | Production/Performance |
| `docker-compose.yml` | Standard (no GPU) | Fallback/Testing |

### Tools

| File | Purpose | How to Use |
|------|---------|-----------|
| `benchmark-ollama.ps1` | Performance benchmarking | `.\benchmark-ollama.ps1` |

---

## 🚀 Quick Commands

### Enable GPU and Start
```powershell
# 1. Enable GPU in Docker Desktop (one-time setup)
# Settings → Resources → GPU → Enable → Apply & Restart

# 2. Start with GPU optimization
docker-compose -f docker-compose.gpu-optimized.yml up --build

# 3. Download AI model (first time)
docker exec uitutive-ollama ollama pull mistral

# 4. Check GPU is working
docker exec uitutive-ollama nvidia-smi -l 1
```

### Stop
```powershell
docker-compose down
```

---

## 📊 GPU Performance Expectations

### Build Speed
| Component | Without GPU | With GPU | Speedup |
|-----------|-------------|----------|---------|
| Docker build | ~3 min | ~1.5 min | **2x faster** |
| Angular build | (same) | (same) | - |

### Inference Speed (Ollama)
| Setup | Speed | Time/Response |
|-------|-------|---------------|
| CPU only | 5-10 tokens/sec | 30-60 sec |
| GPU (RTX 3060) | 80-100 tokens/sec | 2-5 sec |
| GPU (RTX 4090) | 200-300 tokens/sec | <2 sec |

**GPU = 10-30x faster inference!**

---

## ✅ Verification Steps

```powershell
# 1. GPU available?
nvidia-smi

# 2. Docker can use GPU?
docker run --rm --gpus all nvidia/cuda:12.2.0-base-windows-ltsc2022 nvidia-smi

# 3. Containers running?
docker ps

# 4. Ollama using GPU?
docker exec uitutive-ollama nvidia-smi

# 5. API responsive?
curl http://localhost:11434/api/tags
```

---

## 🐛 Troubleshooting

**GPU not detected?**
```powershell
# Restart Docker Desktop and run:
docker run --rm --gpus all nvidia/cuda:12.2.0-base-windows-ltsc2022 nvidia-smi
```

**Out of memory?**
```powershell
# Use smaller model:
# Edit .env: OLLAMA_MODEL=mistral
# Restart: docker-compose restart ollama
```

**Build too slow?**
```powershell
# Enable BuildKit:
$env:DOCKER_BUILDKIT=1
docker-compose -f docker-compose.gpu-optimized.yml up --build
```

→ **More help?** See: `GPU_SETUP_COMPLETE.md` → Troubleshooting section

---

## 🎯 Recommended Setup

```powershell
# Best for performance:
1. Enable GPU in Docker Desktop
2. Use docker-compose.gpu-optimized.yml
3. Enable BuildKit: $env:DOCKER_BUILDKIT=1
4. Use mistral model (fast, high quality)
5. Monitor with: docker exec uitutive-ollama nvidia-smi -l 1
```

---

## 📚 Next Steps

1. **Enable GPU** in Docker Desktop (one-time)
2. **Read** `GPU_QUICK_START.md` (5 min)
3. **Run** `docker-compose -f docker-compose.gpu-optimized.yml up --build`
4. **Test** with `.\benchmark-ollama.ps1`
5. **Enjoy** 10-30x faster inference!

---

## 💡 Tips

- **Fastest models**: mistral, orca-mini (7GB VRAM)
- **Balanced**: llama2, neural-chat (9-13GB VRAM)
- **Most capable**: dolphin-mixtral (50GB+ VRAM)

Choose based on your GPU VRAM!

```powershell
# Check your GPU VRAM:
docker exec uitutive-ollama nvidia-smi | Select-String "Memory"
```

---

## 🔗 External Resources

- [NVIDIA GPU Docker Setup](https://github.com/NVIDIA/nvidia-docker)
- [Ollama GPU Support](https://github.com/ollama/ollama/blob/main/docs/gpu.md)
- [Docker GPU Guide](https://docs.docker.com/config/containers/resource_constraints/#gpu)
- [BuildKit Documentation](https://docs.docker.com/build/buildkit/)

---

**Questions?** Check the specific documentation file for your use case above! 👆
