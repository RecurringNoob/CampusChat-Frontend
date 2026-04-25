import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';

import store from './store/store.js';
import { injectStore } from './api/axios.js';
import { updateSocketToken } from './socket.js'; // ← added
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
// If the user previously logged in and their accessToken is in localStorage,
// restore it into Redux so ProtectedRoute doesn't redirect them to /login.
// Also prime the socket with the token now — this means by the time the user
// navigates to RandomChat, the socket is already authenticated and
// RandomChat's updateSocketToken call will be a no-op (token matches).
const storedToken = localStorage.getItem('accessToken');
if (storedToken) {
  store.dispatch({
    type: 'auth/login',
    payload: { userData: null, accessToken: storedToken },
  });

  // ← added: authenticate socket at startup so it's ready immediately
  updateSocketToken(storedToken);
}

// ── Router ────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // Public callback route — no layout, no guards
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
          { path: 'login',      element: <Login /> },
          { path: 'signup',     element: <Signup /> },
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