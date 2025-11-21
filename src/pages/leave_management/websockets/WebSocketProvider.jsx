import React, { createContext, useContext, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";

const WebSocketContext = createContext(null);
export const useWebSocket = () => useContext(WebSocketContext);

export default function WebSocketProvider({ children }) {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const stompClientRef = useRef(null);
  const listeners = useRef({});

  // ⛔ prevent rapid repeat WebSocket events
  const lastEventTime = useRef(0);

  const subscribe = (event, callback) => {
    if (!listeners.current[event]) listeners.current[event] = [];
    listeners.current[event].push(callback);

    return () => {
      listeners.current[event] = listeners.current[event].filter(
        (cb) => cb !== callback
      );
    };
  };

  const emitEvent = (event, payload) => {
    const now = Date.now();
    if (now - lastEventTime.current < 500) {
      console.warn("⚠ Ignored duplicate WS event");
      return;
    }
    lastEventTime.current = now;

    (listeners.current[event] || []).forEach((cb) => cb(payload));
  };

  useEffect(() => {
    const socket = new SockJS(`${BASE_URL}/ws`);
    const stomp = over(socket);
    stompClientRef.current = stomp;

    stomp.connect(
      {},
      () => {
        stomp.subscribe("/topic/data-updated", (msg) => {
          emitEvent("data-updated", msg.body);
        });
        stomp.subscribe("/topic/leave-updated", (msg) => {
          emitEvent("leave-updated", msg.body);
        });
      },
      (err) => console.error("WS error", err)
    );

    return () => {
      if (stomp.connected) stomp.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}
