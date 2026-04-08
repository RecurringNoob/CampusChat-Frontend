import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';

import store from './store/store.js';
import { injectStore } from './api/axios.js';
import { ProtectedRoute, GuestRoute } from './Components/RouteGuard/RouteGuard.jsx';

import App from './App.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import WaitingRoom from './pages/WaitingRoom.jsx';
import RandomChat from './pages/RandomChat.jsx';
import AuthCallback from './pages/AuthCallback';         
import VerifyOTP from './pages/VerifyOTP.jsx';
import './index.css';

// ── Store injection ───────────────────────────────────────────────────────
injectStore(store);

// ── Auth rehydration ──────────────────────────────────────────────────────
const storedToken = localStorage.getItem('accessToken');
if (storedToken) {
  store.dispatch({
    type: 'auth/login',
    payload: { userData: null, accessToken: storedToken },
  });
}

// ── Router ────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ✅ Public callback route – no layout, no guards
  {
    path: '/auth/callback',
    element: <AuthCallback />,
  },
  // Main app with layout
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },

      {
        element: <GuestRoute />,
        children: [
          { path: 'login',  element: <Login /> },
          { path: 'signup', element: <Signup /> },
          { path: 'verify-otp', element: <VerifyOTP /> },
        ],
      },

      {
        element: <ProtectedRoute />,
        children: [
          { path: 'dashboard',       element: <Dashboard /> },
          { path: 'waiting-room',    element: <WaitingRoom /> },
          { path: 'random-chat',     element: <RandomChat /> },
          { path: 'session/:roomId', element: <RandomChat /> },
        ],
      },

      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);