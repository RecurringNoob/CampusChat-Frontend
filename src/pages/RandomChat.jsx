import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC.js';
import {
  startScreenShareAction,
  stopScreenShareAction,
} from '../store/mediaSlice.js';
import { socket, updateSocketToken } from '../socket.js';
import VideoChatInterface from './VideoInterface.jsx';
import api from '../api/axios.js'; // ← your existing axios instance

export default function RandomChat() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const media     = useSelector((state) => state.media);
  const authToken = useSelector((state) => state.auth.accessToken);
  const userData  = useSelector((state) => state.auth.userData);

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

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const initSocket = async () => {
      let token = authToken;

      try {
        // Hit any protected endpoint — axios interceptor will:
        // 1. Try with current token
        // 2. On 401, automatically call /auth/refresh using the httpOnly cookie
        // 3. Store the new token in localStorage and retry
        // After this resolves, localStorage has a guaranteed fresh token.
        await api.get('/auth/me');
        token = localStorage.getItem('accessToken'); // pick up refreshed token
        console.log('[RandomChat] Token verified/refreshed successfully');
      } catch (err) {
        // If /auth/me fails even after refresh attempt, axios already
        // called logoutUser() and redirected to '/'. Nothing to do here.
        console.error('[RandomChat] Auth check failed:', err.message);
        return;
      }

      if (!token) {
        console.error('[RandomChat] No token available after auth check');
        navigate('/', { replace: true });
        return;
      }

      // Socket now connects with a guaranteed live token
      updateSocketToken(token);

      const meta = userData
        ? {
            interests: userData.interests ?? [],
            age:       userData.age       ?? null,
            country:   userData.country   ?? null,
          }
        : null;

      findMatch(meta);
    };

    initSocket();
  }, [findMatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Reactive device switching ─────────────────────────────────────────
  useEffect(() => {
    if (media.selectedVideoId) replaceVideoTrack(media.selectedVideoId);
  }, [media.selectedVideoId, replaceVideoTrack]);

  useEffect(() => {
    if (media.selectedAudioId) replaceAudioTrack(media.selectedAudioId);
  }, [media.selectedAudioId, replaceAudioTrack]);

  // ── Screen share toggle ───────────────────────────────────────────────
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
  const onHangUp = useCallback(() => {
    navigate('/waiting-room', { replace: true });
  }, [navigate]);

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