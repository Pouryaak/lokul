# Lokul Design Language

> Last updated: 2026-02-23
>
> This document captures the visual design system and UI patterns established for the Lokul chat interface. All new components should follow these guidelines to maintain consistency.

---

## 🎨 Core Philosophy

**Premium Dark Interface with Warm Accents**
- Dark, sophisticated base with subtle warmth
- Glass-morphism inspired overlays
- Orange (#FF6B35) as the primary accent
- Smooth animations and micro-interactions
- Clean, spacious layouts with purposeful density

---

## 🌈 Color System

### Primary Accent
```
--lokul-orange: #FF6B35
--lokul-orange-light: rgba(255, 107, 53, 0.1)
--lokul-orange-medium: rgba(255, 107, 53, 0.2)
```

### Dark Theme Variables (CSS Custom Properties)
```css
--chat-shell-bg:       /* Main app background */
--chat-surface-bg:     /* Card/panel backgrounds */
--chat-header-bg:      /* Header bar backgrounds */
--chat-text-primary:   /* Primary text color */
--chat-text-muted:     /* Secondary/muted text */
--chat-border-soft:    /* Subtle borders */
--chat-border-subtle:  /* Very light borders/dividers */
```

### Semantic Color Usage
- **Success/Healthy**: `emerald-400` / `emerald-500` (green)
- **Warning**: `amber-400` / `amber-500` (yellow/orange)
- **Error/Danger**: `red-400` / `red-500`
- **Neutral**: `muted` / `muted-foreground` (gray scale)

### Category Colors (Memory)
```
Project:     cyan-400   (bg-cyan-500/10, border-cyan-500/20)
Preference:  purple-400 (bg-purple-500/10, border-purple-500/20)
Identity:    emerald-400 (bg-emerald-500/10, border-emerald-500/20)
```

---

## 🧩 Component Patterns

### Header Action Buttons (Performance, Download, Memory)

**Structure:**
```tsx
<Popover>
  <PopoverTrigger>
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Icon className="h-4 w-4" />
      {/* Status indicator dot (optional) */}
      <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full" />
    </Button>
  </PopoverTrigger>
  <PopoverContent
    align="end"
    sideOffset={8}
    className="w-[340px] border-[var(--chat-border-soft)] bg-[var(--chat-surface-bg)] p-0 shadow-2xl"
  >
    {/* Header */}
    {/* Content */}
  </PopoverContent>
</Popover>
```

**Header Pattern:**
- Left: Icon in gradient/colored circle + title + subtitle
- Right: Close button (X icon)
- Border bottom divider

```tsx
<div className="flex items-center justify-between border-b border-[var(--chat-border-subtle)] px-4 py-3">
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6B35]/10">
      <Icon className="h-5 w-5 text-[#FF6B35]" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-[var(--chat-text-primary)]">Title</h3>
      <p className="text-[10px] text-muted-foreground">Subtitle info</p>
    </div>
  </div>
  <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
    <X className="h-4 w-4" />
  </button>
</div>
```

### Sheet Panels (Full Management)

**Structure:**
```tsx
<Sheet>
  <SheetContent
    side="right"
    className="w-full border-[var(--chat-border-soft)] bg-[var(--chat-surface-bg)] p-0 sm:max-w-md"
  >
    <SheetHeader className="border-b border-[var(--chat-border-subtle)] bg-[var(--chat-header-bg)] px-4 py-3">
      {/* Header content */}
    </SheetHeader>
    <div className="flex h-[calc(100vh-140px)] flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Scrollable content */}
      </div>
      <div className="border-t border-[var(--chat-border-subtle)] bg-[var(--chat-header-bg)] p-4">
        {/* Footer actions */}
      </div>
    </div>
  </SheetContent>
</Sheet>
```

### Cards / List Items

**Standard Card:**
```tsx
<div className="group relative rounded-xl border border-[var(--chat-border-subtle)] bg-muted/20 p-3
                transition-all hover:border-[var(--chat-border-soft)] hover:bg-muted/30">
  {/* Content */}
  {/* Actions - appear on hover */}
  <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
    {/* Action buttons */}
  </div>
</div>
```

**Card with Selection:**
```tsx
<div className={cn(
  "rounded-xl border p-3 transition-all",
  "border-[var(--chat-border-subtle)] bg-muted/20",
  isSelected && "border-[#FF6B35]/50 bg-[#FF6B35]/5"
)}>
```

### Form Inputs

**Dark Input:**
```tsx
<input
  className="w-full rounded-xl bg-muted/50 px-3 py-2.5 text-sm text-foreground
             placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50"
/>
```

**Input with Action Button:**
```tsx
<div className="relative">
  <input className="... pr-16" />
  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
    <button className="rounded-lg bg-[#FF6B35]/10 px-2.5 py-1 text-xs font-medium text-[#FF6B35]
                       transition-colors hover:bg-[#FF6B35]/20">
      Action
    </button>
  </div>
</div>
```

### Buttons

**Ghost Icon Button:**
```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
>
```

**Accent Action Button:**
```tsx
<Button
  size="sm"
  className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
>
```

**Ghost with Accent (Manage Mode):**
```tsx
<Button
  variant="ghost"
  size="sm"
  className={cn(
    "h-8 text-xs transition-colors",
    isActive && "bg-[#FF6B35]/10 text-[#FF6B35] hover:bg-[#FF6B35]/20"
  )}
>
```

### Badges / Pills

**Category Filter Pill:**
```tsx
<button
  className={cn(
    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
    isActive
      ? "bg-[accent-bg] text-[accent-color] ring-1 ring-current/30"
      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
  )}
>
  <Icon className="h-3 w-3" />
  Label
  <span className="ml-0.5 rounded-full bg-current/20 px-1.5 py-0.5 text-[10px]">count</span>
</button>
```

**Outline Badge:**
```tsx
<Badge
  variant="outline"
  className="border-0 bg-transparent px-0 text-[10px] font-medium uppercase tracking-wide text-[accent-color]"
>
  <Icon className="mr-1 h-3 w-3" />
  Label
</Badge>
```

---

## ✨ Animations & Transitions

### Framer Motion Patterns

**Card Entrance:**
```tsx
<motion.div
  layout
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="..."
>
```

**Expand/Collapse:**
```tsx
<AnimatePresence>
  {condition && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
```

**Slide In:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 10 }}
>
```

### CSS Transitions

**Standard Hover:**
```css
transition-all hover:bg-muted/50
```

**Opacity Fade (Actions):**
```css
opacity-0 transition-opacity group-hover:opacity-100
```

**Color Transitions:**
```css
transition-colors hover:text-foreground
```

---

## 🎯 Visual Effects

### Pin Indicator
```tsx
{isPinned && (
  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center
                  rounded-full bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/30">
    <Pin className="h-2.5 w-2.5 fill-current" />
  </div>
)}
```

### Status Dot
```tsx
<span className={cn(
  "absolute bottom-1 right-1 h-2 w-2 rounded-full border border-[var(--chat-header-bg)]",
  status === "healthy" && "bg-emerald-500",
  status === "warning" && "bg-amber-500",
  status === "critical" && "bg-red-500"
)} />
```

### Progress Bar
```tsx
<div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
  <div
    className="h-full rounded-full bg-[#FF6B35] transition-all"
    style={{ width: `${percentage}%` }}
  />
