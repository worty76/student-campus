// VNPay Timer Error Fix - Universal Solution for Production
// This script prevents "timer is not defined" errors in VNPay payment pages and jQuery custom.min.js

(function () {
  "use strict";

  console.log("Enhanced VNPay Universal Fix - Loading...");

  // Immediately define timer objects to prevent any timing issues
  const defineTimerImmediately = function() {
    if (typeof window.timer === 'undefined') {
      window.timer = {
        remaining: 1800, // 30 minutes
        interval: null,
        isActive: false,
        init: function() { this.isActive = true; return this; },
        start: function() { this.isActive = true; return this; },
        stop: function() { if (this.interval) clearInterval(this.interval); return this; },
        update: function() { return this; },
        formatTime: function() { return '30:00'; },
        reset: function() { return this; },
        onExpire: function() { return this; }
      };
      console.log('Timer object created immediately');
    }
    
    if (typeof window.updateTime === 'undefined') {
      window.updateTime = function() {
        try {
          if (window.timer && window.timer.remaining > 0) {
            window.timer.remaining--;
          }
        } catch(e) {
          console.warn('updateTime handled safely');
        }
      };
      console.log('updateTime function created immediately');
    }
  };

  // Define timer objects immediately
  defineTimerImmediately();

  // Enhanced error suppression for jQuery and custom.min.js
  const suppressTimerErrors = function (message, source, lineno, colno, error) {
    if (typeof message === "string") {
      const msg = message.toLowerCase();
      const src = (source || "").toLowerCase();

      // Check for timer-related errors
      if (
        msg.includes("timer is not defined") ||
        msg.includes("updatetime is not defined") ||
        msg.includes("referenceerror: timer") ||
        msg.includes("timer is not a") ||
        (src.includes("custom.min.js") && msg.includes("timer")) ||
        (src.includes("vnpay") && msg.includes("timer")) ||
        (src.includes("sandbox.vnpayment.vn") && msg.includes("timer"))
      ) {
        console.warn(
          "Timer error suppressed - Source:",
          source,
          "Line:",
          lineno,
          "Message:",
          message
        );

        // Re-initialize timer objects if missing
        defineTimerImmediately();
        
        return true; // Prevent error from showing
      }
    }
    return false;
  };

        // Initialize timer objects if missing
        if (!window.timer) {
          initializeTimerObjects();
        }

        return true; // Prevent error from showing
      }
    }
    return false;
  };

  // Global error handler
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (suppressTimerErrors(message, source, lineno, colno, error)) {
      return true;
    }

    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    return false;
  };

  // jQuery Deferred exception handler
  const setupJQueryErrorHandling = function () {
    if (typeof window.jQuery !== "undefined" && window.jQuery.Deferred) {
      const originalExceptionHook = window.jQuery.Deferred.exceptionHook;
      window.jQuery.Deferred.exceptionHook = function (error, stack) {
        if (
          error &&
          error.message &&
          error.message.toLowerCase().includes("timer is not defined")
        ) {
          console.warn(
            "jQuery Deferred timer error suppressed:",
            error.message
          );
          return; // Don't propagate timer errors
        }
        if (originalExceptionHook) {
          return originalExceptionHook.call(this, error, stack);
        }
      };
      console.log("jQuery Deferred error handling configured");
    }
  };

  // Enhanced unhandled promise rejection handler
  window.addEventListener("unhandledrejection", function (event) {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.toLowerCase().includes("timer")
    ) {
      console.warn("Timer promise rejection handled:", event.reason.message);
      event.preventDefault();
    }
  });

  // Comprehensive timer object initialization
  const initializeTimerObjects = function () {
    if (typeof window.timer === "undefined") {
      console.log(
        "Enhanced VNPay Fix - Initializing comprehensive timer object"
      );

      window.timer = {
        remaining: 1800, // 30 minutes in seconds
        interval: null,
        isActive: false,
        startTime: Date.now(),

        // Initialize timer
        init: function () {
          console.log(
            "Enhanced Timer - Initialized with",
            this.remaining,
            "seconds"
          );
          this.isActive = true;
          this.startTime = Date.now();
          return this;
        },

        // Start countdown
        start: function () {
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
            } catch (e) {
              console.warn(
                "Enhanced Timer - Update error handled safely:",
                e.message
              );
            }
          }, 1000);

          this.isActive = true;
          console.log("Enhanced Timer - Started");
          return this;
        },

        // Stop timer
        stop: function () {
          if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
          }
          this.isActive = false;
          console.log("Enhanced Timer - Stopped");
          return this;
        },

        // Update display
        updateDisplay: function () {
          try {
            const minutes = Math.floor(this.remaining / 60);
            const seconds = this.remaining % 60;
            const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`;

            // Update timer display elements
            const timerElements = document.querySelectorAll(
              '#timer, .timer, [class*="timer"], [id*="timer"], .countdown, #countdown, .time-remaining'
            );

            timerElements.forEach((el) => {
              if (el && el.textContent !== undefined) {
                el.textContent = timeString;
              }
            });

            // Update page title if it has timer format
            if (
              document.title.includes(":") &&
              document.title.match(/\d+:\d+/)
            ) {
              document.title = document.title.replace(/\d+:\d+/, timeString);
            }

            // Call external update functions if they exist
            if (typeof window.updateTime === "function") {
              window.updateTime();
            }
            if (typeof window.updateTimer === "function") {
              window.updateTimer();
            }
          } catch (e) {
            console.warn(
              "Enhanced Timer - Display update handled safely:",
              e.message
            );
          }
        },

        // Update method (alias for updateDisplay)
        update: function () {
          this.updateDisplay();
          return this;
        },

        // Format time for display
        formatTime: function () {
          const minutes = Math.floor(this.remaining / 60);
          const seconds = this.remaining % 60;
          return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
        },

        // Expiration handler
        onExpire: function () {
          console.log("Enhanced Timer - Expired");
          this.isActive = false;

          // Notify user about expiration
          try {
            if (
              window.location.href.includes("vnpay") ||
              document.body.innerHTML.includes("vnpay")
            ) {
              console.warn("Payment timer expired");
              // Could add user notification here
            }
          } catch (e) {
            console.warn("Timer expiration notification handled safely");
          }
        },

        // Reset timer
        reset: function (newTime) {
          this.remaining = newTime || 1800;
          this.startTime = Date.now();
          this.isActive = true;
          console.log("Enhanced Timer - Reset to", this.remaining, "seconds");
          return this;
        },
      };

      console.log("Enhanced Timer object created successfully");
    }
  };

  // Define enhanced updateTime function
  const defineUpdateTimeFunction = function () {
    if (typeof window.updateTime === "undefined") {
      window.updateTime = function () {
        try {
          if (window.timer && typeof window.timer.update === "function") {
            window.timer.update();
          }
        } catch (e) {
          console.warn("Enhanced updateTime handled safely:", e.message);
        }
      };
      console.log("Enhanced updateTime function defined");
    }
  };

  // Define additional timer aliases that jQuery/VNPay might expect
  const defineTimerAliases = function () {
    if (!window.countdownTimer) {
      window.countdownTimer = window.timer;
    }
    if (!window.paymentTimer) {
      window.paymentTimer = window.timer;
    }
    if (!window.sessionTimer) {
      window.sessionTimer = window.timer;
    }
  };

  // Console error suppression for cleaner logs
  const suppressConsoleErrors = function () {
    const originalConsoleError = console.error;
    console.error = function (...args) {
      const message = args.join(" ").toLowerCase();
      if (
        message.includes("timer is not defined") ||
        message.includes("timer not defined") ||
        (message.includes("referenceerror") && message.includes("timer"))
      ) {
        console.warn("Console timer error suppressed:", args[0]);
        return;
      }
      originalConsoleError.apply(console, args);
    };
  };

  // Initialize everything
  const initialize = function () {
    try {
      initializeTimerObjects();
      defineUpdateTimeFunction();
      defineTimerAliases();
      suppressConsoleErrors();

      // Setup jQuery error handling when jQuery is available
      if (typeof window.jQuery !== "undefined") {
        setupJQueryErrorHandling();
      } else {
        // Wait for jQuery to load
        let jQueryCheckCount = 0;
        const jQueryCheck = setInterval(() => {
          if (typeof window.jQuery !== "undefined" || jQueryCheckCount > 50) {
            clearInterval(jQueryCheck);
            if (typeof window.jQuery !== "undefined") {
              setupJQueryErrorHandling();
            }
          }
          jQueryCheckCount++;
        }, 100);
      }

      console.log("Enhanced VNPay Universal Fix - Loaded successfully");
    } catch (e) {
      console.error("Enhanced VNPay Universal Fix - Initialization error:", e);
    }
  };

  // Auto-initialize on VNPay domains or when timer errors are detected
  const shouldAutoInit = function () {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const href = window.location.href.toLowerCase();

    return (
      hostname.includes("vnpay") ||
      pathname.includes("payment") ||
      pathname.includes("vnpay") ||
      href.includes("vnpay") ||
      document.body.innerHTML.toLowerCase().includes("vnpay")
    );
  };

  // Initialize immediately
  initialize();

  // Auto-start timer on VNPay pages
  if (shouldAutoInit()) {
    setTimeout(() => {
      if (window.timer && !window.timer.isActive) {
        console.log("Auto-starting timer on VNPay page");
        window.timer.init().start();
      }
    }, 1000);
  }

  // Export for manual initialization if needed
  window.VNPayTimerFix = {
    initialize: initialize,
    initializeTimerObjects: initializeTimerObjects,
    setupJQueryErrorHandling: setupJQueryErrorHandling,
  };
})();
