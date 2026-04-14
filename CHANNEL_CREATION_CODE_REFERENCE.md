# Channel Creation Feature - Code Reference

## Summary of Changes

This document provides all code changes made to implement the group channel creation feature.

---

## 1. SlackPage.jsx - State and Handlers

### Added State

```javascript
const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
const [isCreatingChannel, setIsCreatingChannel] = useState(false);
```

### Added Handler: handleCreateChannelClick

```javascript
const handleCreateChannelClick = useCallback(() => {
  setIsCreateModalOpen(true);
}, []);
```

### Added Handler: handleCreateChannel (Main Logic)

```javascript
const handleCreateChannel = useCallback(
  async ({ name, members }) => {
    if (!selectedRepo?.id || !user?.id) {
      console.error("[Channel Creation] Missing workspace ID or user ID");
      alert("Cannot create channel: Missing workspace information");
      return;
    }

    setIsCreatingChannel(true);
    try {
      console.log("[Channel Creation] Creating channel:", { name, members });

      const channelData = {
        name: name.toLowerCase().replace(/\s+/g, "-"),
        workspaceId: selectedRepo.id,
        isPrivate: false,
        members: [user.id, ...members],
      };

      const response = await axios.post(
        `${API_BASE_URL}/chat/channel/create`,
        channelData,
        {
          headers: {
            ...axiosConfig.headers,
          },
        },
      );

      const newChannel = response.data;
      console.log(
        "[Channel Creation] Channel created successfully:",
        newChannel._id,
      );

      setChannels((prev) => [...prev, newChannel]);
      openPublicChannel(newChannel);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("[Channel Creation] Failed to create channel:", error);
      alert(error.response?.data?.message || "Failed to create channel");
    } finally {
      setIsCreatingChannel(false);
    }
  },
  [API_BASE_URL, selectedRepo?.id, user?.id, axiosConfig, openPublicChannel],
);
```

### Updated ChannelList Props

```javascript
<ChannelList
  channels={channels}
  users={collaborators}
  activeChannel={activeChannel}
  onSelectChannel={openPublicChannel}
  onSelectDm={openDmChannel}
  onCreateChannelClick={handleCreateChannelClick}
/>
```

### Added Modal Component

```javascript
<CreateChannelModal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  availableMembers={collaborators}
  currentUserId={user?.id}
  onCreateChannel={handleCreateChannel}
  isLoading={isCreatingChannel}
/>
```

---

## 2. ChannelList.jsx - Plus Button Addition

### Button Code in Render

```javascript
{
  /* Channels Header with Plus Button */
}
<div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
  <h3 className="text-sm font-semibold text-muted-foreground">Channels</h3>
  <button
    onClick={onCreateChannelClick}
    className="p-1 hover:bg-accent/50 active:bg-accent rounded transition-colors"
    title="Create new channel"
  >
    <Plus className="w-4 h-4" />
  </button>
</div>;
```

### Props Interface

```javascript
ChannelList.propTypes = {
  channels: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  activeChannel: PropTypes.object,
  onSelectChannel: PropTypes.func.isRequired,
  onSelectDm: PropTypes.func.isRequired,
  onCreateChannelClick: PropTypes.func, // NEW
};
```

---

## 3. CreateChannelModal.jsx - New Component

```javascript
import { useCallback, useMemo, useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CreateChannelModal = ({
  isOpen,
  onClose,
  availableMembers,
  currentUserId,
  onCreateChannel,
  isLoading,
}) => {
  const [channelName, setChannelName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const filteredAvailableMembers = useMemo(
    () => availableMembers.filter((member) => member.id !== currentUserId),
    [availableMembers, currentUserId],
  );

  const handleSelectMember = useCallback((member) => {
    setSelectedMembers((prev) => {
      const exists = prev.some((m) => m.id === member.id);
      return exists
        ? prev.filter((m) => m.id !== member.id)
        : [...prev, member];
    });
  }, []);

  const handleRemoveMember = useCallback((memberId) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== memberId));
  }, []);

  const handleCreate = useCallback(() => {
    if (!channelName.trim()) {
      alert("Please enter a channel name");
      return;
    }
    if (selectedMembers.length === 0) {
      alert("Please select at least one member");
      return;
    }

    onCreateChannel({
      name: channelName,
      members: selectedMembers.map((m) => m.id),
    });

    setChannelName("");
    setSelectedMembers([]);
  }, [channelName, selectedMembers, onCreateChannel]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !isLoading) {
        handleCreate();
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [handleCreate, isLoading, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto animate-in scale-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40 sticky top-0 bg-card">
          <h2 className="text-lg font-semibold">Create Channel</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Channel Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Channel Name
            </label>
            <Input
              placeholder="e.g., project-alpha (will be lowercased)"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use lowercase letters and hyphens. Spaces will be converted.
            </p>
          </div>

          {/* Members Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Members ({selectedMembers.length})
            </label>
            <div className="border border-border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
              {filteredAvailableMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No members available. Create a DM first.
                </p>
              ) : (
                filteredAvailableMembers.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-2 hover:bg-accent/50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.some((m) => m.id === member.id)}
                      onChange={() => handleSelectMember(member)}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                    {selectedMembers.some((m) => m.id === member.id) && (
                      <Badge variant="default" className="text-xs">
                        ✓
                      </Badge>
                    )}
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Selected Members Display */}
          {selectedMembers.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Added Members</p>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    {member.name}
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="ml-1 hover:opacity-60 transition-opacity"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border/40 sticky bottom-0 bg-card">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              isLoading || !channelName.trim() || selectedMembers.length === 0
            }
            className="flex-1"
          >
            {isLoading ? "Creating..." : "Create Channel"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateChannelModal;
```