</div>
```

### Gradient Icon Background
```tsx
<div className="flex h-10 w-10 items-center justify-center rounded-xl
                bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5">
  <Icon className="h-5 w-5 text-[#FF6B35]" />
</div>
```

---

## 📐 Layout & Spacing

### Spacing Scale (Tailwind)
- `p-3` / `px-4 py-3` - Standard card padding
- `p-4` - Sheet content padding
- `gap-2` / `gap-3` - Standard flex gaps
- `space-y-2` / `space-y-3` - Vertical stacks
- `rounded-xl` - Cards, buttons
- `rounded-2xl` - Larger containers
- `rounded-lg` - Smaller elements (pills, inputs)

### Typography Scale
- `text-[10px]` - Labels, counts, metadata
- `text-xs` - Secondary text, buttons
- `text-sm` - Body text, primary content
- `text-base` - Headers, titles
- `font-medium` - Labels, emphasis
- `font-semibold` - Titles, headers
- `uppercase tracking-wide` - Section labels

---

## 🔧 Iconography

### Icon Sizes
- `h-3 w-3` / `h-3.5 w-3.5` - Small (pills, badges)
- `h-4 w-4` - Standard (buttons, inputs)
- `h-5 w-5` - Large (headers, prominent)
- `h-6 w-6` / `h-8 w-8` - Feature icons

### Icon Libraries
- `lucide-react` - Primary icon library
- All icons should be stroke-based (not filled) unless indicating state
- Use `fill-current` for filled states (pinned, selected)

---

## 🎭 State Patterns

### Hover States
- Background: `hover:bg-muted` or `hover:bg-muted/50`
- Text: `hover:text-foreground`
- Border: `hover:border-[var(--chat-border-soft)]`

### Active/Selected States
- Border: `border-[#FF6B35]/50`
- Background: `bg-[#FF6B35]/5` or `bg-[#FF6B35]/10`
- Ring: `ring-1 ring-[#FF6B35]/30` or `ring-2 ring-[#FF6B35]`

### Loading States
```tsx
<div className="flex h-32 items-center justify-center">
  <div className="h-8 w-8 animate-spin rounded-full
                  border-2 border-muted-foreground/30 border-t-[#FF6B35]" />
</div>
```

### Empty States
```tsx
<div className="flex h-64 flex-col items-center justify-center
                rounded-xl border border-dashed border-[var(--chat-border-subtle)] bg-muted/20">
  <Icon className="h-12 w-12 text-muted-foreground/30" />
  <p className="mt-4 text-sm font-medium text-muted-foreground">No items yet</p>
  <p className="text-xs text-muted-foreground/70">Subtitle description</p>
</div>
```

---

## 📝 Copy & Content

### Tone
- Professional but friendly
- Concise and clear
- Action-oriented button labels

### Common Labels
- "Add" - Primary creation action
- "Save" - Confirm edit
- "Cancel" - Abort action
- "Delete" - Remove (usually red)
- "Manage" - Enter selection/batch mode
- "Done" - Exit manage mode

### Empty State Copy
- Primary: "No [items] yet"
- Secondary: Friendly explanation of what will appear

---

## 🔒 Accessibility

### Required Patterns
- All interactive elements must have `aria-label`
- Focus visible rings: `focus-visible:ring-2 focus-visible:ring-[#FF6B35]/40`
- Sufficient color contrast (WCAG AA minimum)
- Keyboard navigation support

### ARIA Labels
```tsx
<button aria-label="Close panel">
<button aria-label={isPinned ? "Unpin memory" : "Pin memory"}>
<input aria-label="Add memory" />
```

---

## 🧪 Quality Checklist

Before marking a component complete, verify:

- [ ] Uses CSS variables for theming (`--chat-*`)
- [ ] Dark theme compatible
- [ ] Orange accent (#FF6B35) for primary actions
- [ ] Consistent spacing (multiples of 4px)
- [ ] Smooth transitions on interactive elements
- [ ] Hover states for all interactive elements
- [ ] Proper focus states
- [ ] Loading state (if async)
- [ ] Empty state (if list)
- [ ] Error state (if applicable)
- [ ] Responsive design
- [ ] ARIA labels

---

## 📚 Examples

### Complete Component: Memory Button
See `src/components/memory/MemoryButton.tsx` as the reference implementation combining:
- Popover for quick access
- Sheet for full management
- Category filtering
- Inline editing
- Bulk selection
- Dark theme throughout

### Complete Component: Performance Button
See `src/components/performance/PerformanceButton.tsx` for:
- Status indicators
- Progress visualization
- Real-time data display
- Stats grid layout

---

*This document should be updated whenever new patterns are established or existing patterns are modified.*
