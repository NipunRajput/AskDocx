import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';   // adjust path if needed

export default function AuthPage() {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const { login, register, loading } = useAuth();   // loading → boolean provided by context

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register(email, password);
      }
      navigate('/');                // send user to home (or any route you prefer)
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      {/* ---------- Header ---------- */}
      <header className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-2 text-xl font-bold">AskDocx</span>
        </div>

        <div className="flex items-center">
          <button
            className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white"
            onClick={() => alert('Toggle theme')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </button>

          {authMode === 'login' && (
            <button
              className="ml-4 px-4 py-2 bg-indigo-600 rounded-md text-white font-medium"
              onClick={toggleAuthMode}
            >
              Sign Up
            </button>
          )}
        </div>
      </header>

      {/* ---------- Main ---------- */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">
              {authMode === 'login' ? 'Log In' : 'Create Account'}
            </h2>

            {/* ---- Email ---- */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* ---- Password ---- */}
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* ---- Confirm (signup only) ---- */}
            {authMode === 'signup' && (
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            )}

            {/* ---- Forgot (login only) ---- */}
            {authMode === 'login' && (
              <div className="flex justify-end mb-6">
                <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </a>
              </div>
            )}

            {/* ---- Submit ---- */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 py-3 rounded-md text-white font-medium transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : authMode === 'login' ? 'Log In' : 'Create Account'}
            </button>

            {/* ---- Switch Mode ---- */}
            <p className="mt-6 text-center text-sm text-gray-400">
              {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="text-indigo-400 hover:text-indigo-300 font-medium"
                onClick={toggleAuthMode}
              >
                {authMode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>

            {/* ---- Divider & Social ---- */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {/* Google */}
                <button
                  type="button"
                  className="flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 hover:bg-gray-700 transition-colors"
                  onClick={() => alert('Google OAuth coming soon')}
                >
                  {/* Google icon */}
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-1.013z" />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  className="flex justify-center items-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-gray-800 hover:bg-gray-700 transition-colors"
                  onClick={() => alert('GitHub OAuth coming soon')}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                    <path d="M12 .5C5.648.5.5 5.648.5 12.005c0 5.108 3.292 9.434 7.86 10.964.574.105.784-.249.784-.556 0-.274-.01-1.005-.015-1.974-3.197.695-3.872-1.541-3.872-1.541-.522-1.326-1.275-1.678-1.275-1.678-1.042-.712.079-.698.079-.698 1.15.08 1.755 1.18 1.755 1.18 1.025 1.754 2.69 1.247 3.344.953.104-.743.402-1.247.731-1.534-2.553-.29-5.238-1.276-5.238-5.678 0-1.254.448-2.28 1.181-3.084-.118-.289-.512-1.453.112-3.029 0 0 .964-.309 3.16 1.177a10.966 10.966 0 012.88-.387c.976.005 1.96.132 2.88.387 2.195-1.486 3.158-1.177 3.158-1.177.626 1.576.232 2.74.114 3.029.735.804 1.18 1.83 1.18 3.084 0 4.414-2.688 5.384-5.25 5.668.415.356.785 1.06.785 2.137 0 1.543-.014 2.785-.014 3.162 0 .31.207.666.79.553C20.71 21.434 24 17.107 24 12.005 24 5.648 18.852.5 12 .5z" />
                  </svg>
                  <span className="ml-2">GitHub</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
