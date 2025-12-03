# 🏗️ Monorepo Architecture Overview

## Project Topology

```
UITUTIVE MONOREPO
│
├─── FRONTEND (Angular 20+)
│    ├── src/app/features/form-generator/  ← Main feature
│    ├── src/app/shared/services/           ← API calls to backend
│    ├── src/environments/                  ← API configuration
│    └── Port: 4200
│
├─── BACKEND (Node.js + Express)
│    ├── src/services/                      ← Business logic
│    ├── src/routes/                        ← API endpoints
│    ├── src/db/                            ← Database setup
│    ├── src/config/                        ← Configuration
│    └── Port: 3000
│
├─── DATABASE
│    ├── SQLite (default)                   ← dev/test
│    └── PostgreSQL (optional)              ← production
│
└─── OLLAMA (Optional)
     ├── Port: 11434
     └── Used for AI features
```

## Communication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                          │
│                 (localhost:4200)                         │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ HTTP Requests
                  │ (JSON)
                  ▼
┌─────────────────────────────────────────────────────────┐
│              ANGULAR FRONTEND                            │
│                                                          │
│  • Form Generator Component                             │
│  • Form Preview Component                               │
│  • Settings Component                                   │
│                                                          │
│  └─ FormService (HTTP calls)                           │
│  └─ AIService (AI requests)                            │
│  └─ ThemeService (UI state)                            │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ REST API Calls
                  │ (JSON over HTTP)
                  ▼
┌─────────────────────────────────────────────────────────┐
│            EXPRESS BACKEND (Node.js)                     │
│                                                          │
│  • Error Handler Middleware                             │
│  • CORS Middleware                                      │
│  • Body Parser                                          │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │ API Routes (/api/v1)                        │        │
│  │                                              │        │
│  │ • Forms CRUD                                 │        │
│  │ • Submissions CRUD                          │        │
│  │ • AI Generation                             │        │
│  │ • Health Check                              │        │
│  └─────────────────────────────────────────────┘        │
│                  │                                       │
│  ┌──────────────┼──────────────┐                        │
│  │              │              │                        │
│  ▼              ▼              ▼                        │
│ FormService  OllamaService  DbConnection               │
└─────────────────────────────────────────────────────────┘
                  │              │
        ┌─────────┘              └─────────┐
        │                                  │
        ▼                                  ▼
    ┌────────────┐          ┌──────────────────┐
    │   OLLAMA   │          │   DATABASE       │
    │ (Optional) │          │                  │
    │            │          │ • Forms Table    │
    │ Models:    │          │ • Submissions    │
    │ • llama2   │          │ • Templates      │
    │ • mistral  │          │ • Analytics      │
    │ • etc      │          │                  │
    └────────────┘          │ SQLite (dev)     │
                            │ PostgreSQL (prod)│
                            └──────────────────┘
```

## File Structure with Data Flow

```
ROOT: uitutive/
│
├── 📁 src/                          [Angular Frontend]
│   ├── main.ts                      ↓
│   └── app/
│       ├── app.routes.ts            ← Routing definitions
│       ├── app.ts                   ↓
│       ├── features/
│       │   ├── form-generator/      [User creates form]
│       │   │   └── components/
│       │   │       ├── form-generator.component.ts
│       │   │       ├── form-preview.component.ts
│       │   │       └── prompt-input.component.ts
│       │   │
│       │   └── settings/            [App settings]
│       │       └── settings.component.ts
│       │
│       └── shared/
│           ├── services/
│           │   ├── form.service.ts  ← HTTP to backend
│           │   │   ├── GET /api/v1/forms
│           │   │   ├── POST /api/v1/forms
│           │   │   ├── POST /api/v1/ai/generate-form
│           │   │   └── POST /api/v1/forms/:id/submissions
│           │   │
│           │   ├── ai.service.ts    ← AI integration
│           │   └── theme.service.ts ← Dark mode
│           │
│           └── models/
│               └── form.model.ts    ← TypeScript types
│
├── 📁 backend/                      [Node.js Backend]
│   ├── src/
│   │   ├── server.ts                [Express app setup]
│   │   │   └── middleware setup
│   │   │   └── route mounting
│   │   │
│   │   ├── config/
│   │   │   └── config.ts            ← Load .env
│   │   │
│   │   ├── db/
│   │   │   └── database.ts          ← Init SQLite/PostgreSQL
│   │   │       ├── Forms table
│   │   │       ├── Submissions table
│   │   │       ├── Templates table
│   │   │       └── Analytics table
│   │   │
│   │   ├── routes/
│   │   │   └── api.routes.ts        [API Endpoints]
│   │   │       ├── POST /forms
│   │   │       ├── GET /forms
│   │   │       ├── POST /forms/:id/submissions
│   │   │       └── POST /ai/generate-form
│   │   │
│   │   ├── services/
│   │   │   ├── form.service.ts      [Business Logic]
│   │   │   │   ├── createForm()
│   │   │   │   ├── getForm()
│   │   │   │   ├── createSubmission()
│   │   │   │   └── getSubmissions()
│   │   │   │
│   │   │   └── ollama.service.ts    [AI Integration]
│   │   │       ├── generate()
│   │   │       ├── generateFormFields()
│   │   │       └── healthCheck()
│   │   │
│   │   ├── middleware/
│   │   │   └── errorHandler.ts      [Error catching]
│   │   │
│   │   └── models/
│   │       └── types.ts             ← TypeScript interfaces
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                         ← Configuration
│   └── data/
│       └── uitutive.db              ← SQLite (auto-created)
│
├── package.json                     [Monorepo scripts]
├── tsconfig.json
├── angular.json
│
├── 📄 QUICKSTART.md                 ← Start here
├── 📄 GETTING_STARTED.md            ← Setup guide
├── 📄 MONOREPO_SETUP.md             ← Architecture
├── 📄 BACKEND_FILE_REFERENCE.md     ← Backend docs
└── 📄 README.md                     ← Original docs
```

## Request/Response Cycle

### Example: Create Form with AI

```
1. USER INTERACTION
   User enters: "Customer feedback form with name, email, rating"
   Clicks: "Generate with AI"

