// Layout Timer Protection - Consolidated Script
(function () {
  "use strict";

  console.log("Layout Timer Protection - Initializing...");

  // IMMEDIATE timer object definition
  if (!window.timer) {
    console.log("Layout - Creating timer object immediately");
    window.timer = {
      remaining: 1800, // 30 minutes
      interval: null,
      isActive: false,
      startTime: Date.now(),

      init: function () {
        console.log("Layout timer init");
        this.isActive = true;
        this.startTime = Date.now();
        return this;
      },
      start: function () {
        console.log("Layout timer start");
        this.isActive = true;
        if (this.interval) this.stop();
        this.interval = setInterval(() => {
          if (this.remaining > 0) {
            this.remaining--;
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
        if (this.remaining > 0) this.remaining--;
        return this;
      },
      reset: function (newTime) {
        this.remaining = newTime || 1800;
        this.startTime = Date.now();
        this.isActive = true;
        return this;
      },
      updateDisplay: function () {
        try {
          const minutes = Math.floor(this.remaining / 60);
          const seconds = this.remaining % 60;
          const timeString =
            minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

          const elements = document.querySelectorAll(
            '#timer, .timer, [id*="timer"]'
          );
          elements.forEach(function (el) {
            if (el) el.textContent = timeString;
          });
        } catch (err) {
          // Silently handle errors
        }
      },
      formatTime: function () {
        const m = Math.floor(this.remaining / 60);
        const s = this.remaining % 60;
        return m + ":" + (s < 10 ? "0" : "") + s;
      },
      onExpire: function () {
        console.warn("Layout timer expired");
        this.isActive = false;
        this.stop();
      },
    };

    // Make it non-configurable to prevent overwrites
    Object.defineProperty(window, "timer", {
      value: window.timer,
      writable: false,
      configurable: false,
    });
  }

  // IMMEDIATE updateTime function
  if (!window.updateTime) {
    console.log("Layout - Creating updateTime function");
    window.updateTime = function () {
      try {
        if (window.timer && typeof window.timer.update === "function") {
          window.timer.update();
        }
      } catch (err) {
        console.warn("updateTime handled safely");
      }
    };

    Object.defineProperty(window, "updateTime", {
      value: window.updateTime,
      writable: false,
      configurable: false,
    });
  }

  // AGGRESSIVE error suppression
  const originalError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (typeof message === "string") {
      const msg = message.toLowerCase();
      if (
        msg.includes("timer is not defined") ||
        msg.includes("updatetime") ||
        msg.includes("referenceerror: timer") ||
        msg.includes("timer is not a") ||
        (source &&
          source.includes("custom.min.js") &&
          msg.includes("timer")) ||
        (source && source.includes("vnpay") && msg.includes("timer"))
      ) {
        console.warn(
          "Layout timer error prevented:",
          message,
          "Source:",
          source,
          "Line:",
          lineno
        );

        // Re-create timer if missing
        if (!window.timer) {
          window.timer = {
            remaining: 1800,
            interval: null,
            isActive: false,
            init: function () {
              this.isActive = true;
              return this;
            },
            start: function () {
              this.isActive = true;
              return this;
            },
            stop: function () {
              if (this.interval) clearInterval(this.interval);
              return this;
            },
            update: function () {
              return this;
            },
            formatTime: function () {
              return "30:00";
            },
          };
        }

        return true; // Prevent error from showing
      }
    }
    return originalError ? originalError.apply(this, arguments) : false;
  };

  // jQuery Deferred error suppression
  const handleJQueryErrors = function () {
    if (window.jQuery && window.jQuery.Deferred) {
      const originalHook = window.jQuery.Deferred.exceptionHook;
      window.jQuery.Deferred.exceptionHook = function (error, stack) {
        if (
          error &&
          error.message &&
          error.message.toLowerCase().includes("timer is not defined")
        ) {
          console.warn(
            "Layout jQuery Deferred timer error suppressed:",
            error.message
          );
          return; // Don't propagate timer errors
        }
        if (originalHook) {
          return originalHook.call(this, error, stack);
        }
      };
      console.log("Layout jQuery Deferred protection active");
    }
  };

  // Handle jQuery immediately or when loaded
  if (window.jQuery) {
    handleJQueryErrors();
  } else {
    // Monitor for jQuery loading
    let checkCount = 0;
    const checkJQuery = setInterval(function () {
      if (window.jQuery || checkCount > 50) {
        clearInterval(checkJQuery);
        if (window.jQuery) {
          handleJQueryErrors();
        }
      }
      checkCount++;
    }, 100);
  }

  // Promise rejection handler
  window.addEventListener("unhandledrejection", function (event) {
    if (
      event.reason &&
      event.reason.message &&
      event.reason.message.toLowerCase().includes("timer")
    ) {
      console.warn(
        "Layout timer promise rejection handled:",
        event.reason.message
      );
      event.preventDefault();
    }
  });

  console.log("Layout Timer Protection - Ready with enhanced protection");
})();
