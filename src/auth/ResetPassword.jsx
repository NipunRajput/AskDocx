import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill out both fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

  try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ token, password: newPassword })
      });


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Password reset failed');
    }
    navigate('/login', { state: { message: 'Password reset successful!' }});
    const data = await response.json();
    // Handle success
  } catch (error) {
    console.error('Reset error:', error);
    setError(error.message);
  }
};

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <header className="p-4 border-b border-gray-800 flex items-center">
        <h1 className="text-xl font-bold">AskDocx</h1>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

          {error && (
            <div className="text-red-400 text-sm text-center mb-4">{error}</div>
          )}

          <label className="block mb-4">
            <span className="text-sm">New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md"
              disabled={loading}
              required
            />
          </label>

          <label className="block mb-6">
            <span className="text-sm">Confirm New Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-700 rounded-md"
              disabled={loading}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 py-3 rounded-md text-white font-medium hover:bg-indigo-700 transition disabled:opacity-70"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </main>
    </div>
  );
}