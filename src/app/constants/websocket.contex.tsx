'use client';
import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import Toast from '@/components/home/toastnoti';

type WebSocketStatus = 'Disconnected' | 'Connecting' | 'Connected' | 'Error' | 'Reconnecting';

interface WebSocketMessage {
  type: 'init' | 'friend_request' | 'message' | 'accept_request' |'deny_request';
  from?: string;
  to?: string;
  message?: string;
  fromName?: string; // Thêm tên người gửi
  reqid?:string;
}

type MessageHandler = (data: WebSocketMessage) => void;

interface ToastData {
  id: string;
  title: string;
  message: string;
  avatar?: string;
  color?: string;
}

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

  // State cho toast notifications
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Hàm thêm toast
  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    // Auto remove toast sau 5 giây
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Hàm remove toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

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
        attemptReconnectInternal();
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
        
        // Xử lý hiển thị toast cho friend request
        if (data.type === 'friend_request' || data.type === 'Friend_request') {
          addToast({
            title: 'Lời mời kết bạn',
            message: `${data.fromName || data.from || 'Ai đó'} đã gửi lời mời kết bạn cho bạn`,
            avatar: '👤',
            color: 'bg-blue-500'
          });
        }
        if (data.type === 'Friend_request_exist' || data.type === 'Friend_request_exist') {
          addToast({
            title: 'Thông báo',
            message: `Đã gửi lời mời kết bạn cho người này`,
            avatar: '👤',
            color: 'bg-blue-500'
          });
        }
        if (data.type === 'accept_request' || data.type === 'accept_request') {
          addToast({
            title: 'Thông Báo',
            message: `${data.fromName || data.from || 'Ai đó'} Đã chấp nhận lời mời kết bạn`,
            avatar: '👤',
            color: 'bg-blue-500'
          });
        }
        


        // Gọi các message handlers
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

    // Inline reconnect logic
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
  }, [addToast]);

  const disconnect = useCallback(() => {
    clearReconnectTimeout();
    userIdRef.current = null;
    reconnectAttemptsRef.current = 0;
    
    if (socketRef.current) {
      socketRef.current.close(1000, 'Manual disconnect');
      socketRef.current = null;
    }
    
    setStatus('Disconnected');
  }, []);

  const sendMessage = useCallback((data: WebSocketMessage): boolean => {
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
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            message={toast.message}
            avatar={toast.avatar}
            color={toast.color}
            onClose={() => removeToast(toast.id)}
            showProgress={true}
          />
        ))}
      </div>
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