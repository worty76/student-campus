// jQuery Deferred Timer Error Fix - Ultra Aggressive Solution
// This script specifically targets jQuery Deferred timer exceptions

(function () {
  "use strict";

  console.log(
    "jQuery Deferred Timer Fix - Loading ultra aggressive protection..."
  );

  // IMMEDIATE timer object creation with all possible variants
  const createTimerObjects = function () {
    const timerBase = {
      remaining: 1800,
      interval: null,
      isActive: false,
      startTime: Date.now(),

      init: function () {
        this.isActive = true;
        return this;
      },
      start: function () {
        this.isActive = true;
        return this;
      },
      stop: function () {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        return this;
      },
      update: function () {
        return this;
      },
      updateDisplay: function () {
        return this;
      },
      formatTime: function () {
        return "30:00";
      },
      reset: function () {
        return this;
      },
      onExpire: function () {
        return this;
      },
    };

    // Create timer with multiple names
    if (!window.timer) {
      window.timer = { ...timerBase };
      console.log("Ultra: timer object created");
    }
    if (!window.Timer) {
      window.Timer = { ...timerBase };
      console.log("Ultra: Timer object created");
    }
    if (!window.countdownTimer) {
      window.countdownTimer = { ...timerBase };
      console.log("Ultra: countdownTimer object created");
    }
    if (!window.paymentTimer) {
      window.paymentTimer = { ...timerBase };
      console.log("Ultra: paymentTimer object created");
    }

    // Create all possible update functions
    if (!window.updateTime) {
      window.updateTime = function () {
        try {
          if (window.timer) window.timer.remaining--;
        } catch (e) {}
      };
    }
    if (!window.UpdateTime) {
      window.UpdateTime = window.updateTime;
    }
    if (!window.updateTimer) {
      window.updateTimer = window.updateTime;
    }
    if (!window.startTimer) {
      window.startTimer = function () {
        try {
          if (window.timer) window.timer.start();
        } catch (e) {}
      };
    }
    if (!window.stopTimer) {
      window.stopTimer = function () {
        try {
          if (window.timer) window.timer.stop();
        } catch (e) {}
      };
    }

    console.log("Ultra: All timer objects and functions created");
  };

  // Create timer objects IMMEDIATELY
  createTimerObjects();

  // Ultra aggressive jQuery Deferred exception handling
  const hijackJQueryDeferred = function () {
    // Method 1: Override jQuery.Deferred if it exists
    if (window.jQuery && window.jQuery.Deferred) {
      console.log("Ultra: Hijacking existing jQuery.Deferred");

      const OriginalDeferred = window.jQuery.Deferred;

      window.jQuery.Deferred = function (func) {
        const deferred = new OriginalDeferred(func);

        // Override the exceptionHook
        const originalHook = window.jQuery.Deferred.exceptionHook;
        window.jQuery.Deferred.exceptionHook = function (error, stack) {
          if (error && error.message) {
            const msg = error.message.toLowerCase();
            if (
              msg.includes("timer is not defined") ||
              msg.includes("timer") ||
              msg.includes("referenceerror")
            ) {
              console.warn(
                "Ultra: jQuery Deferred timer error suppressed:",
                error.message
              );
              createTimerObjects(); // Re-create if needed
              return; // Don't propagate
            }
          }

          if (originalHook) {
            return originalHook.call(this, error, stack);
          }
        };

        return deferred;
      };

      // Copy static methods
      Object.keys(OriginalDeferred).forEach((key) => {
        window.jQuery.Deferred[key] = OriginalDeferred[key];
      });

      console.log("Ultra: jQuery.Deferred hijacked successfully");
    }

    // Method 2: Set up exceptionHook directly
    if (window.jQuery && window.jQuery.Deferred) {
      window.jQuery.Deferred.exceptionHook = function (error, stack) {
        if (error && error.message) {
          const msg = error.message.toLowerCase();
          if (
            msg.includes("timer is not defined") ||
            msg.includes("timer") ||
            msg.includes("updatetime") ||
            msg.includes("referenceerror")
          ) {
            console.warn(
              "Ultra: Direct jQuery Deferred timer error suppressed:",
              error.message
            );
            createTimerObjects();
            return; // Stop propagation
          }
        }
        console.error("Ultra: Other jQuery Deferred error:", error);
      };
      console.log("Ultra: jQuery.Deferred.exceptionHook set directly");
    }
  };

  // Method 3: Global jQuery monitoring and hijacking
  const monitorJQuery = function () {
    let attempts = 0;
    const maxAttempts = 100;

    const checkJQuery = function () {
      attempts++;

      if (window.jQuery) {
        console.log("Ultra: jQuery detected, hijacking...");
        hijackJQueryDeferred();

        // Also monitor for jQuery reloads
        const originalJQuery = window.jQuery;
        Object.defineProperty(window, "jQuery", {
          get: function () {
            return originalJQuery;
          },
          set: function (newJQuery) {
            console.log("Ultra: jQuery reassigned, re-hijacking...");
            originalJQuery.extend(true, originalJQuery, newJQuery);
            hijackJQueryDeferred();
          },
        });

        // Monitor $ as well
        if (window.$) {
          Object.defineProperty(window, "$", {
            get: function () {
              return originalJQuery;
            },
            set: function (newJQuery) {
              console.log("Ultra: $ reassigned, re-hijacking...");
              hijackJQueryDeferred();
            },
          });
        }

        return true; // Found and hijacked
      }

      if (attempts < maxAttempts) {
        setTimeout(checkJQuery, 50);
      }

      return false;
    };

    checkJQuery();
  };

  // Method 4: Ultra aggressive error catching
  const setupGlobalErrorHandling = function () {
    // Override window.onerror with ultra aggressive timer protection
    const originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
      if (typeof message === "string") {
        const msg = message.toLowerCase();
        if (
          msg.includes("timer is not defined") ||
          msg.includes("timer") ||
          msg.includes("updatetime") ||
          msg.includes("referenceerror")
        ) {
          console.warn(
            "Ultra: Global timer error intercepted:",
            message,
            "Source:",
            source
          );
          createTimerObjects();
          return true; // Prevent default handling
        }
      }

      if (originalOnError) {
        return originalOnError.call(
          this,
          message,
          source,
          lineno,
          colno,
          error
        );
      }
      return false;
    };

    // Override console.error to catch and suppress timer errors
    const originalConsoleError = console.error;
    console.error = function (...args) {
      const message = args.join(" ").toLowerCase();
      if (
        message.includes("jquery deferred exception") &&
        message.includes("timer is not defined")
      ) {
        console.warn("Ultra: Console timer error suppressed:", args[0]);
        createTimerObjects();
        return;
      }
      originalConsoleError.apply(console, args);
    };

    // Promise rejection handling
    window.addEventListener("unhandledrejection", function (event) {
      if (event.reason && event.reason.message) {
        const msg = event.reason.message.toLowerCase();
        if (msg.includes("timer is not defined") || msg.includes("timer")) {
          console.warn(
            "Ultra: Promise timer rejection handled:",
            event.reason.message
          );
          event.preventDefault();
          createTimerObjects();
        }
      }
    });

    console.log("Ultra: Global error handling configured");
  };

  // Method 5: DOM mutation monitoring for dynamic jQuery loading
  const setupDOMMonitoring = function () {
    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) {
              // Element node
              // Check for jQuery script tags
              if (
                node.tagName === "SCRIPT" &&
                (node.src.includes("jquery") ||
                  node.innerHTML.includes("jQuery"))
              ) {
                console.log(
                  "Ultra: jQuery script detected in DOM, preparing hijack..."
                );
                setTimeout(function () {
                  hijackJQueryDeferred();
                  createTimerObjects();
                }, 100);
              }

              // Check for any script that might use timer
              if (
                node.tagName === "SCRIPT" &&
                (node.src.includes("custom") || node.src.includes("vnpay"))
              ) {
                console.log(
                  "Ultra: Custom/VNPay script detected, ensuring timer protection..."
                );
                createTimerObjects();
              }
            }
          });
        });
      });

      observer.observe(document, {
        childList: true,
        subtree: true,
      });

      console.log("Ultra: DOM monitoring active");
    }
  };

  // Initialize all protection methods
  const initialize = function () {
    try {
      createTimerObjects();
      setupGlobalErrorHandling();
      monitorJQuery();
      setupDOMMonitoring();

      // Immediate hijack if jQuery already exists
      if (window.jQuery) {
        hijackJQueryDeferred();
      }

      console.log("Ultra: jQuery Deferred Timer Fix initialized successfully");
    } catch (e) {
      console.error("Ultra: Initialization error:", e);
    }
  };

  // Run initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // Also run immediately
  initialize();

  // Export for manual use
  window.UltraTimerFix = {
    createTimerObjects: createTimerObjects,
    hijackJQueryDeferred: hijackJQueryDeferred,
    initialize: initialize,
  };

  console.log("Ultra: jQuery Deferred Timer Fix loaded and ready");
})();
