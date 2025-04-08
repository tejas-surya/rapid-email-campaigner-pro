
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
  // Get the root element to mount the React app
  const rootElement = document.getElementById("root");

  // Make sure the element exists before rendering
  if (rootElement) {
    try {
      createRoot(rootElement).render(<App />);
      console.log("App successfully rendered");
    } catch (error) {
      console.error("Failed to render App:", error);
    }
  } else {
    console.error("Root element not found! Make sure there is a div with id='root' in index.html");
  }
});
