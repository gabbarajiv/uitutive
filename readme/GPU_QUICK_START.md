# Quick GPU Setup for Windows

## 1. Check Your GPU

```powershell
# Open PowerShell and run:
Get-WmiObject Win32_VideoController | Select Name, Description
```

## 2. Enable GPU in Docker Desktop

1. Open **Docker Desktop**
2. Click **Settings** (⚙️)
3. Go to **Resources** → **GPU**
4. **Enable GPU** (toggle on)
5. **Apply & Restart**

## 3. Verify GPU Works

```powershell
# Test GPU access
docker run --rm --gpus all nvidia/cuda:12.2.0-base-windows-ltsc2022 nvidia-smi

# Should show your GPU info
```

## 4. Start with GPU

```powershell
# Use GPU compose file
cd C:\Users\rajiv\uitutive
docker-compose -f docker-compose.gpu.yml up --build

# This enables GPU for:
# - Ollama (AI inference)
# - Docker build (faster image building)
```

## 5. Verify Ollama is Using GPU

```powershell
# In another terminal:
docker exec uitutive-ollama nvidia-smi

# Should show GPU usage
```

## 6. Performance Check

```powershell
# Test inference speed
docker exec uitutive-ollama ollama run llama2 "Hello, what is your name?"

# With GPU: ~2-5 sec response
# Without GPU: ~30-60 sec response
```

## Troubleshooting

**GPU not showing in `nvidia-smi`?**
- Restart Docker Desktop
- Check NVIDIA drivers: `nvidia-smi` (in host terminal)
- Update drivers: https://www.nvidia.com/Download/driverDetails.aspx

**Build still slow?**
```powershell
# Enable Docker BuildKit for faster builds
$env:DOCKER_BUILDKIT=1
docker-compose -f docker-compose.gpu.yml up --build
```

**Out of memory?**
- Use smaller model: `OLLAMA_MODEL=mistral` (instead of llama2)
- Check VRAM: `docker exec uitutive-ollama nvidia-smi`

## Common GPU Models & VRAM

| Model | VRAM | Speed |
|-------|------|-------|
| orca-mini | 3GB | Fast ⚡ |
| mistral | 7GB | Fast+ ⚡⚡ |
| llama2 | 7GB | Medium ⚡⚡ |
| neural-chat | 13GB | Slow 🐢 |
| dolphin-mixtral | 50GB | Slow 🐢 |

Choose based on your GPU VRAM!
