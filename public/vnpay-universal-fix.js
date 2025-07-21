// VNPay Timer Error Fix - Universal Solution
// This script gets injected into any page that references VNPay

(function () {
  "use strict";

  // Check if we're on a VNPay domain or page that loads VNPay resources
  const isVNPayRelated =
    window.location.hostname.includes("vnpay") ||
    document.documentElement.outerHTML.includes("vnpay") ||
    document.documentElement.outerHTML.includes("VNPay");

  if (!isVNPayRelated) {
    return; // Only run on VNPay-related pages
  }

  // Override console.error to filter out VNPay timer errors
  const originalError = console.error;
  console.error = function (...args) {
    const message = args.join(" ").toLowerCase();
    if (
      message.includes("timer is not defined") ||
      message.includes("updatetime") ||
      message.includes("custom.min.js")
    ) {
      console.warn("VNPay timer error suppressed:", ...args);
      return;
    }
    originalError.apply(console, args);
  };

  // Define missing variables before VNPay scripts load
  Object.defineProperty(window, "timer", {
    value: {
      remaining: 900, // 15 minutes
      interval: null,
      start: function () {
        if (!this.interval && typeof this.update === "function") {
          this.interval = setInterval(() => {
            try {
              this.update();
            } catch (e) {
              console.warn("Timer update handled safely");
            }
          }, 1000);
        }
      },
      stop: function () {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
      },
      update: function () {
        if (this.remaining > 0) {
          this.remaining--;
          // Try to update timer display
          const timerElements = document.querySelectorAll(
            '#timer, .timer, [class*="timer"], [id*="timer"]'
          );
          timerElements.forEach((el) => {
            if (el && this.remaining >= 0) {
              const minutes = Math.floor(this.remaining / 60);
              const seconds = this.remaining % 60;
              el.textContent = `${minutes}:${seconds
                .toString()
                .padStart(2, "0")}`;
            }
          });
        }
      },
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
