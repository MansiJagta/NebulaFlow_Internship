/**
 * 🔧 Role Sync Troubleshooting Guide
 * 
 * If you're seeing the wrong role displayed, follow these steps:
 */

// STEP 1: Clear localStorage
// Open browser console (F12) and run:
localStorage.removeItem('nebula-user');
localStorage.removeItem('nebula-token');
localStorage.removeItem('nebula-selected-repo');

// STEP 2: Reload the page
location.reload();

// STEP 3: Login again - the correct role should now be fetched

// STEP 4: Verify the role is correct
console.log('Current user role:', JSON.parse(localStorage.getItem('nebula-user')).role);

// Expected output for Collaborator: "collaborator"
// Expected output for PM: "pm"

// STEP 5: If still showing wrong role, check these:

// Check workspace response
fetch('/api/workspace/me').then(r => r.json()).then(ws => {
  console.log('Workspace members:', ws.members);
  // Look for your name and check the role field
});

// Check user response
fetch('/api/auth/me').then(r => r.json()).then(data => {
  console.log('Auth user:', data.user);
  // This shows your default role (may not be workspace-specific)
});

// SEE FULL DEBUG INFO
const debugInfo = () => {
  const user = JSON.parse(localStorage.getItem('nebula-user') || '{}');
  const token = localStorage.getItem('nebula-token');
  
  console.log('=== USER ROLE DEBUG ===');
  console.log('Current user:', user);
  console.log('Has token:', !!token);
  
  fetch('/api/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  .then(r => r.json())
  .then(data => {
    console.log('Auth API says your role is:', data.user.role);
    
    return fetch('/api/workspace/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  })
  .then(r => r.json())
  .then(ws => {
    const me = ws.members.find(m => m._id === user.id);
    console.log('Workspace says your role is:', me?.role);
    
    if (me?.role !== user.role) {
      console.warn(`⚠️  MISMATCH: localStorage has "${user.role}" but workspace says "${me?.role}"`);
      console.log('→ Reload the page to sync');
    } else {
      console.log('✅ Role is in sync');
    }
  })
  .catch(e => console.error('Debug failed:', e));
};

debugInfo();
