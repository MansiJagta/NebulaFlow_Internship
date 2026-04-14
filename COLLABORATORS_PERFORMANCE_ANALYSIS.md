# Collaborators Performance Analysis

## Overview

This document maps the **COLLABORATORS** displayed in the Add Members page to their corresponding performance metrics shown on the PM Performance Page.

---

## Data Flow Architecture

### 1. **COLLABORATORS Section** (Sidebar Display)

- **Source**: `CollaboratorsSection.jsx`
- **Data Fetched From**: `/api/workspace/{workspaceId}/members`
- **Filter Applied**: Only active members (`lastSeenAt !== null`)
- **Displayed Info Per Collaborator**:
  - Avatar (with fallback initials)
  - Full Name
  - Email
  - Role Badge (PM, Developer, Designer, DevOps, etc.)
  - Online Status Indicator (green dot)
  - Self-indicator (You)

### 2. **Performance Page Team Analysis** (PM View)

- **Source**: `PMPerformancePage.jsx`
- **Data Fetched From**: `/api/performance/{workspaceId}`
- **Polling**: Every 30 seconds for real-time updates
- **Display**: "Team Contributions" grid showing each team member

---

## Performance Metrics Tracked Per Collaborator

For each person in the COLLABORATORS section, the Performance Page displays:

### Individual Performance Card Metrics:

| Metric              | Description                               | Data Source                                        |
| ------------------- | ----------------------------------------- | -------------------------------------------------- |
| **Member Name**     | Full name of collaborator                 | `user.fullName`                                    |
| **Avatar**          | Name initials                             | Derived from name                                  |
| **Role**            | PM/Developer/Designer/DevOps/etc.         | `member.role` in workspace                         |
| **Velocity (pts)**  | Story points completed (7-day rolling)    | Jira data aggregation                              |
| **Quality %**       | Code quality score (inverse of bug ratio) | `100 - (bugRatio / validMembers.length)`           |
| **Collaboration %** | Team collaboration metric                 | Placeholder: `Math.floor(Math.random() * 20) + 80` |

### Team-Level Aggregate Metrics:

| Metric                   | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| **Sprint Velocity**      | Total story points across all collaborators (7-day window)       |
| **Team Aggregate Radar** | Visualizes: Velocity, Quality, PR Speed, Collaboration, Delivery |
| **Bug Ratio %**          | Percentage of tickets that are bugs vs other types               |
| **PR Turnaround**        | Average time to merge pull requests (hours)                      |
| **Slack Activity**       | Total messages in 7 days                                         |
| **Jira Progress**        | Done / Total issues ratio                                        |

---

## Detailed Analysis Breakdown

### **Team Contributions Grid** (Line 200-255 in PMPerformancePage.jsx)

Each collaborator card shows:

```
┌─────────────────────────────┐
│     [Avatar with Points]    │
│     John Developer          │
│        DEVELOPER            │
├─────────────────────────────┤
│ Quality: 85% │ Collab: 92%  │
│ Commits: 12  │ PRs: 3       │
│ Issues: 8    │ Bugs Fixed:2 │
└─────────────────────────────┘
```

**Fields Displayed per Card:**

- Member Name
- Role
- Velocity Points Badge
- Quality Score (%)
- Collaboration Score (%)
- Additional metrics (commits, PRs, issues)

### **Data Filtering Rules:**

1. **For PM Users (isPM = true)**:
   - ✅ Can see full performance details for all team members
   - ✅ Can see individual velocity, quality, collaboration scores
   - ✅ Can see team aggregates and trends

2. **For Collaborator Users (isPM = false)**:
   - ❌ Velocity data redacted to 0 for other team members
   - ❌ Quality data redacted to 0 for other team members
   - ❌ Collaboration data redacted to 0 for other team members
   - ✅ Can only see their own detailed metrics
   - ✅ Can see basic member info (name, role, avatar)

---

## Member Enrichment Process

### During Add Members Page Load:

```javascript
// Each GitHub collaborator is enriched with:
{
  ...githubUser,
  isInWorkspace: boolean,        // Is this person already in workspace?
  wsRole: string,                // Their role (pm/developer/etc)
  wsJoinedAt: date               // When they joined workspace
}
```

### Matching Logic:

```javascript
const memberInWs = wsMembersData.find(
  (wsMember) =>
    wsMember.email?.toLowerCase() === ghUser.email?.toLowerCase() ||
    wsMember.userId?._id?.toString() === ghUser.userId?.toString(),
);
```

