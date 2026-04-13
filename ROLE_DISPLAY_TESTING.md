# Role Display System - Testing Checklist

## Pre-Flight Checks

- [ ] All components are created in the right directories
- [ ] App.jsx has the SettingsPage import and route
- [ ] Frontend is running without errors
- [ ] Backend API is running
- [ ] Database has test data with PMs and Collaborators

---

## Test Scenarios

### ✅ Test 1: Sidebar Role Display (Logged-in as PM)

**Steps:**

1. Login with a PM account
2. Navigate to any page with AppLayout (e.g., PM Dashboard)
3. Look at the bottom of the sidebar

**Expected Results:**

- [ ] User card visible with name and email
- [ ] Role badge shows with PM label
- [ ] Badge has amber/gold color with crown icon
- [ ] Card has primary color background highlighting
- [ ] Logout button is below user card

**Failed?** Check:

- Sidebar.jsx imports RoleBadge and CollaboratorsSection
- useAuth() hook is returning role correctly
- AuthContext user object has role field

---

### ✅ Test 2: Sidebar Collaborators Section (PM View)

**Steps:**

1. Login as PM
2. Look at "Collaborators" section in sidebar
3. Verify all team members are listed

**Expected Results:**

- [ ] Section title shows "Collaborators" with users icon
- [ ] Current user listed first with "(You)" label
- [ ] Current user row has light primary background color
- [ ] All collaborators listed with role badges
- [ ] Each member shows name, email, and role
- [ ] Online indicator (green dot) visible
- [ ] Role badges show correct color and icon

**Failed?** Check:

- CollaboratorsSection component is imported
- useCollaborators hook is fetching members correctly
- Members have `role` field from API
- Backend returns role information

---

### ✅ Test 3: Sidebar Collaborators Section (Collaborator View)

**Steps:**

1. Login as Collaborator
2. Look at "Collaborators" section in sidebar
3. Verify you're listed with "(You)" label

**Expected Results:**

- [ ] Collaborators section still visible
- [ ] Current user shows role as "Collaborator"
- [ ] Other PMs show role as "PM"
- [ ] Color coding is correct for each role

**Failed?** Check:

- User's role is actually "collaborator" in database
- useAuth() returns correct role for collaborator user

---

### ✅ Test 4: Navbar Dropdown Menu

**Steps:**

1. Login (any role)
2. Click user avatar in top-right corner
3. Observe dropdown menu

**Expected Results:**

- [ ] Dropdown opens without errors
- [ ] Shows user name and email
- [ ] Role badge displayed with correct styling
- [ ] Badge shows correct role
- [ ] "Settings" option is available
- [ ] "Logout" option is available

**Failed?** Check:

- Navbar.jsx imports RoleBadge
- Dropdown menu JSX is correct
- useAuth() returns user and role

---

### ✅ Test 5: Navigate to Settings Page

**Steps:**

1. Click "Settings" in navbar dropdown
2. Wait for page to load

**Expected Results:**

- [ ] Page loads without errors
- [ ] Shows "Settings" title and description
- [ ] User profile card visible
- [ ] Role badge prominently displayed
- [ ] "Your Profile" section visible
- [ ] "Workspace Information" section visible
- [ ] "Available Features" section visible
- [ ] "About Your Role" section visible

**Failed?** Check:

- SettingsPage.jsx exists and is properly typed
- App.jsx has correct route: `/settings`
- Route is inside the ProtectedRoute
- Page imports UserProfileCard and RoleBadge

---

### ✅ Test 6: Settings Page Content (PM)

**Steps:**

1. Login as PM
2. Go to Settings page
3. Review section content

**Expected Results:**

- [ ] Role badge shows "PM" with crown icon
- [ ] "Available Features" shows 3-4 PM features
- [ ] Features include: "Manage Team Members", "Workspace Administration", "Performance Analytics"
- [ ] "About Your Role" section shows PM description
- [ ] Bullet points list PM capabilities
- [ ] "Manage Team Members →" button is clickable
- [ ] Button click navigates to /pm/members

**Failed?** Check:

- SettingsPage.jsx has correct PM features array
- Conditional rendering for PM vs Collaborator
- Button onClick handler is correct

---

### ✅ Test 7: Settings Page Content (Collaborator)

**Steps:**

1. Login as Collaborator
2. Go to Settings page
3. Review section content

**Expected Results:**

