// VNPay Payment Page Component with Timer Error Protection
import { useEffect, useRef } from 'react';

// Type definitions for VNPay timer
interface VNPayTimer {
  remaining: number;
  interval: NodeJS.Timeout | null;
  isActive: boolean;
  init(): VNPayTimer;
  start(): VNPayTimer;
  stop(): VNPayTimer;
  reset(newTime?: number): VNPayTimer;
  updateDisplay(): void;
  formatTime(): string;
  onExpire(): void;
}

// Extend Window interface to include VNPay properties
declare global {
  interface Window {
    timer?: VNPayTimer;
    updateTime?: () => void;
  }
}

interface VNPayPaymentWrapperProps {
  children: React.ReactNode;
  onTimerError?: (error: Error) => void;
  timeoutMinutes?: number;
}

export default function VNPayPaymentWrapper({ 
  children, 
  onTimerError,
  timeoutMinutes = 30 
}: VNPayPaymentWrapperProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    console.log('VNPayPaymentWrapper - Initializing timer protection');

    // Enhanced error handling specifically for VNPay pages
    const handleVNPayError = (error: Error | ErrorEvent): boolean => {
      const message = error.message || error.toString();
      
      if (message.toLowerCase().includes('timer is not defined') ||
          message.toLowerCase().includes('updatetime is not defined')) {
        
        console.warn('VNPay timer error intercepted by wrapper:', message);
        
        // Initialize timer objects if they don't exist
        if (!window.timer) {
          window.timer = {
            remaining: timeoutMinutes * 60,
            interval: null,
            isActive: true,
            
            init(): VNPayTimer {
              console.log('VNPay timer start handled');
              this.isActive = true;
              return this;
            },
            
            start(): VNPayTimer {
              console.log('VNPay timer start handled');
              this.isActive = true;
              return this;
            },
            
            stop(): VNPayTimer {
              console.log('VNPay timer stop handled');
              if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
              }
              this.isActive = false;
              return this;
            },
            
            reset(newTime?: number): VNPayTimer {
              this.remaining = newTime || (timeoutMinutes * 60);
              this.isActive = true;
              return this;
            },
            
            updateDisplay(): void {
              // Safe update implementation
            },
            
            formatTime(): string {
              const minutes = Math.floor(this.remaining / 60);
              const seconds = this.remaining % 60;
              return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            },
            
            onExpire(): void {
              console.log('VNPay timer expired');
              this.isActive = false;
            }
          };
        }

        if (!window.updateTime) {
          window.updateTime = () => {
            try {
              if (window.timer && window.timer.remaining > 0) {
                window.timer.remaining--;
              }
            } catch {
              console.warn('updateTime handled safely');
            }
          };
        }

        // Call error handler if provided
        if (onTimerError) {
          onTimerError(error instanceof Error ? error : new Error(message));
        }
        
        return true; // Prevent default error handling
      }
      
      return false;
    };

    // Set up error listeners
    const errorHandler = (event: ErrorEvent) => {
      handleVNPayError(event);
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof Error) {
        if (handleVNPayError(event.reason)) {
          event.preventDefault();
        }
      }
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    // Initialize VNPay timer protection
    const initVNPayTimer = () => {
      if (!window.timer) {
        window.timer = {
          remaining: timeoutMinutes * 60,
          interval: null,
          isActive: false,
          
          init(): VNPayTimer {
            console.log('VNPay Wrapper - Timer initialized');
            this.isActive = true;
            return this;
          },
          
          start(): VNPayTimer {
            console.log('VNPay Wrapper - Timer started');
            this.isActive = true;
            
            if (this.interval) this.stop();
            
            this.interval = setInterval(() => {
              try {
                if (this.remaining > 0) {
                  this.remaining--;
                  this.updateDisplay();
                } else {
                  this.stop();
                  this.onExpire();
                }
              } catch {
                console.warn('VNPay timer update handled');
              }
            }, 1000);
            
            return this;
          },
          
          stop(): VNPayTimer {
            if (this.interval) {
              clearInterval(this.interval);
              this.interval = null;
            }
            return this;
          },
          
          updateDisplay(): void {
            const minutes = Math.floor(this.remaining / 60);
            const seconds = this.remaining % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update any timer elements
            const timerElements = document.querySelectorAll(
              '#timer, .timer, [class*="timer"], .countdown, #countdown'
            );
            
            timerElements.forEach((el) => {
              if (el instanceof HTMLElement) {
                el.textContent = timeString;
              }
            });
            
            // Update title if it has timer format
            if (document.title.includes(':')) {
              document.title = document.title.replace(/\d+:\d+/, timeString);
            }
          },
          
          formatTime(): string {
            const minutes = Math.floor(this.remaining / 60);
            const seconds = this.remaining % 60;
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          },
          
          reset(newTime?: number): VNPayTimer {
            this.remaining = newTime || (timeoutMinutes * 60);
            this.isActive = true;
            return this;
          },
          
          onExpire(): void {
            console.log('VNPay Wrapper - Timer expired');
            this.isActive = false;
          }
        };
      }

      // Define updateTime function
      if (!window.updateTime) {
        window.updateTime = () => {
          try {
            if (window.timer && window.timer.updateDisplay) {
              window.timer.updateDisplay();
            }
          } catch {
            console.warn('updateTime handled in wrapper');
          }
        };
      }

      // Auto-start timer
      if (window.timer && !timerRef.current) {
        window.timer.init().start();
        timerRef.current = window.timer.interval;
      }
    };

    // Initialize immediately and also on DOM ready
    initVNPayTimer();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initVNPayTimer);
    }

    // Cleanup function
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (window.timer && window.timer.stop) {
        window.timer.stop();
      }
    };
  }, [timeoutMinutes, onTimerError]);

  return <>{children}</>;
}

// Hook for VNPay timer management
export function useVNPayTimer(timeoutMinutes: number = 30) {
  const timerRef = useRef<VNPayTimer | null>(null);

  useEffect(() => {
    const timer = window.timer;
    if (timer) {
      timer.remaining = timeoutMinutes * 60;
      timer.init();
      timerRef.current = timer;
    }

    return () => {
      if (timerRef.current && timerRef.current.stop) {
        timerRef.current.stop();
      }
    };
  }, [timeoutMinutes]);

  const getRemainingTime = (): number => {
    return timerRef.current?.remaining || 0;
  };

  const getFormattedTime = (): string => {
    return timerRef.current?.formatTime() || '00:00';
  };

  const isActive = (): boolean => {
    return timerRef.current?.isActive || false;
  };

  return {
    getRemainingTime,
    getFormattedTime,
    isActive,
    timer: timerRef.current
  };
}
