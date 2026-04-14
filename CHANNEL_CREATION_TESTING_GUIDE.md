# Channel Creation Feature - Complete Testing Guide

## Quick Start

### Current Environment Status

- **Frontend:** Running on `http://localhost:8081`
- **Backend:** Running on `http://localhost:5000`
- **Database:** Connected to MongoDB
- **Test User:** `test@nebula.dev` / Password: `Test@12345`

---

## Manual Testing Steps

### Test 1: Open Channel Creation Modal

**Steps:**

1. Navigate to `http://localhost:8081` in browser
2. Login with test credentials (if needed)
3. Open the Slack chat interface
4. Look for the **Channels** section in left sidebar
5. Click the **"+"** button next to "Channels" header
6. **Expected Result:** Modal should open with smooth animation

**Success Indicators:**

- ✅ Modal overlay appears
- ✅ Channel name input field is focused
- ✅ Member list is populated with available members
- ✅ No console errors in browser DevTools

---

### Test 2: Select Members for Channel

**Steps:**

1. From open modal (Test 1), view available members list
2. Click checkbox next to first member
3. **Expected Result:** Member checkbox marked, pill appears below
4. Click checkbox next to second member
5. **Expected Result:** Second member added to selected list
6. Click "X" on first member pill
7. **Expected Result:** First member removed from selection

**Success Indicators:**

- ✅ Checkboxes toggle when clicked
- ✅ Selected members show as pills with names
- ✅ Remove button (X) works smoothly
- ✅ Member count updates in real-time

---

### Test 3: Create Channel with Members

**Steps:**

1. In open modal, enter channel name: **test-group-chat**
2. Select 2-3 members from list
3. Click **"Create Channel"** button
4. **Expected Result:** Modal closes, new channel appears in left sidebar
5. **Expected Result:** Chat switches to new channel automatically

**Success Indicators:**

- ✅ Channel name formatted as lowercase with hyphens
- ✅ New channel appears in channels list
- ✅ Channel is selected/active
- ✅ Channel greeting/empty state shows
- ✅ Backend logs: `[Channel Creation] Created channel: <ID> with X members`

---

### Test 4: Send Message in Group Channel

**Steps:**

1. In newly created group channel, type message: **"Hello group!"**
2. Click send or press Enter
3. **Expected Result:** Message appears in chat
4. **Expected Result:** Message shows sender name and timestamp
5. **Expected Result:** Backend logs show message broadcast

**Success Indicators:**

- ✅ Message appears in chat window
- ✅ Sender name shown with avatar
- ✅ Timestamp correct
- ✅ Message is encrypted in database (backend logs should show encryption)
- ✅ No "failed to send" error

**Backend Console Should Show:**

```
[Chat] User sent message in channel <channel_ID>
[Chat] Adding to local state
[Chat] Broadcasting message to all channel members
```

---

### Test 5: Multi-User Message Visibility (Requires 2 Browsers)

**Setup:**

- Browser 1: Logged in as test@nebula.dev
- Browser 2: Logged in as second test user (if available) or same user in private window

**Steps:**

1. Both browsers in same group channel
2. Browser 1: Send message "Message from User A"
3. **Expected Result:** Message visible in Browser 1 IMMEDIATELY
4. **Expected Result:** Message visible in Browser 2 within 1 second (socket event)
5. Browser 2: Send message "Message from User B"
6. **Expected Result:** Message visible in Browser 2 IMMEDIATELY
7. **Expected Result:** Message visible in Browser 1 within 1 second

**Success Indicators:**

- ✅ Messages visible to both users in real-time
- ✅ Both senders see their own message immediately
- ✅ Receivers see messages via socket broadcast
- ✅ Chat history includes all messages from all users
- ✅ No message duplication

---

### Test 6: Channel Persistence

**Steps:**

1. Create a group channel with members
2. Send 3-4 messages
3. **Refresh page:** `F5` or browser refresh
4. **Expected Result:** Channel still visible in left sidebar
5. **Expected Result:** All messages still present in chat history
6. **Expected Result:** Channel members unchanged

**Success Indicators:**

- ✅ Channel data persisted to MongoDB
- ✅ Messages retrieved from database on page reload
- ✅ Chat window shows full conversation history
- ✅ No loss of data

---

### Test 7: Error Handling

**Steps:**

**Test 7a: Empty Channel Name**

1. Open create channel modal
2. Select some members
3. Leave channel name empty
4. Click "Create Channel"
5. **Expected Result:** Error message or disabled button

**Test 7b: No Members Selected**

1. Open create channel modal
2. Enter channel name
3. Don't select any members
4. Click "Create Channel"
5. **Expected Result:** Error message or disabled button

**Test 7c: Connection Failure**

1. Stop backend server (Ctrl+C in terminal)
2. Try to create channel
3. **Expected Result:** User-friendly error message
4. **Expected Result:** Modal stays open for retry
5. Restart server and try again

**Success Indicators:**

- ✅ Proper validation messages shown
- ✅ Invalid actions prevented
- ✅ User can retry after error
- ✅ No console errors (well-handled)

---

## API Endpoint Testing

### Endpoint: POST /chat/channel/create

**URL:** `http://localhost:5000/api/chat/channel/create`

**Request Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (Group Channel):**

```json
{
  "name": "team-project-alpha",
  "workspaceId": "workspace_123",
  "isPrivate": false,
  "members": ["user_id_1", "user_id_2", "user_id_3"]
}
```

