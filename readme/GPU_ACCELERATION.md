# GPU Acceleration for Docker & Ollama

This guide shows how to use your GPU to accelerate Docker containers, especially for AI inference with Ollama.

## Prerequisites

### Check Your GPU

**For NVIDIA GPU:**
```powershell
# Check if you have NVIDIA GPU
nvidia-smi

# If command not found, install NVIDIA drivers from:
# https://www.nvidia.com/Download/driverDetails.aspx
```

**For AMD GPU:**
```powershell
# Check AMD GPU
gpu-z  # or check Device Manager
```

**For Intel GPU:**
```powershell
# Check Intel integrated GPU
Get-WmiObject Win32_VideoController
```

## Windows Setup for GPU

### Step 1: Install Docker Desktop GPU Support

#### NVIDIA GPU

1. **Install NVIDIA Docker Runtime:**
   ```powershell
   # Install NVIDIA Container Toolkit
   # Download from: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html
   
   # For Windows, use NVIDIA Container Runtime for Windows:
   # https://github.com/NVIDIA/nvidia-docker/releases
   ```

2. **Enable GPU in Docker Desktop:**
   - Open Docker Desktop
   - Go to **Settings** → **Resources** → **GPU**
   - Toggle **GPU** ON
   - Click **Apply & Restart**

3. **Verify GPU support:**
   ```powershell
   docker run --rm --gpus all nvidia/cuda:12.2.0-base-windows-ltsc2022 nvidia-smi
   ```

#### AMD GPU

1. **Install AMD Docker Runtime:**
   ```powershell
   # For Windows, AMD GPU support is limited
   # Use: https://github.com/RadeonOpenCompute/docker
   ```

2. **Enable GPU in Docker Desktop** (same as NVIDIA)

#### Intel GPU

1. **Enable GPU in Docker Desktop** (same as above)

2. **Use Intel's GPU image:**
   ```powershell
   docker run --rm --gpus all intel/intel-extension-for-pytorch:latest
   ```

### Step 2: Verify GPU Access

```powershell
# Test NVIDIA GPU in Docker
docker run --rm --gpus all nvidia/cuda:12.2.0-base nvidia-smi

# Should show your GPU info
```

## Using GPU with Your App

### Option 1: Use GPU Compose File (Recommended)

```powershell
# Start with GPU support
docker-compose -f docker-compose.gpu.yml up --build

# Or for development
docker-compose -f docker-compose.gpu.yml -f docker-compose.dev.yml up --build
```

### Option 2: Add GPU to Existing Compose File

Edit your `docker-compose.yml` and add to Ollama service:

```yaml
ollama:
  image: ollama/ollama:latest
  container_name: uitutive-ollama
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1  # Use 1 GPU, or 'all' for all GPUs
            capabilities: [gpu]
```

### Option 3: Manual Docker Run with GPU

```powershell
# Run Ollama with GPU
docker run --rm --gpus all -it -v ollama:/root/.ollama -p 11434:11434 ollama/ollama

# Run your backend with GPU-enabled Ollama
docker run --rm --gpus all -it ollama/ollama ollama run llama2
```

## GPU Performance Tips

### 1. Allocate Sufficient VRAM

```yaml
# For RTX 3060 (12GB VRAM)
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          device_ids: ['0']  # GPU device ID
          capabilities: [gpu]
```

### 2. Use Faster Ollama Models

For faster inference with less VRAM:
- **Fast**: mistral, neural-chat, orca-mini (3-7GB)
- **Balanced**: llama2, zephyr (7-13GB)
- **Powerful**: neural-chat-7b, dolphin-mixtral (13-50GB)

```bash
# Download faster model
docker exec uitutive-ollama ollama pull mistral

# Update environment variable
OLLAMA_MODEL=mistral
```

### 3. Enable GPU Persistence Mode (Linux/WSL2)

For Windows with WSL2 backend:
```bash
# Inside WSL2
nvidia-smi -pm 1
```

### 4. Monitor GPU Usage

```powershell
# Watch GPU usage in real-time
docker exec uitutive-ollama nvidia-smi -l 1

# Or use a separate window
nvidia-smi -l 1
```

### 5. Optimize Container Settings

```yaml
ollama:
  environment:
    - OLLAMA_NUM_GPU=1  # Number of GPUs to use
    - OLLAMA_DEBUG=1    # Enable debug for GPU info
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            device_ids: ['0']  # Specific GPU ID
            capabilities: [gpu]
      limits:
        memory: 16G  # Max memory the container can use
```

## Troubleshooting

### GPU Not Detected

```powershell
# Check if Docker has GPU access
docker run --rm --gpus all ubuntu nvidia-smi

# Check Docker GPU settings
docker info | Select-String -Pattern gpu

# Restart Docker Desktop
# Then retry
```

### CUDA Out of Memory (OOM)

```yaml
# Reduce model size or VRAM allocation
ollama:
  environment:
    - OLLAMA_NUM_GPU=0  # Use CPU only
    # or use smaller model
    - OLLAMA_MODEL=orca-mini  # Smaller than llama2
```

### GPU Performance Slow

```powershell
# Check GPU is actually being used
docker exec uitutive-ollama nvidia-smi

# If GPU clock is low, ensure:
# 1. GPU Performance mode is enabled
# 2. No thermal throttling
# 3. Sufficient power supply
```

### Ollama Can't Find GPU

```powershell
# Restart Ollama container
docker-compose restart ollama

# Or rebuild with GPU config
docker-compose -f docker-compose.gpu.yml down
docker-compose -f docker-compose.gpu.yml up --build
```

## Multi-GPU Setup

For systems with multiple GPUs:

```yaml
ollama:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all  # Use all GPUs
            capabilities: [gpu]
```

## Build Acceleration

GPU also helps during Docker build for Node.js/Angular:

```yaml
frontend:
  build:
    context: .
    dockerfile: Dockerfile.frontend
    # Docker BuildKit uses GPU for image building
  # Ensure DOCKER_BUILDKIT=1 is set
```

To enable BuildKit:
```powershell
$env:DOCKER_BUILDKIT=1
docker-compose -f docker-compose.gpu.yml up --build
```

## Verification Commands

```powershell
# Check all GPU capabilities
docker run --rm --gpus all nvidia/cuda:12.2.0-base nvidia-smi

# Check Ollama GPU usage
docker exec uitutive-ollama ollama ps

# Check container GPU access
docker inspect uitutive-ollama | Select-String -Pattern gpu

# Benchmark Ollama with GPU
docker exec uitutive-ollama ollama run llama2 "Respond briefly: What is 2+2?"
```

## Performance Comparison

Without GPU (CPU only):
- Response time: 30-60 seconds (Ollama on CPU)
- Throughput: ~5-10 tokens/sec

With GPU (NVIDIA RTX 3060):
- Response time: 2-5 seconds (same query)
- Throughput: ~50-100 tokens/sec

**10x faster with GPU!**

## Next Steps

1. Verify GPU setup with benchmark
2. Download appropriate model: `docker exec uitutive-ollama ollama pull mistral`
3. Test API response: `curl http://localhost:11434/api/generate -d '{"model":"mistral","prompt":"hello"}'`
4. Monitor performance: `nvidia-smi -l 1`
