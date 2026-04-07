import { useRef,useEffect } from "react";
export default function VideoTile({ stream, isMuted, isVideoOff, name }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream,isVideoOff]);

  return (
    <div className="relative w-full h-full bg-zinc-800">
      {!isVideoOff && (
        <video ref={ref} autoPlay playsInline muted={isMuted} className="w-full h-full object-cover" />
      )}
      {isVideoOff && (
        <div className="flex items-center justify-center h-full">
          <span className="text-2xl text-emerald-400">{name[0]}</span>
        </div>
      )}
    </div>
  );
}

export const VideoGrid = ({ participants, isVideoOff }) => {
  const count = participants.length;

  // Decide grid based on participant count
  const getGridClass = () => {
    if (count === 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-2 grid-rows-1";
    if (count <= 4) return "grid-cols-2 grid-rows-2"; // 🔑 FIX
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-4 auto-rows-fr";
  };

  return (
    <div className="flex-1 w-full h-full p-4 overflow-hidden">
      <div
        className={`
          grid
          w-full
          h-full
          gap-4
          ${getGridClass()}
        `}
      >
       {participants.map(user => (
<div key={`video-${user.id}`} className="relative rounded-2xl overflow-hidden bg-zinc-800">
    <VideoTile stream={user.stream} isMuted={user.isYou} name={user.name} isVideoOff={user.isYou ? isVideoOff :false} />

    <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-lg">
      <span className="text-xs">
        {user.name} {user.isYou && "(You)"}
      </span>
    </div>
  </div>
))}
      </div>
    </div>
  );
};
