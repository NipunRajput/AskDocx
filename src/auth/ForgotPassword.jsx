import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('Failed to send reset email.');
      setSubmitted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-2 text-xl font-bold">AskDocx</span>
        </div>
        <button
          className="ml-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm"
          onClick={() => navigate('/login')}
        >
          Back to Login
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Forgot Password</h2>

            {submitted ? (
              <div className="text-green-400 text-center mb-6">
                ✅ Reset link has been sent to your email!
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Enter your registered email
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 py-3 rounded-md text-white font-medium transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-70"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
