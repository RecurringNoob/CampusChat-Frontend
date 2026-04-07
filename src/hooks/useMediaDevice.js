import { useState, useEffect, useCallback, useRef } from 'react';

export const useMediaDevices = () => {
  const [devices,       setDevices]       = useState([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedAudio, setSelectedAudio] = useState('');
  const [previewStream, setPreviewStream] = useState(null);

  // FIX: track the live stream in a ref so startPreview/stopPreview never
  // close over a stale state value, which caused old tracks to leak.
  const previewStreamRef = useRef(null);

  const updateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices);

      const video = allDevices.find((d) => d.kind === 'videoinput');
      const audio = allDevices.find((d) => d.kind === 'audioinput');
      if (video) setSelectedVideo(video.deviceId);
      if (audio) setSelectedAudio(audio.deviceId);
    } catch (err) {
      console.error('Error fetching devices:', err);
    }
  }, []);

  // FIX: wrapped in useCallback so WaitingRoom / SettingsModal can safely
  // include it in their own useEffect dependency arrays without infinite loops.
  const startPreview = useCallback(async (deviceId) => {
    // FIX: stop the current stream via ref (not stale state closure)
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach((t) => t.stop());
      previewStreamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      });
      previewStreamRef.current = stream;
      setPreviewStream(stream);
    } catch (err) {
      console.error('Error starting preview:', err);
    }
  }, []); // no deps — reads only the ref

  // FIX: stopPreview uses the ref, not the state value, so it always
  // stops the actual current stream even if state hasn't flushed yet.
  const stopPreview = useCallback(() => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach((t) => t.stop());
      previewStreamRef.current = null;
      setPreviewStream(null);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => updateDevices());
    navigator.mediaDevices.ondevicechange = updateDevices;
    return () => { navigator.mediaDevices.ondevicechange = null; };
  }, [updateDevices]);

  return {
    devices,
    selectedVideo,
    setSelectedVideo,
    selectedAudio,
    setSelectedAudio,
    previewStream,
    startPreview,
    stopPreview,
  };
};