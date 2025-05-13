import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null; // not logged in

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="ml-2 flex items-center gap-2 px-3 py-1 rounded-full
                   bg-indigo-600 text-white hover:bg-indigo-700"
      >
        <span className="font-medium text-sm">
          {user.email.split("@")[0]}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-zinc-800
                        rounded-md shadow-lg ring-1 ring-black/10 z-50">
          <div className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200">
            {user.email}
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-zinc-100
                       dark:hover:bg-zinc-700 dark:text-red-400 text-red-600"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
