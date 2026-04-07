import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Video, VideoOff,
  Settings, Monitor, ShieldCheck,
} from 'lucide-react';
import { useMediaDevices } from '../hooks/useMediaDevice.js';
import { toggleMic, toggleCamera } from '../store/mediaSlice';

export default function WaitingRoom() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const videoRef = useRef(null);

  const { isMuted, isVideoOff, selectedVideoId } = useSelector(
    (state) => state.media,
  );

  const { previewStream, startPreview, stopPreview } = useMediaDevices();

  // FIX: startPreview is now a stable useCallback in useMediaDevices,
  // so it's safe to include in the dependency array here.
  useEffect(() => {
    startPreview(selectedVideoId);
    // FIX: use stopPreview (also stable) for cleanup instead of a ref workaround.
    return () => stopPreview();
  }, [selectedVideoId, startPreview, stopPreview]);

  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  const handleJoin = () => {
    navigate('/random-chat', { state: { age: 21, interests: ['math'], country: 'IN' } });
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* ── Left: Live Preview ─────────────────────────────────── */}
        <div className="space-y-6">
          <div className="relative aspect-video bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-700 shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover scale-x-[-1] ${
                isVideoOff ? 'hidden' : 'block'
              }`}
            />

            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800">
                <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center mb-4">
                  <VideoOff size={40} className="text-zinc-500" />
                </div>
                <p className="text-zinc-400 font-medium">Your camera is turned off</p>
              </div>
            )}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4">
              <button
                onClick={() => dispatch(toggleMic())}
                className={`p-4 rounded-full backdrop-blur-md transition-all ${
                  isMuted
                    ? 'bg-red-500'
                    : 'bg-black/40 hover:bg-black/60 border border-white/10'
                }`}
              >
                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button
                onClick={() => dispatch(toggleCamera())}
                className={`p-4 rounded-full backdrop-blur-md transition-all ${
                  isVideoOff
                    ? 'bg-red-500'
                    : 'bg-black/40 hover:bg-black/60 border border-white/10'
                }`}
              >
                {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6 text-zinc-500 text-sm">
            <div className="flex items-center">
              <ShieldCheck size={16} className="mr-2 text-emerald-500" />
              Verified Student
            </div>
            <div className="flex items-center">
              <Monitor size={16} className="mr-2 text-emerald-500" />
              HD Quality
            </div>
          </div>
        </div>

        {/* ── Right: Join Actions ────────────────────────────────── */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-3">Ready to join?</h1>
            <p className="text-zinc-400">
              Advanced Calculus Session • 4 students already inside
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-zinc-800/50 rounded-2xl border border-zinc-700">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
                Check your setup
              </h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm">Microphone levels</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-4 bg-emerald-500/20 rounded-full animate-pulse"
                    />
                  ))}
                </div>
              </div>
              <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm flex items-center justify-center space-x-2 transition-colors">
                <Settings size={18} />
                <span>Adjust Device Settings</span>
              </button>
            </div>

            <button
              onClick={handleJoin}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98]"
            >
              Join Session Now
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-500 text-center italic">
              By joining, you agree to follow the University Study Group Code of
              Conduct.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}