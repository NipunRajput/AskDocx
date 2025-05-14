// // GithubCallback.jsx (very brief)
// import { useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';

// export default function GithubCallback() {
//   const navigate = useNavigate();
//   const { search } = useLocation();
//   useEffect(() => {
//     const code = new URLSearchParams(search).get('code');
//     if (!code) return navigate('/login', { replace: true });
//     fetch(`http://localhost:5000/api/auth/github/callback`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ code })
//     })
//       .then(r => r.json())
//       .then(({ token }) => {
//         // save your own JWT / session cookie
//         navigate('/', { replace: true });
//       })
//       .catch(() => navigate('/login'));
//   }, [search, navigate]);

//   return <p className="text-center text-white">Signing in…</p>;
// }
