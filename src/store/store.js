import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice.js';
import mediaSlice from './mediaSlice.js'

const store = configureStore({
  reducer: {
    auth : authSlice,
    media: mediaSlice,
  }
});

export default store;