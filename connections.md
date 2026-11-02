# ACES Gazette — Architecture & API Connections Map

This document outlines the complete architectural topology, component connections, data flows, and endpoint specifications for the **ACES Broadsheet Gazette** writer profile workbench and blog publishing engine.

---

## 1. System Overview & Component Topology

```mermaid
flowchart TD
    subgraph ClientUI["Client Frontend (Browser)"]
        ProfilePage["Writer Profile Desk<br/>(/writer-profile.html)"]
        EditorPage["Dedicated Blog Editor<br/>(/editor)"]
        ProfileModal["User Credentials Modal<br/>(Opens via [✎ EDIT PROFILE] popup)"]
        EditorialPage["Dedicated Editorial Board Desk<br/>(/editorial-board.html & /editorial)"]
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
        LocalStorage["Browser LocalStorage<br/>(aces_user_profile, aces_editor_blogs, aces_theme)"]
    end

    ProfilePage -- "1. Reads Profile & Dispatches" --> ProfileAPI
    ProfilePage -- "2. [✎ EDIT PROFILE] Click" --> ProfileModal
    ProfileModal -- "PUT /api/profile/:id" --> ProfileAPI
    ProfileModal -- "Caches in" --> LocalStorage

    ProfilePage -- "3. [➔ WRITE BLOG] Click" --> EditorPage
    ProfilePage -- "4. [✂ EDIT] Click with ?id=" --> EditorPage
    EditorPage -- "Saves Drafts / Publishes" --> LocalStorage
    EditorPage -- "Returns to Desk" --> ProfilePage

    ProfilePage -- "5. [⚖ EDITORIAL DESK] Link" --> EditorialPage
    EditorialPage -- "POST /api/profile/:id/badges" --> BadgesAPI
    EditorialPage -- "DELETE /api/profile/:id/badges" --> BadgesAPI
    BadgesAPI --> LocalStorage

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

## 3. Dedicated Blog Editor Connection Flow (Photo 3)

```mermaid
sequenceDiagram
    autonumber
    actor Author as Author
    participant Desk as Writer Profile Desk
    participant Editor as Dedicated Editor UI (/editor)
    participant Storage as LocalStorage / Blog Service

    Note over Author,Storage: Photo 3: "➔ WRITE BLOG" navigates to standalone editor
    Author->>Desk: Clicks "➔ WRITE BLOG" (or "➔ NEW BLOG")
    Desk->>Editor: Navigate to /editor (or /editor?id=... for editing)
    
    alt Editing Existing Blog
        Editor->>Storage: Load blog by ID from storage / API
        Storage-->>Editor: Populate Title, Category, Thumbnail, Excerpt & Markdown
    else New Blog
        Editor->>Editor: Initialize clean manuscript canvas & typeset toolbar
    end

    Author->>Editor: Typesets content, inputs headline, category & cover image
    Author->>Editor: Toggles [ ✦ SPLIT PREVIEW ] for live broadsheet ink proof

    alt Save as Draft
        Author->>Editor: Clicks [ ✂ SAVE DRAFT ]
        Editor->>Storage: Save blog with status "DRAFT"
        Editor-->>Author: Toast: "Draft saved to your desk"
    else Publish Blog
        Author->>Editor: Clicks [ ➔ PUBLISH BLOG ]
        Editor->>Storage: Save blog with status "PUBLISHED"
        Editor->>Desk: Redirect to /writer-profile.html
        Desk-->>Author: Live story stream displays new blog dispatch!
    end
```

---

## 4. Dedicated Editorial Board Accreditation Desk (/editorial-board.html)

```mermaid
sequenceDiagram
    autonumber
    actor Editorial as ACES Editorial Team / Faculty
    participant Desk as Profile Desk UI (/writer-profile.html)
    participant BoardPage as Editorial Board Desk (/editorial-board.html)
    participant API as /api/profile/:id/badges
    participant DB as Prisma / Database

    Note over Editorial,DB: Photo 5: Official accolades managed on dedicated Editorial Board page
    Editorial->>Desk: Clicks [ ⚖ EDITORIAL DESK ] in top bar
    Desk->>BoardPage: Navigates to /editorial-board.html
    BoardPage->>API: GET /api/profile/:id/badges (loads active registry ledger)
    API-->>BoardPage: Returns active accredited honours

    Editorial->>BoardPage: Selects Author (e.g. Aarav Sharma)
    Editorial->>BoardPage: Selects Accolade ("★ TOP CONTRIBUTOR '25", "⚡ SYSTEMS LEAD", etc.)
    Editorial->>BoardPage: Configures Awarding Body & Ink Style (Solid vs Outline)
    Editorial->>BoardPage: Submits [ ★ ACCREDIT & AWARD BADGE ]

    BoardPage->>API: POST /api/profile/:id/badges with payload
    API->>DB: Record new accreditation tied to Author
    DB-->>API: Confirm record created
    API-->>BoardPage: 201 Created { success: true, badge: { ... } }

    BoardPage-->>BoardPage: Live Ledger updates with new badge & [ ✂ REVOKE ] action
    BoardPage->>Desk: Author's profile card displays official badge pill
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
| **`➔ WRITE BLOG`** (Topbar) | Navigate to `/editor` | Author | Opens dedicated full-page blog composer (Photo 3) |
| **`➔ WRITE BLOG`** (Workbench) | Navigate to `/editor` | Author | Opens dedicated blog composer from workbench |
| **`[ ✂ EDIT ]`** (Row Action) | Navigate to `/editor?id={blogId}` | Author | Opens existing article for manuscript revision |
| **`[ ✎ EDIT PROFILE ]`** | Opens `#profileModalOverlay` | Author | Allows author to update avatar photo, name, and bio (Photo 1 & 2) |
| **`[ ★ EDITORIAL: AWARD LABEL ]`** | Opens `#editorialBadgeModalOverlay` | Editorial Team | Allows editorial board to accredit official accolades (Photo 5) |
| **`[ ☛ PREVIEW ]`** | Opens `#readerModalOverlay` | Any / Reader | In-modal technical manuscript preview |

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

