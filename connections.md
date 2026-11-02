# ACES Gazette — Architecture & API Connections Map

This document outlines the complete architectural topology, component connections, data flows, and endpoint specifications for the **ACES Broadsheet Gazette** writer profile workbench and blog publishing engine.

---

## 1. System Overview & Component Topology

```mermaid
flowchart TD
    subgraph ClientUI["Client Frontend (Browser)"]
        ProfilePage["Writer Profile Desk<br/>(/writer-profile.html)"]
        DedicatedEditor["Standalone Dedicated Editor<br/>(Targeted via openDedicatedEditor /editor)"]
        ProfileModal["User Credentials Modal<br/>(Opens via [✎ EDIT PROFILE] popup)"]
    end

    subgraph EditorialAccess["Editorial Committee Direct Access"]
        EditorialAdmin["Editorial Team Member<br/>(Direct Database / API Access for Nicknames & Badges)"]
    end

    subgraph API["Next.js Server API Routes (/api)"]
        ProfileAPI["/api/profile/:id<br/>[GET, PUT]"]
        BadgesAPI["/api/profile/:id/badges<br/>[GET, POST, DELETE]"]
        RankingAPI["/api/ranking<br/>[GET]"]
        HealthAPI["/api/health<br/>[GET]"]
    end

    subgraph Storage["Persistence & Data Layer"]
        PrismaORM["Prisma Client ORM"]
        PostgresDB[("PostgreSQL Database")]
        LocalStorage["Browser LocalStorage<br/>(aces_user_profile, aces_theme)"]
    end

    ProfilePage -- "1. Reads Profile & Dispatches" --> ProfileAPI
    ProfilePage -- "2. [✎ EDIT PROFILE] Click" --> ProfileModal
    ProfileModal -- "PUT /api/profile/:id" --> ProfileAPI
    ProfileModal -- "Caches in" --> LocalStorage

    ProfilePage -- "3. [➔ WRITE BLOG] Click" --> DedicatedEditor
    ProfilePage -- "4. [✂ EDIT] Click with ?id=" --> DedicatedEditor

    EditorialAdmin -- "Accredits Nicknames & Badges directly" --> BadgesAPI
    ProfilePage -- "5. Displays Accredited Nicknames" --> BadgesAPI

    ProfileAPI --> PrismaORM
    BadgesAPI --> PrismaORM
    PrismaORM --> PostgresDB
```

---

## 2. User Profile Connection Flow (Photos 1 & 2)

```mermaid
sequenceDiagram
    autonumber
    actor Author as Author (User)
    participant UI as Profile Desk (/writer-profile.html)
    participant Modal as Profile Editor Modal
    participant Storage as LocalStorage & API
    participant DB as Prisma / Database

    Note over Author,DB: Photos 1 & 2: Avatar, Name, Handle, Bio taken from User
    Author->>UI: Visits Profile Desk
    UI->>Storage: Check for cached user credentials (aces_user_profile)
    alt Cache Present
        Storage-->>UI: Return user custom profile
    else No Cache
        UI->>Storage: GET /api/profile/:id
        Storage->>DB: Query User record
        DB-->>Storage: Return User { avatarUrl, name, companion, hometown }
        Storage-->>UI: Hydrate Author Profile Card
    end

    Author->>UI: Clicks [ ✎ EDIT PROFILE ]
    UI->>Modal: Open modal with current Name, Handle, Photo URL, Bio
    Author->>Modal: Enters new Photo URL, Full Name, Handle & Bio
    Author->>Modal: Submits [ ✔ UPDATE CREDENTIALS ]
    Modal->>Storage: PUT /api/profile/:id with JSON payload
    Storage->>DB: Update user in database
    Modal->>Storage: Cache updated profile in localStorage
    Modal-->>UI: Re-render avatar (Photo 1) & credentials (Photo 2)
    UI-->>Author: Display Success Toast: "Author credentials updated!"
```

---

## 3. Dedicated Blog Editor Connection Architecture

The workbench maintains active integration hooks (`[ ➔ WRITE BLOG ]` and `[ ✂ EDIT ]`) structured to seamlessly open the separate dedicated editor page added afterward.

```mermaid
sequenceDiagram
    autonumber
    actor Author as Author (User)
    participant Desk as Writer Profile Desk (/writer-profile.html)
    participant RouteHook as openDedicatedEditor(event, blogId)
    participant DedicatedEditor as Separate Dedicated Editor Page (Added Afterward)

    Note over Author,DedicatedEditor: "➔ WRITE BLOG" button triggers connection to dedicated editor
    Author->>Desk: Clicks "➔ WRITE BLOG" (or "➔ COMPOSE FIRST DISPATCH")
    Desk->>RouteHook: openDedicatedEditor(e)
    RouteHook->>DedicatedEditor: Navigates to EDITOR_CONFIG.editorRoute (/editor)

    Note over Author,DedicatedEditor: Row "[ ✂ EDIT ]" connects to editor with manuscript ID
    Author->>Desk: Clicks "[ ✂ EDIT ]" on story row
    Desk->>RouteHook: openDedicatedEditor(e, story.id)
    RouteHook->>DedicatedEditor: Navigates to /editor?id={story.id}
```

