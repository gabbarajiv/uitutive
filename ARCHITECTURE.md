# UI/UX Architecture Documentation

## Modular & Responsive Design Structure

This document outlines the modern, component-based architecture implemented for the UI application with full mobile responsiveness and animations.

## 📁 File Organization

### Global Styles (`src/app/shared/styles/`)

The styles are organized into separate, maintainable SCSS modules:

#### 1. **variables.scss** (~60 lines)
- CSS Custom Properties (CSS Variables) for theming
- Color palette, spacing scale, typography, shadows
- Z-index scale for layering
- Supports both light and dark themes
- **Purpose**: Centralized design tokens

#### 2. **animations.scss** (~200 lines)
- All keyframe animations (fadeIn, slideIn, spin, float, etc.)
- Animation utility classes (.animate-fade-in, .animate-bounce)
- Staggered animations for lists
- **Purpose**: Consistent animation system, no duplication

#### 3. **responsive.scss** (~250 lines)
- Responsive breakpoints (xs: 320px, sm: 480px, md: 768px, lg: 1024px)
- Responsive mixins (@include respond-to-md)
- Mobile-first approach utilities
- Touch device enhancements (44px touch targets)
- Print styles
- **Purpose**: Mobile-first responsive utilities

#### 4. **utilities.scss** (~200 lines)
- Spacing utilities (.p-md, .m-lg, .gap-xl)
- Display utilities (.flex, .flex-center, .flex-between)
- Text utilities (.text-center, .text-primary, .line-clamp-2)
- Visibility utilities (.hidden, .invisible)
- Container utility
- **Purpose**: Reusable utility classes

#### 5. **material-overrides.scss** (~400 lines)
- Material Design component customizations
- Toolbar, Sidenav, Card, Button, Form Field overrides
- Menu, Datepicker, Checkbox/Radio styling
- Mobile responsive adjustments for Material components
- **Purpose**: Consistent Material Design theming

#### 6. **styles.scss** (~80 lines)
- Main global styles file that imports all modules
- Base element styling (html, body, app-root)
- Scrollbar styling
- Selection styling
- **Purpose**: Entry point for all global styles

### Component-Specific Styles

#### **App Component** (`src/app/app.scss`) - **200 lines**
- Toolbar styling with animations
- Sidenav container and navigation styling
- App menu styling
- Responsive adjustments for all screen sizes
- Includes hover effects, transitions, and animations

#### **Form Generator Component** 
- **form-generator-layout.scss** (~350 lines)
  - Page header with gradient and floating animations
  - Page content container
  - Card and preview section styling
  - Message containers (error/success states)
  - Empty state styling
  - Full responsive breakpoints (1024px, 768px, 480px)

- **form-generator.component.scss** (~5 lines)
  - Imports layout SCSS
  - Host styling

#### **Prompt Input Component** (`prompt-input.component.scss`) - **180 lines**
- Card styling with animations
- Form field customization
- Input actions (buttons)
- Prompt examples section with hover effects
- Mobile-first responsive design
- Staggered animations for examples

#### **Form Preview Component** (`form-preview.component.scss`) - **220 lines**
- Form header and description styling
- Form fields (input, textarea, select, checkbox, radio)
- Form actions (submit/reset buttons)
- Field wrapper animations
- Full responsive support (768px, 480px)
- Touch-friendly sizing for mobile

## 🎨 Design System

