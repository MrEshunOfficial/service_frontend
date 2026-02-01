# Client Profile Form - Component Showcase

## 🎨 Design System

### Color Palette

The form uses semantic color tokens that automatically adapt to light/dark themes:

```
Primary     - Main brand color for CTAs and active states
Secondary   - Supporting color for less prominent actions
Muted       - Subtle backgrounds and disabled states
Accent      - Highlight important information
Destructive - Error states and warnings
```

### Typography Scale

```
Headings:
- h3: text-xl font-semibold tracking-tight      (Step titles)
- h4: text-base font-medium                      (Section headers)

Body:
- Base: text-sm                                  (Form descriptions)
- Label: text-sm font-medium                     (Field labels)
- Helper: text-xs text-muted-foreground          (Helper text)
```

### Spacing System

```
Gap Hierarchy:
- gap-2   : Tight spacing (buttons, badges)
- gap-3   : Close spacing (form actions)
- gap-4   : Related items (form fields)
- gap-6   : Sections (step content)
- gap-8   : Major sections (steps)
```

---

## 🧩 Component Breakdown

### 1. FormProgress Component

**Purpose**: Visual step indicator with click-to-navigate

**States**:
- ✓ Complete: Filled circle with checkmark, primary color
- → Current: Outlined circle with number, primary ring
- ○ Upcoming: Muted circle with number

**Interactive Behavior**:
- Completed steps: Clickable, hover effect
- Current step: Non-interactive, highlighted
- Future steps: Disabled, reduced opacity

**Visual Example**:
```
Step 1 (Complete)    Step 2 (Current)    Step 3 (Future)
────────────────────────────────────────────────────
[✓] ───────────────  [2] ─────────────── [3]
Personal Info       Location            Preferences
  ↑ Primary           ↑ Primary w/ring    ↑ Muted
```

---

### 2. PersonalInfoStep Component

**Layout**: Single column, stacked fields

**Fields**:
1. Preferred Name (Optional)
   - Icon: User
   - Validation: 2-50 characters
   - Helper: "What should we call you?"

2. Date of Birth (Optional)
   - Icon: Calendar
   - Component: Popover calendar
   - Features: Dropdown year/month selection

3. Secondary Phone (Optional)
   - Icon: Phone
   - Format: +233 XX XXX XXXX
   - Validation: 10-15 digits

4. Email Address (Optional)
   - Icon: Mail
   - Validation: Valid email format

**Visual Hierarchy**:
```
┌─────────────────────────────────────────┐
│ Personal Information                    │
│ ─────────────────────────────────────── │
│                                         │
│ Preferred Name                          │
│ ┌───────────────────────────────────┐  │
│ │ [👤] What should we call you?     │  │
│ └───────────────────────────────────┘  │
│ The name you'd like to be addressed by │
│                                         │
│ Date of Birth                           │
│ ┌───────────────────────────────────┐  │
│ │ [📅] Select your date of birth    │  │
│ └───────────────────────────────────┘  │
│ Optional - helps us personalize...     │
└─────────────────────────────────────────┘
```

---

### 3. LocationStep Component

**Layout**: Card-based with status indicators

**Sections**:

1. **Location Status Card**
   - Auto-detects on mount
   - Shows GPS coordinates
   - Displays detection status
   - Retry button if failed

2. **GPS Address Input**
   - Format validation: AA-###-####
   - Verify button
   - Real-time format hints

3. **Nearby Landmark**
   - Free text input
   - Examples provided

4. **Enriched Data Display** (After verification)
   - Alert component
   - Grid layout: Region, City, District, Locality
   - Visual confirmation

**State Indicators**:
```
Loading:    [⟳] Detecting your location...
Success:    [✓] Location detected successfully
Error:      [!] Location detection failed
```

**Visual Flow**:
```
┌─────────────────────────────────────────┐
│ [✓] Location detected successfully     │
│ Coordinates: 5.60, -0.18 • East Legon  │
│                           [Retry] ────► │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Ghana Post GPS Address *                │
│ ┌─────────────────┬─────────────────┐  │
│ │ GA-123-4567     │  [📍 Verify]    │  │
│ └─────────────────┴─────────────────┘  │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ ✓ Verified Location Details:           │
│ Region: Greater Accra | City: Accra     │
│ District: Ayawaso    | Locality: Legon  │
└─────────────────────────────────────────┘
```

---

### 4. PreferencesStep Component

**Layout**: Mixed (select, badges, cards)

**Sections**:

1. **Language Preference**
   - Select dropdown
   - Icon: Globe
   - Options: English, Twi, Ga, Ewe

2. **Service Categories**
   - Badge selection (multi-select)
   - Toggle on/off by clicking
   - Visual states:
     - Selected: Solid background, primary color
     - Unselected: Outline style

3. **Communication Preferences**
   - Card container
   - Three toggle switches:
     * Email Notifications
     * SMS Notifications
     * Push Notifications
   - Each with icon and description

**Badge Interaction**:
```
Unselected:  [Plumbing]  [Electrical]  [Cleaning]
              ↓ click
Selected:    [Plumbing]  [Electrical]  [Cleaning]
             ─────────
             Primary bg
```

---

### 5. EmergencyContactStep Component

**Layout**: Single column with privacy notice

**Components**:

1. **Privacy Alert**
   - Shield icon
   - Light background (primary/5 opacity)
   - Reassurance message

2. **Contact Fields**:
   - Full Name (Icon: User)
   - Relationship (Icon: Users, Select dropdown)
   - Phone Number (Icon: Phone)

**Relationship Options**:
```
Spouse, Parent, Sibling, Child, Friend,
Colleague, Other Family Member, Other
```

