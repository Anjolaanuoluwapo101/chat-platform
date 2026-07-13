# Complete Request Wireframe — Frontend

## Page Map

```
/                              → Redirect → /dashboard
├── /login                     → STANDALONE PAGE (public)
├── /register                  → STANDALONE PAGE (public)
├── /dashboard                 → STANDALONE PAGE (protected)
├── /privacy                   → STANDALONE PAGE (protected)
├── /messages                  → Redirect → /messages/:username (BUG)
├── /messages/:username        → STANDALONE PAGE (public)
├── /groups                    → STANDALONE PAGE (protected)
├── /groups/create             → STANDALONE PAGE (protected, orphaned — modal used instead)
└── /groups/:groupId           → STANDALONE PAGE (protected)
    └── AdminPanel             → MODAL (rendered inside GroupMessages)
```

---

## 1. `/login` — Login Page

**Type:** Standalone page | **Auth required:** No

| # | Trigger | Method | Endpoint | Body | Response |
|---|---------|--------|----------|------|----------|
| 1 | Form submit | `POST` | `/api/login` | `{ username, password }` | `{ success, user: {id, username, email}, errors? }` |

**Side effects on success:** Stores `user` and `isAuthenticated` (timestamp) in `sessionStorage`. Redirects to stored `redirectURI` or `/dashboard`.

---

## 2. `/register` — Register Page

**Type:** Standalone page | **Auth required:** No

| # | Trigger | Method | Endpoint | Body | Response |
|---|---------|--------|----------|------|----------|
| 1 | Form submit | `POST` | `/api/register` | `{ username, email, password }` | `{ success, message?, user?: {id, username, email}, errors? }` |

**Side effects on success:** Stores `user` + `isAuthenticated` in `sessionStorage`. Redirects to `/login` after 3 seconds.

---

## 3. `/dashboard` — Dashboard Page

**Type:** Standalone page | **Auth required:** Yes

| # | Trigger | Method | Endpoint | Response |
|---|---------|--------|----------|----------|
| — | — | — | **No API requests** | — |

All data is client-side from `sessionStorage`.

---

## 4. `/messages/:username` — Messages Page

**Type:** Standalone page | **Auth required:** No (intentionally public for anonymous messaging)

### Case A: Viewing your own messages (username matches logged-in user)

| # | Trigger | Method | Endpoint | Params | Response |
|---|---------|--------|----------|--------|----------|
| 1 | Component mount | `GET` | `/api/messages` | `?username={username}` | `{ success, messages: [{id, content, username?, created_at, media_urls?, reply_to_message_id?, replied_message_*?}] }` |
| 2 | Real-time | WebSocket | Pusher: `private-messages-{username}` | — | Event `new-message`: `{id, content, username?, created_at, media_urls?, ...}` |
| 3 | Push init (if logged in) | `GET` | `/api/pusher/beam-auth` | `?user_id={userId}` | `{ token }` |

### Case B: Viewing someone else's messages (send form only)

| # | Trigger | Method | Endpoint | Body | Response |
|---|---------|--------|----------|------|----------|
| 1 | Form submit | `POST` | `/api/messages` | FormData: `username`, `content`, `media[]` | `{ success, message?, errors? }` |

---

## 5. `/groups` — Group List Page

**Type:** Standalone page | **Auth required:** Yes

### Initial load:

| # | Trigger | Method | Endpoint | Response |
|---|---------|--------|----------|----------|
| 1 | Component mount | `GET` | `/api/groups` | `{ success, groups: [{id, name, is_anonymous, last_message_summary?, last_message_ts?, unread_count?}] }` |

### Create Group modal (opens from sidebar):

