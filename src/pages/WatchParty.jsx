import { useEffect, useRef,useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket"; // same socket you already use
import YouTube from "react-youtube";
export default function WatchParty() {
  const { partyId } = useParams();
  const videoRef = useRef(null);
const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    socket.emit("join-watch-party", {
      partyId,
      mediaUrl: "/sample.mp4", // temp static file
    });
    
    socket.on("sync-state", (state) => {
  videoRef.current.currentTime = state.currentTime;

  state.isPlaying
    ? videoRef.current.play()
    : videoRef.current.pause();

  setIsHost(socket.id === state.hostId);
});


    socket.on("play", ({ time }) => {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    });

    socket.on("pause", ({ time }) => {
      videoRef.current.currentTime = time;
      videoRef.current.pause();
    });

    socket.on("seek", ({ time }) => {
      videoRef.current.currentTime = time;
    });
    socket.on("party-ended", () => {
  alert("Host left. Watch party ended.");
  window.location.href = "/dashboard";
});

    return () => {
      socket.off("sync-state");
      socket.off("play");
      socket.off("pause");
      socket.off("seek");
    };
  }, []);

  return (
    <div className="h-screen bg-black flex flex-col">
      <video
  ref={videoRef}
  src="/sample.mp4"
  controls={isHost}
  className="w-full h-full"
  onPlay={() =>
    isHost &&
    socket.emit("play", {
      partyId,
      time: videoRef.current.currentTime,
    })
  }
  onPause={() =>
    isHost &&
    socket.emit("pause", {
      partyId,
      time: videoRef.current.currentTime,
    })
  }
  onSeeked={() =>
    isHost &&
    socket.emit("seek", {
      partyId,
      time: videoRef.current.currentTime,
    })
  }
/>

    </div>
  );
}