2. FRONTEND (Angular)
   form-generator.component.ts
   ├─ Call: aiService.generateFormFields(prompt)
   └─ This calls: POST /api/v1/ai/generate-form
      {prompt: "..."}

3. NETWORK
   HTTP POST: localhost:3000/api/v1/ai/generate-form
   ├─ CORS check: ✓ (localhost:4200 allowed)
   └─ Body: {prompt: "..."}

4. BACKEND (Express)
   server.ts
   ├─ Middleware: body-parser, error handler
   ├─ Route match: POST /ai/generate-form
   └─ Call: api.routes.ts handler

5. BACKEND: ROUTE HANDLER
   api.routes.ts
   ├─ Extract: {prompt}
   ├─ Validate: prompt exists
   └─ Call: ollamaService.generateFormFields(prompt)

6. BACKEND: OLLAMA SERVICE
   ollama.service.ts
   ├─ Create system prompt
   ├─ Create messages array
   └─ HTTP POST: http://localhost:11434/api/chat
      {
        "model": "llama2",
        "messages": [...],
        "stream": false
      }

7. OLLAMA (Local AI)
   ├─ Process prompt
   ├─ Generate response (form fields JSON)
   └─ Return response

8. BACKEND: PARSE RESPONSE
   ollama.service.ts
   ├─ Extract JSON from response
   ├─ Validate: fields array format
   └─ Return: parsed fields array

9. BACKEND: RETURN TO FRONTEND
   api.routes.ts
   └─ res.json({
       success: true,
       data: {fields: [...]}
     })

10. FRONTEND: PROCESS RESPONSE
    form-generator.component.ts
    ├─ Receive: fields array
    ├─ Update: form.fields = fields
    ├─ Render: Form preview updates
    └─ User sees: Generated form fields

11. USER ACTION
    User fills form data
    Clicks: "Submit"

12. FRONTEND: SUBMIT
    form-preview.component.ts
    └─ Call: formService.submitForm(formId, data)
       POST /api/v1/forms/{formId}/submissions

13. BACKEND: CREATE SUBMISSION
    api.routes.ts
    └─ Call: formService.createSubmission(
         formId, data, userAgent, ipAddress
       )

14. BACKEND: STORE IN DATABASE
    form.service.ts
    ├─ Generate UUID: submission.id
    ├─ SQL: INSERT INTO submissions (...)
    └─ Database: SQLite/PostgreSQL

15. BACKEND: RETURN CONFIRMATION
    └─ res.status(201).json({
         success: true,
         data: {id, form_id, data, ...}
       })

16. FRONTEND: SUCCESS
    User sees: "Form submitted successfully"
