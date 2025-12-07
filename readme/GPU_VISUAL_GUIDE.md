# GPU Setup - Visual Guide

## 🏗️ Architecture with GPU

```
┌─────────────────────────────────────────────────────┐
│              Your Computer                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────┐      ┌───────────────┐             │
│  │ NVIDIA GPU │◄─────┤  Docker GPU   │             │
│  │ (CUDA)     │      │  Support      │             │
│  └────────────┘      └───────────────┘             │
│        ▲                     ▲                      │
│        │ GPU Memory          │ GPU Control         │
│        │                     │                      │
│  ┌─────┴─────────────────────┴──────────┐         │
│  │   Docker Desktop Container            │         │
│  ├────────────────────────────────────────┤        │
│  │                                        │         │
│  │  ┌──────────────┐   ┌──────────────┐ │        │
│  │  │   Ollama     │   │   Backend    │ │        │
│  │  │ (AI Model)   │   │  (Node.js)   │ │        │
│  │  │  GPU: ON     │   │  GPU: OFF    │ │        │
│  │  └──────────────┘   └──────────────┘ │        │
│  │                                        │         │
│  │  ┌──────────────┐   ┌──────────────┐ │        │
│  │  │  Frontend    │   │  Database    │ │        │
│  │  │  (Angular)   │   │   (SQLite)   │ │        │
│  │  │  GPU: OFF    │   │  GPU: OFF    │ │        │
│  │  └──────────────┘   └──────────────┘ │        │
│  │                                        │         │
│  └────────────────────────────────────────┘        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## ⚙️ Setup Workflow

```
START
  │
  ├─► Step 1: Enable GPU in Docker Desktop
  │   └─► Settings → Resources → GPU → ON
  │       └─► Apply & Restart
  │
  ├─► Step 2: Verify GPU Works
  │   └─► Run: nvidia-smi (host terminal)
  │   └─► Run: docker run --gpus all ... nvidia-smi
  │
  ├─► Step 3: Start Application
  │   └─► docker-compose -f docker-compose.gpu-optimized.yml up --build
  │
  ├─► Step 4: Verify GPU is Used
  │   └─► docker exec uitutive-ollama nvidia-smi -l 1
  │
  └─► Step 5: Enjoy 10-30x Faster Performance! 🚀
```

## 📊 Performance Comparison

### Response Time (seconds)

```
CPU Only (Ollama)      ████████████████████████████ 45s
GPU RTX 3060           ███ 3.2s
GPU RTX 4090           ██ 1.8s

Legend: ✓ = 1 second
```

### Memory Usage

```
CPU Inference
├─ RAM: ████████████░░░░ 8GB
└─ GPU: ░░░░░░░░░░░░░░░░░ 0GB

GPU Inference  
├─ RAM: ██░░░░░░░░░░░░░░░ 2GB
└─ GPU: ███████░░░░░░░░░░ 7GB
```

## 🔄 Data Flow with GPU

### Without GPU (CPU)
```
User Input
    ↓
Browser (4200)
    ↓
Backend API (3000)
    ↓
Ollama (CPU Mode)
    ↓ [30-60 seconds] ⏳
Response
    ↓
Browser
```

### With GPU
```
User Input
    ↓
Browser (4200)
    ↓
Backend API (3000)
    ↓
Ollama (GPU Accelerated)
    ↓ [2-5 seconds] ⚡
Response
    ↓
Browser
```

## 📈 Speedup Factor

```
Model: Mistral (7GB)

CPU:      ████ (1x)        ~30 sec
GPU RTX3060: ████████████████████████████ (10x)   ~3 sec
GPU RTX4090: ████████████████████████████████████ (15x)  ~2 sec
```

## 🎯 Choose Your Path

```
┌─────────────────────────────────────┐
│   What's Your GPU?                  │
└─────────────────────────────────────┘
              ▼
    ┌─────────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼
  NVIDIA    AMD       Intel     CPU Only
    │         │         │         │
    ├─► Use   ├─► Use   ├─► Use   └─► Use
    │    GPU  │    GPU  │    GPU       CPU
    │    Compose    Compose    Compose  Compose
    │    GPU-OPT    GPU-OPT    GPU-OPT  (Default)
    │         │         │
    └─────┬───┴────┬────┘
          ▼        ▼
      Enjoy Fast ⚡ Inference!
```

## 📋 Setup Checklist

```
GPU Setup Checklist
═══════════════════════════════════════════════════

