// src/pages/AuthCallback.jsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    // Parse the URL fragment (everything after #)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('accessToken');
    const error = params.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }

    if (accessToken) {
      processed.current = true;
      // Store only the access token – refresh token is an httpOnly cookie
      localStorage.setItem('accessToken', accessToken);
      dispatch(login({ accessToken, userData: null }));
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login?error=missing_tokens');
    }
  }, [navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">Completing sign in...</div>
    </div>
  );
}