### Color Palette
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #ec4899 (Pink)
- **Accent**: #10b981 (Green)
- **Status Colors**: Success (#10b981), Warning (#f59e0b), Error (#ef4444)

### Spacing Scale
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
```

### Typography
- **Font**: Inter (400, 500, 600, 700, 800)
- **Mono**: JetBrains Mono
- **Sizes**: xs-4xl (0.75rem to 2.25rem)

### Responsive Breakpoints
- **XS**: < 320px (small phones)
- **SM**: < 480px (phones)
- **MD**: < 768px (tablets)
- **LG**: < 1024px (small desktops)
- **XL**: < 1280px (desktops)
- **2XL**: < 1536px (large desktops)

## 📱 Mobile Responsiveness

### Key Mobile Optimizations
1. **Touch Targets**: 44px minimum height/width on touch devices
2. **Font Sizes**: 16px on mobile inputs to prevent iOS auto-zoom
3. **Flexible Layouts**: Column layouts on mobile, row on desktop
4. **Spacing**: Reduced spacing on smaller screens
5. **Buttons**: Full-width on mobile when appropriate
6. **Typography**: Font sizes scale down proportionally
7. **Icons**: Responsive icon sizes (24px → 18px → 16px)

### Responsive Adjustment Pattern
```scss
// Desktop (default)
padding: 2.5rem;
font-size: 1rem;

// Tablet
@media (max-width: 768px) {
    padding: 1.5rem;
    font-size: 0.95rem;
}

// Mobile
@media (max-width: 480px) {
    padding: 1rem;
    font-size: 0.9rem;
}
```

## ✨ Animation System

### Available Animations
- **fadeIn/fadeOut**: Opacity with vertical movement
- **slideInLeft/Right/Up/Down**: Directional slide with fade
- **pulse**: Opacity pulsing
- **glow**: Box shadow glow effect
- **spin**: 360° rotation
- **float**: Vertical floating effect
- **scaleIn**: Scale from 0.95 to 1 with fade
- **bounce**: Vertical bounce effect

### Animation Timings
- **Fast**: 150ms (interactions)
- **Base**: 250ms (standard transitions)
- **Slow**: 350ms (page transitions)
- **Slowest**: 500ms (heavy animations)

### Staggered Animations
```scss
.stagger-item {
    animation: slideInUp var(--transition-base) ease-out;
    
    @for $i from 0 through 10 {
        &:nth-child(#{$i + 1}) {
            animation-delay: calc(#{$i} * 50ms);
        }
    }
}
```

## 📐 Component File Size Tracking

All components are kept under 500 lines:

| File | Lines | Purpose |
|------|-------|---------|
| styles.scss | ~80 | Global imports |
| variables.scss | ~60 | Design tokens |
| animations.scss | ~200 | Animation system |
| responsive.scss | ~250 | Breakpoints & responsive |
| utilities.scss | ~200 | Utility classes |
| material-overrides.scss | ~400 | Material customizations |
| app.scss | ~200 | App layout |
| form-generator-layout.scss | ~350 | Form layout |
| prompt-input.component.scss | ~180 | Input styling |
| form-preview.component.scss | ~220 | Form preview styling |

**Total**: ~2,140 lines (well organized & maintainable)

## 🎯 Best Practices Implemented

1. ✅ **Separation of Concerns**: Animations, variables, responsive, utilities are separate
2. ✅ **DRY (Don't Repeat Yourself)**: CSS Variables eliminate color/spacing duplication
3. ✅ **Mobile-First**: Styles default to mobile, enhanced for larger screens
4. ✅ **Accessible Touch Targets**: 44px+ minimum for touch interactions
5. ✅ **Component Isolation**: Each component has its own SCSS with limited scope
6. ✅ **Performance**: No inline styles, efficient selectors
7. ✅ **Consistency**: Shared animations, spacing, colors across all components
8. ✅ **Maintainability**: File organization makes updates easy

## 🚀 Usage Examples

### Using Animations
```html
<!-- Fade in animation -->
<div class="animate-fade-in">Content</div>

<!-- Bounce animation -->
<div class="animate-bounce">Button</div>

<!-- Slide in from left -->
<div class="animate-slide-in-left">Navigation</div>
```

### Using Spacing Utilities
```html
<!-- Padding and margin -->
<div class="p-lg m-md">Content with 1.5rem padding and 1rem margin</div>

<!-- Gap between flex items -->
<div class="flex gap-xl">Item 1 | Item 2</div>
```

### Using Text Utilities
```html
<!-- Text styling -->
<p class="text-primary text-lg font-semibold">Primary heading</p>

<!-- Line clamping -->
<p class="line-clamp-2">Long text that wraps to 2 lines max...</p>
```

### Using Responsive Utilities
```html
<!-- Hide on mobile, show on desktop -->
<div class="hide-mobile">Desktop only</div>

<!-- Show on mobile only -->
<div class="show-mobile">Mobile only</div>
```

## 📝 Theme Customization

To change theme colors, update CSS Variables in `variables.scss`:

```scss
:root {
    --color-primary: #your-color;
    --color-secondary: #your-color;
    --color-success: #your-color;
    // ... update other colors
}
```

## 🔄 Maintenance & Updates

When updating styles:
1. Update design tokens in `variables.scss` first
2. Add animations to `animations.scss` (never inline)
3. Add responsive breakpoints to `responsive.scss`
4. Component-specific styles in component SCSS files
5. Keep each file under 500 lines for readability

---

**Last Updated**: December 2025
**Architecture Type**: Component-Based, Mobile-First, Responsive
**Design System**: Material Design + Custom Modern UI
