# CampusChat

A student-only random video chat platform for verified university members. Think Omegle, but gated behind an institutional email address — real-time video calls, in-call text chat, screen sharing, and synchronized watch parties, all within your campus community.

---

## Features

- **Verified access** — registration restricted to `@lnmiit.ac.in` email addresses with OTP confirmation(Guards Removed for demonstration puposes)
- **Random video chat** — peer-to-peer WebRTC sessions matched server-side
- **In-call tools** — text chat sidebar, screen sharing, mic/camera controls, device settings
- **Watch parties** — synchronized YouTube viewing with host-controlled playback
- **Google OAuth** — sign in via Google in addition to email/password
- **Token refresh** — silent access token renewal via httpOnly refresh cookie

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| State | Redux Toolkit |
| Routing | React Router v6 |
| Real-time | Socket.IO client |
| Video | WebRTC (native browser APIs) |
| Styling | Tailwind CSS |
| HTTP | Axios (with interceptors) |
| Icons | Lucide React |
| YouTube | react-youtube |

---

## Project Structure

```
src/
├── api/
│   ├── axios.js              # Axios instance + auth/refresh interceptors
│   └── auth.js               # Auth API calls (register, login, OTP, Google OAuth)
├── store/
│   ├── store.js              # Redux store
│   ├── authSlice.js          # Auth state: status, userData, accessToken
│   └── mediaSlice.js         # Media state: mute, video, screen share, device IDs
├── hooks/
│   ├── useWebRTC.js          # Full WebRTC lifecycle management
│   └── useMediaDevice.js     # Device enumeration + camera preview
├── socket.js                 # Socket.IO singleton (supports token refresh)
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── VerifyOTP.jsx
│   ├── AuthCallback.jsx      # Google OAuth redirect handler
│   ├── Dashboard.jsx
│   ├── WaitingRoom.jsx       # Camera/mic preview before joining
│   ├── RandomChat.jsx        # WebRTC orchestration + video UI
│   └── WatchParty.jsx        # Synchronized video viewing
└── Components/
    ├── RouteGuard/            # ProtectedRoute + GuestRoute wrappers
    ├── VideoInterface/        # VideoChatInterface, VideoGrid, VideoTile,
    │                          # MediaControls, ChatSidebar, ParticipantsSidebar,
    │                          # SettingsModal
    ├── Dashboard/             # ConnectionRow, StatCard, PartyCard, etc.
    ├── Layout/                # Sidebar
    └── ...                    # Header, Footer, DashboardNavigation, Logo, etc.
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A running instance of the CampusChat backend

### Installation

```bash
git clone https://github.com/your-org/campuschat-frontend.git
cd campuschat-frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Routing

| Path | Component | Access |
|---|---|---|
| `/` | `Home` | Public |
| `/login` | `Login` | Guest only |
| `/signup` | `Signup` | Guest only |
| `/verify-otp` | `VerifyOTP` | Guest only |
| `/auth/callback` | `AuthCallback` | Public (no layout) |
| `/dashboard` | `Dashboard` | Protected |
| `/waiting-room` | `WaitingRoom` | Protected |
| `/random-chat` | `RandomChat` | Protected |
| `/session/:roomId` | `RandomChat` | Protected |
| `/watch-party/:partyId` | `WatchParty` | Protected |

**GuestRoute** redirects authenticated users to `/dashboard`.  
**ProtectedRoute** redirects unauthenticated users to `/login`.

---

## Authentication Flow

1. User registers with an `@lnmiit.ac.in` email address
2. A 6-digit OTP is sent to the email; the user verifies at `/verify-otp`
3. On login, an access token is stored in `localStorage` and Redux; the refresh token is stored in an **httpOnly cookie**
4. Axios automatically retries failed requests after silently refreshing the access token
5. Google OAuth is supported — the callback page extracts the token from the URL fragment

On app load, `main.jsx` rehydrates auth state from `localStorage` by dispatching the stored access token into Redux.

---

## Redux State

### `authSlice`

```js
{
  status: boolean,        // is authenticated
  userData: object|null,  // user profile from backend
  accessToken: string|null,
}
```

Actions: `login`, `logout`, `updateUser`

### `mediaSlice`

