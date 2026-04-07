import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: false,
  userData: null,
  accessToken: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.status = true;
      state.userData    = action.payload.userData;
      state.accessToken  = action.payload.accessToken;
     

      // FIX: only persist non-null values so axios never sends "Bearer null"
      if (action.payload.accessToken)
        localStorage.setItem('accessToken',  action.payload.accessToken);
    },

    logout: (state) => {
      state.status       = false;
      state.userData     = null;
      state.accessToken  = null;
      state.refreshToken = null;
      localStorage.removeItem('accessToken');

    },

    updateUser: (state, action) => {
      state.userData = action.payload;
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;