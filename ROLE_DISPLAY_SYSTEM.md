# Role Display System - Implementation Guide

## Overview

This document describes the comprehensive role display and management system implemented in Nebula Flow. The system displays the logged-in user's role in multiple places throughout the application, updates consistently when the role changes, and provides role-based feature access.

## Components Created

### 1. **RoleBadge Component** (`/components/common/RoleBadge.jsx`)

A reusable component that displays role badges with consistent styling across the app.

**Features:**

- Displays role with icon (Crown for PM, Users for Collaborator)
- Configurable sizes: `xs`, `sm`, `md`, `lg`
- Color-coded by role:
  - **PM**: Amber/Gold background
  - **Collaborator**: Blue background
- Tooltip with role description

**Usage:**

```jsx
import RoleBadge from '@/components/common/RoleBadge';

<RoleBadge role="pm" size="md" showIcon={true} />
<RoleBadge role="collaborator" size="sm" showIcon={false} />
```

---

### 2. **CollaboratorsSection Component** (`/components/layout/CollaboratorsSection.jsx`)

Displays the current user and all team members in the sidebar with their roles.

**Features:**

- Shows current user first with "(You)" label
- Highlights current user with primary color background
- Displays all team members with role badges
- Shows user email for each member
- Online status indicator
- Responsive animations

**Usage:**

```jsx
import CollaboratorsSection from "@/components/layout/CollaboratorsSection";

<CollaboratorsSection
  currentUser={user}
  collaborators={collaborators}
  collapsed={collapsed}
/>;
```

---

### 3. **UserProfileCard Component** (`/components/common/UserProfileCard.jsx`)

A card component that displays user profile information with role prominently featured.

**Features:**

- Two display modes: `compact` and full
- Shows user avatar, name, email, and role badge
- Optional click handler for role-based actions
- Animated entry with spring effect
- Gradient background

**Usage:**

```jsx
import UserProfileCard from '@/components/common/UserProfileCard';

// Compact version
<UserProfileCard user={user} role={role} compact={true} />

// Full version (for PM, clickable to manage members)
<UserProfileCard user={user} role={role} clickable={role === 'pm'} />
```

---

### 4. **RoleGuard Components** (`/components/auth/RoleGuard.jsx`)

Components and hooks for role-based access control and feature visibility.

**Exports:**

#### `<RoleProtected>` Component

Conditionally renders content based on user role.

```jsx
import { RoleProtected } from '@/components/auth/RoleGuard';

<RoleProtected requiredRole="pm">
  <PMOnlyFeature />
</RoleProtected>

<RoleProtected requiredRole="collaborator" fallback={<div>Access Denied</div>}>
  <CollaboratorFeature />
</RoleProtected>
```

#### `useHasRole()` Hook

Check if current user has a specific role.

```jsx
import { useHasRole } from "@/components/auth/RoleGuard";

const isPM = useHasRole("pm");
const isCollaboratorOrBetter = useHasRole(["collaborator", "pm"]);
```

#### `useFeatureAccess()` Hook

Get feature access flags based on user's role.

```jsx
import { useFeatureAccess } from "@/components/auth/RoleGuard";

const { isPM, canManageMembers, canViewPerformance } = useFeatureAccess();
```

---

### 5. **useRoleSync Hook** (`/hooks/useRoleSync.js`)

Listens for role changes and triggers updates across the app.

**Features:**

- Monitors localStorage for role changes
- Syncs role changes across browser tabs
- Fetches latest user info from server
- Triggers callbacks when role changes

**Usage:**

```jsx
import { useRoleSync } from "@/hooks/useRoleSync";

const { syncRoleFromServer } = useRoleSync((newRole, oldRole) => {
  console.log(`Role changed from ${oldRole} to ${newRole}`);
  // Trigger UI updates, reload permissions, etc.
});

// Manually sync role from server when needed
await syncRoleFromServer();
```

---

## Locations Where Role is Displayed

### 1. **Sidebar Bottom Section**

- Shows current user's name, email, and role badge
- Updated background highlighting for prominence
- Visible when sidebar is not collapsed

