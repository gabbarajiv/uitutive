# Prompt Suggestions Feature - Implementation Guide

## Overview
Added a configurable prompt suggestions feature that displays clickable suggestion chips below the prompt input in the Form Generator. Users can click any suggestion to instantly populate the input field with that text.

## Components & Services

### 1. PromptSuggestionsService
**Location:** `src/app/shared/services/prompt-suggestions.service.ts`

Manages all prompt suggestion operations with full CRUD functionality and localStorage persistence.

**Key Methods:**
- `getSuggestions()` - Get suggestions as observable
- `getSuggestionsSync()` - Get suggestions synchronously
- `addSuggestion(text)` - Add new suggestion
- `removeSuggestion(id)` - Delete suggestion
- `updateSuggestion(id, text)` - Update existing suggestion
- `resetToDefaults()` - Reset to default suggestions
- `setSuggestions(suggestions)` - Replace all suggestions
- `exportSuggestions()` - Export as JSON string
- `importSuggestions(jsonString)` - Import from JSON

**Default Suggestions:**
1. Create a customer registration form with name, email, phone, and address fields
2. Generate a product feedback form with rating, comments, and email
3. Build a job application form with skills, experience, and resume upload
4. Create a survey form with multiple choice questions and satisfaction ratings
5. Generate a contact form with name, email, subject, and message fields

**Storage:** Uses localStorage with key `prompt_suggestions`

### 2. PromptInputComponent Updates
**Location:** `src/app/features/form-generator/components/prompt-input/`

Enhanced to display and handle prompt suggestions.

**Changes:**
- Added MatChipsModule import
- Added `suggestions: PromptSuggestion[]` property
- Added `private destroy$: Subject<void>` for subscription cleanup
- Inject `PromptSuggestionsService`
- Load suggestions in ngOnInit
- Implement ngOnDestroy for cleanup
- Added `selectSuggestion(suggestion)` method to populate input

**New Methods:**
```typescript
selectSuggestion(suggestion: PromptSuggestion): void {
    this.prompt = suggestion.text;
    this.cdr.markForCheck();
}
```

**UI Changes:**
- New "Suggestions Section" with:
  - Lightbulb icon indicator
  - "Try a suggestion:" label
  - Horizontal chip layout of clickable suggestions
  - Chips pre-populate the input when clicked

### 3. Settings Component - Suggestion Management
**Location:** `src/app/features/settings/components/settings.component.ts/html/scss`

Full suggestion management interface in Settings page.

**New Section: "Prompt Suggestions"**

**Features:**
- Add new suggestions via textarea form
- View all current suggestions with count
- Edit existing suggestions inline
- Delete suggestions with confirmation
- Reset all suggestions to defaults
- Visual feedback with success/error messages

**New Properties:**
```typescript
suggestions: PromptSuggestion[] = [];
newSuggestion: string = '';
editingSuggestionId: string | null = null;
editingSuggestionText: string = '';
```

**New Methods:**
- `loadPromptSuggestions()` - Load suggestions from service
- `addPromptSuggestion()` - Add new suggestion
- `startEditSuggestion(id, text)` - Enter edit mode
- `saveEditSuggestion()` - Save changes
- `cancelEditSuggestion()` - Exit edit mode
- `deletePromptSuggestion(id)` - Delete with confirmation
- `resetSuggestionsToDefaults()` - Reset all to defaults

**UI Components:**
- Add new suggestion form (textarea + button)
- Suggestions list with edit/delete actions
- Empty state when no suggestions exist
- Reset to defaults button

## User Flow

### Using Suggestions (Form Generator)
1. User navigates to Form Generator
2. Suggestion chips appear below input field (if any exist)
3. User clicks on a suggestion chip
4. Input field instantly populates with suggestion text
5. User can edit, modify, or submit as-is

### Managing Suggestions (Settings)
1. User navigates to Settings → Prompt Suggestions section
2. Can add new suggestions via "Add a new suggestion" form
3. Can edit existing suggestions by clicking the edit icon
4. Can delete suggestions by clicking the delete icon
5. Can reset all to defaults with confirmation
6. Changes are saved automatically to localStorage

## Styling

### Suggestions Section in Form Generator
- Green accent color (#10b981) to differentiate from main input
- Gradient background (green to blue)
- Chipsets with hover effects
- Disabled state when form generation is in progress
- Dark theme support with adjusted opacity
- Responsive design for mobile

### Settings Management
- Inline editing with expandable forms
- Edit/Delete action buttons for each suggestion
- Empty state with folder icon
- Hover effects on suggestion items
- Full responsive support (stacks on mobile)
- Dark theme compatible

## Storage & Persistence

**localStorage Key:** `prompt_suggestions`

**Data Format:**
```typescript
interface PromptSuggestion {
    id: string;      // timestamp-based unique ID
    text: string;    // suggestion text
}
```

**Persistence:**
- Automatically loads on app startup
- Saves after each add/edit/delete
- Import/Export available via service methods
- Defaults are hardcoded and always available

## Integration Points

### Services Used:
- `PromptSuggestionsService` - Suggestion management
- `ChangeDetectorRef` - Manual change detection (OnPush strategy)
- `ThemeService` - Dark theme support

### Material Components:
- MatChipsModule - Suggestion display
- MatFormFieldModule - Input forms
- MatButtonModule - Action buttons
- MatIconModule - Icons (lightbulb, add, edit, delete, etc.)
- MatInputModule - Textarea inputs

## Configuration

### Making Suggestions Configurable

Users can configure suggestions through:

1. **UI Interface (Settings Page)**
   - Add, edit, delete suggestions visually
   - Immediately reflected in Form Generator

2. **Default Suggestions**
   - Edit `DEFAULT_SUGGESTIONS` array in PromptSuggestionsService
   - Available via "Reset to Defaults" button

3. **Import/Export (Future Enhancement)**
   - Export suggestions as JSON
   - Import from previously saved JSON
   - Use `exportSuggestions()` and `importSuggestions()` methods

## Dark Theme Support

Both components include dark theme styling:
- Uses CSS custom properties (--color-background, --color-text, etc.)
- Suggestion chips adapt to dark theme
- Settings interface respects dark mode
- Proper contrast ratios maintained

## Accessibility

- Semantic HTML structure
- ARIA labels on chip sets
- Proper button roles and tooltips
- Keyboard navigation support via Material components
- Clear visual feedback on interactions

## Performance Considerations

- OnPush change detection strategy for efficiency
- RxJS subscription cleanup with takeUntil pattern
- Lazy loading of suggestions on component init
- Synchronous access available for non-reactive contexts

## Future Enhancements

1. **Categories/Tags**: Organize suggestions by form type
2. **Usage Analytics**: Track which suggestions are most used
3. **Personalization**: Learn from user behavior
4. **Cloud Sync**: Sync suggestions across devices
5. **Sharing**: Share suggestion sets with team members
6. **AI Generation**: Auto-generate suggestions based on user history
