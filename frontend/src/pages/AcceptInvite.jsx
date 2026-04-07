import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('Processing your invite...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('No invite token provided');
      setLoading(false);
      return;
    }

    const acceptInvite = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/auth/accept-invite?token=${token}`,
          { withCredentials: true }
        );

        const { action, redirectUrl, message: msg } = res.data;
        setMessage(msg || 'Invite processed');

        // Handle different actions
        if (action === 'added_to_workspace_authenticated') {
          // User was logged in and added to workspace
          setMessage('Successfully added to workspace! Redirecting...');
          setTimeout(() => navigate(redirectUrl || '/pm/dashboard'), 1500);
        } else if (action === 'added_to_workspace_login') {
          // User was added but needs to log in
          setMessage('Invite accepted! Redirecting to login...');
          setTimeout(() => navigate('/login'), 1500);
        } else if (action === 'already_member') {
          // User is already a member
          setMessage('You are already a member of this workspace. Redirecting...');
          setTimeout(() => navigate(user?.role === 'pm' ? '/pm/dashboard' : '/collaborator/dashboard'), 1500);
        } else if (action === 'redirect_to_signup') {
          // New user - store invite context and redirect to signup
          const { inviteeEmail, role } = res.data;
          localStorage.setItem('inviteToken', token);
          localStorage.setItem('inviteeEmail', inviteeEmail);
          localStorage.setItem('inviteRole', role);
          setMessage('Creating your account...');
          setTimeout(() => navigate('/signup'), 1500);
        }
      } catch (err) {
        const errMsg = err.response?.data?.error || err.message || 'Failed to process invite';
        setError(errMsg);
        setMessage('');
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [searchParams, navigate, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full background:#12132a border-1px border:#1e2050 rounded-xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {loading && (
          <>
            <h1 className="text-2xl font-bold text-white mb-4">Processing Invite</h1>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-400 border-t-transparent"></div>
            </div>
            <p className="text-slate-300">{message}</p>
          </>
        )}

        {error && !loading && (
          <>
            <h1 className="text-2xl font-bold text-red-400 mb-4">Unable to Accept Invite</h1>
            <p className="text-slate-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              Go Home
            </button>
          </>
        )}

        {message && !loading && !error && (
          <>
            <h1 className="text-2xl font-bold text-white mb-4">Invite Accepted!</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <p className="text-sm text-slate-400">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