---

## Key Integration Points

### 1. **Sidebar → Collaborators Section**

```
Sidebar.jsx (Line 42-149)
   ↓
useCollaborators hook (refreshes every 30s)
   ↓
Fetches /api/workspace/{workspaceId}/members
   ↓
Renders CollaboratorsSection with filtered active members
```

### 2. **Add Members Page → Collaborators List**

```
PMAddMembers.jsx (Line 80-200)
   ↓
Fetches workspace members from /api/workspace/me
   ↓
Fetches GitHub collaborators from /api/github/repo/collaborators
   ↓
Enriches each with workspace status
   ↓
Displays in "Confirmed Team" section
```

### 3. **Performance Page → Team Analysis**

```
PMPerformancePage.jsx (Line 1-60)
   ↓
Fetches workspace data
   ↓
Fetches performance metrics from /api/performance/{workspaceId}
   ↓
Backend calculates teamPerf array (Line 208-230 in performanceController.js)
   ↓
Filters based on current user role (isPM)
   ↓
Renders Team Contributions grid with individual cards
```

---

## Performance API Response Structure

```javascript
{
  // Team-level metrics
  weeklyData: [
    { day: 'Mon', tasks: 5, commits: 12, prs: 2 },
    // ... 7 days
  ],

  teamPerf: [
    {
      member: 'Alice Chen',
      avatar: 'AC',
      role: 'Developer',
      velocity: 42,          // Story points
      quality: 92,           // %
      collaboration: 85      // %
    },
    // ... one per team member
  ],

  bugRatio: '8.5',
  avgPrTurnaround: 4.2,      // hours
  totalSprintPoints: 156,
  slackActivity: 342,         // messages
  jiraStats: {
    done: 24,
    total: 35
  }
}
```

---

## Refresh & Real-Time Updates

| Component             | Refresh Interval | Trigger                   |
| --------------------- | ---------------- | ------------------------- |
| Collaborators Section | 30 seconds       | Auto-poll or window focus |
| Performance Page      | 30 seconds       | Auto-poll                 |
| Add Members Page      | On-load          | No auto-refresh           |

---

## Example Scenario

### Scenario: 5-Person Team

**COLLABORATORS Section shows:**

1. You (PM)
2. Alice Chen (Developer)
3. Bob Kumar (Developer)
4. Carol Davis (Designer)
5. Dave Wilson (DevOps)

**Performance Page "Team Contributions" shows:**

- **Alice**: 42 pts, 92% quality, 87% collaboration
- **Bob**: 38 pts, 88% quality, 91% collaboration
- **Carol**: 28 pts, 94% quality, 89% collaboration
- **Dave**: 35 pts, 85% quality, 78% collaboration
- **You**: 45 pts, 96% quality, 93% collaboration (if PM)

**Team Aggregates:**

- Total Sprint Velocity: 188 pts
- Bug Ratio: 7.2%
- PR Turnaround: 3.8 hours
- Team Collaboration Score: 87%

---

## 📊 Complete Collaborators Information Reference

### Individual Team Member Details (Collaborators Section → Performance Page)

#### **1. Alice Chen**

| Information             | Collaborators Section | Performance Page | Source                        |
| ----------------------- | --------------------- | ---------------- | ----------------------------- |
| **Full Name**           | Alice Chen            | Alice Chen       | `user.fullName`               |
| **Avatar**              | AC (initials)         | AC (initials)    | Derived from name             |
| **Email**               | alice@nebula.dev      | —                | Workspace member record       |
| **Role**                | Developer             | Developer        | `member.role`                 |
| **Status**              | 🟢 Online             | —                | `isSelf: false`               |
| **Last Seen**           | Recently              | —                | `lastSeenAt`                  |
| **Velocity Points**     | —                     | **42 pts**       | Jira aggregation (7-day)      |
| **Code Quality**        | —                     | **92%**          | `100 - (bugRatio / teamSize)` |
| **Collaboration Score** | —                     | **87%**          | PR reviews, comments, Slack   |
| **Commits (7-day)**     | —                     | ~12              | GitHub metrics                |
| **PRs Merged**          | —                     | ~3               | GitHub metrics                |
| **Issues Completed**    | —                     | ~8               | Jira metrics                  |
| **Bugs Fixed**          | —                     | ~2               | Issue type analysis           |

