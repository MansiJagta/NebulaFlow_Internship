# Visual Guide - Role Display Locations

## UI Locations Where Role is Displayed

### 1. SIDEBAR - Bottom User Section

```
┌─────────────────────────────────────┐
│  SIDEBAR (when expanded)            │
├─────────────────────────────────────┤
│  Nebula Flow  [collapse button]     │
├─────────────────────────────────────┤
│  ← Back to Repos                    │
├─────────────────────────────────────┤
│  📊 Dashboard                       │
│  ✓ Jira                            │
│  💬 Slack                          │
│  🔀 GitHub                         │
│  📈 Performance                    │
│  👤 Add Members                    │
├─────────────────────────────────────┤
│  👥 Collaborators                   │
│  ────────────────────────────────   │
│  👤 [You] ................  [PM]    │  ← Current user with badge
│  Mansi Jagtap                       │
│  mansi@example.com                  │
├─────────────────────────────────────┤
│  [Avatar] John .........  [COLLAB]  │  ← Other collaborators
│  [Avatar] Jane .........  [COLLAB]  │
│  [Avatar] Manager ......  [PM]      │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ Mansi Jagtap                  │  │  ← User Info Card
│  │ mansi@example.com             │  │
│  │ ┌────────────────────────────┐ │  │
│  │ │  👑 PM                     │ │  │
│  │ └────────────────────────────┘ │  │
│  └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  🚪 Logout                          │
└─────────────────────────────────────┘
```

### 2. NAVBAR - Top Right User Dropdown

```
┌──────────────────────────────────────────────────────────┐
│  Nebula Flow          [Search...]  🔔  [👤 ▼]           │  Top Bar
└──────────────────────────────────────────────────────────┘
                                        │
                                        └─→ Click to open
                                            ↓
                                        ┌──────────────────┐
                                        │ Mansi Jagtap     │
                                        │ mansi@example.   │
                                        │ ┌────────────────┐│
                                        │ │ 👑 PM          ││ ← Role Badge
                                        │ └────────────────┘│
                                        │ ─────────────────  │
                                        │ 📊 Dashboard     │
                                        │ ⚙️ Settings      │
                                        │ ─────────────────  │
                                        │ 🚪 Logout        │
                                        └──────────────────┘
```

### 3. SETTINGS PAGE - Profile Section

```
┌─────────────────────────────────────────────────────────────┐
│                        Settings                             │
│  Manage your account and workspace preferences              │
│                                                             │
│  Your Profile                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [👤] Mansi Jagtap                                     │ │
│  │       mansi@example.com                               │ │
│  │       ┌────────────────────────────────────┐          │ │
│  │       │ 👑 PM                              │          │ │
│  │       └────────────────────────────────────┘          │ │
│  │  [Click to manage workspace members →]               │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Workspace Information                                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Current Role: [👑 PM]      Email: mansi@example.com │ │
│  │  Repository: user/project   Workspace ID: ...       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  Available Features                                         │
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │ 👥 Manage Members    │  │ 🛡️ Administration        │   │
│  │ Add/remove members   │  │ Control workspace       │   │
│  └──────────────────────┘  └──────────────────────────┘   │
│  ┌──────────────────────┐                                  │
│  │ ⚡ Performance        │                                  │
│  │ View metrics         │                                  │
│  └──────────────────────┘                                  │
│                                                             │
│  About Your Role                                            │
│  Project Manager                                            │
│  • Add and remove team members                             │
│  • Assign and update member roles                          │
│  • Configure workspace settings                            │
│  • View comprehensive analytics                            │
│  [Manage Team Members →]                                  │
└─────────────────────────────────────────────────────────────┘
```

### 4. COLLABORATORS SECTION - Expanded View

```
Collaborators (in Sidebar when expanded)
─────────────────────────────────────
👤 (You) Mansi Jagtap     [👑 PM]
   mansi@example.com      ✓ online

   Highlighted with primary background color
   ↑
   Current user is marked with "(You)"

👤 John Developer         [👥 Collaborator]
   john@example.com       ✓ online

👤 Jane Designer          [👥 Collaborator]
   jane@example.com       ✓ online

👤 Alice Manager          [👑 PM]
   alice@example.com      ✓ online
```

## Color Coding

### PM (Project Manager)

```
Badge: 👑 PM
Colors:
  Background: Amber with transparency
  Text: Amber (darker)
  Border: Amber
  Icon: Crown

Visual: ┌────────────┐
        │ 👑 PM      │
        └────────────┘
```

### Collaborator

```
Badge: 👥 Collaborator
Colors:
  Background: Blue with transparency
  Text: Blue (darker)
  Border: Blue
  Icon: Users

Visual: ┌────────────────────┐
        │ 👥 Collaborator    │
        └────────────────────┘
```

## Current User Highlighting

### In Collaborators List

```
Background Color: Primary color (10% opacity)
Border: Primary color (30% opacity)
Hover Effect: Primary color (20% opacity)
Text Label: "(You)" in muted color
```

### Visual Example

```
Normal Collaborator:
┌─────────────────────────────┐
│ [👤] John Developer   [👥]  │
│      john@example.com       │
└─────────────────────────────┘

Current User:
┌─────────────────────────────┐
│ [👤] You: Mansi Jagtap [👑] │  ← Colored background
│      mansi@example.com      │  ← Colored border
│ ✓ Online indicator          │
└─────────────────────────────┘
```

## Responsive Design

### Desktop (Sidebar Expanded)

```
Full width sidebar (240px)
- User card fully visible
- All role information displayed
- Collaborators list fully visible
```

### Desktop (Sidebar Collapsed)

```
Collapsed sidebar (64px)
- Only user avatar visible in sidebar
- Collaborators section hidden
- User info card collapsed
- Role badge visible on hover in navbar
```

### Mobile

```
- Settings page responsive
- Sidebar can be collapsed/expanded
- Role badge always visible in navbar
- Stacked layout for settings sections
```

## Animations

### Entry Animations

- User profile card: Spring animation
- Role badge: Fade-in with scale
- Collaborators list: Staggered fade-in (each item delayed)

### Interaction Animations

- Hover over collaborator: Background color transition
- Click user avatar: Smooth dropdown open
- Role change: Smooth color transition

## Accessibility

- Role badges have tooltips with full name
- Semantic HTML structure
- Proper contrast ratios for color-coded items
- Keyboard navigation support
- Screen reader friendly labels
- Focus indicators for interactive elements

## Badge Sizes

```
Extra Small (xs): Used in lists and compact views
┌────┐
│ PM │
└────┘

Small (sm): Default for inline displays
┌─────────┐
│ 👑 PM   │
└─────────┘

Medium (md): Used in profile cards and dropdowns
┌──────────────┐
│ 👑 PM        │
└──────────────┘

Large (lg): Used for emphasis in main sections
┌─────────────────┐
│ 👑 PM           │
└─────────────────┘
```

## State Indicators

### Online Status (in Collaborators)

```
Online:  🟢 Green dot (bottom-right of avatar)
Offline: ⚫ Gray dot (or no indicator)
```

### Interactivity

```
Clickable elements:
- Collaborator name → Could trigger DM or profile
- User card (for PM) → Opens member management
- Settings link → Opens settings page
```
