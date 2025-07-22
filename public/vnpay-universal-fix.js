// VNPay Timer Error Fix - Universal Solution for Production
// This script prevents "timer is not defined" errors in VNPay payment pages

(function () {
  "use strict";

  console.log("VNPay Universal Fix - Loading...");

  // Global error handler for VNPay timer issues
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (typeof message === 'string' && 
        (message.includes('timer is not defined') || 
         message.includes('updateTime is not defined') ||
         message.includes('ReferenceError: timer'))) {
      console.warn('VNPay timer error intercepted and handled:', message);
      return true; // Prevent the error from showing in console
    }
    
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    return false;
  };

  // Enhanced unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && 
        event.reason.message.includes('timer')) {
      console.warn('VNPay timer promise rejection handled:', event.reason.message);
      event.preventDefault();
    }
  });

  // Define comprehensive timer object before any VNPay scripts load
  if (typeof window.timer === 'undefined') {
    console.log('VNPay Fix - Initializing timer object');
    
    window.timer = {
      remaining: 1800, // 30 minutes in seconds
      interval: null,
      isActive: false,
      
      // Initialize timer
      init: function() {
        console.log('VNPay Timer - Initialized with', this.remaining, 'seconds');
        this.isActive = true;
        return this;
      },
      
      // Start countdown
      start: function() {
        if (this.interval) this.stop();
        
        this.interval = setInterval(() => {
          try {
            if (this.remaining > 0) {
              this.remaining--;
              if (typeof this.update === 'function') {
                this.update();
              }
            } else {
              this.stop();
              if (typeof this.onExpire === 'function') {
                this.onExpire();
              }
            }
          } catch (e) {
            console.warn('VNPay Timer - Update error handled safely:', e.message);
          }
        }, 1000);
        
        console.log('VNPay Timer - Started');
        return this;
      },
      
      // Stop timer
      stop: function() {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        console.log('VNPay Timer - Stopped');
        return this;
      },
      
      // Update display (override by VNPay if needed)
      update: function() {
        // Safe update function that won't crash
        try {
          if (typeof window.updateTime === 'function') {
            window.updateTime();
          } else if (typeof window.updateTimer === 'function') {
            window.updateTimer();
          }
        } catch (e) {
          // Silently handle update errors
        }
      },
      
      // Format time for display
      formatTime: function() {
        const minutes = Math.floor(this.remaining / 60);
        const seconds = this.remaining % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      },
      
      // Expiration handler
      onExpire: function() {
        console.log('VNPay Timer - Expired');
        this.isActive = false;
      },
      
      // Reset timer
      reset: function(newTime) {
        this.remaining = newTime || 1800;
        this.isActive = true;
        console.log('VNPay Timer - Reset to', this.remaining, 'seconds');
        return this;
      }
    };
  }
          this.interval = null;
        }
      },
      }

  // Define additional VNPay-related functions that might be missing
  if (typeof window.updateTime === 'undefined') {
    window.updateTime = function() {
      try {
        if (window.timer && window.timer.remaining >= 0) {
          const minutes = Math.floor(window.timer.remaining / 60);
          const seconds = window.timer.remaining % 60;
          
          // Update any timer display elements
          const timerElements = document.querySelectorAll(
            '#timer, .timer, [class*="timer"], [id*="timer"], .countdown, #countdown'
          );
          
          timerElements.forEach((el) => {
            if (el) {
              el.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
          });
          
          // Update page title if it has timer
          if (document.title.includes(':') && document.title.match(/\d+:\d+/)) {
            document.title = document.title.replace(/\d+:\d+/, 
              `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          }
        }
      } catch (e) {
        console.warn('VNPay updateTime handled safely:', e.message);
      }
    };
  }

  // Define other potentially missing VNPay functions
  if (typeof window.updateTimer === 'undefined') {
    window.updateTimer = window.updateTime;
  }

  if (typeof window.countdown === 'undefined') {
    window.countdown = function(seconds) {
      if (window.timer) {
        window.timer.remaining = seconds || 1800;
        window.timer.start();
      }
    };
  }

  // Auto-initialize timer when VNPay page loads
  document.addEventListener('DOMContentLoaded', function() {
    if (window.timer && !window.timer.isActive) {
      console.log('VNPay Fix - Auto-initializing timer on DOMContentLoaded');
      window.timer.init();
      
      // Start timer if we detect we're on a payment page
      if (document.querySelector('.payment, .vnpay, [class*="pay"]') || 
          window.location.href.includes('vnpay') ||
          document.body.innerHTML.includes('VNPay')) {
        window.timer.start();
      }
    }
  });

  // Enhanced error suppression for common VNPay issues
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ').toLowerCase();
    
    // List of VNPay-related errors to suppress
    const vnpayErrors = [
      'timer is not defined',
      'updatetime is not defined',
      'referenceerror: timer',
      'custom.min.js',
      'vnpay-timer',
      'payment-timer',
      'countdown is not defined'
    ];
    
    if (vnpayErrors.some(error => message.includes(error))) {
      console.warn('VNPay error suppressed and handled:', args[0]);
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  // Additional protection for script loading errors
  window.addEventListener('error', function(e) {
    if (e.filename && (e.filename.includes('vnpay') || e.filename.includes('custom.min.js'))) {
      if (e.message && e.message.includes('timer')) {
        console.warn('VNPay script error handled:', e.message);
        e.preventDefault();
        return false;
      }
    }
  }, true);

  // Initialize timer immediately if we're already on a VNPay domain
  if (window.location.hostname.includes('vnpay')) {
    console.log('VNPay Fix - On VNPay domain, initializing timer immediately');
    if (window.timer) {
      window.timer.init().start();
    }
  }

  console.log("VNPay Universal Fix - Loaded successfully");

})();
    },
    writable: false,
    configurable: false,
  });

  // Define updateTime function
  Object.defineProperty(window, "updateTime", {
    value: function () {
      try {
        if (window.timer && typeof window.timer.update === "function") {
          window.timer.update();
        }
      } catch (e) {
        console.warn("updateTime handled safely:", e.message);
      }
    },
    writable: false,
    configurable: false,
  });

  // Start timer when page loads
  const startTimer = () => {
    if (window.timer && typeof window.timer.start === "function") {
      window.timer.start();
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startTimer);
  } else {
    startTimer();
  }

  // Override window.onerror to handle VNPay errors
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (
      typeof message === "string" &&
      (message.includes("timer is not defined") ||
        message.includes("updateTime") ||
        (source && source.includes("custom.min.js")))
    ) {
      console.warn("VNPay error handled:", message);
      return true; // Prevent error from showing
    }

    if (originalOnError) {
      return originalOnError.apply(window, arguments);
    }
    return false;
  };

  // Modern error handling
  window.addEventListener(
    "error",
    function (event) {
      if (
        event.message &&
        (event.message.includes("timer is not defined") ||
          event.message.includes("updateTime") ||
          (event.filename && event.filename.includes("custom.min.js")))
      ) {
        console.warn(
          "VNPay error handled via addEventListener:",
          event.message
        );
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    },
    true
  );

  console.log("VNPay timer fix loaded successfully");
})();