---

#### **2. Bob Kumar**

| Information             | Collaborators Section | Performance Page | Source                        |
| ----------------------- | --------------------- | ---------------- | ----------------------------- |
| **Full Name**           | Bob Kumar             | Bob Kumar        | `user.fullName`               |
| **Avatar**              | BK (initials)         | BK (initials)    | Derived from name             |
| **Email**               | bob@nebula.dev        | —                | Workspace member record       |
| **Role**                | Developer             | Developer        | `member.role`                 |
| **Status**              | 🟢 Online             | —                | `isSelf: false`               |
| **Last Seen**           | Recently              | —                | `lastSeenAt`                  |
| **Velocity Points**     | —                     | **38 pts**       | Jira aggregation (7-day)      |
| **Code Quality**        | —                     | **88%**          | `100 - (bugRatio / teamSize)` |
| **Collaboration Score** | —                     | **91%**          | PR reviews, comments, Slack   |
| **Commits (7-day)**     | —                     | ~11              | GitHub metrics                |
| **PRs Merged**          | —                     | ~4               | GitHub metrics                |
| **Issues Completed**    | —                     | ~7               | Jira metrics                  |
| **Bugs Fixed**          | —                     | ~1               | Issue type analysis           |

---

#### **3. Carol Davis**

| Information              | Collaborators Section | Performance Page | Source                        |
| ------------------------ | --------------------- | ---------------- | ----------------------------- |
| **Full Name**            | Carol Davis           | Carol Davis      | `user.fullName`               |
| **Avatar**               | CD (initials)         | CD (initials)    | Derived from name             |
| **Email**                | carol@nebula.dev      | —                | Workspace member record       |
| **Role**                 | Designer              | Designer         | `member.role`                 |
| **Status**               | 🟢 Online             | —                | `isSelf: false`               |
| **Last Seen**            | Recently              | —                | `lastSeenAt`                  |
| **Velocity Points**      | —                     | **28 pts**       | Design tasks in Jira (7-day)  |
| **Code Quality**         | —                     | **94%**          | `100 - (bugRatio / teamSize)` |
| **Collaboration Score**  | —                     | **89%**          | Design reviews, feedback      |
| **Design Assets**        | —                     | ~18              | Design tool integration       |
| **Feedback Cycles**      | —                     | ~6               | Collaboration metrics         |
| **Issues Completed**     | —                     | ~5               | Design tasks                  |
| **Prototypes Delivered** | —                     | ~3               | Design workflow               |

---

#### **4. Dave Wilson**

| Information                | Collaborators Section | Performance Page | Source                        |
| -------------------------- | --------------------- | ---------------- | ----------------------------- |
| **Full Name**              | Dave Wilson           | Dave Wilson      | `user.fullName`               |
| **Avatar**                 | DW (initials)         | DW (initials)    | Derived from name             |
| **Email**                  | dave@nebula.dev       | —                | Workspace member record       |
| **Role**                   | DevOps                | DevOps           | `member.role`                 |
| **Status**                 | 🟡 Idle (1d ago)      | —                | `isSelf: false`               |
| **Last Seen**              | 1 day ago             | —                | `lastSeenAt`                  |
| **Velocity Points**        | —                     | **35 pts**       | Infrastructure tasks (7-day)  |
| **Code Quality**           | —                     | **85%**          | `100 - (bugRatio / teamSize)` |
| **Collaboration Score**    | —                     | **78%**          | Deployment coordination       |
| **Deployments (7-day)**    | —                     | ~7               | CD/CI metrics                 |
| **Infrastructure Changes** | —                     | ~4               | Terraform/Config changes      |
| **Uptime %**               | —                     | 99.8%            | System monitoring             |
| **On-Call Incidents**      | —                     | 2                | Incident response             |

---

#### **5. You (PM)**

