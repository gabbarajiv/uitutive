# Dark Mode & Styling - Quick Reference

## CSS Variables (Use These!)

### Colors
```scss
// Text Colors
--color-text              // Primary text (#0f172a light, #f1f5f9 dark)
--color-text-secondary    // Secondary text (#64748b light, #cbd5e1 dark)

// Background
--color-background        // Page background (#f8fafc light, #0f172a dark)
--color-surface           // Card/Surface background (#ffffff light, #1e293b dark)

// Semantic
--color-primary           // Primary color (#6366f1)
--color-secondary         // Secondary color (#ec4899)
--color-success           // Success color (#10b981)
--color-warning           // Warning color (#f59e0b)
--color-error             // Error color (#ef4444)
--color-info              // Info color (#3b82f6)

// Structure
--color-border            // Border color (#e2e8f0 light, #334155 dark)
```

### Spacing
```scss
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem
--spacing-2xl: 3rem
--spacing-3xl: 4rem
```

### Typography
```scss
--font-family
--font-mono
--font-size-xs through --font-size-4xl
```

### Shadows & Borders
```scss
--shadow-xs through --shadow-2xl
--radius-sm through --radius-xl
--transition-fast through --transition-slowest
```

## Essential Mixins

### Form Fields
```scss
// Light theme
mat-form-field {
    @include form-field-base;
}

// With dark mode
mat-form-field {
    @include form-field-base;
    
    body.dark-theme & {
        @include form-field-dark;
    }
}
```

### Tables
```scss
// Light theme
.my-table {
    @include table-base;
}

// With dark mode
.my-table {
    @include table-base;
    
    body.dark-theme & {
        @include table-dark;
    }
}
```

### Status Colors
```scss
// For data cells
&.success {
    @include cell-status('success');
}

&.error {
    @include cell-status('error');
}

// For chips
mat-chip.success {
    @include status-chip('success');
}
```

### Metrics
```scss
.metrics-grid {
    @include metrics-grid;
}

.metric {
    @include metric-card;
    
    .label {
        @include metric-label;
    }
    
    .value {
        @include metric-value;
    }
}
```

### Containers
```scss
.card {
    @include card-container;
}

.loading {
    @include loading-state;
}

.empty {
    @include empty-state;
}
```

## Status Types

```scss
// Types: 'success', 'error', 'warning', 'info'

// Example
mat-chip.success {
    @include status-chip('success');
}

// Light colors:
// - success: #c8e6c9 / #2e7d32
// - error: #ffcdd2 / #c62828
// - warning: #ffe0b2 / #e65100
// - info: #bbdefb / #1565c0

// Dark colors (automatic):
// - success: rgba(76, 175, 80, 0.25) / #81c784
// - error: rgba(244, 67, 54, 0.25) / #ef5350
// - warning: rgba(255, 152, 0, 0.25) / #ffb74d
// - info: rgba(33, 150, 243, 0.25) / #64b5f6
```

## Import Statement

```scss
@import '../../../../shared/styles/form-table-mixins.scss';
```

## Don't Mix Approaches

❌ **Avoid**
```scss
color: #000000;              // Hardcoded color
background-color: white;    // Hardcoded color
padding: 20px;              // Hardcoded spacing
```

✅ **Use Instead**
```scss
color: var(--color-text);
background-color: var(--color-surface);
padding: var(--spacing-lg);
@include metric-card;
```

## Dark Mode Toggle

```typescript
// Enable dark mode
document.body.classList.add('dark-theme');

// Disable dark mode
document.body.classList.remove('dark-theme');

// Toggle
document.body.classList.toggle('dark-theme');
```

## Files to Reference

| File | Purpose | When to Use |
|------|---------|-------------|
| `variables.scss` | Color/spacing/typography variables | Every SCSS file |
| `form-table-mixins.scss` | Reusable styling mixins | Components with forms/tables |
| `material-overrides.scss` | Material component overrides | Global styles |
| `page-common.scss` | Page layout mixins | Page containers |

## Component Checklist

When updating a component for dark mode:

- [ ] Import `form-table-mixins.scss`
- [ ] Replace hardcoded colors with CSS variables
- [ ] Apply mixins for forms/tables
- [ ] Add `body.dark-theme &` overrides
- [ ] Test with `document.body.classList.add('dark-theme')`
- [ ] Check all tabs/sections
- [ ] Verify contrast ratios
- [ ] Test responsive design

## Common Mistakes

❌ **Using old colors**
```scss
background-color: #f0f0f0;  // Don't!
```

✅ **Use variables instead**
```scss
background-color: var(--color-surface);  // Do this!
```

---

❌ **Forgetting dark mode override**
```scss
color: var(--color-text);  // Works in light, may fail in dark
```

✅ **Add dark mode override**
```scss
color: var(--color-text);

body.dark-theme & {
    color: var(--color-text);  // Ensures consistency
}
```

---

❌ **Creating custom status colors**
```scss
&.success {
    color: #4caf50;
}
```

✅ **Use the mixin instead**
```scss
&.success {
    @include cell-status('success');
}
```
