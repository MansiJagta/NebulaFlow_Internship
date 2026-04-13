# 🎯 Role Display System - Quick Reference

## 🚀 Quick Start (Copy-Paste Ready)

### Display User Role

```jsx
import { useAuth } from "@/contexts/AuthContext";
import RoleBadge from "@/components/common/RoleBadge";

export default function MyComponent() {
  const { user, role } = useAuth();

  return (
    <div>
      <h2>{user.name}</h2>
      <RoleBadge role={role} size="md" />
    </div>
  );
}
```

### Protect Feature by Role

```jsx
import { RoleProtected } from '@/components/auth/RoleGuard';

<RoleProtected requiredRole="pm">
  <AdminPanel />
</RoleProtected>

<RoleProtected requiredRole="collaborator" fallback={<p>Access Denied</p>}>
  <TeamFeature />
</RoleProtected>
```

### Check Role in Logic

```jsx
import { useHasRole, useFeatureAccess } from "@/components/auth/RoleGuard";

const isPM = useHasRole("pm");
const isCollaborator = useHasRole("collaborator");

// Or use predefined features
const { canManageMembers, canViewPerformance } = useFeatureAccess();
```

### Show User Profile

```jsx
import UserProfileCard from '@/components/common/UserProfileCard';

// Compact version
<UserProfileCard user={user} role={role} compact={true} />

// Full version
<UserProfileCard user={user} role={role} clickable={true} />
```

### Display Team Members

```jsx
import CollaboratorsSection from "@/components/layout/CollaboratorsSection";

<CollaboratorsSection
  currentUser={user}
  collaborators={collaborators}
  collapsed={false}
/>;
```

---

## 🎨 RoleBadge Sizes

```jsx
<RoleBadge role="pm" size="xs" />         {/* 10px - lists */}
<RoleBadge role="collaborator" size="sm" /> {/* 12px - default */}
<RoleBadge role="pm" size="md" />         {/* 14px - cards */}
<RoleBadge role="collaborator" size="lg" /> {/* 16px - emphasis */}
```

---

## ✅ Hooks Cheat Sheet

| Hook                            | Returns                              | Use Case                |
| ------------------------------- | ------------------------------------ | ----------------------- |
| `useAuth()`                     | `{ user, role, token, logout, ... }` | Get current user & role |
| `useHasRole(role)`              | `boolean`                            | Check if user has role  |
| `useFeatureAccess()`            | `{ isPM, canManageMembers, ... }`    | Get feature permissions |
| `useRoleSync(callback)`         | `{ syncRoleFromServer }`             | Listen for role changes |
| `useCollaborators(workspaceId)` | `{ collaborators, loading }`         | Get team members        |

---

## 🎯 Components Quick Map

| Component            | Location | Import                                                                        |
| -------------------- | -------- | ----------------------------------------------------------------------------- |
| RoleBadge            | `common` | `import RoleBadge from '@/components/common/RoleBadge'`                       |
| UserProfileCard      | `common` | `import UserProfileCard from '@/components/common/UserProfileCard'`           |
| CollaboratorsSection | `layout` | `import CollaboratorsSection from '@/components/layout/CollaboratorsSection'` |
| RoleProtected        | `auth`   | `import { RoleProtected } from '@/components/auth/RoleGuard'`                 |

---

## 🛡️ Role Types

| Role           | Features                                   | Color         |
| -------------- | ------------------------------------------ | ------------- |
| `pm`           | Manage members, Admin access, Analytics    | 🟨 Amber/Gold |
| `collaborator` | View tasks, Collaboration, Basic analytics | 🟦 Blue       |

---

## 📍 Display Locations

| Location       | Path        | Component                   |
| -------------- | ----------- | --------------------------- |
| Sidebar Bottom | Sidebar     | User info card + RoleBadge  |
| Collaborators  | Sidebar     | CollaboratorsSection        |
| Navbar         | Navbar      | RoleBadge in dropdown       |
| Settings       | `/settings` | UserProfileCard + RoleBadge |

