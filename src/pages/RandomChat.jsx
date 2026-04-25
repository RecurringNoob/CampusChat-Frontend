import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC.js';
import {
  startScreenShareAction,
  stopScreenShareAction,
} from '../store/mediaSlice.js';
import { socket, updateSocketToken } from '../socket.js'; // ← static import, no dynamic import race
import VideoChatInterface from './VideoInterface.jsx';

/**
 * RandomChat
 * ──────────
 * Owns the single useWebRTC instance for the entire call lifetime.
 *
 * Race conditions fixed:
 *
 * 1. Socket reconnect used dynamic import('../socket.js') which is async —
 *    it yielded control before the import resolved, so the findMatch effect
 *    ran first and emitted 'find-match' into a socket that was mid-disconnect.
 *    Fixed by using a static import so updateSocketToken is synchronous.
 *
 * 2. register-meta and find-match were fired from three separate effects with
 *    no guaranteed ordering (socket reconnect, register-meta, findMatch).
 *    Fixed by consolidating into one effect: token → meta → findMatch.
 *
 * 3. matchMeta was taken from location.state which is often null unless the
 *    caller explicitly passes it via navigate(). Meta is now built directly
 *    from Redux userData so it's always available.
 *
 * 4. NO navigation on onMatchFound — navigating away unmounts this component,
 *    firing the hook's cleanup and tearing down PeerConnections before ICE
 *    negotiation can complete. URL is updated cosmetically via replaceState.
 */
export default function RandomChat() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const media     = useSelector((state) => state.media);
  const authToken = useSelector((state) => state.auth.accessToken);
  const userData  = useSelector((state) => state.auth.userData);

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

    // Do NOT navigate here — it would unmount this component and close
    // PeerConnections before ICE negotiation finishes.
    onMatchFound: ({ roomId }) => {
      window.history.replaceState(null, '', `/session/${roomId}`);
    },

    onPeerLeft: () => {
      navigate('/random-chat', { replace: true });
    },

    onError: ({ code }) => {
      if (code === 'MATCH_TIMEOUT') navigate('/', { replace: true });
    },
  });

  // ── Single coordinated startup effect ────────────────────────────────
  //
  // Order matters:
  //   1. updateSocketToken  — synchronously updates socket.auth and
  //                           reconnects if the token changed. Must happen
  //                           before findMatch so 'find-match' is sent on an
  //                           authenticated socket.
  //   2. findMatch(meta)    — emits 'register-meta' then 'find-match', waiting
  //                           for 'connect' internally if the socket isn't ready.
  //
  // The started ref prevents double-invocation under React 18 StrictMode,
  // which mounts+unmounts+remounts effects twice in development.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    // Step 1: ensure socket is authenticated with the current token.
    // updateSocketToken is a no-op if token matches and socket is connected.
    if (authToken) updateSocketToken(authToken);

    // Step 2: build meta from Redux — always available, never relies on
    // location.state which callers frequently omit.
    const meta = userData
      ? {
          interests: userData.interests ?? [],
          age:       userData.age       ?? null,
          country:   userData.country   ?? null,
        }
      : null;

    // Step 3: emit register-meta + find-match (waits for connect internally).
    findMatch(meta);
  }, [findMatch]); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: authToken and userData are intentionally excluded from deps.
  // This effect must run exactly once on mount. If the token or user data
  // changes mid-session that's handled by the auth layer, not here.

  // ── Reactive device switching ─────────────────────────────────────────
  useEffect(() => {
    if (media.selectedVideoId) replaceVideoTrack(media.selectedVideoId);
  }, [media.selectedVideoId, replaceVideoTrack]);

  useEffect(() => {
    if (media.selectedAudioId) replaceAudioTrack(media.selectedAudioId);
  }, [media.selectedAudioId, replaceAudioTrack]);

  // ── Screen share toggle ───────────────────────────────────────────────
  // isScreenSharingRef avoids a stale closure in handleScreenShare when
  // the user toggles screen share quickly between renders.
  const isScreenSharingRef = useRef(media.isScreenSharing);
  useEffect(() => {
    isScreenSharingRef.current = media.isScreenSharing;
  }, [media.isScreenSharing]);

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
      name:  'Peer',
      isYou: false,
      stream,
    })),
  ], [localStream, remoteStreams]);

  // ── Hang up ───────────────────────────────────────────────────────────
  // Navigating away unmounts the component, triggering useWebRTC's cleanup:
  // all PeerConnections are closed and tracks are stopped.
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