---

## 4. Editorial Team Database & Nickname Accreditation Architecture

The public website does not expose editorial administrative controls. Instead, designated members of the ACES Editorial Committee manage official accolades, nicknames, and recognition labels directly via database access or backend credentials.

```mermaid
sequenceDiagram
    autonumber
    actor EditorialAdmin as Editorial Team Member (Database Access)
    participant API as /api/profile/:id/badges
    participant DB as Prisma / Database (PostgreSQL)
    participant Desk as Writer Profile Desk (/writer-profile.html)

    Note over EditorialAdmin,Desk: Editorial team member awards nicknames/badges via direct DB access
    EditorialAdmin->>DB: Inserts Badge record (or calls POST /api/profile/:id/badges)
    DB-->>DB: Badge tied to Author (userId) with name, emoji & timestamps

    Author->>Desk: Visits Writer Profile Desk
    Desk->>API: GET /api/profile/:id
    API->>DB: Query User with embedded Badges
    DB-->>API: Returns User { badges: [...] }
    API-->>Desk: Hydrates #authorBadgesCluster with official nickname/award pills
```

---

## 5. Complete API Endpoints Specification

| HTTP Method | Route | Description | Auth / Role | Request Payload | Response Shape |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`GET`** | `/api/profile/:id` | Fetch author profile with embedded badges | Public | None | `User` object (name, avatarUrl, bio, email, badges[]) |
| **`PUT`** | `/api/profile/:id` | Update author credentials (Photo 1 & 2) | Author / Self | `{ name, profileImg, username, bio }` | `200 OK` with updated `User` object |
| **`GET`** | `/api/profile/:id/badges` | List accredited badges for an author | Public | None | `Badge[]` array |
| **`POST`** | `/api/profile/:id/badges` | Accredit official editorial label (Photo 5) | Editorial Team | `{ name, emoji, awardedBy, style }` | `201 Created` `{ success: true, badge: { ... } }` |
| **`DELETE`** | `/api/profile/:id/badges` | Revoke an editorial label | Editorial Team | `{ badgeId: string }` | `200 OK` `{ success: true }` |
| **`GET`** | `/api/ranking` | Fetch campus team leaderboard & rankings | Public | None | `Team[]` array |
| **`GET`** | `/api/health` | Healthcheck and server status | Public | None | `{ status: "ok", timestamp }` |

---

## 6. Frontend Navigation & Action Triggers

| UI Trigger Button | Target / Action | User Role | Description |
| :--- | :--- | :--- | :--- |
| **`➔ WRITE BLOG`** (Topbar) | `openDedicatedEditor(e)` | Author | Navigates to `/editor` (Dedicated editor page added afterward) |
| **`➔ WRITE BLOG`** (Workbench) | `openDedicatedEditor(e)` | Author | Navigates to `/editor` from dispatches toolbar |
| **`[ ✂ EDIT ]`** (Row Action) | `openDedicatedEditor(e, id)` | Author | Opens dedicated editor with article ID parameter |
| **`[ ✎ EDIT PROFILE ]`** | Opens `#profileModalOverlay` | Author | Allows author to update avatar photo, name, handle, and bio |
| **`[ ☛ PREVIEW ]`** | Opens `#readerModalOverlay` | Any / Reader | In-modal technical manuscript preview proof |

---

## 7. Data Models & Type Contracts

### `User` Contract
```typescript
interface User {
  id: string;
  name: string;
  username: string;
  role: "WRITER" | "EDITOR" | "ADMIN";
  avatarUrl: string | null;  // Photo 1: User-uploaded portrait
  bio: string;               // Photo 2: Author biography & beat
  labels: EditorialLabel[];  // Photo 5: Editorial accolades
  createdAt: string;
  updatedAt: string;
}
```

### `EditorialLabel` Contract
```typescript
interface EditorialLabel {
  key: string;
  text: string;              // e.g. "TOP CONTRIBUTOR '25", "SYSTEMS LEAD"
  emoji: string;             // e.g. "★", "⚡", "🏆"
  awarded: boolean;          // true = Solid Black Frame, false = Outline
  awardedBy: string;         // e.g. "ACES PVGCOET Editorial Board"
  awardedAt: string;         // ISO Timestamp
}
```

### `Blog` Contract
```typescript
interface Blog {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  author: string;
  status: "DRAFT" | "PUBLISHED" | "UNDER_REVIEW" | "REVISION_DRAFT" | "ARCHIVED" | "REJECT";
  category: string;
  tags: string[];
  readTime: string;
  content: string;
  excerpt: string;
  latestRevisionVersion: number;
  latestPublishedVersion: number;
  createdAt: string;
  modifiedAt: string;
}
```

