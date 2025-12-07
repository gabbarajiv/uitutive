# Capacitor Mobile App with Ollama, Backend & Frontend

This guide explains how to run your Uitutive app on Android/iOS with Ollama backend support.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         Mobile App (Android/iOS)                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Angular Frontend (Capacitor WebView)          │  │
│  └───────────────────────────────────────────────┘  │
│                      ↓                               │
│  Built by: npm run mobile:build:web                 │
└─────────────────────────────────────────────────────┘
                       ↓ API Calls
         ┌─────────────────────────────┐
         │   Backend Server            │
         │ (Node.js/Express)           │
         │ :3000 or :5000              │
         └─────────────────────────────┘
                       ↓ AI Requests
         ┌─────────────────────────────┐
         │   Ollama Server             │
         │ (Local LLM)                 │
         │ :11434                      │
         └─────────────────────────────┘
```

---

## 🔄 Execution Flow

### Development Workflow

1. **Start Ollama** (AI Model Server)
   ```powershell
   ollama serve
   ```

2. **Start Backend** (in another terminal)
   ```powershell
   npm run backend:dev:watch
   ```

3. **Start Frontend Dev Server** (in another terminal)
   ```powershell
   npm run frontend:start
   ```

4. **Sync to Mobile** (in another terminal)
   ```powershell
   npm run mobile:dev
   ```
   This runs `ng serve` + `npx cap sync` concurrently

5. **Open in Xcode/Android Studio** (in another terminal)
   ```powershell
   npm run mobile:open:ios
   # OR
   npm run mobile:open:android
   ```

---

## 📱 Development Setup (Desktop - Web Based)

### Step 1: Start Ollama
```powershell
ollama serve
# Output: Listening on 127.0.0.1:11434
```

### Step 2: Start Backend (Port 3000 or 5000)
```powershell
npm run backend:dev:watch
# Backend will connect to Ollama at http://localhost:11434
```

### Step 3: Start Frontend Dev Server
```powershell
npm run frontend:start
# Access at http://localhost:4200
```

### Step 4: Test API Communication
The Angular app will make API calls to backend:
```
Frontend → Backend API → Ollama
http://localhost:4200 → http://localhost:3000 → http://localhost:11434
```

---

## 🔌 Configuration for Mobile

### Backend API URL Configuration

Your backend needs to determine where Ollama is located:

**In `backend/src/config/config.ts`:**
```typescript
const config = {
  // For development (desktop + mobile web)
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  
  // Backend port
  PORT: process.env.PORT || 3000,
  
  // For mobile, need to expose backend on network
  NETWORK_URL: process.env.NETWORK_URL || 'http://192.168.x.x:3000'
};

export default config;
```

**In `src/environments/environment.ts`:**
```typescript
export const environment = {
  production: false,
  // For development - points to local backend
  apiUrl: 'http://localhost:3000',
  
  // For mobile - points to machine's IP (replace with actual)
  // apiUrl: 'http://192.168.x.x:3000',
};
```

### Capacitor Config Update

**`capacitor.config.json`:**
```json
{
  "appId": "com.uitutive.app",
  "appName": "Uitutive",
  "webDir": "dist/uitutive/browser",
  "server": {
    "androidScheme": "https",
    "hostname": "localhost",
    "cleartext": true,
    "allowNavigation": [
      "localhost",
      "127.0.0.1",
      "192.168.0.*",
      "10.0.0.*"
    ]
  },
  "plugins": {
    "SplashScreen": {
      "launchAutoHide": true
    },
    "StatusBar": {
      "style": "dark"
    }
  }
}
```

---

## 📱 Mobile Development Workflow

### iOS Development

1. **First Time Setup:**
   ```powershell
   npm run mobile:build:web
   npm run mobile:open:ios
   ```
   This opens Xcode. Click the play button to build & run in simulator.

2. **Subsequent Changes:**
   ```powershell
   npm run mobile:dev
   # This runs frontend:start + cap sync concurrently
   ```
   Then in Xcode, press Cmd+R to reload the app.

3. **To Connect to Backend on Your Machine:**
   - Get your machine's IP: `ipconfig` → IPv4 Address (e.g., 192.168.1.100)
   - Update `environment.ts`: `apiUrl: 'http://192.168.1.100:3000'`
   - Run `npm run mobile:dev` again

### Android Development

1. **First Time Setup:**
   ```powershell
   npm run mobile:build:web
   npm run mobile:open:android
   ```
   This opens Android Studio. Click run button to build & run in emulator.

2. **Subsequent Changes:**
   ```powershell
   npm run mobile:dev
   ```
   Then in Android Studio, press Ctrl+Shift+R to reload the app (or use live reload).

3. **To Connect to Backend:**
   - Get your machine's IP: `ipconfig` → IPv4 Address
   - Update `environment.ts`: `apiUrl: 'http://10.0.2.2:3000'` (Android emulator special IP)
   - Run `npm run mobile:dev` again

---

## 🐳 Production Mobile Build (with Docker)

### Step 1: Build Docker Containers

```powershell
# GPU-optimized build (recommended)
$env:DOCKER_BUILDKIT=1
docker-compose -f docker-compose.gpu-optimized.yml up --build

