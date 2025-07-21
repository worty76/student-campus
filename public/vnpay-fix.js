// VNPay JavaScript Fix
// This script fixes the "timer is not defined" error in VNPay's payment page
// by defining the missing variables before VNPay's scripts load

(function () {
  "use strict";

  // Define missing timer variable that VNPay's JavaScript expects
  if (typeof window.timer === "undefined") {
    window.timer = null;
  }

  // Define updateTime function if missing
  if (typeof window.updateTime === "undefined") {
    window.updateTime = function () {
      // VNPay's updateTime function implementation
      try {
        // Check if timer exists and is valid
        if (window.timer && typeof window.timer === "object") {
          // Update timer display logic here
          const timeElement = document.querySelector(
            '#timer, .timer, [id*="timer"]'
          );
          if (timeElement) {
            // Update the timer element if found
            const remainingTime = window.timer.remaining || 900; // 15 minutes default
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            timeElement.textContent = `${minutes}:${seconds
              .toString()
              .padStart(2, "0")}`;

            // Decrease remaining time
            if (window.timer.remaining > 0) {
              window.timer.remaining--;
            }
          }
        }
      } catch (error) {
        console.warn("Timer update error (safe to ignore):", error.message);
      }
    };
  }

  // Initialize timer object with default values
  if (!window.timer) {
    window.timer = {
      remaining: 900, // 15 minutes in seconds
      interval: null,
      start: function () {
        if (!this.interval) {
          this.interval = setInterval(() => {
            if (typeof window.updateTime === "function") {
              window.updateTime();
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
    };
  }

  // Auto-start timer when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.timer && typeof window.timer.start === "function") {
        window.timer.start();
      }
    });
  } else {
    // Page already loaded
    if (window.timer && typeof window.timer.start === "function") {
      window.timer.start();
    }
  }

  console.log("VNPay JavaScript fix applied successfully");
})();
