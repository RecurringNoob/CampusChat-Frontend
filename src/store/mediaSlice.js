import { createSlice } from "@reduxjs/toolkit";

const mediaSlice = createSlice({
  name: "media",
  initialState: {
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    selectedVideoId: "",
    selectedAudioId: "",
  },
  reducers: {
    toggleMic: (state) => {
      state.isMuted = !state.isMuted;
    },
    toggleCamera: (state) => {
      state.isVideoOff = !state.isVideoOff;
    },
    startScreenShareAction: (state) => {
      state.isScreenSharing = true;
    },
    stopScreenShareAction: (state) => {
      state.isScreenSharing = false;
    },
    setVideoDevice: (state, action) => {
      state.selectedVideoId = action.payload;
    },
    setAudioDevice: (state, action) => {
      state.selectedAudioId = action.payload;
    },
  },
});

export const {
  toggleMic,
  toggleCamera,
  startScreenShareAction,
  stopScreenShareAction,
  setVideoDevice,
  setAudioDevice,
} = mediaSlice.actions;

export default mediaSlice.reducer;