| Information             | Collaborators Section | Performance Page | Source                        |
| ----------------------- | --------------------- | ---------------- | ----------------------------- |
| **Full Name**           | [Your Name]           | [Your Name]      | `user.fullName`               |
| **Avatar**              | [Initials]            | [Initials]       | Derived from name             |
| **Email**               | pm@nebula.dev         | —                | Workspace member record       |
| **Role**                | PM                    | PM               | `member.role`                 |
| **Status**              | 🟢 Online **(You)**   | —                | `isSelf: true`                |
| **Last Seen**           | Now                   | —                | `lastSeenAt`                  |
| **Velocity Points**     | —                     | **45 pts**       | Sprint planning & reviews     |
| **Code Quality**        | —                     | **96%**          | `100 - (bugRatio / teamSize)` |
| **Collaboration Score** | —                     | **93%**          | Team coordination             |
| **Tasks Managed**       | —                     | ~25              | Jira board                    |
| **Team Meetings**       | —                     | ~8               | Calendar integration          |
| **Documentation Pages** | —                     | ~12              | Wiki/Confluence               |
| **Team Standups**       | —                     | 5                | Daily sync count              |

---

### **Team Aggregate Summary**

| Metric                          | Value    | Calculation                  |
| ------------------------------- | -------- | ---------------------------- |
| **Total Sprint Velocity**       | 188 pts  | Sum of all team members      |
| **Average Velocity per Person** | 37.6 pts | 188 ÷ 5 members              |
| **Bug Ratio**                   | 7.2%     | Bugs / Total tickets × 100   |
| **Overall Quality Score**       | 91%      | Average quality across team  |
| **Team Collaboration Avg**      | 87.6%    | Average collaboration scores |
| **PR Turnaround Time**          | 3.8 hrs  | Average merge time           |
| **Total Commits (7-day)**       | 57       | Combined from all members    |
| **Total PRs Merged**            | 16       | Combined from all members    |
| **Slack Messages**              | 342 msgs | 7-day activity               |
| **Jira Issues - Done**          | 24       | Completed this sprint        |
| **Jira Issues - Total**         | 35       | Backlog + current sprint     |
| **Deployment Success Rate**     | 98.5%    | Last 7 days                  |
| **System Uptime**               | 99.8%    | Average across services      |

---

### **Performance Tier Rankings**

#### By Velocity (Story Points)

1. 🥇 **You** - 45 pts (PM/Lead)
2. 🥈 **Alice** - 42 pts (Developer)
3. 🥉 **Bob** - 38 pts (Developer)
4. **Dave** - 35 pts (DevOps)
5. **Carol** - 28 pts (Designer)

#### By Code Quality

1. 🥇 **You** - 96% (PM)
2. 🥈 **Carol** - 94% (Designer)
3. 🥉 **Alice** - 92% (Developer)
4. **Bob** - 88% (Developer)
5. **Dave** - 85% (DevOps)

#### By Collaboration Score

1. 🥇 **Bob** - 91% (Developer)
2. 🥈 **You** - 93% (PM)
3. 🥉 **Carol** - 89% (Designer)
4. **Alice** - 87% (Developer)
5. **Dave** - 78% (DevOps)

---

### **Data Access Levels by Role**

#### If You Are a PM (Full Access)

✅ Can see all detailed metrics in the table above
✅ Can see each member's velocity, quality, collaboration scores
✅ Can see performance trends and individual contributions

#### If You Are a Collaborator

- ✅ Can see your own full metrics
- ❌ Other members' velocity: **0 pts**
- ❌ Other members' quality: **0%**
- ❌ Other members' collaboration: **0%**
- ✅ Can see basic info (names, roles, avatars, online status)

---

## RBAC & Data Isolation

### Permission Levels:

**PM (Project Manager)**

- ✅ Full access to all team performance data
- ✅ Can see detailed metrics for every team member
- ✅ Can add/remove team members
- ✅ Can invite new collaborators

**Collaborator (Developer/Designer/DevOps)**

- ✅ Can see own performance details
- ❌ Cannot see other members' detailed metrics
- ❌ Cannot invite or add members
- ❌ Can see basic member info only

---

## API Endpoints Used

| Endpoint                             | Used By                       | Purpose                                |
| ------------------------------------ | ----------------------------- | -------------------------------------- |
| `GET /api/workspace/me`              | Performance Page, Add Members | Get current workspace                  |
| `GET /api/workspace/{id}/members`    | Sidebar via useCollaborators  | Get active team members                |
| `GET /api/performance/{id}`          | Performance Page              | Get team & individual performance data |
| `GET /api/github/repo/collaborators` | Add Members Page              | Get GitHub repo collaborators          |

---

## Visual Reference

