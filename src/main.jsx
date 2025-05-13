import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from './layout/ThemeContext';
import AuthProvider from "./auth/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
        <ThemeProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeProvider>
  </React.StrictMode>
);