Pre-Setup
  ☐ Check GPU: nvidia-smi (host terminal)
  ☐ Update NVIDIA drivers (latest)
  ☐ Allocate ≥ 8GB GPU VRAM for Ollama

Docker Setup
  ☐ Enable GPU in Docker Desktop
  ☐ Restart Docker Desktop
  ☐ Verify: docker run --gpus all ... nvidia-smi

Application Setup
  ☐ Create/edit .env file
  ☐ Run: docker-compose -f docker-compose.gpu-optimized.yml up
  ☐ Wait for containers to start
  ☐ Download model: docker exec ... ollama pull mistral

Verification
  ☐ Browser: http://localhost:4200 (loads)
  ☐ API: curl http://localhost:3000/api/v1
  ☐ GPU: docker exec ... nvidia-smi (shows usage)
  ☐ Performance: Response < 5 seconds

Optimization (Optional)
  ☐ Enable BuildKit: $env:DOCKER_BUILDKIT=1
  ☐ Try different models: mistral, llama2, orca-mini
  ☐ Monitor: docker exec ... nvidia-smi -l 1
  ☐ Benchmark: .\benchmark-ollama.ps1

═══════════════════════════════════════════════════
When all checked: You're ready! ✅
```

## 🎮 Model Selection Guide

```
Your GPU VRAM
     ▼
┌─────────────────────────────────────┐
│                                     │
├─ < 4GB                             │
│  └─► No Ollama GPU support         │
│      Use CPU mode or upgrade GPU   │
│                                     │
├─ 4-6GB                             │
│  └─► orca-mini (best fit) ⭐      │
│      └─ Speed: ⚡ (very fast)      │
│      └─ Quality: ⭐⭐⭐ (decent)   │
│                                     │
├─ 6-8GB                             │
│  └─► mistral (recommended) ⭐⭐   │
│      └─ Speed: ⚡⚡ (fast)         │
│      └─ Quality: ⭐⭐⭐⭐ (good)   │
│                                     │
├─ 8-12GB                            │
│  └─► llama2 (balanced)             │
│      └─ Speed: ⚡⚡ (good)         │
│      └─ Quality: ⭐⭐⭐⭐⭐ (best) │
│                                     │
└─ 12GB+                             │
   └─► any model (neural-chat, etc) │
       └─ Speed: varies by model    │
       └─ Quality: ⭐⭐⭐⭐⭐ (best) │
```

## ⏱️ Time Expectations

```
First-Time Setup
├─ Enable GPU: 2 minutes
├─ Docker build: 3-5 minutes (with GPU)
├─ Model download: 2-10 minutes (mistral ~4GB)
└─ Total: ~10-20 minutes

Subsequent Startups
├─ Start containers: 10 seconds
├─ Warmup Ollama: 5 seconds
└─ Total: ~15 seconds

Per Query
├─ With GPU: 2-5 seconds
├─ Without GPU: 30-60 seconds
└─ Speedup: 10-30x faster! 🚀
```

## 🔌 Quick Start Summary

```
┌─────────────────────────────────────────┐
│  QUICK START - 5 STEPS                  │
├─────────────────────────────────────────┤
│                                         │
│ 1️⃣ Enable GPU in Docker Desktop        │
│    → Settings → Resources → GPU → ON   │
│    → Restart                            │
│                                         │
│ 2️⃣ Run command:                        │
│    $env:DOCKER_BUILDKIT=1              │
│    docker-compose -f \                 │
│      docker-compose.gpu-optimized.yml \ │
│      up --build                         │
│                                         │
│ 3️⃣ Download model (in new terminal):  │
│    docker exec uitutive-ollama \        │
│      ollama pull mistral               │
│                                         │
│ 4️⃣ Open browser:                       │
│    http://localhost:4200               │
│                                         │
│ 5️⃣ Monitor GPU:                        │
│    docker exec uitutive-ollama \        │
│      nvidia-smi -l 1                   │
│                                         │
│ 🎉 Enjoy 10-30x faster AI! 🚀         │
│                                         │
└─────────────────────────────────────────┘
```

## 📚 Documentation Map

```
Start Here
    │
    ├─► GPU_QUICK_START.md (5 min read)
    │
    ├─► GPU_SETUP_COMPLETE.md (10 min read)
    │
    ├─► DOCKER_GPU_COMMANDS.md (Reference)
    │
    └─► GPU_ACCELERATION.md (Deep dive)
```

---

**Ready to boost your performance? 🚀**

→ **Next: Read `GPU_QUICK_START.md`**
