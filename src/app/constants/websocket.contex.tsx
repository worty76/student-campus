'use client';
import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

type WebSocketStatus = 'Disconnected' | 'Connecting' | 'Connected' | 'Error' | 'Reconnecting';

interface WebSocketMessage {
  type: 'init' | 'friend_request' | 'message';
  from?: string;
  to?: string;
}

type MessageHandler = (data: WebSocketMessage) => void;

interface WebSocketContextType {
  socket: WebSocket | null;
  status: WebSocketStatus;
  connectWebSocket: (userId: string) => void;
  disconnect: () => void;
  sendMessage: (data: WebSocketMessage) => boolean;
  addMessageHandler: (handler: MessageHandler) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('Disconnected');
  const messageHandlersRef = useRef<Set<MessageHandler>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

 const connectWebSocket = useCallback((userId: string) => {
  clearReconnectTimeout();
  userIdRef.current = userId;

  if (socketRef.current) {
    socketRef.current.close();
  }

  setStatus('Connecting');

  const socket = new WebSocket('ws://localhost:3001');
  socketRef.current = socket;

  socket.onopen = () => {
    console.log('WebSocket connected');
    setStatus('Connected');
    reconnectAttemptsRef.current = 0;

    socket.send(JSON.stringify({ type: 'init', id: userId }));
  };

  socket.onclose = (event) => {
    console.log('WebSocket closed:', event.code, event.reason);
    socketRef.current = null;

    if (event.code !== 1000 && userIdRef.current) {
      attemptReconnectInternal(); // gọi nội bộ
    } else {
      setStatus('Disconnected');
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
    setStatus('Error');
  };

  socket.onmessage = (event) => {
    console.log('[Socket Message]', event.data);
    try {
      const data = JSON.parse(event.data);
      messageHandlersRef.current.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error('Error in message handler:', err);
        }
      });
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  };

  // Inline reconnect logic to avoid circular dependency
  function attemptReconnectInternal() {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      setStatus('Error');
      return;
    }

    setStatus('Reconnecting');
    reconnectAttemptsRef.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      if (userIdRef.current) {
        console.log(`Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
        connectWebSocket(userIdRef.current);
      }
    }, reconnectDelay);
  }
}, []);

  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    userIdRef.current = null;
    reconnectAttemptsRef.current = 0;
    
    if (socketRef.current) {
      socketRef.current.close(1000, 'Manual disconnect'); // Normal closure
      socketRef.current = null;
    }
    
    setStatus('Disconnected');
  }, []);

  const sendMessage = useCallback((data:WebSocketMessage ): boolean => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        return false;
      }
    }
    
    console.warn('WebSocket not connected, message not sent:', data);
    return false;
  }, []);

  const addMessageHandler = useCallback((handler: MessageHandler) => {
    messageHandlersRef.current.add(handler);
    
    // Return cleanup function
    return () => {
      messageHandlersRef.current.delete(handler);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearReconnectTimeout();
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const contextValue: WebSocketContextType = {
  socket: socketRef.current,
  status,
  connectWebSocket,
  disconnect,
  sendMessage,
  addMessageHandler,
};
    useEffect(() => {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        connectWebSocket(storedUserId);
      }
    }, [connectWebSocket]);
  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
  
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};