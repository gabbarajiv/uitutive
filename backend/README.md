# Uitutive Backend

Node.js + Express backend for the Uitutive Form Generator application.

## Features

- ✅ Express.js server with TypeScript
- ✅ SQLite/PostgreSQL database support
- ✅ Ollama AI integration for form generation
- ✅ RESTful API for form management and submissions
- ✅ Error handling and middleware
- ✅ CORS support for Angular frontend

## Prerequisites

- Node.js 18+
- npm or yarn
- Ollama running locally (for AI features)
- SQLite3 or PostgreSQL (optional, SQLite included)

## Installation

```bash
cd backend
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite  # or 'postgres'
OLLAMA_BASE_URL=http://localhost:11434
CORS_ORIGIN=http://localhost:4200
```

## Running the Server

### Development Mode
```bash
npm run dev
```

With file watching:
```bash
npm run dev:watch
```

### Production Mode
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── config/          # Configuration files
├── db/              # Database initialization and schema
├── middleware/      # Express middleware
├── models/          # TypeScript interfaces/types
├── routes/          # API route handlers
├── services/        # Business logic (Form, Ollama services)
├── utils/           # Utility functions
└── server.ts        # Main server entry point
```

## API Endpoints

### Health Check
- `GET /api/v1/health` - Server and Ollama status

### Forms
- `POST /api/v1/forms` - Create form
- `GET /api/v1/forms` - Get all forms
- `GET /api/v1/forms/:formId` - Get specific form
- `PATCH /api/v1/forms/:formId` - Update form
- `DELETE /api/v1/forms/:formId` - Delete form

### Form Submissions
- `POST /api/v1/forms/:formId/submissions` - Create submission
- `GET /api/v1/forms/:formId/submissions` - List submissions (paginated)
- `GET /api/v1/forms/:formId/submissions/:submissionId` - Get specific submission
- `PATCH /api/v1/forms/:formId/submissions/:submissionId` - Update submission
- `DELETE /api/v1/forms/:formId/submissions/:submissionId` - Delete submission

### AI Generation
- `POST /api/v1/ai/generate-form` - Generate form fields from description
- `POST /api/v1/ai/generate-metadata` - Generate form title/description

## Database Schema

### Forms Table
```sql
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  fields JSON NOT NULL,
  created_at DATETIME,
  updated_at DATETIME
);
```

### Submissions Table
```sql
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  data JSON NOT NULL,
  status TEXT,
  user_agent TEXT,
  ip_address TEXT,
  submitted_at DATETIME,
  created_at DATETIME,
  FOREIGN KEY(form_id) REFERENCES forms(id)
);
```

### Templates Table
```sql
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  content JSON NOT NULL,
  is_default BOOLEAN,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(form_id) REFERENCES forms(id)
);
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| NODE_ENV | development | Environment |
| DB_TYPE | sqlite | Database type (sqlite/postgres) |
| SQLITE_PATH | ./data/uitutive.db | SQLite database path |
| POSTGRES_* | - | PostgreSQL connection settings |
| OLLAMA_BASE_URL | http://localhost:11434 | Ollama server URL |
| OLLAMA_MODEL | llama2 | Model to use for generation |
| CORS_ORIGIN | http://localhost:4200 | Allowed CORS origin |

## Services

### FormService
Handles CRUD operations for forms, submissions, and templates.

### OllamaService
Integrates with local Ollama instance for:
- Form field generation from descriptions
- Form metadata generation
- Submission validation
- Insights generation

## Error Handling

All errors are handled through the centralized error handler middleware and return JSON responses with appropriate HTTP status codes.

## Development

### Type Checking
```bash
npm run typecheck
```

### Linting
```bash
npm run lint
```

### Testing
```bash
npm run test
```

## Database Setup

The database is automatically initialized on server start. Tables are created if they don't exist.

### Using PostgreSQL

1. Install PostgreSQL
2. Create a database:
```sql
CREATE DATABASE uitutive;
```

3. Update `.env`:
```env
DB_TYPE=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=uitutive
```

## Ollama Setup

1. Download Ollama from https://ollama.ai
2. Run Ollama: `ollama serve`
3. Pull a model: `ollama pull llama2`
4. Ollama will be available at `http://localhost:11434`

## Deployment

1. Build the project:
```bash
npm run build
```

2. Set environment variables for production
3. Run the server:
```bash
npm start
```

## Contributing

Please follow the existing code style and structure when adding new features.

## License

MIT
