import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC.js';
import {
  startScreenShareAction,
  stopScreenShareAction,
} from '../store/mediaSlice.js';
import VideoChatInterface from './VideoInterface.jsx';


/**
 * RandomChat
 * ──────────
 * Owns the single useWebRTC instance for the entire call lifetime.
 *
 * Key fixes over the original:
 *
 * 1. NO navigation on `onMatchFound` — navigating away unmounts this
 *    component and fires the hook's cleanup, which tears down PeerConnections
 *    before the WebRTC handshake can complete.  The session info is now held
 *    in local state (via the hook) and VideoChatInterface renders in-place.
 *
 * 2. Socket is reconnected with a fresh token when the component mounts,
 *    so a user who logged out and back in gets a new authenticated socket.
 *
 * 3. matchMeta is stabilised in a ref so findMatch's useEffect doesn't
 *    re-fire if the location.state object is recreated between renders.
 *
 * 4. handleScreenShare uses the latest media.isScreenSharing via a ref,
 *    avoiding a stale-closure bug when the user toggles quickly.
 */
export default function RandomChat() {
  const dispatch = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const media     = useSelector((state) => state.media);
  const authToken = useSelector((state) => state.auth.accessToken);
  const userData  = useSelector((state) => state.auth.userData);
  // ── Stabilise match meta across renders ─────────────────────────────
  // location.state is a new object on every render; putting it directly in
  // a useEffect dep array causes the effect to re-run unnecessarily.
  const matchMetaRef = useRef(location.state ?? null);

  // ── Reconnect socket with current auth token ─────────────────────────
  // Must happen before useWebRTC registers its socket handlers.
  useEffect(() => {
    if (!authToken) return;
    // Imported lazily to avoid circular dependency at module level
    import('../socket.js').then(({ socket }) => {
      if (socket.auth?.token !== authToken) {
        socket.auth = { token: authToken };
        if (socket.connected) socket.disconnect();
        socket.connect();
      }
    });
  }, [authToken]);

    // ── Register user metadata for matchmaking ───────────────────────────
  useEffect(() => {
    if (!userData?.interests) return; // only send if we have interests
    import('../socket.js').then(({ socket }) => {
      if (socket.connected) {
        socket.emit('register-meta', {
          interests: userData.interests,
          age: userData.age,
          country: userData.country,
        });
      } else {
        // If socket not yet connected, wait for connection
        const onConnect = () => {
          socket.emit('register-meta', {
            interests: userData.interests,
            age: userData.age,
            country: userData.country,
          });
          socket.off('connect', onConnect);
        };
        socket.on('connect', onConnect);
      }
    });
  }, [userData]); // re-run if userData changes

  // ── WebRTC hook ───────────────────────────────────────────────────────
  const {
    phase,
    localStream,
    remoteStreams,
    startScreenShare,
    stopScreenShare,
    replaceVideoTrack,
    replaceAudioTrack,
    messages,
    sendChatMessage,
    findMatch,
  } = useWebRTC({
    isMuted:    media.isMuted,
    isVideoOff: media.isVideoOff,

    onScreenShareEnded: () => dispatch(stopScreenShareAction()),

    // ── FIXED: do NOT navigate here. ──────────────────────────────────
    // Navigating away on match-found unmounts RandomChat, firing the hook's
    // cleanup and closing PeerConnections before ICE negotiation finishes.
    // The call UI is rendered inside this component via VideoChatInterface.
    onMatchFound: ({ roomId }) => {
      // Optional: update URL bar without unmounting, purely cosmetic
      window.history.replaceState(null, '', `/session/${roomId}`);
    },

    onPeerLeft: () => {
      // Peer disconnected → restart matchmaking from a clean state
      navigate('/random-chat', { replace: true });
    },

    onError: ({ code }) => {
      if (code === 'MATCH_TIMEOUT') navigate('/', { replace: true });
    },
  });

  // ── Kick off matchmaking once on mount ───────────────────────────────
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // findMatch is stable (useCallback with no deps that change)
    findMatch(matchMetaRef.current);
  }, [findMatch]);
  // NOTE: the started ref guard is intentional — it prevents double-invocation
  // in React 18 StrictMode which mounts effects twice in development.

  // ── Reactive device switching ─────────────────────────────────────────
  useEffect(() => {
    if (media.selectedVideoId) replaceVideoTrack(media.selectedVideoId);
  }, [media.selectedVideoId, replaceVideoTrack]);

  useEffect(() => {
    if (media.selectedAudioId) replaceAudioTrack(media.selectedAudioId);
  }, [media.selectedAudioId, replaceAudioTrack]);

  // ── Screen share toggle ───────────────────────────────────────────────
  // Use a ref for isScreenSharing to avoid a stale closure in handleScreenShare
  const isScreenSharingRef = useRef(media.isScreenSharing);
  useEffect(() => { isScreenSharingRef.current = media.isScreenSharing; }, [media.isScreenSharing]);

  const handleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharingRef.current) {
        await stopScreenShare();
        dispatch(stopScreenShareAction());
      } else {
        await startScreenShare();
        dispatch(startScreenShareAction());
      }
    } catch (err) {
      console.error('[RandomChat] Screen share failed:', err);
    }
  }, [startScreenShare, stopScreenShare, dispatch]);

  // ── Participant list ──────────────────────────────────────────────────
  const participants = useMemo(() => [
    { id: 'local', name: 'You', isYou: true, stream: localStream },
    ...Object.entries(remoteStreams).map(([id, stream]) => ({
      id,
      name: 'Peer',
      isYou: false,
      stream,
    })),
  ], [localStream, remoteStreams]);

  // ── Hang up ───────────────────────────────────────────────────────────
  // Navigating away unmounts the component, which triggers useWebRTC's
  // cleanup: all PeerConnections are closed and tracks are stopped.
  const onHangUp = useCallback(() => {
    navigate('/waiting-room', { replace: true });
  }, [navigate]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <VideoChatInterface
      participants={participants}
      messages={messages}
      sendChatMessage={sendChatMessage}
      handleScreenShare={handleScreenShare}
      isScreenSharing={media.isScreenSharing}
      isVideoOff={media.isVideoOff}
      onHangUp={onHangUp}
      phase={phase}
    />
  );
}