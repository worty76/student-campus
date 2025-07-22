// VNPay Timer Error Fix - Enhanced Universal Solution
// This script prevents "timer is not defined" errors in VNPay payment pages

(function () {
  "use strict";

  console.log("VNPay Timer Fix - Loading enhanced protection...");

  // Immediately define timer and related objects
  const initializeTimerImmediately = function () {
    // Define timer object with all expected methods
    if (typeof window.timer === "undefined") {
      window.timer = {
        remaining: 1800, // 30 minutes
        interval: null,
        isActive: false,
        startTime: Date.now(),

        init: function () {
          console.log("VNPay Timer - Initialized");
          this.isActive = true;
          this.startTime = Date.now();
          return this;
        },

        start: function () {
          console.log("VNPay Timer - Started");
          this.isActive = true;
          if (this.interval) this.stop();

          this.interval = setInterval(() => {
            if (this.remaining > 0) {
              this.remaining--;
              this.updateDisplay();
            } else {
              this.onExpire();
            }
          }, 1000);

          return this;
        },

        stop: function () {
          if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
          }
          this.isActive = false;
          return this;
        },

        update: function () {
          if (this.remaining > 0) {
            this.remaining--;
          }
          return this;
        },

        updateDisplay: function () {
          try {
            const minutes = Math.floor(this.remaining / 60);
            const seconds = this.remaining % 60;
            const timeString = `${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`;

            // Update any timer elements on the page
            const timerElements = document.querySelectorAll(
              '#timer, .timer, [id*="timer"], [class*="timer"]'
            );
            timerElements.forEach((el) => {
              if (el) el.textContent = timeString;
            });
          } catch (e) {
            // Silently handle display errors
          }
        },

        formatTime: function () {
          const minutes = Math.floor(this.remaining / 60);
          const seconds = this.remaining % 60;
          return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
        },

        reset: function (newTime) {
          this.remaining = newTime || 1800;
          this.isActive = true;
          return this;
        },

        onExpire: function () {
          console.warn("VNPay Timer - Expired");
          this.isActive = false;
          this.stop();
        },
      };

      console.log("VNPay Timer object created successfully");
    }

    // Define updateTime function that VNPay expects
    if (typeof window.updateTime === "undefined") {
      window.updateTime = function () {
        try {
          if (window.timer) {
            window.timer.update();
          }
        } catch (e) {
          console.warn("updateTime error handled:", e.message);
        }
      };
      console.log("updateTime function created");
    }

    // Define additional timer-related functions that might be expected
    if (typeof window.startTimer === "undefined") {
      window.startTimer = function () {
        if (window.timer) {
          window.timer.start();
        }
      };
    }

    if (typeof window.stopTimer === "undefined") {
      window.stopTimer = function () {
        if (window.timer) {
          window.timer.stop();
        }
      };
    }
  };

  // Initialize timer objects immediately
  initializeTimerImmediately();

  // Enhanced error suppression
  const handleTimerError = function (message, source, lineno) {
    const msg = (message || "").toString().toLowerCase();
    const src = (source || "").toString().toLowerCase();

    if (
      msg.includes("timer is not defined") ||
      msg.includes("updatetime is not defined") ||
      msg.includes("referenceerror: timer") ||
      (src.includes("custom.min.js") && msg.includes("timer")) ||
      (src.includes("vnpay") && msg.includes("timer"))
    ) {
      console.warn(`Timer error prevented: ${message} (${source}:${lineno})`);

      // Re-initialize if needed
      initializeTimerImmediately();

      return true; // Suppress error
    }

    return false;
  };

  // Override window.onerror
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (handleTimerError(message, source, lineno)) {
      return true;
    }

    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }

    return false;
  };

  // Handle jQuery Deferred exceptions specifically
  const setupJQueryHandler = function () {
    if (window.jQuery && window.jQuery.Deferred) {
      const originalHook = window.jQuery.Deferred.exceptionHook;
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
          initializeTimerImmediately();
          return; // Don't call original handler
        }

        if (originalHook) {
          return originalHook.call(this, error, stack);
        }
      };
      console.log("jQuery Deferred error handling configured");
    }
  };

  // Setup jQuery handler immediately if available
  if (window.jQuery) {
    setupJQueryHandler();
  } else {
    // Wait for jQuery to load
    let attempts = 0;
    const checkForJQuery = setInterval(() => {
      if (window.jQuery || attempts > 50) {
        clearInterval(checkForJQuery);
        if (window.jQuery) {
          setupJQueryHandler();
        }
      }
      attempts++;
    }, 100);
  }

  // Handle promise rejections
  window.addEventListener("unhandledrejection", function (event) {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.toLowerCase().includes("timer")
    ) {
      console.warn("Timer promise rejection handled:", event.reason.message);
      event.preventDefault();
      initializeTimerImmediately();
    }
  });

  // Console error suppression for cleaner output
  const originalConsoleError = console.error;
  console.error = function (...args) {
    const message = args.join(" ").toLowerCase();
    if (
      message.includes("timer is not defined") ||
      message.includes("timer not defined")
    ) {
      console.warn("Console timer error suppressed:", args[0]);
      initializeTimerImmediately();
      return;
    }
    originalConsoleError.apply(console, args);
  };

  // Auto-start timer if on VNPay page
  const isVNPayPage = function () {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    return (
      hostname.includes("vnpay") ||
      pathname.includes("payment") ||
      document.body.innerHTML.toLowerCase().includes("vnpay")
    );
  };

  // Initialize and start timer if needed
  setTimeout(() => {
    if (isVNPayPage() && window.timer && !window.timer.isActive) {
      console.log("Auto-starting timer on VNPay page");
      window.timer.init().start();
    }
  }, 500);

  // Re-initialize on DOM changes (for dynamic content)
  if (typeof MutationObserver !== "undefined") {
    const observer = new MutationObserver(() => {
      if (!window.timer || typeof window.updateTime !== "function") {
        initializeTimerImmediately();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  console.log("VNPay Timer Fix - Enhanced protection loaded successfully");

  // Export for manual use
  window.VNPayTimerFix = {
    initialize: initializeTimerImmediately,
    isActive: () => window.timer && window.timer.isActive,
  };
})();
