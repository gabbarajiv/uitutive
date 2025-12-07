# Dark Mode & Centralized Styling Guide

## Overview

This document explains how dark mode support and centralized styling have been implemented across the application, particularly for the API tracking component and analytics dashboard.

## Architecture

### Centralized Variables

All color, spacing, and typography variables are defined in `src/app/shared/styles/variables.scss`:

```scss
:root {
    --color-primary: #6366f1;
    --color-background: #f8fafc;
    --color-surface: #ffffff;
    --color-text: #0f172a;
    --color-text-secondary: #64748b;
    --color-border: #e2e8f0;
    // ... more variables
}

body.dark-theme {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text: #f1f5f9;
    --color-text-secondary: #cbd5e1;
    --color-border: #334155;
}
```

### Reusable SCSS Mixins

Common styling patterns have been extracted into mixins in `src/app/shared/styles/form-table-mixins.scss`:

#### Form Field Mixins

**`form-field-base`** - Base form field styling
```scss
@include form-field-base;
```

**`form-field-dark`** - Dark mode overrides for form fields
```scss
body.dark-theme & {
    @include form-field-dark;
}
```

#### Table Mixins

**`table-base`** - Standard table styling
```scss
.analytics-table {
    @include table-base;
}
```

**`table-dark`** - Dark mode overrides for tables
```scss
body.dark-theme & {
    @include table-dark;
}
```

#### Status & Data Cell Mixins

**`cell-status($type)`** - Apply status colors to data cells
```scss
&.success {
    @include cell-status('success');
}

&.error {
    @include cell-status('error');
}
```

**`status-chip($type)`** - Style status chips with proper dark mode support
```scss
mat-chip {
    &.success {
        @include status-chip('success');
    }
    
    &.error {
        @include status-chip('error');
    }
}
```

#### Metric Display Mixins

**`metric-card`** - Container for metric displays
```scss
.metric {
    @include metric-card;
}
```

**`metric-label`** - Label styling for metrics
```scss
.metric-label {
    @include metric-label;
}
```

**`metric-value`** - Value styling for metrics
```scss
.metric-value {
    @include metric-value;
}
```

#### Grid Layout Mixins

**`metrics-grid`** - Responsive grid for metrics
```scss
.metrics-grid {
    @include metrics-grid;
}
```

**`status-grid`** - Responsive grid for status items
```scss
.status-grid {
    @include status-grid;
}
```

**`details-grid`** - Responsive grid for detail items
```scss
.details-grid {
    @include details-grid;
}
```

#### Container Mixins

**`card-container`** - Standard card styling
```scss
.card {
    @include card-container;
}
```

**`loading-state`** - Loading state container
```scss
.loading {
    @include loading-state;
}
```

**`empty-state`** - Empty state container
```scss
.empty {
    @include empty-state;
}
```

## Implementation Examples

### API Tracking Component

The API tracking component demonstrates proper usage of all mixins:

```scss
@import '../../../../shared/styles/form-table-mixins.scss';

.api-tracking-container {
    padding: 20px;
    background-color: var(--color-background);
    
    .filters-card {
        @include card-container;
        
        mat-form-field {
            @include form-field-base;
            
            body.dark-theme & {
                @include form-field-dark;
            }
        }
    }
    
    .metrics-grid {
        @include metrics-grid;
        
        .metric {
            @include metric-card;
            
            .metric-label {
                @include metric-label;
            }
            
            .metric-value {
                @include metric-value;
            }
        }
    }
    
    .analytics-table {
        @include table-base;
        
        body.dark-theme & {
            @include table-dark;
        }
        
        td {
            mat-chip {
                &.success {
                    @include status-chip('success');
                }
                
                &.error {
                    @include status-chip('error');
                }
            }
        }
    }
}
```

### Analytics Dashboard Component

The analytics dashboard shows how to apply the same patterns:

```scss
@import '../../../../shared/styles/form-table-mixins.scss';

.metrics-section {
    .metrics-grid {
        @include metrics-grid;
    }
}

.metric-card {
    @include card-container;
}

.field-analytics-card {
    @include card-container;
    
    .field-table {
        @include table-base;
        
        body.dark-theme & {
            @include table-dark;
        }
    }
}
```

## Dark Mode Toggle

Dark mode is enabled via the `dark-theme` class on the body element:

```html
<body class="dark-theme">
    <!-- content -->
</body>
```

All components using centralized variables and mixins automatically support dark mode without additional changes.

## Adding New Components

When creating new components with forms or tables:

1. **Import the mixins** at the top of your component's SCSS file:
   ```scss
   @import '../../../../shared/styles/form-table-mixins.scss';
   ```

2. **Use centralized variables** instead of hardcoded colors:
   ```scss
   // Good
   background-color: var(--color-surface);
   color: var(--color-text);
   
   // Avoid
   background-color: #ffffff;
   color: #000000;
   ```

3. **Apply appropriate mixins** for consistent styling:
   ```scss
   .my-form-field {
       @include form-field-base;
       
       body.dark-theme & {
           @include form-field-dark;
       }
   }
   
   .my-table {
       @include table-base;
       
       body.dark-theme & {
           @include table-dark;
       }
   }
   ```

## Benefits

✅ **Consistency** - All components use the same design language  
✅ **Maintainability** - Update once, apply everywhere  
✅ **Dark Mode Support** - Automatic for all components using mixins  
✅ **Accessibility** - Consistent contrast ratios and readable text  
✅ **Performance** - No duplicate styles, efficient CSS  
✅ **Scalability** - Easy to add new components with consistent styling  

## Status Color Reference

- **Success**: `#4caf50` (light), `#81c784` (dark)
- **Error**: `#f44336` (light), `#ef5350` (dark)
- **Warning**: `#ff9800` (light), `#ffb74d` (dark)
- **Info**: `#2196f3` (light), `#64b5f6` (dark)

## Files Modified

- ✅ `src/app/shared/styles/form-table-mixins.scss` - New centralized mixins
- ✅ `src/app/features/analytics/components/api-call-tracker/api-call-tracker.component.scss` - Updated with mixins
- ✅ `src/app/features/analytics/components/analytics-dashboard/analytics-dashboard.component.scss` - Updated with mixins
