# Backend File Reference

Complete documentation of all backend files and their purposes.

## Core Files

### `backend/src/server.ts`
**Main entry point for the Express server**

- Initializes Express app
- Configures CORS middleware
- Sets up body parser
- Initializes database
- Mounts API routes
- Implements error handling
- Starts HTTP server on configured port

**Key Functions:**
- `startServer()` - Initialize and start the server
- Graceful shutdown handlers for SIGTERM/SIGINT

### `backend/src/config/config.ts`
**Environment configuration**

Exports configuration object with:
- `port` - Server port (default: 3000)
- `nodeEnv` - Environment (development/production)
- Database settings (SQLite or PostgreSQL)
- Ollama configuration
- CORS settings
- API version prefix

**Usage:**
```typescript
import { config } from './config/config.js';
config.port // 3000
config.db.type // 'sqlite'
config.ollama.baseUrl // 'http://localhost:11434'
```

## Database Layer

### `backend/src/db/database.ts`
**Database initialization and connection management**

**Exports:**
- `initializeDatabase()` - Initialize DB connection (SQLite or PostgreSQL)
- `getDatabase()` - Get current DB connection
- `setDatabase()` - Set DB connection
- `DbConnection` - Interface for DB operations

**Tables Created:**
1. `forms` - Form definitions
2. `submissions` - Form responses
3. `templates` - Response templates
4. `analytics` - Analytics data

**Supports:**
- SQLite (default, auto-created at `backend/data/uitutive.db`)
- PostgreSQL (for production)

**Functions:**
- `createSqliteTables()` - SQLite schema creation
- `createPostgresTables()` - PostgreSQL schema creation

## Services

### `backend/src/services/form.service.ts`
**Form and submission management**

**Class:** `FormService`

**Methods:**

**Forms:**
- `createForm(title, description, fields)` - Create new form
- `getForm(formId)` - Get form by ID
- `getAllForms()` - Get all forms
- `updateForm(formId, updates)` - Update form
- `deleteForm(formId)` - Delete form

**Submissions:**
- `createSubmission(formId, data, userAgent, ipAddress)` - Store response
- `getSubmissions(formId, limit, offset)` - List submissions (paginated)
- `getSubmission(submissionId)` - Get specific submission
- `updateSubmission(submissionId, updates)` - Update submission
- `deleteSubmission(submissionId)` - Delete submission

**Exports:**
- `formService` - Singleton instance

### `backend/src/services/ollama.service.ts`
**Local Ollama AI integration**

**Class:** `OllamaService`

**Methods:**
- `generate(prompt, systemPrompt)` - Generate text from prompt
- `generateFormFields(description)` - AI-generate form fields
- `generateFormMetadata(input)` - Generate form title/description
- `validateSubmission(schema, data)` - Validate submission
- `generateInsights(submissions)` - Generate analytics insights
- `healthCheck()` - Check if Ollama is running

**Features:**
- Auto-extracts JSON from responses
- Error handling with fallbacks
- Customizable system prompts

**Exports:**
- `ollamaService` - Singleton instance

**Example:**
```typescript
const fields = await ollamaService.generateFormFields(
  'Customer feedback form with rating'
);
```

## Routes

### `backend/src/routes/api.routes.ts`
**RESTful API endpoint definitions**

**Endpoints:**

**Health:**
- `GET /health` - Server status & Ollama connection

**Forms:**
- `POST /forms` - Create form
- `GET /forms` - List all forms
- `GET /forms/:formId` - Get form
- `PATCH /forms/:formId` - Update form
- `DELETE /forms/:formId` - Delete form

**Submissions:**
- `POST /forms/:formId/submissions` - Create submission
- `GET /forms/:formId/submissions` - List submissions (paginated)
- `GET /forms/:formId/submissions/:submissionId` - Get submission
- `PATCH /forms/:formId/submissions/:submissionId` - Update submission
- `DELETE /forms/:formId/submissions/:submissionId` - Delete submission

**AI:**
- `POST /ai/generate-form` - Generate form fields
- `POST /ai/generate-metadata` - Generate form metadata

**Features:**
- All routes wrapped with `asyncHandler` for error handling
- Request validation
- Proper HTTP status codes
- JSON responses

## Middleware

### `backend/src/middleware/errorHandler.ts`
**Error handling and async wrapper**

**Classes:**
- `AppError` - Custom error class with statusCode

**Functions:**
- `errorHandler()` - Express error middleware
- `asyncHandler()` - Wrapper for async route handlers