- [ ] Role badge shows "Collaborator" with users icon
- [ ] "Available Features" shows 3-4 Collaborator features
- [ ] Features include: "Performance Analytics", "Team Collaboration", etc.
- [ ] "About Your Role" section shows Collaborator description
- [ ] Bullet points list Collaborator capabilities
- [ ] No "Manage Team Members" button visible

**Failed?** Check:

- Collaborator features array is correctly defined
- Conditional rendering is working
- Role="collaborator" is being used correctly

---

### ✅ Test 8: Role Change Synchronization

**Steps:**

1. Open two browser windows/tabs (can be same user with different role simulation)
   - **Option A**: Open same account in two browsers
   - **Option B**: Have two accounts with different roles
2. In one window: Go to PM Dashboard → Add Members
3. Find a member whose role is "collaborator"
4. Change their role to "pm" (if available) or vice versa
5. Observe first window for UI updates
6. Check second window/tab for automatic updates

**Expected Results (First Window):**

- [ ] Role change submitted successfully
- [ ] Sidebar collaborators section updates
- [ ] Changed member now shows new role badge
- [ ] Color of badge changes appropriately
- [ ] No page reload needed

**Expected Results (Second Window/Tab):**

- [ ] Collaborators list auto-updates (if same account open in different window)
- [ ] Role badge updates without manual refresh
- [ ] All role displays stay synchronized

**Failed?** Check:

- useRoleSync hook is working
- localStorage events are being triggered
- Components are using useAuth() hook
- CollaboratorsSection refetches data

---

### ✅ Test 9: Responsive Design - Sidebar Collapsed

**Steps:**

1. Login and navigate to main page
2. Click the collapse button (chevron) in sidebar
3. Observe sidebar behavior

**Expected Results:**

- [ ] Sidebar collapses to 64px width
- [ ] User card is hidden
- [ ] Collaborators section is hidden
- [ ] Only user avatar visible in sidebar (on hover/profile)
- [ ] Navbar dropdown still shows full info
- [ ] Main content area expands

**Failed?** Check:

- CollaboratorsSection checks `collapsed` prop
- Conditional rendering: `{!collapsed && ...}`
- Sidebar width transitions smoothly

---

### ✅ Test 10: Responsive Design - Mobile

**Steps:**

1. Open browser DevTools
2. Set device to mobile (e.g., iPhone SE)
3. Navigate to dashboard and settings page

**Expected Results:**

- [ ] Settings page is readable on mobile
- [ ] Sections stack vertically
- [ ] Role badge is visible and readable
- [ ] Features grid adapts to single column
- [ ] No horizontal scroll needed
- [ ] All interactive elements are touchable

**Failed?** Check:

- SettingsPage.jsx has responsive grid classes (`grid-cols-1 md:grid-cols-2`)
- Padding and margins are appropriate for mobile
- Font sizes are readable on small screens

---

### ✅ Test 11: Feature Access Control

**Steps:**

1. Login as PM
2. Check that PM-only features are visible
3. Logout and login as Collaborator
4. Check that those features are hidden

**Expected Results (PM):**

- [ ] Can see "Add Members" in sidebar navigation
- [ ] Can access `/pm/members` route
- [ ] Can see PM functions in UI

**Expected Results (Collaborator):**

- [ ] Cannot see "Add Members" in navigation
- [ ] Route `/pm/members` redirects appropriately
- [ ] Cannot access PM functions
- [ ] Can see collaborator-specific features

**Failed?** Check:

- ProtectedRoute component checks role
- requireRole prop is set correctly in routes
- useFeatureAccess() hook returns correct values

---

### ✅ Test 12: RoleBadge Component Sizing

**Steps:**

1. Go to SettingsPage (has multiple badge sizes)
2. Inspect different badge instances

**Expected Results:**

- [ ] "xs" badges are small (text ~10px)
- [ ] "sm" badges are small-medium (text ~12px)
- [ ] "md" badges are medium (text ~14px)
- [ ] "lg" badges are large (text ~16px)
- [ ] All badges maintain proper proportions
- [ ] Icons scale with text

**Failed?** Check:

- RoleBadge.jsx has correct size classes
- TailwindCSS classes are correct
- Icon sizing is proportional

---

### ✅ Test 13: Color Coding Consistency

**Steps:**

1. View all locations where role badges appear
2. Compare colors across all sections

**Expected Results:**

