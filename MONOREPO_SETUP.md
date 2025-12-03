# Uitutive Monorepo

A comprehensive form generator application with AI assistance, featuring an Angular frontend and Node.js/Express backend.

## 📁 Project Structure

```
uitutive/
├── frontend/          # Angular application (src/)
├── backend/           # Node.js + Express API
├── package.json       # Monorepo scripts
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Angular CLI 20+
- Ollama running locally (optional, for AI features)

### Installation

1. **Install all dependencies**
```bash
npm run install:all
```

This installs dependencies for both frontend and backend.

### Development

#### Option 1: Run both frontend and backend together
```bash
npm run dev
```

This uses concurrently to run:
- Frontend on http://localhost:4200
- Backend on http://localhost:3000

#### Option 2: Run separately

**Frontend only:**
```bash
npm run start:frontend
```

**Backend only:**
```bash
npm run start:backend
```

### Building

**Build both frontend and backend:**
```bash
npm run build:all
```

**Build frontend only:**
```bash
npm run frontend:build
```

**Build backend only:**
```bash
npm run backend:build
```

## 📦 Frontend

Angular 20 application with Material Design UI for form generation and management.

```bash
npm run frontend:start    # Start dev server
npm run frontend:build    # Build for production
npm run frontend:test     # Run tests
```

**Features:**
- ✅ Dynamic form creation with AI assistance
- ✅ Form preview and validation
- ✅ Response collection
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Material Design components

**Location:** Root directory with `src/`, `angular.json`, `tsconfig.json`

## 🔧 Backend

Node.js + Express API with TypeScript.

```bash
npm run backend:start     # Start production server
npm run backend:dev       # Start dev server
npm run backend:dev:watch # Start with file watching
npm run backend:build     # Build TypeScript
npm run backend:test      # Run tests
npm run backend:lint      # Lint code
```

**Features:**
- ✅ RESTful API for forms and submissions
- ✅ SQLite/PostgreSQL support
- ✅ Ollama AI integration
- ✅ Error handling & middleware
- ✅ Type-safe with TypeScript

**Location:** `backend/` directory

**API Documentation:** See [backend/README.md](backend/README.md)

## ⚙️ Configuration

### Frontend Configuration
- See `angular.json` and `src/environments/`
- CORS configured to call backend at `http://localhost:3000`

### Backend Configuration
1. Copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```

2. Update `.env` with your settings:
```env
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite
OLLAMA_BASE_URL=http://localhost:11434
CORS_ORIGIN=http://localhost:4200
```

## 🤖 Ollama Integration

### Setup

1. **Download Ollama:** https://ollama.ai
2. **Run Ollama:**
```bash
ollama serve
```

3. **Pull a model:**
```bash
ollama pull llama2
```

4. **Verify connection:**
```bash
curl http://localhost:11434/api/tags
```

### Features
- Form field generation from descriptions
- Form title/description generation
- Submission analysis and insights

## 🗄️ Database

### SQLite (Default)
- Automatically created at `backend/data/uitutive.db`
- No external dependencies
- Good for development

### PostgreSQL
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
POSTGRES_PASSWORD=password
POSTGRES_DB=uitutive
```

## 📋 API Endpoints

All endpoints are prefixed with `/api/v1`

### Forms
- `POST /forms` - Create form
- `GET /forms` - List all forms
- `GET /forms/:id` - Get form
- `PATCH /forms/:id` - Update form
- `DELETE /forms/:id` - Delete form

### Submissions
- `POST /forms/:formId/submissions` - Create submission
- `GET /forms/:formId/submissions` - List submissions
- `GET /forms/:formId/submissions/:id` - Get submission
- `PATCH /forms/:formId/submissions/:id` - Update submission
- `DELETE /forms/:formId/submissions/:id` - Delete submission

### AI
- `POST /ai/generate-form` - Generate form fields
- `POST /ai/generate-metadata` - Generate form metadata

## 🧪 Testing

**Frontend tests:**
```bash
npm run frontend:test
```

**Backend tests:**
```bash
npm run backend:test
```

## 📚 Documentation

- [Frontend Architecture](ARCHITECTURE.md)
- [Backend API Documentation](backend/README.md)
- [Phase 1 Summary](PHASE_1_SUMMARY.md)
- [Phase 2 Roadmap](PHASE_2_ROADMAP.md)

## 🔄 Development Workflow

### Adding a new backend route:

1. Create route handler in `backend/src/routes/`
2. Add service method in `backend/src/services/`
3. Use `asyncHandler` for error handling
4. Document endpoint in API section above

### Adding a new frontend feature:

1. Create component in `src/app/features/`
2. Add service in `src/app/shared/services/`
3. Import in appropriate module
4. Update routing as needed

## 🐛 Troubleshooting

### Backend fails to start
- Check if port 3000 is in use: `netstat -ano | findstr :3000`
- Verify Ollama is running if using AI features
- Check database path is writable

### Frontend can't reach backend
- Verify backend is running on port 3000
- Check CORS configuration in `backend/.env`
- Ensure frontend environment file points to correct backend URL

### Ollama connection issues
- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Check OLLAMA_BASE_URL in `.env`
- Ensure model is pulled: `ollama list`

## 📝 Environment Variables

### Backend (backend/.env)
```env
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite
SQLITE_PATH=./data/uitutive.db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
CORS_ORIGIN=http://localhost:4200
```

### Frontend
Configuration is in `src/environments/` - no .env file needed

## 🚀 Deployment

### Frontend
```bash
npm run frontend:build
# Deploy dist/uitutive to static hosting
```

### Backend
```bash
npm run backend:build
npm run backend:start
```

Set environment variables for production before deploying.

## 📄 License

MIT

## 🤝 Contributing

Please follow the existing code structure and conventions when contributing.

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review error logs
3. Verify configuration
4. Check Ollama/database connectivity
