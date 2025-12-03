# 🚀 Monorepo Quick Start Guide

## One-Command Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start Ollama (in another terminal)
ollama serve

# 3. Run everything together
npm run dev
```

## What Just Happened?

✅ **Frontend** started on http://localhost:4200
✅ **Backend** started on http://localhost:3000  
✅ **Ollama** connected for AI features

## Directory Overview

```
uitutive/
├── src/                    # Angular Frontend (20+)
│   ├── app/
│   │   ├── features/       # Form generator, settings
│   │   └── shared/         # Services, models
│   └── main.ts
│
├── backend/                # Node.js + Express Backend
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── db/            # Database setup
│   │   ├── services/      # Business logic
│   │   ├── routes/        # API endpoints
│   │   └── server.ts      # Main file
│   └── package.json
│
└── package.json            # Monorepo scripts
```

## Key Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run frontend + backend together |
| `npm run frontend:start` | Frontend only |
| `npm run backend:dev` | Backend only (auto-reload) |
| `npm run install:all` | Install both frontends & backend deps |
| `npm run build:all` | Build frontend + backend |

## API Testing

### Create a form:
```bash
curl -X POST http://localhost:3000/api/v1/forms \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Customer Feedback",
    "description": "Collect customer feedback",
    "fields": [
      {"id": "1", "label": "Name", "type": "text", "required": true},
      {"id": "2", "label": "Email", "type": "email", "required": true}
    ]
  }'
```

### Get all forms:
```bash
curl http://localhost:3000/api/v1/forms
```

### Submit response:
```bash
curl -X POST http://localhost:3000/api/v1/forms/{formId}/submissions \
  -H "Content-Type: application/json" \
  -d '{"data": {"name": "John", "email": "john@example.com"}}'
```

## Database

- **Default:** SQLite at `backend/data/uitutive.db` (auto-created)
- **Preferred:** PostgreSQL for production

To use PostgreSQL, update `backend/.env`:
```env
DB_TYPE=postgres
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=uitutive
```

## AI Features (Ollama)

Requires Ollama running locally at `http://localhost:11434`

### Generate form from description:
```bash
curl -X POST http://localhost:3000/api/v1/ai/generate-form \
  -H "Content-Type: application/json" \
  -d '{"description": "Customer feedback form with name, email, and rating"}'
```

## Frontend Features

- 🎨 Dynamic form builder
- 🤖 AI-assisted form generation
- 📱 Responsive design
- 🌙 Dark mode
- ✅ Real-time validation
- 📊 Response analytics (Phase 2)

## Backend Features

- 🔗 RESTful API
- 🗄️ SQLite/PostgreSQL support
- 🤖 Ollama integration
- 📝 Form submission storage
- ⚡ TypeScript + Express
- 🛡️ Error handling

## Common Issues

### "Cannot find module 'better-sqlite3'"
```bash
cd backend && npm install
```

### "Ollama connection failed"
1. Verify Ollama is running: `ollama serve`
2. Check URL in `backend/.env`: `OLLAMA_BASE_URL=http://localhost:11434`
3. Pull a model: `ollama pull llama2`

### Port already in use
```bash
# Windows
netstat -ano | findstr :3000

# Kill process (if PID is 1234)
taskkill /PID 1234 /F
```

### Database locked
Delete `backend/data/uitutive.db` and restart backend

## Next Steps

1. ✅ Verify everything runs with `npm run dev`
2. 📖 Read [MONOREPO_SETUP.md](MONOREPO_SETUP.md) for detailed docs
3. 🏗️ Check [PHASE_2_ROADMAP.md](PHASE_2_ROADMAP.md) for upcoming features
4. 🛠️ Start building with both frontend and backend!

## File Structure Details

### Frontend (`src/app/`)
- **form-generator/** - Main form creation feature
  - components/ - Form builder, preview, input
- **settings/** - Application settings
- **shared/** - Reusable services and models
  - services/ - API communication, form logic
  - models/ - TypeScript interfaces

### Backend (`backend/src/`)
- **config/** - App configuration
- **db/** - Database initialization
- **services/** - Core business logic
  - form.service.ts - CRUD operations
  - ollama.service.ts - AI integration
- **routes/** - API endpoints
- **middleware/** - Error handling
- **models/** - TypeScript types

## Deployment

**Frontend:**
```bash
npm run frontend:build
# Deploy dist/uitutive/ folder
```

**Backend:**
```bash
npm run backend:build
npm run backend:start
# Set environment variables for production
```

---

**Happy coding!** 🎉

For more details, see [README.md](README.md) and [MONOREPO_SETUP.md](MONOREPO_SETUP.md)
