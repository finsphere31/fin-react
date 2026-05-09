import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

console.log('Mounting App with full UI...');
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log('App mounted');
}