---

### 6. ReviewStep Component

**Layout**: Card grid, organized by section

**Features**:
- Read-only display
- Grouped by form step
- Icons for each section
- Conditional rendering (only shows filled fields)
- Formatted values

**Visual Structure**:
```
┌──────────────────────────────────────┐
│ [👤] Personal Information           │
│ ─────────────────────────────────── │
│ PREFERRED NAME                       │
│ John Doe                             │
│                                      │
│ DATE OF BIRTH                        │
│ January 15, 1990                     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ [📍] Location Details               │
│ ─────────────────────────────────── │
│ GPS ADDRESS                          │
│ GA-123-4567                          │
│                                      │
│ Region: Greater Accra | City: Accra  │
│ District: Ayawaso    | Locality: ... │
└──────────────────────────────────────┘
```

---

### 7. FormNavigation Component

**Layout**: Space-between flex container

**Buttons**:

**Previous Button** (Left):
- Variant: Outline
- Icon: ChevronLeft
- Hidden on first step
- Hover: Icon slides left

**Cancel Button** (Right, optional):
- Variant: Ghost
- Icon: X
- Always visible if provided

**Next Button** (Right):
- Variant: Default (primary)
- Icon: ChevronRight
- Hover: Icon slides right
- Replaces with Submit on last step

**Submit Button** (Last step):
- Variant: Default
- Min width: 120px
- Loading state: Spinner + "Creating..."

**Visual States**:
```
Step 1-4:
[Previous]                    [Cancel] [Next →]

Step 5 (Last):
[← Previous]          [Cancel] [Create Profile]

Loading:
[← Previous]          [Cancel] [⟳ Creating...]
                                (disabled)
```

---

## 🎭 Interactive States

### Input Focus States

```css
Default:   border-border bg-background
Focus:     border-primary ring-4 ring-primary/20
Error:     border-destructive ring-4 ring-destructive/20
Disabled:  opacity-50 cursor-not-allowed
```

### Button States

```css
Default:   bg-primary text-primary-foreground
Hover:     opacity-90
Active:    scale-95
Disabled:  opacity-50 cursor-not-allowed
Loading:   cursor-wait (with spinner)
```

### Badge States

```css
Unselected: border-border text-foreground
Selected:   bg-primary text-primary-foreground
Hover:      bg-primary/90 (if selected)
```

---

## 📱 Responsive Behavior

### Breakpoints

```
Mobile:    < 640px   (sm)
Tablet:    640-1024px (md-lg)
Desktop:   > 1024px  (xl)
```

### Layout Adjustments

**FormProgress**:
```
Mobile:  Vertical list, smaller circles
Tablet:  Horizontal, reduced spacing
Desktop: Full horizontal with generous spacing
```

**Form Fields**:
```
Mobile:  Full width, stacked
Tablet:  Grid 2 columns for short fields
Desktop: Optimized spacing, max-width container
```

**Navigation**:
```
Mobile:  Compact buttons, shorter labels
Tablet:  Full buttons with icons
Desktop: Full buttons with hover effects
```

---

## ♿ Accessibility Features

### Keyboard Navigation
- Tab order follows visual flow
- Enter to submit forms
- Escape to close popovers
- Arrow keys in selects/calendars

### Screen Reader Support
- Semantic HTML (form, fieldset, legend)
- ARIA labels on icons
- ARIA live regions for errors
- Progress announcements

### Focus Management
- Visible focus indicators
- Focus trap in modals
- Auto-focus on errors
- Logical tab order

---

## 🎬 Animation Details

### Micro-Interactions

**Step Transition**:
```
Duration: 300ms
Easing: ease-in-out
Effect: Fade + slight slide
```

**Button Hover**:
```
Icon shift: translateX(±4px)
Duration: 200ms
Easing: ease-out
```

**Success State**:
```
Checkmark: Scale 0 → 1
Duration: 400ms
Easing: spring
```

**Loading Spinner**:
```
Rotation: 360deg
Duration: 1s
Easing: linear
Infinite: true
```

---

## 🎨 Dark Mode Adaptations

All components automatically adapt using CSS variables:

```
Light Mode              Dark Mode
─────────────────────────────────────
bg-background          #FFFFFF → #0A0A0A
text-foreground        #000000 → #FAFAFA
border-border          #E5E5E5 → #27272A
bg-muted               #F4F4F5 → #18181B
```

**Special Considerations**:
- Shadows reduced in dark mode
- Borders more subtle
- Focus rings adjusted for contrast
- Icons maintain visibility

---

## 📐 Layout Grid

```
Container:
max-width: 896px (3xl)
padding: 32px (desktop), 16px (mobile)

Card:
padding: 24px
border-radius: 8px
border: 1px solid border

Form Fields:
gap: 24px (between fields)
label-to-input: 8px
input-to-helper: 4px
```

---

## 🔍 Validation Feedback

### Error States

**Visual Indicators**:
- Red border (border-destructive)
- Red ring on focus
- Error icon (AlertCircle)
- Error message below field

**Error Message Format**:
```
[!] Error message here
    ↑ Red color, small text
    ↑ Slide in from top
```

### Success States

**Visual Indicators**:
- Green checkmark (CheckCircle2)
- Success message
- Green border (optional)

---

## 🎯 Component Density

### Comfortable (Default)
```
Field height: 40px
Padding: 12px 16px
Gap: 24px
```

### Compact (Mobile)
```
Field height: 36px
Padding: 8px 12px
Gap: 16px
```

---

**This showcase demonstrates the comprehensive design system used throughout the client profile form components.**
