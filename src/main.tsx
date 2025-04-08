
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Get the root element to mount the React app
const rootElement = document.getElementById("root");

// Make sure the element exists before rendering
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found! Make sure there is a div with id='root' in index.html");
}