- [ ] All PM badges have amber/gold color
- [ ] All Collaborator badges have blue color
- [ ] Colors are consistent across:
  - Sidebar user card
  - Collaborators section
  - Navbar dropdown
  - Settings page
  - Any other location with role display

**Failed?** Check:

- RoleBadge component uses consistent colors
- TailwindCSS color classes are correct
- No inline styles overriding colors

---

### ✅ Test 14: Accessibility - Screen Reader

**Steps:**

1. Use browser's accessibility inspector
2. Check for proper semantic HTML
3. Test with a screen reader (NVDA, JAWS, or VoiceOver)

**Expected Results:**

- [ ] Badge text is readable by screen readers
- [ ] Buttons have proper aria-labels
- [ ] Dropdown menu is properly announced
- [ ] Role information is announced clearly
- [ ] Focusable elements have focus indicators

**Failed?** Check:

- Components have proper semantic HTML
- aria-labels are used where needed
- Focus indicators are visible with CSS

---

### ✅ Test 15: Performance - No Memory Leaks

**Steps:**

1. Open DevTools Performance tab
2. Navigate between different pages with role display
3. Open/close navbar dropdown multiple times
4. Check memory usage

**Expected Results:**

- [ ] No significant memory increase
- [ ] useRoleSync cleanup function runs on unmount
- [ ] Event listeners are removed properly
- [ ] No console errors or warnings

**Failed?** Check:

- useRoleSync has proper cleanup (return function)
- useEffect dependencies are correct
- Event listeners use removeEventListener

---

## Browser Testing

Test in multiple browsers:

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Cross-Tab Testing

**Steps:**

1. Open app in Tab A
2. Open same app in Tab B (same browser)
3. Change role in Tab A (e.g., member management)
4. Check Tab B for automatic updates

**Expected Results:**

- [ ] Tab B updates without manual refresh
- [ ] Role changes propagate across tabs
- [ ] localStorage events trigger properly

---

## Error Scenarios

### Test Network Error

**Steps:**

1. Open DevTools
2. Go to Network tab
3. Set to "Offline"
4. Try to load settings page

**Expected Results:**

- [ ] Error message shown gracefully
- [ ] App doesn't crash
- [ ] User can still see role in sidebar

### Test Missing Role Data

**Steps:**

1. Manually set nebula-user in localStorage to user without role field
2. Reload page

**Expected Results:**

- [ ] App doesn't crash
- [ ] Defaults to "collaborator" role
- [ ] Error logged to console (not shown to user)

### Test Malformed API Response

**Steps:**

1. Go mock the API to return invalid role data
2. Try to load collaborators

**Expected Results:**

- [ ] App handles error gracefully
- [ ] Collaborators list may be empty but no crash
- [ ] Error logged appropriately

---

## Performance Benchmarks

- [ ] Settings page loads in < 2 seconds
- [ ] Navbar dropdown opens instantly
- [ ] Role change reflects in UI < 500ms
- [ ] No janky animations or layout shifts
- [ ] Sidebar collapse/expand smooth (60fps)

---

## Sign-Off

- [ ] All tests passed
- [ ] No console errors or warnings
- [ ] Feature works as expected
- [ ] Ready for production

---

## Quick Debug Commands

**Check user role in console:**

```javascript
JSON.parse(localStorage.getItem("nebula-user")).role;
```

**Check if useAuth returns role:**

```javascript
// In component
const { role } = useAuth();
console.log("Current role:", role);
```

**Force sync role from server:**

```javascript
// In SettingsPage or component using useRoleSync
const { syncRoleFromServer } = useRoleSync();
await syncRoleFromServer();
```

**Check collaborators data:**

```javascript
// In component using useCollaborators
const { collaborators } = useCollaborators(workspaceId);
console.table(collaborators);
```

---

## Troubleshooting

### Role Badge Not Showing

1. Check if component imports RoleBadge
2. Check if role is being passed correctly
3. Check browser console for errors
4. Verify AuthContext is set up properly

### Collaborators List Empty

1. Check if workspace has members
2. Verify members have `lastSeenAt` set
3. Check API response in Network tab
4. Verify useCollaborators hook is being called

### Settings Page Not Loading

1. Check if route is added to App.jsx
2. Verify SettingsPage component exists
3. Check if authentication is required
4. Look for console errors

### Role Not Updating After Change

1. Check if role change API succeeded
2. Verify response included updated role
3. Check if AuthContext.syncUser is called
4. Verify localStorage is updated
5. Check if useRoleSync is listening
