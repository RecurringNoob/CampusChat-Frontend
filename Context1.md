# CampusChat — Project Context (Updated)

## Overview

**CampusChat** is a student-only random video chat platform (similar to Omegle, but verified). Users must register with a university email (`@lnmiit.ac.in`) to access the platform. After authentication, they can join real-time video sessions with random peers, chat, share screens, and manage media devices.

The platform also includes **watch parties** (synchronized video viewing) and **listening parties** (planned), extending the social experience beyond one‑to‑one calls.

---

## Tech Stack

- **Frontend:** React 18 + Vite
- **State Management:** Redux Toolkit
- **Routing:** React Router v6 (nested routes, `createBrowserRouter`)
- **Real-time:** Socket.IO client
- **WebRTC:** Native browser APIs (`RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios (with interceptors for auth + token refresh)
- **Icons:** Lucide React
- **YouTube Integration:** `react-youtube` (for watch parties)

---

## Project Structure

```
src/
├── api/
│   ├── axios.js          # Axios instance + request/response interceptors
│   └── auth.js           # Auth API calls (register, login, OTP, Google OAuth)
├── store/
│   ├── store.js          # Redux store (auth + media slices)
│   ├── authSlice.js      # Auth state: status, userData, accessToken, refreshToken
│   └── mediaSlice.js     # Media state: isMuted, isVideoOff, isScreenSharing, device IDs
├── hooks/
│   ├── useWebRTC.js      # Core WebRTC hook (full lifecycle management)
│   └── useMediaDevice.js # Device enumeration + camera preview
├── socket.js             # Socket.IO singleton (supports dynamic auth token)
├── pages/
│   ├── Home.jsx          # Landing page with email signup CTA
│   ├── Login.jsx         # Login form + Google OAuth
│   ├── Signup.jsx        # Signup form (edu email validation)
│   ├── VerifyOTP.jsx     # 6‑digit OTP verification after signup
│   ├── AuthCallback.jsx  # Handles Google OAuth redirect (extracts token from URL fragment)
│   ├── Dashboard.jsx     # Post-auth dashboard
│   ├── WaitingRoom.jsx   # Camera/mic preview before joining
│   ├── RandomChat.jsx    # Orchestrates WebRTC hook + renders VideoChatInterface
│   └── WatchParty.jsx    # Synchronized video viewing (host‑controlled)
├── Components/
│   ├── RouteGuard/
│   │   └── RouteGuard.jsx         # ProtectedRoute / GuestRoute wrappers
│   ├── VideoInterface/
│   │   ├── VideoChatInterface.jsx # Pure-UI shell for the video call
│   │   ├── VideoGrid.jsx          # Grid layout for video tiles
│   │   ├── VideoTile.jsx          # Individual video element
│   │   ├── MediaControls.jsx      # Mic/camera/screenshare/chat/hangup buttons
│   │   ├── ChatSidebar.jsx        # In-call text chat panel
│   │   ├── ParticipantsSidebar.jsx# Participants list panel
│   │   └── SettingsModal.jsx      # Device settings modal (video/audio/profile)
│   ├── Dashboard/
│   │   ├── ConnectionRow.jsx
│   │   ├── DashboardSection.jsx
│   │   ├── PartyCard.jsx
│   │   ├── StatCard.jsx
│   │   └── WelcomeBanner.jsx
│   ├── Layout/
│   │   └── Sidebar.jsx
│   ├── Container/
│   │   └── HeroContainer.jsx
│   ├── Card/
│   │   └── Card1.jsx
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── DashboardNavigation.jsx
│   ├── Logo.jsx
│   ├── LogoutBtn.jsx
│   ├── NotificationPanel.jsx
│   └── SearchBar.jsx
├── App.jsx               # Root layout (Header or DashboardNavigation + Outlet + Footer)
└── main.jsx              # Entry point: Redux Provider + RouterProvider + auth rehydration
```

---

## Routing

Defined in `main.jsx` using `createBrowserRouter`.

| Path                     | Component         | Guard          |
|--------------------------|-------------------|----------------|
| `/`                      | `Home`            | Public         |
| `/login`                 | `Login`           | GuestRoute     |
| `/signup`                | `Signup`          | GuestRoute     |
| `/verify-otp`            | `VerifyOTP`       | GuestRoute     |
| `/auth/callback`         | `AuthCallback`    | Public (no layout) |
| `/dashboard`             | `Dashboard`       | ProtectedRoute |
| `/waiting-room`          | `WaitingRoom`     | ProtectedRoute |
| `/random-chat`           | `RandomChat`      | ProtectedRoute |
| `/session/:roomId`       | `RandomChat`      | ProtectedRoute |
| `/watch-party/:partyId`  | `WatchParty`      | ProtectedRoute |
| `*`                      | Redirect to `/`   | —              |

**GuestRoute:** Redirects authenticated users to `/dashboard`.  
**ProtectedRoute:** Redirects unauthenticated users to `/login`.

---

## Authentication

- **Email/password** registration limited to `@lnmiit.ac.in` addresses.
- **OTP verification** is required after registration (`/verify-otp`).
- **Google OAuth** redirects to backend endpoint `/api/auth/google`. The callback endpoint `/auth/callback` extracts the access token from the URL fragment and stores it.
- Tokens stored in `localStorage` (`accessToken`) and Redux. The refresh token is stored in an **httpOnly cookie** for security.
- On app load, `main.jsx` rehydrates auth state from `localStorage` by dispatching `auth/login` with the stored access token.
- `axios.js` attaches the access token to every request and auto-refreshes on 401 using the refresh token (cookie). Failed requests are queued and retried after refresh.

---

## Redux State

### `authSlice`
```js
{
  status: boolean,       // is authenticated
  userData: object|null, // user object from backend
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

## WebRTC Architecture (`useWebRTC.js`)

### Lifecycle Phases
```
IDLE → ACQUIRING_MEDIA → MATCHMAKING → MATCHED → WEBRTC_CONNECTING → CONNECTED_CALL
```

### Key Design Decisions

1. **No navigation on `onMatchFound`** — `RandomChat` stays mounted throughout the call. The URL bar is updated cosmetically via `window.history.replaceState` to avoid unmounting the component (which would close PeerConnections).

2. **Stable remote streams** — Each peer gets a pre-allocated `MediaStream` stored in a ref. Tracks are added to this existing stream object; React state is bumped with a shallow map copy to avoid re-wiring `<video>.srcObject` on every track event.

3. **ICE recovery** — `disconnected` state triggers a 5-second timer before calling `restartIce()`. `failed` state triggers a full offer-with-ICE-restart.

4. **Offer glare guard** — Incoming offers are ignored if `signalingState !== 'stable'`.

5. **Pending ICE candidates** — Candidates arriving before `setRemoteDescription` are buffered per peer and flushed after the remote description is set.

6. **Socket timing** — `findMatch` waits for an active socket connection before emitting, rather than relying on Socket.IO's send-buffer.

7. **Track toggles** — Always operate on `localStreamRef.current` to handle post-screen-share stream replacement correctly.

---

## Socket Events

### Random Chat

| Event (incoming)  | Description                                      |
|-------------------|--------------------------------------------------|
| `match-found`     | Server found a peer; includes `roomId`, `remoteId`, `initiator` |
| `offer`           | SDP offer from remote peer                       |
| `answer`          | SDP answer from remote peer                      |
| `ice-candidate`   | ICE candidate from remote peer                   |
| `chat-message`    | Text message from remote peer                    |
| `peer-left`       | Remote peer disconnected                         |
| `error`           | Server error with `code` + `message`             |
| `match-timeout`   | Matchmaking timed out                            |

| Event (outgoing)  | Description                                      |
|-------------------|--------------------------------------------------|
| `register-meta`   | Send user metadata (age, interests, country)     |
| `find-match`      | Request matchmaking                              |
| `join-room`       | Join a matched room                              |
| `offer`           | Send SDP offer                                   |
| `answer`          | Send SDP answer                                  |
| `ice-candidate`   | Send ICE candidate                               |
| `chat-message`    | Send text message                                |

### Watch Party

| Event (incoming)   | Description                                      |
|--------------------|--------------------------------------------------|
| `sync-state`       | Full state (currentTime, isPlaying, hostId)      |
| `play`             | Remote host started playback (with timestamp)    |
| `pause`            | Remote host paused playback (with timestamp)     |
| `seek`             | Remote host seeked (with new time)               |
| `party-ended`      | Host left – party is terminated                  |

| Event (outgoing)   | Description                                      |
|--------------------|--------------------------------------------------|
| `join-watch-party` | Join a party (with partyId, mediaUrl)            |
| `play`             | Emitted by host when video plays                 |
| `pause`            | Emitted by host when video pauses                |
| `seek`             | Emitted by host when seeking                     |

---

## Component Hierarchy (Video Call)

```
RandomChat                     ← owns useWebRTC, handles navigation + screen share
└── VideoChatInterface         ← pure UI shell, receives all data as props
    ├── VideoGrid              ← lays out participants in a responsive grid
    │   └── VideoTile[]        ← individual <video> elements wired via useEffect
    ├── MediaControls          ← mic/camera/screenshare/chat/participants/hangup
    ├── ChatSidebar            ← text chat panel (toggled)
    ├── ParticipantsSidebar    ← participants list (toggled)
    └── SettingsModal          ← device picker + camera preview (modal)
```

---

## Hooks

### `useWebRTC(params)`
Full WebRTC lifecycle management. See section above.

### `useMediaDevices()`
- Enumerates all media devices (`audioinput`, `videoinput`).
- Manages a camera preview stream (`startPreview`, `stopPreview`).
- Used in `WaitingRoom` and `SettingsModal`.

---

## API Layer (`src/api/`)

### `axios.js`
- Base URL from `VITE_API_URL` env var (fallback: `http://localhost:5000/api`).
- Request interceptor: injects `Authorization: Bearer <accessToken>` from `localStorage`.
- Response interceptor: on 401, attempts silent token refresh via `POST /auth/refresh` (using httpOnly cookie). Queues concurrent failed requests and replays them after refresh. Forces logout if refresh fails.
- `injectStore(store)` allows the interceptor to dispatch Redux actions.

### `auth.js`
```js
register(email, password, fullName)  // POST /auth/register
verifyOtp(email, code)               // POST /auth/verify-otp
login(email, password)               // POST /auth/login
resendOtp(email)                     // POST /auth/resend-otp
logout()                             // POST /auth/logout
getGoogleAuthUrl()                   // Returns redirect URL for Google OAuth
```

---

## Environment Variables

| Variable          | Purpose                          | Default                        |
|-------------------|----------------------------------|--------------------------------|
| `VITE_API_URL`    | Backend API base URL             | `http://localhost:5000/api`    |
| `VITE_SOCKET_URL` | Socket.IO server URL             | `http://localhost:5000`        |

---

## Known Patterns & Conventions

- **Refs for stale closures:** `isScreenSharingRef`, `previewStreamRef`, `matchedRoomIdRef` are used to avoid stale closure bugs in callbacks and cleanup functions.
- **StrictMode guard:** `started.current` ref in `RandomChat` prevents `findMatch` from firing twice under React 18 StrictMode in development.
- **Pure UI components:** `VideoChatInterface` is a pure UI shell that receives all data/callbacks as props; it does not call any hooks itself.
- **CSS:** Tailwind CSS utility classes throughout. Dark zinc-based color palette with emerald accent colors.
- **Socket token refresh:** After login or token refresh, call `updateSocketToken(newToken)` from `socket.js` to keep the WebSocket connection authenticated.
- **OTP cooldown:** The `VerifyOTP` page implements a 60‑second resend cooldown and auto‑submits when all 6 digits are entered.
- **Watch party host control:** Only the party host can emit `play`/`pause`/`seek`; other clients only receive sync events. The host’s identity is determined via `sync-state` event.