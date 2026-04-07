import { useState } from 'react';
import { X, Settings, Share, Info, AlertCircle } from 'lucide-react';
import MediaControls from '../Components/VideoInterface/MediaControls.jsx';
import { ChatSidebar } from '../Components/VideoInterface/ChatSidebar.jsx';
import { VideoGrid } from '../Components/VideoInterface/VideoGrid.jsx';
import SettingsModal from '../Components/VideoInterface/SettingsModal.jsx';
import { ParticipantsSidebar } from '../Components/VideoInterface/ParticipantsSidebar.jsx';

/**
 * VideoChatInterface  (pure-UI shell)
 * ────────────────────────────────────
 * Receives ALL data and callbacks as props.
 * Does NOT call useWebRTC — that lives in RandomChat.
 *
 * Props
 * ─────
 * participants      {Array}    [{ id, name, isYou, stream }]
 * messages          {Array}
 * sendChatMessage   {Function}
 * handleScreenShare {Function}
 * isScreenSharing   {boolean}
 * isVideoOff        {boolean}
 */
export default function VideoChatInterface({
  participants = [],
  messages = [],
  sendChatMessage,
  handleScreenShare,
  isScreenSharing = false,
  isVideoOff = false,
  onHangUp,
  phase
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen((prev) => {
      if (!prev) setIsParticipantsOpen(false);
      return !prev;
    });
  };

  const toggleParticipants = () => {
    setIsParticipantsOpen((prev) => {
      if (!prev) setIsChatOpen(false);
      return !prev;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* ── Header ───────────────────────────────────────────────── */}
      <nav className="backdrop-blur-lg bg-zinc-900/70 sticky top-0 z-50 border-b border-zinc-800 py-3 px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2" />

        <div className="flex items-center space-x-1">
          <div className="bg-zinc-800 px-4 py-1 rounded-full flex items-center text-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 mr-2" />
            <span>Study Session: Advanced Calculus</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700">
            <Share size={18} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <Settings size={18} />
          </button>
          <button className="p-2 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500/30">
            <X size={18} />
          </button>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden h-[calc(100vh-120px)] max-h-[calc(100vh-120px)]">
        <div
          className={`flex-1 ${
            isChatOpen ? 'hidden md:flex' : 'flex'
          } flex-col min-h-0 overflow-hidden relative`}
        >
          <VideoGrid participants={participants} isVideoOff={isVideoOff} />
                    {/* 🔽 Loading overlay when not connected */}
          {(phase === "MATCHMAKING" ||
phase === "WEBRTC_CONNECTING") && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
                <p className="text-white text-lg font-medium">
                  Connecting... ({phase})
                </p>
              </div>
            </div>
          )}
          <div className="py-4 border-t border-zinc-800 bg-zinc-900 flex justify-center shrink-0">
            <MediaControls
              isChatOpen={isChatOpen}
              toggleChat={toggleChat}
              onHangUp={onHangUp}
              isParticipantsOpen={isParticipantsOpen}
              toggleParticipants={toggleParticipants}
              handleScreenShare={handleScreenShare}
              isScreenSharing={isScreenSharing}
              participantcount ={participants.length}
            />
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <ChatSidebar
            messages={messages}
            onSendMessage={sendChatMessage}
            onClose={() => setIsChatOpen(false)}
          />
        )}

        {/* Participants Panel */}
        {isParticipantsOpen && (
          <ParticipantsSidebar
            participants={participants}
            onClose={() => setIsParticipantsOpen(false)}
          />
        )}
      </div>

      {/* ── Info Banner ──────────────────────────────────────────── */}
      <div className="bg-zinc-800/80 backdrop-blur-md border-t border-zinc-700 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-zinc-400">
            <Info size={14} className="mr-1" />
            <span>This session is encrypted and limited to verified students only</span>
          </div>
          <div className="text-xs text-zinc-400 flex items-center">
            <AlertCircle size={14} className="mr-1" />
            <span>Report Issue</span>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}