**Features:**
- Catches async errors automatically
- Returns JSON error responses
- Logs errors to console
- Provides meaningful error messages

**Usage:**
```typescript
router.post('/endpoint', asyncHandler(async (req, res) => {
  // If error thrown, asyncHandler catches it
  throw new AppError(400, 'Invalid input');
}));
```

## Models

### `backend/src/models/types.ts`
**TypeScript interfaces and types**

**Interfaces:**
- `FormField` - Single form field definition
- `Form` - Complete form with fields
- `FormSubmission` - Submitted form response
- `ResponseTemplate` - Template for displaying responses
- `AnalyticsRecord` - Analytics data point
- `ApiResponse<T>` - Standard API response format
- `PaginatedResponse<T>` - Paginated API response

**Example:**
```typescript
interface Form {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  created_at: Date;
  updated_at: Date;
}
```

## Utils

### `backend/src/utils/` (Empty)
Reserved for utility functions:
- String formatting
- Date utilities
- Validation helpers
- Common transformations

## Configuration Files

### `backend/package.json`
**Backend dependencies and scripts**

**Dependencies:**
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `axios` - HTTP client (for Ollama)
- `pg` - PostgreSQL driver
- `sqlite3` - SQLite driver
- `uuid` - Generate unique IDs

**Dev Dependencies:**
- `typescript` - Type checking
- `ts-node` - Run TypeScript directly
- `nodemon` - Auto-reload
- `jest` - Testing
- `eslint` - Linting

**Scripts:**
- `npm run dev` - Start with ts-node
- `npm run dev:watch` - Start with auto-reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JS
- `npm test` - Run tests
- `npm run typecheck` - Check types

### `backend/tsconfig.json`
**TypeScript compiler options**

**Key Settings:**
- `target: ES2020` - Output ES2020
- `module: ES2020` - ESM modules
- `strict: true` - Strict type checking
- `outDir: ./dist` - Compiled output
- `rootDir: ./src` - Source files

## Environment Files

### `backend/.env`
**Local development environment (do not commit)**

```env
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite
SQLITE_PATH=./data/uitutive.db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
CORS_ORIGIN=http://localhost:4200
```

### `backend/.env.example`
**Environment template (commit this)**

Template for creating `.env` files with all available variables and defaults.

## Other Files

### `backend/.gitignore`
**Git exclusions**

Ignores:
- `node_modules/`
- `dist/`
- `.env` files
- Database files
- Logs

### `backend/README.md`
**Backend documentation**

Complete documentation including:
- Installation instructions
- Configuration guide
- API endpoints reference
- Database schema
- Development setup
- Deployment guide

## File Organization Best Practices

### Adding a New Feature

1. **Create service** in `backend/src/services/`
   ```typescript
   export class MyService {
     async doSomething() { }
   }
   export const myService = new MyService();
   ```

2. **Add routes** in `backend/src/routes/api.routes.ts`
   ```typescript
   router.post('/endpoint', asyncHandler(async (req, res) => {
     const result = await myService.doSomething(req.body);
     res.json({ success: true, data: result });
   }));
   ```

3. **Add types** in `backend/src/models/types.ts`
   ```typescript
   export interface MyType {
     // properties
   }
   ```

4. **Test** with curl or Postman

### Database Queries

All database operations go through `FormService`:
- Queries use the `DbConnection` interface
- Automatic parameterized queries (prevent SQL injection)
- Consistent error handling

### Error Handling

Always use `AsyncHandler`:
```typescript
router.post('/endpoint', asyncHandler(async (req, res) => {
  if (!req.body.required) {
    throw new AppError(400, 'Required field missing');
  }
  // Process...
}));
```

## Type System

All responses follow consistent types:
- `ApiResponse<T>` for single items
- `PaginatedResponse<T>` for lists
- Always include `success` boolean
- Always include `data` or `error`

## Next Steps

### To Add New Functionality:

1. Create service method in `FormService` or new service
2. Add route(s) in `api.routes.ts`
3. Add TypeScript types to `types.ts`
4. Test with curl/Postman
5. Document in README

### To Change Database:

1. Update `DB_TYPE` in `.env`
2. Configure connection in `config.ts`
3. Restart server (tables auto-create)

### To Modify Schema:

Edit `backend/src/db/database.ts`:
- `createSqliteTables()` for SQLite changes
- `createPostgresTables()` for PostgreSQL changes

---

**All files are TypeScript with strict type checking enabled.**

For API details, see `backend/README.md`.
