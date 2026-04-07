import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  X, Mic, MicOff, Video, User, Volume2,
  Check, ChevronDown, Camera
} from 'lucide-react';
import {
  setVideoDevice,
  setAudioDevice,
} from '../../store/mediaSlice.js';
import { useMediaDevices } from '../../hooks/useMediaDevice.js';

const SettingsModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const [activeTab, setActiveTab] = useState('video');

  // Redux state
  const { selectedVideoId, selectedAudioId, isMuted } = useSelector((state) => state.media);
  const { devices, previewStream, startPreview, stopPreview } = useMediaDevices();

  // ── Cleanup when modal closes ─────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      stopPreview();
    }
  }, [isOpen, stopPreview]);

  // ── Restart preview when Video tab is active, device changes ──
  useEffect(() => {
    if (isOpen && activeTab === 'video') {
      startPreview(selectedVideoId);
    } else {
      stopPreview();
    }
  }, [isOpen, activeTab, selectedVideoId, startPreview, stopPreview]);

  // ── Attach preview stream to video element ────────────────────
  useEffect(() => {
    if (videoRef.current && previewStream) {
      videoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  // Must come after all hooks!
  if (!isOpen) return null;

  const tabs = [
    { id: 'video', label: 'Video', icon: <Video size={18} /> },
    { id: 'audio', label: 'Audio', icon: <Mic size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[550px]">
        {/* Sidebar */}
        <div className="w-full md:w-56 bg-zinc-950/40 border-r border-zinc-800 p-6 flex flex-col">
          <h2 className="text-xl font-bold mb-8 text-white px-2">Settings</h2>
          <nav className="space-y-2 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]'
                    : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                }`}
              >
                {tab.icon}
                <span className="font-semibold text-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
          <button
            onClick={onClose}
            className="mt-auto w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm font-bold transition-colors"
          >
            Close
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-900">
          <header className="p-6 border-b border-zinc-800 flex justify-between items-center md:hidden">
            <span className="font-bold capitalize">{activeTab} Settings</span>
            <button onClick={onClose}><X size={20} /></button>
          </header>

          <div className="p-8 flex-1 overflow-y-auto">
            {/* VIDEO SETTINGS */}
            {activeTab === 'video' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Camera Device</label>
                  <div className="relative">
                    <select
                      value={selectedVideoId}
                      onChange={(e) => dispatch(setVideoDevice(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm appearance-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {devices.filter(d => d.kind === 'videoinput').map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 5)}`}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Preview</label>
                  <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 group">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {!previewStream && (
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                        <Camera size={40} className="text-zinc-800 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AUDIO SETTINGS */}
            {activeTab === 'audio' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Microphone</label>
                  <div className="relative">
                    <select
                      value={selectedAudioId}
                      onChange={(e) => dispatch(setAudioDevice(e.target.value))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm appearance-none focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {devices.filter(d => d.kind === 'audioinput').map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}`}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="p-6 bg-zinc-800/50 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${isMuted ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </div>
                    <div>
                      <p className="font-bold">Test Microphone</p>
                      <p className="text-xs text-zinc-500">Speak to see the input level</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 h-4 items-end">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="w-1 bg-emerald-500/30 rounded-full h-full animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex flex-col items-center py-4">
                  <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-zinc-700 flex items-center justify-center mb-4 relative group cursor-pointer">
                    <User size={40} className="text-zinc-600" />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera size={20} className="text-white" />
                    </div>
                  </div>
                  <button className="text-emerald-400 text-sm font-bold">Edit Profile Picture</button>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. UCLA Student"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;