import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './layout/ThemeContext';
const root=createRoot(document.getElementById('root'));


root.render(
    <ThemeProvider>
    <App />
    </ThemeProvider>
);