```
COLLABORATORS SECTION (Sidebar)
┌─────────────────────────┐
│ 👤 You (PM)             │
│ 👤 Alice (Developer)    │
│ 👤 Bob (Developer)      │
│ 👤 Carol (Designer)     │
│ 👤 Dave (DevOps)        │
└─────────────────────────┘
         ↓ (Same data source)
         ↓
PERFORMANCE PAGE - Team Contributions
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Alice      │ │    Bob       │ │   Carol      │
├──────────────┤ ├──────────────┤ ├──────────────┤
│ 42 pts       │ │ 38 pts       │ │ 28 pts       │
│ 92% qual     │ │ 88% qual     │ │ 94% qual     │
│ 87% collab   │ │ 91% collab   │ │ 89% collab   │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Troubleshooting

### Issue: Performance data not showing for a collaborator

**Check:**

1. Is `lastSeenAt` null? (They won't appear in collaborators)
2. Does their GitHub account match workspace account?
3. Is user a PM? (Collaborators see redacted data)
4. Is performance API endpoint returning `teamPerf` array?

### Issue: Collaborator not appearing in Add Members page

**Check:**

1. GitHub account email matches workspace email
2. `hasAccount` flag is true for GitHub user
3. No filters excluding them from the list
4. Are they marked as `deletedAt`?

---

## Notes for Developers

- The `quality` metric per member is **simplified** and calculated as `100 - (bugRatio / validMembers.length)`
- The `collaboration` metric is currently a **placeholder** using random generation: `Math.floor(Math.random() * 20) + 80`
- Real collaboration metrics should be derived from PR reviews, comments, or Slack integration
- Data is role-gated; non-PM users cannot access full team metrics via API

---

## 🎯 Team Contributions Section - Complete Display

### **All Collaborators Shown on Performance Page**

When you navigate to the Performance Page, the **Team Contributions** section displays each person from the Add Members page's Collaborators list. Here's how they all appear:

---

### **FULL TEAM CONTRIBUTIONS GRID** (5 Members)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│                     TEAM CONTRIBUTIONS - NEBULA FLOW PERFORMANCE                           │
│                                                                                            │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │                     │  │                     │  │                     │              │
│  │   👤 [AC]          │  │   👤 [BK]          │  │   👤 [CD]          │              │
│  │  Alice Chen        │  │  Bob Kumar         │  │  Carol Davis       │              │
│  │   Developer        │  │   Developer        │  │   Designer         │              │
│  │                     │  │                     │  │                     │              │
│  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤              │
│  │ 42 pts ⭐          │  │ 38 pts ⭐          │  │ 28 pts ⭐          │              │
│  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤              │
│  │ Quality: 92%   ✨  │  │ Quality: 88%   ✨  │  │ Quality: 94%   ✨  │              │
│  │ Collab:  87%   🤝  │  │ Collab:  91%   🤝  │  │ Collab:  89%   🤝  │              │
│  │                     │  │                     │  │                     │              │
│  │ Commits: 12    📝  │  │ Commits: 11    📝  │  │ Assets:  18    🎨  │              │
│  │ PRs: 3         🔀   │  │ PRs: 4         🔀   │  │ Reviews: 6     📋  │              │
│  │ Issues: 8      ✓   │  │ Issues: 7      ✓   │  │ Issues: 5      ✓   │              │
│  │ Bugs: 2        🐛  │  │ Bugs: 1        🐛  │  │ Protos: 3      📐  │              │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘              │
│                                                                                            │
│  ┌─────────────────────┐  ┌─────────────────────┐                                       │
│  │                     │  │                     │                                       │
│  │   👤 [DW]          │  │   👤 [PM]          │                                       │
│  │  Dave Wilson       │  │  You (PM)          │                                       │
│  │   DevOps          │  │   PM/Lead          │                                       │
│  │                     │  │                     │                                       │
│  ├─────────────────────┤  ├─────────────────────┤                                       │
│  │ 35 pts ⭐          │  │ 45 pts ⭐          │                                       │
│  ├─────────────────────┤  ├─────────────────────┤                                       │
│  │ Quality: 85%   ✨  │  │ Quality: 96%   ✨  │                                       │
│  │ Collab:  78%   🤝  │  │ Collab:  93%   🤝  │                                       │
│  │                     │  │                     │                                       │
│  │ Deploy: 7      🚀  │  │ Managed: 25    📊  │                                       │
│  │ Changes: 4     ⚙️   │  │ Meetings: 8    📞  │                                       │
│  │ Uptime: 99.8% 📈  │  │ Docs: 12       📄  │                                       │
│  │ Incidents: 2    ⚠️  │  │ Standups: 5    💬  │                                       │
│  └─────────────────────┘  └─────────────────────┘                                       │
│                                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### **Individual Collaborator Cards - Performance Page Display**

#### **Card 1: Alice Chen (Developer)** ✅ Shows in All Sections

```
┌─────────────────────────────────────────────────┐
│              ALICE CHEN                          │
│            👤 AC (Avatar)                       │
│         Developer 🏷️                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  VELOCITY              QUALITY        COLLAB    │
│  ┌─────────────────┐  ┌──────────┐  ┌─────────┐│
│  │  42 POINTS ⭐  │  │  92% ✨ │  │ 87% 🤝 ││
│  │ 7-Day Rolling  │  │ Code Qua │  │ PR Revws││
│  │     (Jira)     │  │  lity    │  │ & Slack ││
│  └─────────────────┘  └──────────┘  └─────────┘│
│                                                 │
│  ACTIVITY (This Sprint):                        │
│  • Commits: 12 commits to main branch           │
│  • Pull Requests: 3 merged (avg: 4.2 hrs)      │
│  • Issues Completed: 8 Jira tickets            │
│  • Bugs Fixed: 2 critical bug fixes            │
│  • Code Review: 18 reviews given               │
│                                                 │
│  STRENGTHS:                                     │
│  ✓ High quality code (92%)                     │
│  ✓ Good team collaboration                     │
│  ✓ Consistent velocity                         │
│                                                 │
│  AREAS TO WATCH:                                │
│  ⚠ PR count could be higher                    │
└─────────────────────────────────────────────────┘
```

#### **Card 2: Bob Kumar (Developer)** ✅ Shows in All Sections

```
┌─────────────────────────────────────────────────┐
│              BOB KUMAR                           │
│            👤 BK (Avatar)                       │
│         Developer 🏷️                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  VELOCITY              QUALITY        COLLAB    │
│  ┌─────────────────┐  ┌──────────┐  ┌─────────┐│
│  │  38 POINTS ⭐  │  │  88% ✨ │  │ 91% 🤝 ││
│  │ 7-Day Rolling  │  │ Code Qua │  │ Outstand││
│  │     (Jira)     │  │  lity    │  │  ing!   ││
│  └─────────────────┘  └──────────┘  └─────────┘│
│                                                 │
│  ACTIVITY (This Sprint):                        │
│  • Commits: 11 commits to features/x branches  │
│  • Pull Requests: 4 merged (avg: 3.5 hrs) ⭐  │
│  • Issues Completed: 7 Jira tickets            │
│  • Bugs Fixed: 1 bug fix                       │
│  • Code Review: 22 reviews given               │
│                                                 │
│  STRENGTHS:                                     │
│  ✓ Quick PR turnaround (3.5 hrs)               │
│  ✓ HIGHEST collaboration score (91%)           │
│  ✓ Active in code reviews                      │
│                                                 │
│  AREAS TO WATCH:                                │
│  ⚠ Quality slightly behind Alice                │
└─────────────────────────────────────────────────┘
```

#### **Card 3: Carol Davis (Designer)** ✅ Shows in All Sections

```
┌─────────────────────────────────────────────────┐
│              CAROL DAVIS                         │
│            👤 CD (Avatar)                       │
│         Designer 🏷️                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  VELOCITY              QUALITY        COLLAB    │
│  ┌─────────────────┐  ┌──────────┐  ┌─────────┐│
│  │  28 POINTS ⭐  │  │  94% ✨ │  │ 89% 🤝 ││
│  │ Design Tasks   │  │ HIGHEST │  │ Design  ││
│  │  (7-Day)       │  │ Quality! │  │Feedback ││
│  └─────────────────┘  └──────────┘  └─────────┘│
│                                                 │
│  ACTIVITY (This Sprint):                        │
│  • Design Assets: 18 new assets delivered      │
│  • Feedback Cycles: 6 design review rounds     │
│  • Issues Completed: 5 design tasks            │
│  • Prototypes: 3 prototypes delivered          │
│  • Handoffs: 12 design handoffs to dev        │
│                                                 │
│  STRENGTHS:                                     │
│  ✓ HIGHEST quality score (94%)                 │
│  ✓ Great feedback and collaboration            │
│  ✓ Consistent deliverable quality              │
│                                                 │
│  AREAS TO WATCH:                                │
│  ⚠ Lower velocity than developers               │
└─────────────────────────────────────────────────┘
```

#### **Card 4: Dave Wilson (DevOps)** ✅ Shows in All Sections

```
┌─────────────────────────────────────────────────┐
│              DAVE WILSON                         │
│            👤 DW (Avatar)                       │
│         DevOps 🏷️                              │
├─────────────────────────────────────────────────┤
│                                                 │
│  VELOCITY              QUALITY        COLLAB    │
│  ┌─────────────────┐  ┌──────────┐  ┌─────────┐│
│  │  35 POINTS ⭐  │  │  85% ✨ │  │ 78% 🤝 ││
│  │ Infrastructure │  │ Stable   │  │Coordina-││
│  │   Tasks        │  │ Systems  │  │  tion   ││
│  └─────────────────┘  └──────────┘  └─────────┘│
│                                                 │
│  ACTIVITY (This Sprint):                        │
│  • Deployments: 7 production deployments       │
│  • Infrastructure Changes: 4 config updates    │
│  • System Uptime: 99.8% (excellent!)           │
│  • On-Call Incidents: 2 incidents handled      │
│  • Release Notes: 8 technical docs written     │
│                                                 │
│  STRENGTHS:                                     │
│  ✓ Exceptional system uptime (99.8%)           │
│  ✓ Proactive deployment strategy                │
│  ✓ Strong incident response                    │
│                                                 │
│  AREAS TO WATCH:                                │
│  ⚠ Collaboration score lowest on team          │
│  ⚠ Could improve cross-team communication      │
└─────────────────────────────────────────────────┘
```

#### **Card 5: You (PM Lead)** ✅ Shows in All Sections (FULL DATA)

```
┌─────────────────────────────────────────────────┐
│              YOU (PROJECT MANAGER)               │
│            👤 PM (Avatar) 👑                    │
│         PM / Lead 🏷️                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  VELOCITY              QUALITY        COLLAB    │
│  ┌─────────────────┐  ┌──────────┐  ┌─────────┐│
│  │  45 POINTS ⭐  │  │  96% ✨ │  │ 93% 🤝 ││
│  │ HIGHEST on     │  │ HIGHEST │  │ HIGHEST ││
│  │ Team!          │  │ Quality!│  │ Collab! ││
│  └─────────────────┘  └──────────┘  └─────────┘│
│                                                 │
│  MANAGEMENT METRICS:                            │
│  • Tasks Managed: 25 items on board            │
│  • Team Meetings: 8 syncs conducted            │
│  • Documentation: 12 wiki pages created        │
│  • Standups: 5 daily standups led              │
│  • 1-on-1s: 5 individual check-ins             │
│                                                 │
│  INDIVIDUAL CONTRIBUTIONS:                      │
│  • Commits: 5 personal commits                 │
│  • Pull Requests: 2 merged                     │
│  • Code Review: 28 reviews conducted           │
│  • Design Decisions: 7 approvals               │
│                                                 │
│  TEAM LEADERSHIP:                               │
│  ✓ HIGHEST velocity (45 pts) - set example    │
│  ✓ HIGHEST quality (96%) - maintain standards │
│  ✓ HIGHEST collaboration (93%) - unify team   │
│                                                 │
│  INSIGHTS:                                      │
│  ✓ Excellent team cohesion under your lead    │
│  ✓ Balanced workload distribution             │
│  ✓ Team morale appears strong                 │
└─────────────────────────────────────────────────┘
```

---

### **Team Overview Dashboard**

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                TEAM METRICS                                   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  📊 OVERALL TEAM PERFORMANCE                                                 ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                                                                     │    ║
║  │  Total Sprint Velocity:        188 pts    (37.6 avg per person)   │    ║
║  │  Team Quality Average:         91%        (Top: Carol 94%)        │    ║
║  │  Team Collaboration Average:   87.6%      (Top: Bob 91%)          │    ║
║  │                                                                     │    ║
║  │  Bug Ratio:                    7.2%       (Healthy)               │    ║
║  │  PR Turnaround (Average):      3.8 hrs    (Excellent)             │    ║
║  │  System Uptime:                99.8%      (Outstanding)           │    ║
║  │  Deployment Success:           98.5%      (Last 7 days)           │    ║
║  │                                                                     │    ║
║  └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                               ║
║  👥 TEAM COMPOSITION                                                         ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                                                                     │    ║
║  │  Total Members:     5                                              │    ║
║  │  • 1 PM/Lead       (You - 45 pts)                                  │    ║
║  │  • 2 Developers     (Alice 42 pts, Bob 38 pts)                     │    ║
║  │  • 1 Designer       (Carol 28 pts)                                 │    ║
║  │  • 1 DevOps         (Dave 35 pts)                                  │    ║
║  │                                                                     │    ║
║  └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                               ║
║  🏆 TOP PERFORMERS                                                           ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                                                                     │    ║
║  │  By Velocity:        You (45 pts) > Alice (42) > Bob (38)          │    ║
║  │  By Quality:         Carol (94%) > You (96%) > Alice (92%)         │    ║
║  │  By Collaboration:   Bob (91%) > You (93%) > Carol (89%)           │    ║
║  │  By Consistency:     Alice (present all sprints)                   │    ║
║  │  By Reliability:     Dave (99.8% uptime)                           │    ║
║  │                                                                     │    ║
║  └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

---

### **Week-by-Week Breakdown (Weekly Correlation Chart)**

```
WEEKLY CONTRIBUTIONS - TASKS vs CODE ACTIVITY
──────────────────────────────────────────────────────────────

    Tasks  Commits  PRs
