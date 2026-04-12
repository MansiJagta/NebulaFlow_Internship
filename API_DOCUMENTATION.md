# 🚀 Nebula Flow - Complete API Documentation

**Base URL:** `http://localhost:5000/api`

---

## 📋 Table of Contents

1. [Authentication](#-authentication)
2. [Workspace Management](#-workspace-management)
3. [Chat & Channels](#-chat--channels)
4. [Project Management (PM)](#-project-management-pm)
5. [Milestones](#-milestones)
6. [Meetings](#-meetings)
7. [GitHub Integration](#-github-integration)
8. [Performance Metrics](#-performance-metrics)

---

## 🔐 Authentication

**Base Path:** `/api/auth`

### 1. Register with Email

- **Method:** `POST`
- **Endpoint:** `/register`
- **Auth Required:** No
- **Description:** Register a new user with email and password
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** User object with JWT token

### 2. Login with Email/Password

- **Method:** `POST`
- **Endpoint:** `/login-email`
- **Auth Required:** No
- **Description:** Login user with email and password credentials
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** JWT token and user details

### 3. Get Current User

- **Method:** `GET`
- **Endpoint:** `/me`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch currently authenticated user's information
- **Response:**
  ```json
  {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "url"
  }
  ```

### 4. Logout

- **Method:** `POST`
- **Endpoint:** `/logout`
- **Auth Required:** Yes (JWT)
- **Description:** Logout the current user
- **Response:** Success message

### 5. Google OAuth - Start

- **Method:** `GET`
- **Endpoint:** `/google`
- **Auth Required:** No
- **Description:** Initiate Google OAuth login/signup flow
- **Redirects to:** Google authentication page

### 6. Google OAuth - Callback

- **Method:** `GET`
- **Endpoint:** `/google/callback`
- **Auth Required:** No
- **Description:** Handle Google OAuth callback and create/login user
- **Query Params:** `code`, `state` (from Google)
- **Response:** Redirects to frontend with JWT token

### 7. Connect GitHub

- **Method:** `GET`
- **Endpoint:** `/github`
- **Auth Required:** No
- **Description:** Initiate GitHub OAuth connection
- **Redirects to:** GitHub authentication page

### 8. GitHub Callback

- **Method:** `GET`
- **Endpoint:** `/github/callback`
- **Auth Required:** No
- **Description:** Handle GitHub OAuth callback
- **Query Params:** `code`, `state` (from GitHub)
- **Response:** User object with GitHub credentials stored

### 9. Get GitHub Repositories

- **Method:** `GET`
- **Endpoint:** `/github/repos`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch list of user's GitHub repositories
- **Response:**
  ```json
  [
    {
      "name": "repo-name",
      "url": "https://github.com/.../repo-name",
      "owner": "username"
    }
  ]
  ```

### 10. Get GitHub Status

- **Method:** `GET`
- **Endpoint:** `/github/status`
- **Auth Required:** Yes (JWT)
- **Description:** Check if user is connected to GitHub
- **Response:**
  ```json
  {
    "isConnected": true,
    "username": "github-username"
  }
  ```

### 11. Accept Invite

- **Method:** `GET`
- **Endpoint:** `/accept-invite`
- **Auth Required:** No
- **Description:** Accept workspace invite via email link
- **Query Params:** `token` (from email)
- **Response:** Workspace invitation acceptance confirmation

---

## 🏢 Workspace Management

**Base Path:** `/api/workspace`

### 1. Get My Workspace

- **Method:** `GET`
- **Endpoint:** `/me`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch current user's workspace information
- **Response:**
  ```json
  {
    "_id": "workspace_id",
    "name": "Workspace Name",
    "members": [
      {
        "userId": "user_id",
        "role": "pm|member|admin"
      }
    ],
    "createdAt": "2026-04-08T00:00:00Z"
  }
  ```

### 2. Create Workspace

- **Method:** `POST`
- **Endpoint:** `/`
- **Auth Required:** Yes (JWT)
- **Description:** Create a new workspace
- **Request Body:**
  ```json
  {
    "name": "New Workspace"
  }
  ```
- **Response:** Newly created workspace object

### 3. Add Member to Workspace

- **Method:** `POST`
- **Endpoint:** `/:workspaceId/add-member`
- **Auth Required:** Yes (JWT)
- **Description:** Add a new member to workspace via email invite
- **Request Body:**
  ```json
  {
    "email": "newmember@example.com",
    "role": "member|pm"
  }
  ```
- **Response:** Invite sent confirmation

---

## 💬 Chat & Channels

**Base Path:** `/api/chat`

### 1. Get Workspace Channels

- **Method:** `GET`
- **Endpoint:** `/workspace/:workspaceId/channels`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch all public channels and private channels user is member of
- **Response:**
  ```json
  [
    {
      "_id": "channel_id",
      "name": "general",
      "workspaceId": "workspace_id",
      "isPrivate": false,
      "members": []
    }
  ]
  ```

### 2. Create Channel

- **Method:** `POST`
- **Endpoint:** `/channel/create`
- **Auth Required:** Yes (JWT)
- **Description:** Create a new public or private channel
- **Request Body:**
  ```json
  {
    "name": "channel-name",
    "workspaceId": "workspace_id",
    "isPrivate": false,
    "members": []
  }
  ```
- **Response:** Created channel object

### 3. Add Member to Channel

- **Method:** `POST`
- **Endpoint:** `/channel/add-member`
- **Auth Required:** Yes (JWT)
- **Description:** Add a user to a private channel
- **Request Body:**
  ```json
  {
    "channelId": "channel_id",
    "userId": "user_id"
  }
  ```
- **Response:** Updated channel object

### 4. Send Message to Channel

- **Method:** `POST`
- **Endpoint:** `/send/:channelId`
- **Auth Required:** Yes (JWT)
- **Description:** Send a text message to a channel (with optional mentions)
- **Request Body:**
  ```json
  {
    "content": "Hello @user, this is a message",
    "mentions": ["user_id"]
  }
  ```
- **Response:**
  ```json
  {
    "_id": "message_id",
    "channelId": "channel_id",
    "sender": "user_id",
    "content": "encrypted_content",
    "createdAt": "2026-04-08T08:00:00Z"
  }
  ```

### 5. Upload File/Image to Channel

- **Method:** `POST`
- **Endpoint:** `/upload/:channelId`
- **Auth Required:** Yes (JWT)
- **Content-Type:** `multipart/form-data`
- **Description:** Upload file(s) and/or text message with attachments
- **Request Data:**
  - `file` (multiple files allowed) - File to upload
  - `content` (optional) - Text message content
- **Response:**
  ```json
  {
    "_id": "message_id",
    "channelId": "channel_id",
    "content": "message_text",
    "attachments": [
      {
        "url": "https://cloudinary.../file.pdf",
        "type": "raw|image|video",
        "filename": "document.pdf"
      }
    ]
  }
  ```

### 6. Get Channel Messages

- **Method:** `GET`
- **Endpoint:** `/:channelId`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch all messages in a channel with pagination
- **Query Params:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 50)
- **Response:**
  ```json
  {
    "messages": [
      {
        "_id": "message_id",
        "sender": "user_id",
        "content": "encrypted_content",
        "attachments": [],
        "createdAt": "2026-04-08T08:00:00Z"
      }
    ],
    "total": 150,
    "page": 1
  }
  ```

### 7. Get File Metadata

- **Method:** `GET`
- **Endpoint:** `/files/:fileId`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch metadata for uploaded file
- **Response:**
  ```json
  {
    "_id": "file_id",
    "filename": "document.pdf",
    "url": "https://cloudinary.../file.pdf",
    "type": "raw|image|video",
    "uploadedAt": "2026-04-08T08:00:00Z"
  }
  ```

### 8. Get PDF Content

- **Method:** `GET`
- **Endpoint:** `/pdf/:messageId`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch and display PDF from message attachment
- **Response:** PDF file stream

### 9. Delete Message

- **Method:** `DELETE`
- **Endpoint:** `/messages/:messageId`
- **Auth Required:** Yes (JWT)
- **Middleware:** Only message sender can delete
- **Description:** Delete a message permanently
- **Response:**
  ```json
  {
    "message": "Message deleted successfully"
  }
  ```

### 10. Edit Message

- **Method:** `PUT`
- **Endpoint:** `/messages/:messageId`
- **Auth Required:** Yes (JWT)
- **Middleware:** Only message sender can edit
- **Description:** Edit message content
- **Request Body:**
  ```json
  {
    "content": "Updated message content"
  }
  ```
- **Response:** Updated message object with `isEdited: true`

---

## 📊 Project Management (PM)

**Base Path:** `/api/pm`

### 1. Get All Users

- **Method:** `GET`
- **Endpoint:** `/users`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch all workspace members for assignment
- **Response:**
  ```json
  [
    {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "pm|member"
    }
  ]
  ```

### 2. Get All Sprints

- **Method:** `GET`
- **Endpoint:** `/sprints`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch all sprints in workspace
- **Response:**
  ```json
  [
    {
      "_id": "sprint_id",
      "name": "Sprint 14",
      "startsOn": "2026-04-08T00:00:00Z",
      "endsOn": "2026-04-22T00:00:00Z",
      "isActive": true,
      "goal": "Deliver MVP features"
    }
  ]
  ```

### 3. Get All Issues

- **Method:** `GET`
- **Endpoint:** `/issues`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch all issues in workspace with filters
- **Query Params:**
  - `status` (optional) - pending|in-progress|completed|blocked
  - `assignee` (optional) - user_id
  - `sprint` (optional) - sprint_id
- **Response:**
  ```json
  [
    {
      "_id": "issue_id",
      "title": "Implement authentication",
      "description": "Add JWT-based auth",
      "status": "in-progress",
      "priority": "high",
      "assignee": "user_id",
      "sprint": "sprint_id",
      "createdAt": "2026-04-08T00:00:00Z"
    }
  ]
  ```

### 4. Create Issue

- **Method:** `POST`
- **Endpoint:** `/issues`
- **Auth Required:** Yes (JWT)
- **Description:** Create a new issue/task
- **Request Body:**
  ```json
  {
    "title": "Add user profile page",
    "description": "Create user profile with edit capabilities",
    "priority": "high|medium|low",
    "assignee": "user_id",
    "sprint": "sprint_id"
  }
  ```
- **Response:** Created issue object

### 5. Update Issue

- **Method:** `PATCH`
- **Endpoint:** `/issues/:id`
- **Auth Required:** Yes (JWT)
- **Description:** Update issue details or status
- **Request Body:**
  ```json
  {
    "title": "Updated title",
    "status": "completed",
    "assignee": "user_id",
    "priority": "high"
  }
  ```
- **Response:** Updated issue object

---

## 🎯 Milestones

**Base Path:** `/api/milestone`

### 1. Get All Milestones

- **Method:** `GET`
- **Endpoint:** `/`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch all milestones in workspace
- **Response:**
  ```json
  [
    {
      "_id": "milestone_id",
      "name": "MVP Release",
      "description": "Complete MVP with core features",
      "dueDate": "2026-05-01T00:00:00Z",
      "status": "pending|in-progress|completed",
      "workspaceId": "workspace_id"
    }
  ]
  ```

### 2. Create Milestone

- **Method:** `POST`
- **Endpoint:** `/`
- **Auth Required:** Yes (JWT)
- **Description:** Create a new milestone
- **Request Body:**
  ```json
  {
    "name": "Beta Release",
    "description": "Release beta version to selected users",
    "dueDate": "2026-06-01T00:00:00Z"
  }
  ```
- **Response:** Created milestone object

### 3. Update Milestone

- **Method:** `PATCH`
- **Endpoint:** `/:id`
- **Auth Required:** Yes (JWT)
- **Description:** Update milestone details or status
- **Request Body:**
  ```json
  {
    "name": "Updated name",
    "status": "in-progress",
    "dueDate": "2026-06-15T00:00:00Z"
  }
  ```
- **Response:** Updated milestone object

### 4. Delete Milestone

- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Auth Required:** Yes (JWT)
- **Description:** Delete a milestone
- **Response:**
  ```json
  {
    "message": "Milestone deleted successfully"
  }
  ```

---

## 📅 Meetings

**Base Path:** `/api/meeting`

### 1. Get All Meetings

- **Method:** `GET`
- **Endpoint:** `/`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch all meetings in workspace
- **Response:**
  ```json
  [
    {
      "_id": "meeting_id",
      "title": "Sprint Planning",
      "description": "Plan tasks for sprint 14",
      "scheduledFor": "2026-04-10T10:00:00Z",
      "attendees": ["user_id1", "user_id2"],
      "workspaceId": "workspace_id"
    }
  ]
  ```

### 2. Create Meeting

- **Method:** `POST`
- **Endpoint:** `/`
- **Auth Required:** Yes (JWT)
- **Description:** Schedule a new meeting
- **Request Body:**
  ```json
  {
    "title": "Design Review",
    "description": "Review new UI designs",
    "scheduledFor": "2026-04-12T14:00:00Z",
    "attendees": ["user_id1", "user_id2"]
  }
  ```
- **Response:** Created meeting object

### 3. Delete Meeting

- **Method:** `DELETE`
- **Endpoint:** `/:id`
- **Auth Required:** Yes (JWT)
- **Description:** Cancel/delete a meeting
- **Response:**
  ```json
  {
    "message": "Meeting deleted successfully"
  }
  ```

---

## 🐙 GitHub Integration

**Base Path:** `/api/github`

### 1. Get Repository Details

- **Method:** `GET`
- **Endpoint:** `/repo`
- **Auth Required:** No
- **Description:** Fetch GitHub repository information
- **Query Params:**
  - `owner` - Repository owner username
  - `repo` - Repository name
- **Response:**
  ```json
  {
    "name": "nebula-flow",
    "owner": "username",
    "url": "https://github.com/username/nebula-flow",
    "description": "Repository description",
    "stars": 150,
    "language": "JavaScript"
  }
  ```

### 2. Get Repository Collaborators

- **Method:** `GET`
- **Endpoint:** `/repo/collaborators`
- **Auth Required:** No
- **Description:** Fetch list of repository collaborators
- **Query Params:**
  - `owner` - Repository owner username
  - `repo` - Repository name
- **Response:**
  ```json
  [
    {
      "username": "collaborator1",
      "role": "admin|write|read",
      "avatar": "https://github.com/avatar.png"
    }
  ]
  ```

### 3. Send GitHub Invite

- **Method:** `POST`
- **Endpoint:** `/invite`
- **Auth Required:** Yes (JWT)
- **Description:** Send workspace invite to GitHub collaborators
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "githubUsername": "github-username",
    "role": "member|pm",
    "repoOwner": "repo-owner",
    "repoName": "repo-name"
  }
  ```
- **Response:** Invite sent confirmation

---

## 📈 Performance Metrics

**Base Path:** `/api/performance`

### 1. Get Performance Data

- **Method:** `GET`
- **Endpoint:** `/:workspaceId`
- **Auth Required:** Yes (JWT)
- **Description:** Fetch performance metrics and analytics for workspace
- **Response:**
  ```json
  {
    "workspaceId": "workspace_id",
    "totalIssues": 45,
    "completedIssues": 38,
    "pendingIssues": 5,
    "blockedIssues": 2,
    "averageCompletionTime": "3.2 days",
    "teamVelocity": 12,
    "sprintProgress": 85,
    "memberStats": [
      {
        "userId": "user_id",
        "name": "User Name",
        "completedTasks": 8,
        "performanceScore": 92
      }
    ]
  }
  ```

---

## 🔒 Authentication Headers

All authenticated endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## ⚠️ Error Responses

All endpoints return error responses in this format:

### 400 Bad Request

```json
{
  "message": "Parameter validation failed"
}
```

### 401 Unauthorized

```json
{
  "message": "Unauthorized - Invalid or missing JWT token"
}
```

### 403 Forbidden

```json
{
  "message": "Access denied - Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "message": "Resource not found"
}
```

### 500 Server Error

```json
{
  "message": "Server error - Internal error occurred"
}
```

---

## 🔌 WebSocket Events (Socket.io)

Real-time events for chat and notifications:

- **`newMessage`** - Broadcast when message is sent
- **`messageDeleted`** - Broadcast when message is deleted
- **`messageEdited`** - Broadcast when message is edited
- **`userTyping`** - User is typing in channel
- **`userOnline`** - User came online
- **`userOffline`** - User went offline

---

## 📝 Rate Limiting

- **File uploads**: 50 MB per file max
- **Message length**: 50,000 characters max
- **Batch operations**: 100 items per request max

---

**Last Updated:** April 8, 2026
**Version:** 1.0.0
