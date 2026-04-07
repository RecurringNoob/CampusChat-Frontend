/**
 * useWebRTC.js
 *
 * Lifecycle phases:
 *   IDLE → ACQUIRING_MEDIA → MATCHMAKING → MATCHED → WEBRTC_CONNECTING → CONNECTED_CALL
 *
 * Fixes applied on top of the original:
 *
 * 1. onTrack stream handling — each remote peer gets a stable MediaStream stored
 *    in a ref. Tracks are added to the existing stream object; only a counter bump
 *    triggers a React re-render.
 *
 * 2. findMatch socket timing — waits for 'connect' before emitting 'find-match'.
 *
 * 3. ICE connection state machine — 'disconnected' sets a 5 s recovery timer then
 *    calls restartIce(). 'failed' triggers a full offer-with-restart.
 *
 * 4. Offer guard — ignores offers when signalingState !== 'stable'.
 *
 * 5. Pending ICE candidates buffered per peer and flushed after setRemoteDescription.
 *
 * 6. Track toggles always read from localStreamRef (safe after stream replacement).
 *
 * 7. FIX: setLocalStream(null) called in cleanup so VideoGrid never shows a dead
 *    stream reference after unmount/remount.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from '../socket.js';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const useWebRTC = ({
  isMuted        = false,
  isVideoOff     = false,
  onScreenShareEnded,
  onMatchFound,
  onPeerLeft,
  onError,
} = {}) => {

  /* ─── Public state ─────────────────────────────────────────────── */
  const [phase,            setPhase]            = useState('IDLE');
  const [localStream,      setLocalStream]      = useState(null);
  const [remoteStreamMap,  setRemoteStreamMap]  = useState({});
  const [connectionStates, setConnectionStates] = useState({});
  const [messages,         setMessages]         = useState([]);
  const [matchedRoomId,    setMatchedRoomId]    = useState(null);
  const [mediaError,       setMediaError]       = useState(null);

  /* ─── Private refs ──────────────────────────────────────────────── */
  const pcs              = useRef({});
  const senders          = useRef({});
  const localStreamRef   = useRef(null);
  const cameraTrackRef   = useRef(null);
  const screenStreamRef  = useRef(null);
  const matchedRoomIdRef = useRef(null);
  const remoteStreamRefs = useRef({});

  const _setMatchedRoomId = useCallback((id) => {
    matchedRoomIdRef.current = id;
    setMatchedRoomId(id);
  }, []);

  /* ════════════════════════════════════════════════════
     PHASE 1 — ACQUIRING_MEDIA
  ════════════════════════════════════════════════════ */
  useEffect(() => {
    let cancelled = false;

    const acquire = async () => {
      setPhase('ACQUIRING_MEDIA');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        localStreamRef.current  = stream;
        cameraTrackRef.current  = stream.getVideoTracks()[0] ?? null;
        setLocalStream(stream);
        setPhase('IDLE');
      } catch (err) {
        if (cancelled) return;
        console.error('[WebRTC] getUserMedia failed:', err);
        setMediaError(err);
        setPhase('MEDIA_ERROR');
        onError?.({ code: 'MEDIA_ERROR', message: err.message });
      }
    };

    acquire();

    return () => {
      cancelled = true;
      // FIX: null out localStream state so VideoGrid never renders a dead stream
      localStreamRef.current?.getTracks().forEach((t) => {
        if (t.readyState !== 'ended') t.stop();
      });
      localStreamRef.current = null;
      setLocalStream(null);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ════════════════════════════════════════════════════
     TRACK TOGGLES
  ════════════════════════════════════════════════════ */
  useEffect(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !isMuted; });
  }, [isMuted]);

  useEffect(() => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !isVideoOff; });
  }, [isVideoOff]);

  /* ════════════════════════════════════════════════════
     PEER CONNECTION FACTORY
  ════════════════════════════════════════════════════ */
  const createPeerConnection = useCallback((roomId, remoteId) => {
    if (pcs.current[remoteId]) return pcs.current[remoteId];

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcs.current[remoteId]    = pc;
    senders.current[remoteId] = { video: null, audio: null };

    if (!remoteStreamRefs.current[remoteId]) {
      remoteStreamRefs.current[remoteId] = new MediaStream();
    }

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit('ice-candidate', { candidate, roomId, remoteId });
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      setConnectionStates((prev) => ({ ...prev, [remoteId]: state }));

      if (state === 'failed') {
        if (pc.signalingState === 'closed') return;
        pc.createOffer({ iceRestart: true })
          .then((o) => pc.setLocalDescription(o))
          .then(() => socket.emit('offer', {
            offer:    pc.localDescription,
            roomId:   matchedRoomIdRef.current,
            remoteId,
          }))
          .catch(console.warn);
      }

      if (state === 'disconnected') {
        setTimeout(() => {
          if (
            pc.iceConnectionState === 'disconnected' &&
            pc.signalingState     !== 'closed'
          ) {
            pc.restartIce();
          }
        }, 5000);
      }
    };

    pc.ontrack = ({ track }) => {
      const stream = remoteStreamRefs.current[remoteId];
      if (!stream) return;
      if (!stream.getTracks().find((t) => t.id === track.id)) {
        stream.addTrack(track);
      }
      setRemoteStreamMap((prev) => ({ ...prev, [remoteId]: stream }));
    };

    localStreamRef.current?.getTracks().forEach((track) => {
      const sender = pc.addTrack(track, localStreamRef.current);
      if (track.kind === 'video') senders.current[remoteId].video = sender;
      if (track.kind === 'audio') senders.current[remoteId].audio = sender;
    });

    return pc;
  }, []);

  /* ════════════════════════════════════════════════════
     CLOSE ONE PEER CONNECTION
  ════════════════════════════════════════════════════ */
  const closePeerConnection = useCallback((remoteId) => {
    const stream = remoteStreamRefs.current[remoteId];
    stream?.getTracks().forEach((t) => { if (t.readyState !== 'ended') t.stop(); });
    delete remoteStreamRefs.current[remoteId];

    pcs.current[remoteId]?.close();
    delete pcs.current[remoteId];
    delete senders.current[remoteId];

    setRemoteStreamMap((prev) => { const c = { ...prev }; delete c[remoteId]; return c; });
    setConnectionStates((prev) => { const c = { ...prev }; delete c[remoteId]; return c; });
  }, []);

  /* ════════════════════════════════════════════════════
     STREAM READY HELPER
  ════════════════════════════════════════════════════ */
  const waitForStream = useCallback((timeoutMs = 8000) =>
    new Promise((resolve, reject) => {
      if (localStreamRef.current) return resolve(localStreamRef.current);
      const deadline = setTimeout(
        () => reject(new Error('Stream not available after timeout')),
        timeoutMs,
      );
      const poll = setInterval(() => {
        if (localStreamRef.current) {
          clearInterval(poll);
          clearTimeout(deadline);
          resolve(localStreamRef.current);
        }
      }, 50);
    }), []);

  /* ════════════════════════════════════════════════════
     SOCKET EVENT HANDLERS
  ════════════════════════════════════════════════════ */
  useEffect(() => {
    const pendingCandidates = {};

    const onMatchFound_ = async ({ roomId, remoteId, initiator }) => {
      setPhase('MATCHED');
      _setMatchedRoomId(roomId);
      socket.emit('join-room', { roomId });

      if (!localStreamRef.current) {
        try { await waitForStream(); }
        catch { onError?.({ code: 'MEDIA_TIMEOUT', message: 'Media stream not available' }); return; }
      }

      setPhase('WEBRTC_CONNECTING');

      if (initiator) {
        const pc    = createPeerConnection(roomId, remoteId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { offer, roomId, remoteId });
      }

      onMatchFound?.({ roomId, remoteId, initiator });
    };

    const onOffer = async ({ offer, roomId, remoteId }) => {
      if (!offer?.sdp) return;
      const pc = createPeerConnection(roomId, remoteId);

      if (pc.signalingState !== 'stable') {
        console.warn('[WebRTC] Ignoring offer — signalingState is', pc.signalingState);
        return;
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      for (const c of pendingCandidates[remoteId] ?? []) {
        await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
      }
      pendingCandidates[remoteId] = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { answer, remoteId, roomId });
      setPhase('CONNECTED_CALL');
    };

    const onAnswer = async ({ answer, remoteId }) => {
      const pc = pcs.current[remoteId];
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      for (const c of pendingCandidates[remoteId] ?? []) {
        await pc.addIceCandidate(new RTCIceCandidate(c)).catch(console.warn);
      }
      pendingCandidates[remoteId] = [];
      setPhase('CONNECTED_CALL');
    };

    const onIceCandidate = async ({ candidate, remoteId }) => {
      const pc = pcs.current[remoteId];
      if (!pc) return;
      if (pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.warn);
      } else {
        pendingCandidates[remoteId] = pendingCandidates[remoteId] ?? [];
        pendingCandidates[remoteId].push(candidate);
      }
    };

    const onChatMessage = ({ message, user }) => {
      setMessages((prev) => [...prev, { ...message, sender: user?.name ?? 'Peer' }]);
    };

    const onPeerLeft_ = ({ remoteId }) => {
      closePeerConnection(remoteId);
      onPeerLeft?.({ remoteId });
      delete pendingCandidates[remoteId];
      if (Object.keys(pcs.current).length === 0) {
        _setMatchedRoomId(null);
        setPhase('IDLE');
        setConnectionStates({});
      }
    };

    const onServerError   = ({ code, message }) => {
      console.error(`[Socket error] ${code}: ${message}`);
      onError?.({ code, message });
    };

    const onMatchTimeout = () => {
      setPhase('IDLE');
      onError?.({ code: 'MATCH_TIMEOUT', message: 'No match found in time' });
    };

    socket.on('match-found',   onMatchFound_);
    socket.on('offer',         onOffer);
    socket.on('answer',        onAnswer);
    socket.on('ice-candidate', onIceCandidate);
    socket.on('chat-message',  onChatMessage);
    socket.on('peer-left',     onPeerLeft_);
    socket.on('error',         onServerError);
    socket.on('match-timeout', onMatchTimeout);

    return () => {
      socket.off('match-found',   onMatchFound_);
      socket.off('offer',         onOffer);
      socket.off('answer',        onAnswer);
      socket.off('ice-candidate', onIceCandidate);
      socket.off('chat-message',  onChatMessage);
      socket.off('peer-left',     onPeerLeft_);
      socket.off('error',         onServerError);
      socket.off('match-timeout', onMatchTimeout);

      Object.values(pcs.current).forEach((pc) => pc.close());
      pcs.current    = {};
      senders.current = {};

      // FIX: also clean up the screen share stream if active
      screenStreamRef.current?.getTracks().forEach((t) => {
        if (t.readyState !== 'ended') t.stop();
      });
      screenStreamRef.current = null;
    };
  }, [createPeerConnection, closePeerConnection, waitForStream, _setMatchedRoomId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ════════════════════════════════════════════════════
     PUBLIC ACTIONS
  ════════════════════════════════════════════════════ */
  const findMatch = useCallback((meta) => {
    if (!localStreamRef.current) {
      onError?.({ code: 'MEDIA_NOT_READY', message: 'Camera/mic not ready yet' });
      return;
    }

    const emit = () => {
      if (meta) socket.emit('register-meta', meta);
      setPhase('MATCHMAKING');
      socket.emit('find-match');
    };

    if (socket.connected) {
      emit();
    } else {
      socket.once('connect', emit);
      socket.connect();
    }
  }, [onError]);

  const sendChatMessage = useCallback((text) => {
    const roomId = matchedRoomIdRef.current;
    if (!roomId) return;

    const sanitized = text.trim().slice(0, 500);
    if (!sanitized) return;

    const message = {
      id:     `${socket.id}-${Date.now()}`,
      sender: 'me',
      text:   sanitized,
      time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, message]);
    socket.emit('chat-message', { roomId, message });
  }, []);

  const replaceVideoTrack = useCallback(async (deviceId) => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false,
      });
      const newTrack = stream.getVideoTracks()[0];

      Object.values(senders.current).forEach((s) => s.video?.replaceTrack(newTrack));

      localStreamRef.current?.getVideoTracks().forEach((t) => {
        if (t.readyState !== 'ended') t.stop();
      });

      cameraTrackRef.current = newTrack;
      localStreamRef.current = new MediaStream([
        newTrack,
        ...(localStreamRef.current?.getAudioTracks() ?? []),
      ]);
      setLocalStream(localStreamRef.current);
    } catch (err) {
      console.error('[WebRTC] replaceVideoTrack failed:', err);
      onError?.({ code: 'DEVICE_ERROR', message: err.message });
    }
  }, [onError]);

  const replaceAudioTrack = useCallback(async (deviceId) => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false,
      });
      const newTrack = stream.getAudioTracks()[0];

      Object.values(senders.current).forEach((s) => s.audio?.replaceTrack(newTrack));

      localStreamRef.current?.getAudioTracks().forEach((t) => {
        if (t.readyState !== 'ended') t.stop();
      });

      localStreamRef.current = new MediaStream([
        ...(localStreamRef.current?.getVideoTracks() ?? []),
        newTrack,
      ]);
      setLocalStream(localStreamRef.current);
    } catch (err) {
      console.error('[WebRTC] replaceAudioTrack failed:', err);
      onError?.({ code: 'DEVICE_ERROR', message: err.message });
    }
  }, [onError]);

  const stopScreenShare = useCallback(async () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;

    const cameraTrack = cameraTrackRef.current;
    if (!cameraTrack) return;

    Object.values(senders.current).forEach((s) => s.video?.replaceTrack(cameraTrack));

    localStreamRef.current = new MediaStream([
      cameraTrack,
      ...(localStreamRef.current?.getAudioTracks() ?? []),
    ]);
    setLocalStream(localStreamRef.current);
  }, []);

  const startScreenShare = useCallback(async () => {
    if (screenStreamRef.current) { console.warn('[WebRTC] Already screen sharing'); return; }
    if (!localStreamRef.current) {
      onError?.({ code: 'MEDIA_NOT_READY', message: 'Camera not initialized' });
      return;
    }

    try {
      cameraTrackRef.current = localStreamRef.current.getVideoTracks()[0] ?? null;

      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack  = screenStream.getVideoTracks()[0];
      screenStreamRef.current = screenStream;

      Object.values(senders.current).forEach((s) => s.video?.replaceTrack(screenTrack));

      localStreamRef.current = new MediaStream([
        screenTrack,
        ...(localStreamRef.current?.getAudioTracks() ?? []),
      ]);
      setLocalStream(localStreamRef.current);

      screenTrack.onended = () => {
        stopScreenShare();
        onScreenShareEnded?.();
      };
    } catch (err) {
      console.error('[WebRTC] startScreenShare failed:', err);
      onError?.({ code: 'SCREENSHARE_ERROR', message: err.message });
    }
  }, [onScreenShareEnded, stopScreenShare, onError]);

  /* ════════════════════════════════════════════════════
     RETURN
  ════════════════════════════════════════════════════ */
  return {
    phase,
    localStream,
    remoteStreams: remoteStreamMap,
    connectionStates,
    messages,
    matchedRoomId,
    mediaError,
    findMatch,
    sendChatMessage,
    replaceVideoTrack,
    replaceAudioTrack,
    startScreenShare,
    stopScreenShare,
  };
};