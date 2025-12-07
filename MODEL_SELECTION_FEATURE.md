# Model Selection Feature - Implementation Summary

## Overview
Added the ability to select and switch between available AI models directly from the UI. Users can now choose which model to use for form generation through the Settings page.

## Changes Made

### Backend Changes

#### 1. OllamaService (`backend/src/services/ollama.service.ts`)
- Added `ModelInfo` interface to represent model metadata
- Added `ModelsResponse` interface for API responses
- Added `getAvailableModels()` method - fetches available models from Ollama's `/api/tags` endpoint
- Added `setModel(modelName)` method - sets the model to use for generation
- Added `getModel()` method - returns the currently selected model

#### 2. API Routes (`backend/src/routes/api.routes.ts`)
- Added `GET /api/v1/models` endpoint - returns available models and current model
- Added `POST /api/v1/models/select` endpoint - sets the selected model

### Frontend Changes

#### 1. AIService (`src/app/shared/services/ai.service.ts`)
- Exported `ModelInfo` interface for use in components
- Added `currentModel` BehaviorSubject to track selected model
- Added `loadCurrentModel()` private method - loads current model from backend on initialization
- Added `getAvailableModels()` Observable method - fetches models from backend
- Added `setModel(modelName)` Observable method - changes the selected model
- Added `getCurrentModel$()` method - returns observable of current model
- Added `getCurrentModel()` method - returns current model value

#### 2. Settings Component TS (`src/app/features/settings/components/settings.component.ts`)
- Added imports for `MatProgressSpinnerModule` for loading state
- Added `ModelInfo` import from AIService
- Added properties:
  - `availableModels: ModelInfo[]` - list of available models
  - `currentModel: string` - currently selected model
  - `loadingModels: boolean` - loading state for models
  - `modelChangeInProgress: boolean` - state during model change
- Added `loadAvailableModels()` method - fetches available models on component init
- Added `changeModel(model)` method - handles model selection change

#### 3. Settings Component HTML (`src/app/features/settings/components/settings.component.html`)
- Added new "AI Model" section in AI Configuration card
- Added model dropdown selector (`mat-select`)
- Shows loading state while fetching models
- Displays list of available models as options
- Added spinner icon while model change is in progress

#### 4. Settings Component SCSS (`src/app/features/settings/components/settings.component.scss`)
- Added `.model-selector` class with flexbox layout
- Added `.model-select` class for the dropdown field
- Added styling for spinner during model change

## User Workflow

1. User navigates to Settings page
2. In "AI Configuration" section, a new "AI Model" dropdown appears
3. The dropdown shows all available models from the Ollama instance
4. User selects a different model from the dropdown
5. Backend is notified of the selection
6. Success/error message is displayed
7. All subsequent form generation uses the selected model

## API Endpoints

### Get Available Models
```
GET /api/v1/models
Response: {
  success: true,
  data: {
    models: [{ name, modified_at, size, digest }, ...],
    currentModel: "llama2"
  }
}
```

### Select Model
```
POST /api/v1/models/select
Body: { model: "model-name" }
Response: {
  success: true,
  message: "Model switched to model-name",
  currentModel: "model-name"
}
```

## Features
- ✅ Displays all available Ollama models
- ✅ Shows current model selection
- ✅ Easy model switching from UI
- ✅ Loading states during model fetch and change
- ✅ Error handling with user feedback
- ✅ Model selection persists in backend
- ✅ Success/error notifications

## Testing Checklist
- [ ] Models load on Settings page open
- [ ] Model dropdown shows all available models
- [ ] Selecting a model updates the backend
- [ ] Success message displays on model change
- [ ] Error message displays on failure
- [ ] Selected model is used for form generation
- [ ] Model selection persists across page navigation
- [ ] Loading spinner shows during model change
