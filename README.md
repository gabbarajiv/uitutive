#  Uitutive - AI-Powered Dynamic Form & UI Builder

Modern web application for generating forms and UI components using AI prompts. Built with Angular 20, SSR-ready, and powered by OpenAI/Claude.

##  Project Overview

Uitutive enables users to create complex forms and UI layouts through natural language prompts. Generate professional forms, dashboards, and components in seconds without writing code.

##  Core Features

**Phase 1 (MVP)**
- AI Form Generator - Generate forms from text descriptions
- Dynamic Form Builder - Visual drag-and-drop form editor
- Form Preview - Real-time form visualization
- Validation Engine - Built-in validation rules

**Phase 2 (Enhancement)**
- Response Collection - Store form submissions
- Form Templates - Save and reuse form templates
- Dashboard Analytics - View submission statistics
- Export Forms - Generate Angular component code

**Phase 3 (Advanced)**
- AI UI Component Generator - Create dashboards/layouts
- Theme Customization - Custom colors and styling
- Dark Mode Support - Light/dark theme toggle
- API Integration - Export forms as REST API endpoints

##  Quick Start

\\\ash
# Install dependencies
npm install

# Development server
npm start

# Production build
npm run build
\\\

##  Development Stages

| Stage | Tasks | Status |
|-------|-------|--------|
| **Setup** | Install Material/PrimeNG, AI SDK, RxJS | Pending |
| **Phase 1** | Core form generation, dynamic forms | Pending |
| **Phase 2** | Backend API, response storage | Pending |
| **Phase 3** | Analytics, theming, export | Pending |

##  Tech Stack

- **Framework**: Angular 20 with SSR
- **Forms**: Reactive Forms + Dynamic Form Generation
- **UI Library**: Angular Material (planned)
- **AI**: OpenAI/Claude API integration
- **State**: RxJS with TypeScript
- **Backend**: Express (included with SSR)
- **Database**: Firebase/Supabase (planned)

##  Component-Based Architecture

\\\
src/
 app/
    features/                          # Lazy-loaded feature modules
       form-generator/
          components/
             prompt-input/
             form-preview/
             form-generator.component.ts
          services/
          models/
          form-generator.routes.ts
       form-builder/
          components/
             form-canvas/
             field-inspector/
             field-palette/
          services/
          form-builder.routes.ts
       dashboard/
    shared/
       components/                   # Reusable UI components
          form-field/
          dialog/
          layout/
       services/
          ai.service.ts
          form.service.ts
          storage.service.ts
       models/
          form.model.ts
          field.model.ts
       pipes/
       directives/
       guards/
    core/
       interceptors/
       providers/
    app.routes.ts
    app.config.ts
\\\

##  Best Practices

 **Architecture**
- Standalone Components (Angular 14+)
- Lazy-loaded feature modules
- Separation of concerns (features/shared/core)
- Service-oriented data management

 **Code Quality**
- Strict TypeScript mode
- RxJS observables + async pipe
- No memory leaks (proper unsubscribe)
- Dependency injection
- Single Responsibility Principle

 **Reactive Forms**
- Strongly-typed FormBuilder
- Dynamic form generation
- Custom validators
- Real-time form state management

 **Reusability**
- Presentational components (dumb)
- Container components (smart)
- Shared module for common components
- Service layer for business logic

 **Performance**
- OnPush change detection
- Lazy loading routes
- Server-side rendering (SSR)
- Code splitting

##  Next Steps

1. Install Material & AI SDK dependencies
2. Create shared models (Form, Field, Validation)
3. Build AI service (form generation)
4. Create feature-specific components
5. Set up state management (signals/services)

##  Notes

- Uses Angular 20 standalone components
- SSR-ready for performance
- TypeScript strict mode enabled
- SCSS with Material Design patterns