**Expected Response (Success 200):**

```json
{
  "_id": "channel_123",
  "name": "team-project-alpha",
  "workspaceId": "workspace_123",
  "isPrivate": false,
  "members": ["user_id_1", "user_id_2", "user_id_3"],
  "createdAt": "2025-04-14T12:00:00Z",
  "updatedAt": "2025-04-14T12:00:00Z"
}
```

**Testing with cURL:**

```bash
curl -X POST http://localhost:5000/api/chat/channel/create \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "api-test-channel",
    "workspaceId": "workspace_123",
    "isPrivate": false,
    "members": ["user1", "user2"]
  }'
```

---

## Browser Console Checks

**Open DevTools:** `F12` → Console tab

**Look for these logs when creating a channel:**

```
[slack-page] Attempting to create channel...
[Channel Creation] Creating channel: {name, members}
[Channel Creation] Channel created successfully: <channel_ID>
```

**Look for these logs when sending messages:**

```
[Chat] User sent message in channel <channel_ID>
[Chat] Adding to local state
receive_message event received
[Chat] Message added to state
```

---

## Troubleshooting

### Issue: "+" button not visible

- **Check:** Channels section is visible in left sidebar
- **Fix:** Scroll left sidebar if needed
- **Redux:** Refresh page, check browser console for errors

### Issue: Modal doesn't open

- **Check:** Console for JavaScript errors
- **Check:** Verify `CreateChannelModal` import in SlackPage.jsx
- **Fix:** Restart frontend dev server (`npm run dev`)

### Issue: Member list empty in modal

- **Check:** Are there any DMs created yet?
- **Check:** Member list is fetched from collaborators state
- **Fix:** Create a DM with someone first, then try channel creation

### Issue: Channel created but not visible

- **Check:** Backend response successful?
- **Check:** Channel added to channels state?
- **Fix:** Check browser console and backend logs for errors
- **Terminal:** Restart backend with `npm run dev`

### Issue: Messages not visible to other users

- **Check:** Both users in same channel?
- **Check:** Socket connection established? (check browser console)
- **Check:** Backend socket logs show broadcast?
- **Fix:** Verify socket broadcasting in backend console output

### Issue: "Cannot read property 'id' of undefined"

- **Cause:** selectedRepo might be undefined
- **Fix:** Ensure you're in a workspace/repo context
- **Check:** selectedRepo query parameter in URL

---

## Performance Checks

### For Channel Creation:

- Modal should open **< 200ms**
- Channel creation request should complete **< 1 second**
- Channel should appear in list **< 500ms**
- Page switch should be smooth

### For Message Broadcasting:

- Own message appears immediately (< 100ms)
- Other user's message arrives **< 500ms** (socket latency)
- No lag when scrolling message history
- File uploads < 5 seconds for small files

---

## Database Verification

### MongoDB Queries to Verify Data:

**Check created channels:**

```javascript
db.channels.find({ isPrivate: false }).pretty();
```

**Check channel members:**

```javascript
db.channels.findOne({ name: "test-group-chat" }).members;
```

**Check messages in channel:**

```javascript
db.messages.find({ channelId: ObjectId("<channel_ID>") }).pretty();
```

---

## Success Criteria Summary

### Minimum Viable Functionality:

- ✅ Can create a channel with a name
- ✅ Can select members for the channel
- ✅ Channel appears in channels list
- ✅ Can send messages in channel
- ✅ All channel members see messages in real-time
- ✅ Messages persist across page reloads

### Enhanced Functionality:

- ✅ Smooth animations on modal open/close
- ✅ Loading states during creation
- ✅ Error messages for invalid inputs
- ✅ Member list properly formatted with avatars
- ✅ Channel name formatting (lowercase, hyphens)
- ✅ Keyboard shortcuts (Enter to create, Escape to cancel)

### Optional/Future:

- ⏳ Channel description/topic
- ⏳ Channel member count badge
- ⏳ Leave channel functionality
- ⏳ Add/remove members after creation
- ⏳ Channel settings/permissions

---

## Known Limitations & Future Improvements

1. **Channel Name Uniqueness:** Currently prevents duplicate names per workspace
2. **Member Addition:** Currently only during creation; no add-members-later feature
3. **Channel Deletion:** Not yet implemented
4. **Permissions:** Any member can do any action; fine-grained permissions TBD
5. **Notifications:** All messages generate notifications; muting not yet implemented

---

## Quick Reference Commands

**Restart Frontend:**

```bash
cd frontend
npm run dev
```

**Restart Backend:**

```bash
cd backend
npm run dev
```

**View Backend Logs:**
Terminal where backend is running should show all logs

**Clear Database:**

```javascript
// In MongoDB shell
db.channels.deleteMany({ isPrivate: false });
db.messages.deleteMany({});
```

---

## Test Completion Checklist

- [ ] Test 1: Modal opens
- [ ] Test 2: Member selection works
- [ ] Test 3: Channel creation successful
- [ ] Test 4: Messages send and display
- [ ] Test 5: Multi-user messaging works (if 2 users available)
- [ ] Test 6: Channel persistence verified
- [ ] Test 7: Error handling appropriate
- [ ] API endpoint responds correctly
- [ ] Browser console clean (no errors)
- [ ] Backend logs show channel creation and broadcasts

---

**Feature Status:** ✅ **READY FOR TESTING**

All integration complete. Frontend and backend running. Follow tests above to verify functionality.
