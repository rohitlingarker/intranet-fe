import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import  WebSocketProvider  from "./pages/leave_management/websockets/WebSocketProvider.jsx";
import './index.css';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  // {/* </StrictMode> */}
);
  