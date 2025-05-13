import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './layout/ThemeContext';
import AuthProvider from './auth/AuthContext.jsx'
const root=createRoot(document.getElementById('root'));


root.render(
    <ThemeProvider>
        <AuthProvider>
            <App />
        </AuthProvider>
    </ThemeProvider>
);