**Last component in Sidebar**

### 2. **Collaborators Section** (Sidebar)

- Lists current user first with "(You)" label
- Shows all team members with role badges
- Highlighted background for current user
- Shows role for each collaborator

**In Sidebar, below navigation links**

### 3. **Navbar Dropdown Menu**

- Click user avatar in top-right corner
- Shows name, email, and role badge
- Access point to Settings page

**Top-right user dropdown in Navbar**

### 4. **Settings Page** (`/settings`)

- Full profile card with role badge
- Workspace information section with current role
- Role-based features list
- Detailed role description and capabilities
- Quick access to manage members (for PMs)

**Route: `/settings`**

---

## Role-Based Features

### PM (Project Manager)

✓ Manage Team Members  
✓ Workspace Administration  
✓ Performance Analytics  
✓ View all Collaborator features

### Collaborator

✓ View assigned tasks  
✓ Team collaboration tools  
✓ Basic performance view  
✓ Group activities

---

## How Role Changes Propagate

1. **Backend**: PM updates a member's role via member management
2. **API Response**: Updated user data includes new role
3. **Frontend**: AuthContext updates the `user` object
4. **localStorage**: User object is persisted with new role
5. **useRoleSync**: Detects localStorage change
6. **Components**: All components using `useAuth()` re-render with updated role
7. **UI Updates**:
   - Sidebar user section updates
   - Collaborators section updates
   - Navbar dropdown updates
   - Settings page updates
   - Feature access changes

---

## Database Schema (Backend)

**Workspace Members Structure:**

```javascript
members: [
  {
    userId: ObjectId, // Reference to User
    role: String, // 'pm' or 'collaborator'
    joinedAt: Date,
  },
];
```

**User Model includes:**

```javascript
role: String,               // User's default role (updated via workspace)
lastSeenAt: Date,          // For filtering active members
isActive: Boolean          // For online status
```

---

## API Endpoints

### Get Workspace Members (with roles)

```
GET /api/workspace/:workspaceId/members
Response:
[
  {
    _id: String,
    fullName: String,
    email: String,
    avatarUrl: String,
    role: "pm" | "collaborator",
    status: "online" | "offline"
  }
]
```

### Update Member Role (PM only)

```
PATCH /api/workspace/:workspaceId/members/:memberId/role
Body:
{ role: "pm" | "collaborator" }
```

---

## Styling & Theming

### Role Badge Colors

- **PM**: `bg-amber-500/20 text-amber-700 border-amber-500/30`
- **Collaborator**: `bg-blue-500/20 text-blue-700 border-blue-500/30`

### Icons

- **PM**: Crown icon (lucide-react)
- **Collaborator**: Users icon (lucide-react)

---

## Best Practices

1. **Always use RoleBadge component** for consistent role display
2. **Use RoleProtected wrapper** for restricted features
3. **Use useHasRole hook** for conditional logic in code
4. **Use useFeatureAccess hook** for checking feature permissions
5. **Call syncRoleFromServer** after any role update operation
6. **Don't hardcode role checks** - use the provided guards

---

## Migration Guide for Existing Components

If adding role display to existing components:

1. Import RoleBadge
2. Get role from `useAuth()`
3. Add badge near username/profile section
4. Use RoleProtected wrapper for restricted content

**Example:**

```jsx
import { useAuth } from "@/contexts/AuthContext";
import RoleBadge from "@/components/common/RoleBadge";

const MyComponent = () => {
  const { user, role } = useAuth();

  return (
    <div>
      <h2>{user.name}</h2>
      <RoleBadge role={role} size="md" />
    </div>
  );
};
```

---

## Testing

Test role changes by:

1. Going to PM Member Management page
2. Changing a member's role
3. Verify updates in:
   - Sidebar Collaborators section
   - Navbar dropdown
   - Settings page
   - Affected member's own session (open in new window for same account with different role)

---

## Future Enhancements

- [ ] Add role history/audit log
- [ ] Add role-based feature flags
- [ ] Add custom role creation
- [ ] Add role templates
- [ ] Add permission matrix UI
- [ ] Add role transition animations