```

## Data Model

### Form Structure
```
Form {
  id: "uuid-1234"                   ← Auto-generated
  title: "Customer Feedback"        ← User or AI generated
  description: "..."
  fields: [
    {
      id: "1"
      label: "Full Name"
      type: "text"
      required: true
      placeholder: "Enter your full name"
    },
    {
      id: "2"
      label: "Email"
      type: "email"
      required: true
    },
    {
      id: "3"
      label: "Rating"
      type: "select"
      required: false
      options: ["Poor", "Good", "Excellent"]
    }
  ]
  created_at: "2024-12-02T10:30:00Z"
  updated_at: "2024-12-02T10:30:00Z"
}
```

### Submission Structure
```
Submission {
  id: "uuid-5678"                   ← Auto-generated
  form_id: "uuid-1234"              ← Links to form
  data: {
    "1": "John Doe"                 ← Field id: value
    "2": "john@example.com"
    "3": "Excellent"
  }
  status: "new"                     ← new|reviewed|archived
  user_agent: "Mozilla/5.0..."      ← Browser info
  ip_address: "192.168.1.1"         ← User IP
  submitted_at: "2024-12-02T11:00:00Z"
  created_at: "2024-12-02T11:00:00Z"
}
```

## Technology Stack

### Frontend
- **Framework**: Angular 20.3
- **UI Library**: Angular Material
- **Styling**: SCSS with responsive design
- **HTTP**: HttpClient / Axios
- **State**: RxJS Observables
- **Routing**: Angular Router

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Language**: TypeScript 5.3
- **Database**: SQLite 3 / PostgreSQL
- **AI**: Ollama (local)
- **HTTP Client**: Axios

### Infrastructure
- **Development**: npm scripts, TypeScript, ts-node
- **Build**: tsc (TypeScript compiler)
- **Watch Mode**: Nodemon
- **Concurrency**: concurrently (run both dev servers)

## Environment Variables

### Backend (.env)
```
SERVER_CONFIG:
  PORT=3000
  NODE_ENV=development

DATABASE:
  DB_TYPE=sqlite
  SQLITE_PATH=./data/uitutive.db
  (or PostgreSQL settings)

AI:
  OLLAMA_BASE_URL=http://localhost:11434
  OLLAMA_MODEL=llama2
  OLLAMA_TIMEOUT=30000

CORS:
  CORS_ORIGIN=http://localhost:4200
```

### Frontend (environment.ts)
```
API_CONFIG:
  apiUrl = 'http://localhost:3000/api/v1'
```

## Execution Flow

### Startup
```
npm run dev
  ├─ npm run start:frontend
  │  └─ ng serve
  │     └─ Webpack dev server on :4200
  │
  └─ npm run start:backend
     └─ npm run dev:watch
        └─ nodemon --exec ts-node src/server.ts
           ├─ Load config from .env
           ├─ Initialize database
           │  └─ Create tables if needed
           ├─ Mount API routes
           └─ Listen on :3000
```

### API Request Flow
```
Frontend HTTP Request
  └─ Browser makes request to backend
     └─ Express middleware chain
        ├─ CORS check
        ├─ Body parser
        ├─ Error handler wrapper
        └─ Route handler
           ├─ Service call
           ├─ Database query
           ├─ Response formatting
           └─ Send JSON response
```

## Performance Considerations

### Frontend
- Angular Change Detection: OnPush strategy for large forms
- Lazy loading of form modules
- RxJS subscription management

### Backend
- Database indices on frequently queried columns
- Connection pooling for PostgreSQL
- Pagination for large result sets
- Timeout on Ollama requests (30s default)

### Database
- SQLite: Good for dev/testing (file-based)
- PostgreSQL: Better for production (concurrent users)
- Automatic table creation on startup
- Foreign key constraints enabled

## Scalability Path

```
Current (Dev):
  Frontend: Single dev server
  Backend: Single dev server
  DB: SQLite file-based

Short Term (Production):
  Frontend: Static hosting (Vercel/Netlify)
  Backend: Single Node.js instance
  DB: PostgreSQL managed service

Long Term (Scale):
  Frontend: CDN + static hosting
  Backend: Multiple instances behind load balancer
  DB: PostgreSQL with read replicas
  Cache: Redis for frequent queries
  Queue: Bull/RabbitMQ for async tasks
  AI: Ollama cluster or API service
```

## Summary

This monorepo provides:
✅ **Full-stack** form generation application
✅ **Scalable** architecture for future growth
✅ **Type-safe** TypeScript everywhere
✅ **Database** options (SQLite dev, PostgreSQL prod)
✅ **AI** integration via local Ollama
✅ **API** for third-party integrations
✅ **Documentation** at multiple levels
✅ **Development** and production ready

---

**Ready to build?** See `QUICKSTART.md` to get started!