# OR standard
docker-compose -f docker-compose.yml up --build
```

### Step 2: Download Ollama Model

```powershell
docker exec uitutive-ollama ollama pull mistral
```

### Step 3: Build Mobile App for Production

```powershell
# Build optimized web version
npm run mobile:build:web

# Build for Android
npm run mobile:build:android

# OR Build for iOS
npm run mobile:build:ios
```

### Step 4: Backend URL for Containerized Setup

Update your API URL to point to Docker container:
- If backend runs in Docker: `http://backend:3000` (internal Docker network)
- If accessing from mobile device: `http://<host-machine-ip>:3000`

---

## 🌐 Network Configuration Reference

### Desktop Development
```
App URL: http://localhost:4200
Backend: http://localhost:3000
Ollama: http://localhost:11434
```

### Mobile on iOS Simulator (same machine)
```
App: Web View (from npm run frontend:start)
Backend: http://localhost:3000 ✓ Works (simulator has host access)
Ollama: http://localhost:11434 ✓ Works
```

### Mobile on iOS Device (same network)
```
App: Web View (built and deployed)
Backend: http://<host-ip>:3000 (e.g., 192.168.1.100:3000)
Ollama: Not directly accessible (run on backend machine)
```

### Mobile on Android Emulator (same machine)
```
App: Web View
Backend: http://10.0.2.2:3000 ✓ Special emulator IP for host
Ollama: http://10.0.2.2:11434 ✓ Works
```

### Mobile on Android Device (same network)
```
App: Web View
Backend: http://<host-ip>:3000
Ollama: Not directly accessible
```

---

## ⚙️ Environment Variables

Create `.env` files to manage configuration:

**`.env` (root)**
```
BACKEND_URL=http://localhost:3000
OLLAMA_URL=http://localhost:11434
NODE_ENV=development
```

**`backend/.env`**
```
PORT=3000
OLLAMA_URL=http://localhost:11434
DB_PATH=./data/db.sqlite
```

---

## 🚀 Complete Commands Reference

| Task | Command |
|------|---------|
| Start everything locally | `npm run dev` |
| Frontend only | `npm run frontend:start` |
| Backend only | `npm run backend:dev` |
| Ollama (separate terminal) | `ollama serve` |
| Mobile dev sync | `npm run mobile:dev` |
| Build production web | `npm run mobile:build:web` |
| Build Android APK | `npm run mobile:build:android` |
| Build iOS app | `npm run mobile:build:ios` |
| Open iOS in Xcode | `npm run mobile:open:ios` |
| Open Android in Android Studio | `npm run mobile:open:android` |
| Docker with GPU | `docker-compose -f docker-compose.gpu-optimized.yml up` |

---

## 📋 Troubleshooting

### Backend Can't Reach Ollama
- **Problem:** "Cannot connect to Ollama at localhost:11434"
- **Solution:** Make sure `ollama serve` is running in a separate terminal

### Mobile App Can't Reach Backend
- **iOS Simulator:** Should work with `http://localhost:3000`
- **iOS Device:** Must use machine IP, e.g., `http://192.168.1.100:3000`
- **Android Emulator:** Use `http://10.0.2.2:3000` (not localhost)
- **Android Device:** Use machine IP, e.g., `http://192.168.1.100:3000`

### CORS Issues
- Add CORS headers in `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:*', 'http://192.168.0.*', 'http://10.0.0.*'],
  credentials: true
}));
```

### Port Already in Use
```powershell
# Find process on port (e.g., 3000)
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run backend:dev
```

---

## 🔗 Key Files to Update

1. `backend/src/config/config.ts` - Backend configuration
2. `src/environments/environment.ts` - Frontend environment config
3. `capacitor.config.json` - Capacitor mobile configuration
4. `backend/src/server.ts` - CORS and API setup
5. `.env` files - Environment variables