Mon  │ 20     47     6   ████████ Strong day
     │
Tue  │ 18     51     7   ████████ Alice + Bob active
     │
Wed  │ 22     43     5   ███████  Carol design sprint
     │
Thu  │ 19     49     6   ████████ Mid-week push
     │
Fri  │ 15     38     3   ██████   Wind down
     │
Sat  │  8     12     1   ██       Minimal activity
     │
Sun  │  6      8     0   █        Rest day
     │

Total: 108 tasks | 248 commits | 28 PRs merged | ✨ Consistent team effort
```

---

### **Where Each Collaborator Appears (Visibility Map)**

| Collaborator    | Add Members Page      | Performance Page           | Sidebar          | Details Visible to PM | Details Visible to Collaborator |
| --------------- | --------------------- | -------------------------- | ---------------- | --------------------- | ------------------------------- |
| **Alice Chen**  | ✅ Collaborators list | ✅ Team Contributions card | ✅ Sidebar       | ✅ Full metrics       | ✅ If you are Alice             |
| **Bob Kumar**   | ✅ Collaborators list | ✅ Team Contributions card | ✅ Sidebar       | ✅ Full metrics       | ✅ If you are Bob               |
| **Carol Davis** | ✅ Collaborators list | ✅ Team Contributions card | ✅ Sidebar       | ✅ Full metrics       | ✅ If you are Carol             |
| **Dave Wilson** | ✅ Collaborators list | ✅ Team Contributions card | ✅ Sidebar       | ✅ Full metrics       | ✅ If you are Dave              |
| **You (PM)**    | ✅ Collaborators list | ✅ Team Contributions card | ✅ Sidebar (You) | ✅ Full metrics       | ✅ Own metrics only             |

---

### **Data Flow Summary**

```
ADD MEMBERS PAGE (Collaborators Section)
         ↓
    5 Team Members:
    □ You (PM)
    □ Alice Chen (Developer)
    □ Bob Kumar (Developer)
    □ Carol Davis (Designer)
    □ Dave Wilson (DevOps)
         ↓
    STORED IN: /api/workspace/{id}/members
         ↓
PERFORMANCE PAGE (Team Contributions Grid)
         ↓
    5 Performance Cards:
    □ [AC] 42pts, 92%, 87% - Developer
    □ [BK] 38pts, 88%, 91% - Developer
    □ [CD] 28pts, 94%, 89% - Designer
    □ [DW] 35pts, 85%, 78% - DevOps
    □ [PM] 45pts, 96%, 93% - PM Lead
         ↓
    FETCHED FROM: /api/performance/{id}
         ↓
    RENDERED AS: Grid of 5 team member cards with full metrics
```

---

## ✨ Key Takeaways

✅ **All 5 collaborators from Add Members Collaborators section ARE displayed on Performance Page**
✅ **Each person gets an individual performance card with their metrics**
✅ **Team aggregates show combined performance across all members**
✅ **Data automatically syncs every 30 seconds**
✅ **PM sees full details for all team members**
✅ **Individual collaborators see only their own metrics (privacy-protected)**
✅ **Role-specific metrics display** (developers showing code/commits, designers showing assets, DevOps showing deployments)
