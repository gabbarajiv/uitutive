# Getting Started - Monorepo Development

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js 18+ (`node --version`)
- ✅ npm (`npm --version`)
- ✅ Angular CLI 20+ (`ng version`)
- ✅ Ollama (optional for AI features)
- ✅ Git

## Initial Setup (5 minutes)

### 1. Install Dependencies

```bash
# Install all dependencies for frontend and backend
npm run install:all
```

This command:
- Installs root dependencies
- Installs backend dependencies in `backend/` folder
- Sets up TypeScript, Angular CLI, Express, etc.

### 2. Configure Environment

The backend comes with a default `.env` file. For production, create custom settings:

```bash
cp backend/.env.example backend/.env.production
# Edit as needed
```

### 3. Start the Development Environment

#### Quick Start (Recommended)
```bash
npm run dev
```

This runs both frontend and backend concurrently:
- **Frontend**: http://localhost:4200 (Angular dev server)
- **Backend**: http://localhost:3000 (Express API)

#### Or Run Separately

In **Terminal 1** - Frontend:
```bash
npm run start:frontend
```

In **Terminal 2** - Backend:
```bash
npm run start:backend
```

## Using AI Features (Optional)

### Install Ollama

1. Download from https://ollama.ai
2. Run `ollama serve`
3. In another terminal: `ollama pull llama2`

The backend will auto-detect Ollama at startup and show connection status in logs.

## First Form Test

### Via Frontend UI

1. Open http://localhost:4200
2. Use the form generator to create a test form
3. Click "Generate with AI" to test AI features
4. View/manage responses in the dashboard

### Via Backend API

Create a form:
```bash
curl -X POST http://localhost:3000/api/v1/forms \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Form",
    "description": "My first form",
    "fields": [
      {
        "id": "1",
        "label": "Your Name",
        "type": "text",
        "required": true
      },
      {
        "id": "2", 
        "label": "Email",
        "type": "email",
        "required": true
      }
    ]
  }'
```

Response will include the form ID. Use it to submit data:

```bash
curl -X POST http://localhost:3000/api/v1/forms/FORM_ID/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "1": "John Doe",
      "2": "john@example.com"
    }
  }'
```

## Project Structure Understanding

### Frontend (Angular)

```
src/app/
├── features/
│   ├── form-generator/      # Main form builder
│   │   ├── components/
│   │   │   ├── form-generator.component.ts    # Main builder
│   │   │   ├── form-preview/                  # Preview mode
│   │   │   └── prompt-input/                  # AI prompt input
│   │   └── form-generator-layout.scss         # Styles
│   │
│   └── settings/             # App settings
│       └── components/
│           └── settings.component.ts
│
└── shared/
    ├── services/
    │   ├── form.service.ts   # Form API calls
    │   ├── ai.service.ts     # AI integration
    │   └── theme.service.ts  # Dark mode
    │
    └── models/
        └── form.model.ts     # TypeScript interfaces
```

**Key Files:**
- `src/app/app.routes.ts` - Route definitions
- `src/environments/` - API endpoint configuration
- `src/styles/` - Global styling

### Backend (Node.js + Express)

```
backend/src/
├── server.ts                 # Main entry point
│
├── config/
│   └── config.ts            # Environment configuration
│
├── db/
│   └── database.ts          # SQLite/PostgreSQL setup
│
├── services/
│   ├── form.service.ts      # Form CRUD logic
│   └── ollama.service.ts    # AI integration
│
├── routes/
│   └── api.routes.ts        # API endpoints
│
├── models/
│   └── types.ts             # TypeScript interfaces
│
└── middleware/
    └── errorHandler.ts      # Error handling
```

**Key Endpoints:**
- `POST /api/v1/forms` - Create form
- `GET /api/v1/forms/:id` - Get form
- `POST /api/v1/forms/:id/submissions` - Submit response
- `POST /api/v1/ai/generate-form` - AI form generation

## Database Setup

