import { MicOff, Mic, Video, VideoOff, MessageSquare, X, Users, ScreenShare } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCamera, toggleMic } from '../../store/mediaSlice';

const MediaControls = ({
  onHangUp,
  toggleChat,
  isChatOpen,
  toggleParticipants,
  isParticipantsOpen,
  handleScreenShare,
  participantcount,
}) => {
  const dispatch = useDispatch();
  const { isMuted, isVideoOff, isScreenSharing } = useSelector((state) => state.media);

  return (
    <div className="flex items-center space-x-4 z-10">
      <button
        onClick={() => dispatch(toggleMic())}
        className={`p-4 rounded-full transition-colors ${
          isMuted ? 'bg-red-500' : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
      >
        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
      </button>

      <button
        onClick={() => dispatch(toggleCamera())}
        className={`p-4 rounded-full transition-colors ${
          isVideoOff ? 'bg-red-500' : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
      >
        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
      </button>

      {/* FIX: add `relative` so the absolute badge is positioned against this button */}
      <button
        onClick={toggleParticipants}
        className={`relative p-3 rounded-xl transition-all ${
          isParticipantsOpen
            ? 'bg-emerald-500 text-white'
            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
        }`}
      >
        <Users size={20} />
        <span className="absolute -top-1 -right-1 bg-emerald-500 text-[10px] w-4 h-4 rounded-full flex items-center justify-center text-white border-2 border-zinc-900">
          {participantcount}
        </span>
      </button>

      <button
        onClick={handleScreenShare}
        className={`p-4 rounded-full transition-colors ${
          isScreenSharing ? 'bg-emerald-500' : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
      >
        <ScreenShare size={20} />
      </button>

      <button
        onClick={toggleChat}
        className={`p-4 rounded-full transition-colors ${
          isChatOpen ? 'bg-emerald-500' : 'bg-zinc-800 hover:bg-zinc-700'
        }`}
      >
        <MessageSquare size={20} />
      </button>

      <button
        onClick={onHangUp}
        className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default MediaControls;