---

## 4. Backend Route - chatRoutes.js

### Updated Endpoint

```javascript
router.post("/channel/create", async (req, res) => {
  try {
    const { name, workspaceId, isPrivate = false, members = [] } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    // 1. Check if public channel already exists in this workspace (by name)
    if (!isPrivate) {
      const existing = await Channel.findOne({
        name,
        workspaceId,
        isPrivate: false,
      });
      if (existing) {
        // Add any new members if provided
        if (members.length > 0) {
          await Channel.findByIdAndUpdate(existing._id, {
            $addToSet: { members: { $each: members } },
          });
        }
        return res.json(existing);
      }
    }

    // 2. Check if DM/Private channel with exact same members and workspace exists
    if (isPrivate && members.length > 0) {
      const existing = await Channel.findOne({
        workspaceId,
        isPrivate: true,
        members: { $all: members, $size: members.length },
      });
      if (existing) return res.json(existing);
    }

    // 3. Create new channel with members for both public group channels and private DMs
    const channel = await Channel.create({
      name: name || (isPrivate ? "dm" : "New Channel"),
      workspaceId,
      isPrivate,
      members: members.length > 0 ? members : [],
    });

    console.log(
      `[Channel Creation] Created channel: ${channel._id} with ${members.length} members`,
    );

    res.json(channel);
  } catch (err) {
    console.error("Channel creation error:", err);
    res.status(500).json({ message: "Failed to handle channel creation" });
  }
});
```

---

## Key Technical Details

### Data Flow

```
User Action → handleCreateChannelClick()
     ↓
setIsCreateModalOpen(true)
     ↓
<CreateChannelModal isOpen={true}> renders
     ↓
User selects members, enters name
     ↓
User clicks Create
     ↓
onCreateChannel({ name, members }) fired
     ↓
handleCreateChannel() executes
     ↓
axios.post() to /chat/channel/create
     ↓
Backend creates channel with members array
     ↓
Response received, channel added to state
     ↓
openPublicChannel(newChannel) switches to channel
     ↓
Modal closes
```

### State Management

```javascript
SlackPage Component State:
├── channels: Array[Channel]
├── collaborators: Array[User]
├── activeChannel: Channel (currently selected)
├── messages: Array[Message]
├── isCreateModalOpen: Boolean
├── isCreatingChannel: Boolean (loading)
└── ... other chat state
```

### Props Flow

```
SlackPage
├── onCreateChannelClick → ChannelList
├── ChannelList renders Plus button
└── Click Plus → calls onCreateChannelClick
└── Modal renders with props:
    ├── isOpen: boolean
    ├── onClose: function
    ├── availableMembers: Array[User]
    ├── currentUserId: string
    ├── onCreateChannel: function (receives { name, members })
    └── isLoading: boolean
```

### API Contract

```
POST /chat/channel/create

Request:
{
  "name": "string (lowercased, hyphenated)",
  "workspaceId": "string (from selectedRepo.id)",
  "isPrivate": false (for public group channels),
  "members": ["userId1", "userId2", ...]
}

Response:
{
  "_id": "channelId",
  "name": "channel-name",
  "workspaceId": "workspaceId",
  "isPrivate": false,
  "members": ["userId1", "userId2"],
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

---

## Testing Code Snippets

### Browser Console - Create Channel Manually

```javascript
// Simulating what the modal does internally
const channelData = {
  name: "test-channel",
  workspaceId: "your_workspace_id",
  isPrivate: false,
  members: ["user1_id", "user2_id"],
};

fetch("http://localhost:5000/api/chat/channel/create", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(channelData),
})
  .then((r) => r.json())
  .then(console.log);
```

### MongoDB - Verify Channel Creation

```javascript
db.channels.findOne({ name: "test-channel" });
// Should show members array populated
```

---

## Debugging Tips

1. **Modal not opening?**
   - Check `isCreateModalOpen` state in React DevTools
   - Verify `onCreateChannelClick` is called on Plus button click

2. **Members not loading?**
   - Check `collaborators` state is populated
   - Verify `currentUserId` is not equal to all members (filtering should work)

3. **Channel not created?**
   - Check browser console for error
   - Check backend logs for `[Channel Creation]` messages
   - Verify `selectedRepo.id` is valid

4. **Messages not visible after creation?**
   - Verify channel ID is correct
   - Check socket connection established
   - Verify message broadcast logging in backend

---

## Version Information

- **Frontend Framework:** React 18 with Hooks
- **HTTP Client:** Axios
- **Real-time Communication:** Socket.io
- **State Management:** React Hooks (useState, useCallback, useMemo)
- **Backend:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT Bearer tokens

---

**Implementation Date:** April 14, 2025  
**Status:** ✅ Complete and Ready for Testing