### Default: SQLite

Automatically created at `backend/data/uitutive.db`

**Tables:**
- `forms` - Form definitions
- `submissions` - Form responses
- `templates` - Response templates
- `analytics` - Usage metrics

### Alternative: PostgreSQL

1. Create database:
```sql
CREATE DATABASE uitutive;
```

2. Update `backend/.env`:
```env
DB_TYPE=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=uitutive
```

3. Restart backend

## Development Tips

### Hot Reload

Both frontend and backend support hot reload:
- **Frontend**: Auto-refresh on file changes
- **Backend**: Auto-restart on file changes (when using `npm run backend:dev:watch`)

### Debugging Frontend

In Chrome DevTools:
- `Sources` tab to debug TypeScript
- `Console` for logs
- `Network` to inspect API calls

### Debugging Backend

Add `debugger;` statements or use:
```bash
node --inspect dist/server.js
```

Then open `chrome://inspect` in Chrome.

### Common Commands

```bash
# Run specific component's tests
ng test --include='**/form-generator.component.spec.ts'

# Build frontend for production
npm run frontend:build

# Check TypeScript errors
npm run backend:typecheck

# Lint backend code
npm run backend:lint

# Format code
npx prettier --write "src/**/*.ts"
```

## Environment Variables Reference

### Backend (`.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 3000 | Backend server port |
| `NODE_ENV` | development | Environment mode |
| `DB_TYPE` | sqlite | Database type |
| `OLLAMA_BASE_URL` | http://localhost:11434 | Ollama endpoint |
| `OLLAMA_MODEL` | llama2 | Model to use |
| `CORS_ORIGIN` | http://localhost:4200 | Frontend URL for CORS |

### Frontend (`src/environments/environment.ts`)

```typescript
export const environment = {
  apiUrl: 'http://localhost:3000/api/v1'
};
```

## Troubleshooting

### "npm run install:all" fails

**Solution**: Install dependencies separately
```bash
npm install
cd backend
npm install
cd ..
```

### Frontend can't reach backend

**Check:**
1. Backend is running: `curl http://localhost:3000/api/v1/health`
2. CORS configuration: `backend/.env` has `CORS_ORIGIN=http://localhost:4200`
3. Frontend environment: `src/environments/environment.ts` points to `http://localhost:3000`

### Ollama not connecting

**Check:**
1. Ollama is running: `ollama serve` in another terminal
2. Model is pulled: `ollama list`
3. URL is correct: `curl http://localhost:11434/api/tags`

### Database locked error

**Solution**: Delete and recreate
```bash
rm backend/data/uitutive.db
npm run backend:dev
```

### Port 3000 already in use

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :3000
kill -9 <PID>
```

## Building for Production

### Frontend
```bash
npm run frontend:build
# Output in: dist/uitutive/
```

### Backend
```bash
npm run backend:build
# Output in: backend/dist/
```

### Run Production Backend
```bash
cd backend
npm start
```

Set environment variables before running:
```bash
export NODE_ENV=production
export DB_TYPE=postgres
export POSTGRES_HOST=your-db-host
export OLLAMA_BASE_URL=your-ollama-url
```

## Next Steps

1. ✅ Complete this setup
2. 📖 Read [QUICKSTART.md](QUICKSTART.md) for quick commands
3. 🏗️ Check [MONOREPO_SETUP.md](MONOREPO_SETUP.md) for architecture details
4. 📊 Review [PHASE_2_ROADMAP.md](PHASE_2_ROADMAP.md) for upcoming features
5. 🚀 Start building!

## Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [Ollama Documentation](https://ollama.ai)
- [SQLite Documentation](https://www.sqlite.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/)

## Getting Help

1. Check error messages in terminal/console
2. Review logs in `backend/` for API errors
3. Check browser console for frontend errors
4. Verify all prerequisites are installed
5. Re-read this guide for setup steps

---

**Ready to start?** Run `npm run dev` and open http://localhost:4200 🚀