```js
{
  isMuted: boolean,
  isVideoOff: boolean,
  isScreenSharing: boolean,
  selectedVideoId: string,  // deviceId
  selectedAudioId: string,  // deviceId
}
```

Actions: `toggleMic`, `toggleCamera`, `startScreenShareAction`, `stopScreenShareAction`, `setVideoDevice`, `setAudioDevice`

---

## WebRTC Architecture

The `useWebRTC` hook manages the full call lifecycle:

```
IDLE → ACQUIRING_MEDIA → MATCHMAKING → MATCHED → WEBRTC_CONNECTING → CONNECTED_CALL
```

Key design decisions:

- **No unmounting during calls** — `RandomChat` stays mounted throughout the session; the URL is updated cosmetically via `window.history.replaceState` to avoid tearing down peer connections.
- **Stable remote streams** — each peer gets a pre-allocated `MediaStream` stored in a ref; tracks are added to the existing stream object to avoid re-wiring `<video>.srcObject` on every track event.
- **ICE recovery** — `disconnected` triggers a 5-second timer before `restartIce()`; `failed` triggers a full offer with ICE restart.
- **Offer glare guard** — incoming offers are ignored when `signalingState !== 'stable'`.
- **Buffered ICE candidates** — candidates that arrive before `setRemoteDescription` are stored per-peer and flushed after the remote description is applied.

### Component Hierarchy

```
RandomChat
└── VideoChatInterface
    ├── VideoGrid
    │   └── VideoTile[]
    ├── MediaControls
    ├── ChatSidebar
    ├── ParticipantsSidebar
    └── SettingsModal
```

---

## Socket Events

### Random Chat

| Direction | Event | Description |
|---|---|---|
| Incoming | `match-found` | Peer matched; includes `roomId`, `remoteId`, `initiator` |
| Incoming | `offer` | SDP offer from remote peer |
| Incoming | `answer` | SDP answer from remote peer |
| Incoming | `ice-candidate` | ICE candidate from remote peer |
| Incoming | `chat-message` | Text message from remote peer |
| Incoming | `peer-left` | Remote peer disconnected |
| Incoming | `match-timeout` | Matchmaking timed out |
| Outgoing | `find-match` | Request matchmaking |
| Outgoing | `join-room` | Join a matched room |
| Outgoing | `offer` / `answer` / `ice-candidate` | WebRTC signalling |
| Outgoing | `chat-message` | Send text message |

### Watch Party

| Direction | Event | Description |
|---|---|---|
| Incoming | `sync-state` | Full state snapshot (time, playing, hostId) |
| Incoming | `play` / `pause` / `seek` | Host playback events |
| Incoming | `party-ended` | Host left; party terminated |
| Outgoing | `join-watch-party` | Join a party |
| Outgoing | `play` / `pause` / `seek` | Emitted by host only |

---

## Design System

| Token | Value |
|---|---|
| Page background | `zinc-950` |
| Card surface | `zinc-900` |
| Borders | `zinc-800` |
| Primary accent | `emerald-500` |
| Hover accent | `emerald-400` |
| Navbar | `backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800/60 h-16` |
| Card radius | `rounded-2xl` |
| Input radius | `rounded-xl` |
| CTA glow | `shadow-lg shadow-emerald-900/30` |

---

## Known Patterns & Conventions

- **Stale closure refs** — `isScreenSharingRef`, `previewStreamRef`, and `matchedRoomIdRef` are used in callbacks and cleanup functions to avoid stale closure bugs.
- **StrictMode guard** — a `started.current` ref in `RandomChat` prevents `findMatch` from firing twice under React 18 StrictMode in development.
- **Pure UI shell** — `VideoChatInterface` receives all data and callbacks as props and calls no hooks itself.
- **Socket token sync** — call `updateSocketToken(newToken)` from `socket.js` after login or token refresh to keep the WebSocket connection authenticated.
- **Logout safety** — `logoutAction()` is always dispatched in a `finally` block so Redux state is cleared even if the backend call fails.
- **Full-bleed routes** — dashboard and video routes manage their own width; all other routes receive `max-w-7xl` centering from `<main>` in `App.jsx`.
- **DEV utilities** — debug panels (e.g. the `userData` snapshot in `Dashboard.jsx`) are gated behind `import.meta.env.DEV` and collapsed inside `<details>`.

---

## License

MIT