| # | Trigger | Method | Endpoint | Body | Response |
|---|---------|--------|----------|------|----------|
| 2 | Modal form submit | `POST` | `/api/groups` | `{ name, is_anonymous }` | `{ success, group_id?, errors? }` |
| 3 | After create success | `GET` | `/api/groups` | — | (same as #1, refreshes list) |

---

## 6. `/groups/:groupId` — Group Messages Page

**Type:** Standalone page | **Auth required:** Yes

### On mount (non-member):

| # | Trigger | Method | Endpoint | Response |
|---|---------|--------|----------|----------|
| 1 | Component mount | `GET` | `/api/groups/{groupId}/info` | `{ success, is_member, group: {id, name, is_anonymous, admins?, banned_users?, members?, last_message_id?} }` |

Stops here. Shows "Join Group" view. No messages fetched.

### On mount (member):

| # | Trigger | Method | Endpoint | Response |
|---|---------|--------|----------|----------|
| 1 | Component mount | `GET` | `/api/groups/{groupId}/info` | `{ success, is_member, group: {id, name, is_anonymous, admins?, banned_users?, members?, last_message_id?} }` |
| 2 | After #1 (if member) | `GET` | `/api/groups/{groupId}` | `{ success, messages: [{id, content, username?, created_at, media_urls?, reply_to_message_id?}] }` Params: `?limit=50` |
| 3 | Push init (if user) | `GET` | `/api/pusher/beam-auth` | `?user_id={userId}` → `{ token }` |
| 4 | Push init | Beams SDK | `addInterest("group_{groupId}")` | — |
| 5 | Real-time | WebSocket | Pusher: `private-group-{groupId}` | Event `new-message`: `{id, content, username?, created_at, ...}` |
| 6 | On each new message | `POST` | `/api/groups/{groupId}/markread` | `{ group_id, last_message_id }` → `{ success }` |

### User actions:

| # | Trigger | Method | Endpoint | Body | Response |
|---|---------|--------|----------|------|----------|
| 7 | Click "Join" | `POST` | `/api/groups/{groupId}/join` | `{ group_id }` | `{ success, is_member? }` |
| 8 | After join | `GET` | `/api/groups/{groupId}/info` | — | (same as #1) |
| 9 | After join | `GET` | `/api/groups/{groupId}` | — | (same as #2) |
| 10 | After join | `POST` | `/api/groups/{groupId}/markread` | `{ group_id, last_message_id }` | `{ success }` |
| 11 | Click "Leave Group" | `POST` | `/api/groups/{groupId}/leave` | `{ group_id }` | `{ success }` |
| 12 | Send message | `POST` | `/api/groups/{groupId}/messages` | FormData: `username`, `content`, `reply_to_message_id?`, `media[]` | `{ success, message?, errors? }` |
| 13 | Load more (scroll up) | `GET` | `/api/groups/{groupId}` | `?limit=50&reference_id={oldestMsgId}&direction=before` | `{ success, messages: [...] }` |
| 14 | Refresh admin data | `GET` | `/api/groups/{groupId}/info` | — | (same as #1) |

---

## 7. Admin Panel — MODAL (inside `/groups/:groupId`)

**Type:** Modal | **Rendered by:** GroupMessages.tsx | **Auth required:** Yes (admin only)

Data is passed as props from parent. Admin actions trigger API calls:

| # | Trigger | Method | Endpoint | Body | Response |
|---|---------|--------|----------|------|----------|
| 1 | Add member | `POST` | `/api/groups/{groupId}/members` | `{ username, group_id }` | `{ success }` |
| 2 | Remove member | `POST` | `/api/groups/{groupId}/members/remove` | `{ user_id, group_id }` | `{ success }` |
| 3 | Promote to admin | `POST` | `/api/groups/{groupId}/promote-admin` | `{ group_id, user_id }` | `{ success }` |
| 4 | Demote admin | `POST` | `/api/groups/{groupId}/demote-admin` | `{ group_id, user_id }` | `{ success }` |
| 5 | Ban user | `POST` | `/api/groups/{groupId}/ban-user` | `{ group_id, user_id }` | `{ success }` |
| 6 | Unban user | `POST` | `/api/groups/{groupId}/unban-user` | `{ group_id, user_id }` | `{ success }` |
| 7 | Delete group | `POST` | `/api/groups/{groupId}/delete` | `{ group_id }` | `{ success }` |

**After every admin action** (#1-#6): calls `onAdminDataRefresh()` → `GET /api/groups/{groupId}/info`.

---

## 8. `/groups/create` — Standalone Create Group (orphaned)

**Type:** Standalone page (orphaned — modal from GroupList is used instead) | **Auth required:** Yes

| # | Trigger | Method | Endpoint | Body | Response |
|---|---------|--------|----------|------|----------|
| 1 | Form submit | `POST` | `/api/groups` | `{ name, is_anonymous }` | `{ success, group_id?, errors? }` |
| 2 | On success | Navigate | `/groups/{group_id}` | — | — |

---

## 9. `/privacy` — Privacy Page

**Type:** Standalone page | **Auth required:** Yes

| # | Trigger | Method | Endpoint | Response |
|---|---------|--------|----------|----------|
| — | — | — | **No API requests** | — |

Purely static content.

---

## 10. Logout (triggered from any page's sidebar)

**Type:** Action (not a page) | **Trigger:** Sidebar "Logout" link

| # | Trigger | Method | Endpoint | Response |
|---|---------|--------|----------|----------|
| 1 | Click "Logout" | `POST` | `/api/logout` | `{ success }` |

**Side effects:** Clears Pusher Beams state, clears cache, clears `sessionStorage` + `localStorage`, redirects to `/login`.

---

## Global / Cross-Cutting Requests

These happen independently of page navigation:

| # | Trigger | Method | Endpoint | Body | Response |
|---|---------|--------|----------|------|----------|
| 1 | Pusher channel auth (any private channel) | `POST` | `/api/pusher/auth` | `{ socket_id, channel_name }` | `{ auth, channel_data? }` |
| 2 | Pusher Beams auth (messages/group pages) | `GET` | `/api/pusher/beam-auth` | `?user_id={userId}` | `{ token }` |
| 3 | Every API request | `OPTIONS` | `/api/*` | CORS preflight | 200 |

---

## All Backend Endpoints — Used vs Defined

| Method | Endpoint | Called from frontend | Used by |
|--------|----------|:-------------------:|---------|
| `POST` | `/api/login` | Yes | Login |
| `POST` | `/api/register` | Yes | Register |
| `POST` | `/api/logout` | Yes | Logout |
| `GET` | `/api/verify` | No | — |
| `POST` | `/api/auth/validate` | No | — |
| `GET` | `/api/auth/user` | No | — |
| `GET` | `/api/messages` | Yes | Messages |
| `POST` | `/api/messages` | Yes | Messages |
| `GET` | `/api/groups` | Yes | GroupList |
| `POST` | `/api/groups` | Yes | CreateGroup |
| `GET` | `/api/groups/{id}` | Yes | GroupMessages |
| `GET` | `/api/groups/{id}/info` | Yes | GroupMessages, AdminPanel |
| `GET` | `/api/groups/{id}/members` | No | — |
| `POST` | `/api/groups/{id}/members` | Yes | AdminPanel |
| `POST` | `/api/groups/{id}/members/remove` | Yes | AdminPanel |
| `POST` | `/api/groups/{id}/join` | Yes | GroupMessages |
| `POST` | `/api/groups/{id}/leave` | Yes | GroupMessages |
| `POST` | `/api/groups/{id}/messages` | Yes | GroupMessages |
| `POST` | `/api/groups/{id}/markread` | Yes | GroupMessages |
| `GET` | `/api/groups/{id}/is-admin` | No | — |
| `GET` | `/api/groups/{id}/admins` | No | — |
| `GET` | `/api/groups/{id}/banned-users` | No | — |
| `POST` | `/api/groups/{id}/remove-admin` | No | — |
| `POST` | `/api/groups/{id}/update-settings` | No | — |
| `POST` | `/api/groups/{id}/promote-admin` | Yes | AdminPanel |
| `POST` | `/api/groups/{id}/demote-admin` | Yes | AdminPanel |
| `POST` | `/api/groups/{id}/ban-user` | Yes | AdminPanel |
| `POST` | `/api/groups/{id}/unban-user` | Yes | AdminPanel |
| `POST` | `/api/groups/{id}/delete` | Yes | AdminPanel |
| `POST` | `/api/pusher/auth` | Yes | Pusher WebSocket |
| `GET` | `/api/pusher/beam-auth` | Yes | Pusher Beams |