---

## 🔄 Update Flow

1. User changes role →
2. API updates →
3. Response includes new role →
4. AuthContext.syncUser() →
5. localStorage updates →
6. All components re-render

---

## 🧪 Test Commands

```javascript
// Check role in console
JSON.parse(localStorage.getItem("nebula-user")).role;

// Force role sync
const { syncRoleFromServer } = useRoleSync();
await syncRoleFromServer();

// Check collaborators
console.table(collaborators);

// Check feature access
console.log(useFeatureAccess());
```

---

## 📱 Responsive Breakpoints

- **xs**: Extra small (< 640px)
- **sm**: Small (640px - 768px)
- **md**: Medium (768px - 1024px)
- **lg**: Large (1024px - 1280px)
- **xl**: Extra large (> 1280px)

---

## 🎨 Color Tokens

```
PM Colors:
  Background: bg-amber-500/20
  Text: text-amber-700
  Border: border-amber-500/30

Collaborator Colors:
  Background: bg-blue-500/20
  Text: text-blue-700
  Border: border-blue-500/30

Current User Highlight:
  Primary: from-primary/10 to-primary/5
```

---

## 🚀 Common Patterns

### Pattern 1: Show Different UI by Role

```jsx
const { isPM } = useFeatureAccess();

return isPM ? <PMDashboard /> : <CollaboratorDashboard />;
```

### Pattern 2: Add Role Badge to List Item

```jsx
{
  users.map((user) => (
    <div key={user.id} className="flex justify-between">
      <span>{user.name}</span>
      <RoleBadge role={user.role} size="sm" />
    </div>
  ));
}
```

### Pattern 3: Role-Gated Button

```jsx
<RoleProtected requiredRole="pm">
  <button onClick={addMember}>Add Member</button>
</RoleProtected>
```

### Pattern 4: Feature List by Role

```jsx
const features = {
  pm: ["Analytics", "Members", "Settings"],
  collaborator: ["Tasks", "Collaboration", "Profile"],
};

return features[role].map((f) => <Feature key={f} name={f} />);
```

---

## 🐛 Debug Mode

Enable detailed logging:

```jsx
import { useRoleSync } from "@/hooks/useRoleSync";

const { syncRoleFromServer } = useRoleSync((newRole, oldRole) => {
  console.log(`🔄 Role updated: ${oldRole} → ${newRole}`);
});
```

---

## 📦 File Imports

```javascript
// Utility Imports
import { useAuth } from "@/contexts/AuthContext";

// Component Imports
import RoleBadge from "@/components/common/RoleBadge";
import UserProfileCard from "@/components/common/UserProfileCard";
import CollaboratorsSection from "@/components/layout/CollaboratorsSection";
import { RoleProtected } from "@/components/auth/RoleGuard";

// Hook Imports
import { useHasRole, useFeatureAccess } from "@/components/auth/RoleGuard";
import { useRoleSync } from "@/hooks/useRoleSync";
import { useCollaborators } from "@/hooks/useCollaborators";
```

---

## ✨ Pro Tips

💡 **Always use the RoleBadge component** for consistency  
💡 **Use RoleProtected for UI toggles** - cleaner than if/else  
💡 **Use useFeatureAccess** for predefined permission checks  
💡 **Don't hardcode role strings** - use 'pm' and 'collaborator' consistently  
💡 **Test with multiple browser tabs** to verify sync

---

## 🔗 Documentation Links

- **Full System Guide**: `ROLE_DISPLAY_SYSTEM.md`
- **Implementation Details**: `ROLE_DISPLAY_IMPLEMENTATION.md`
- **Visual Guide**: `ROLE_DISPLAY_VISUAL_GUIDE.md`
- **Testing Checklist**: `ROLE_DISPLAY_TESTING.md`
- **Complete Summary**: `ROLE_DISPLAY_COMPLETE.md`

---

**Last Updated**: April 13, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
