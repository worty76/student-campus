// VNPay JavaScript Error Handler
// This script helps handle VNPay's timer error by defining the missing timer variable

(function () {
  "use strict";

  // Check if we're on a VNPay page
  if (
    window.location.hostname.includes("vnpay") ||
    window.location.hostname.includes("sandbox.vnpayment.vn")
  ) {
    // Define missing timer variable that VNPay's JavaScript expects
    if (typeof window.timer === "undefined") {
      window.timer = null;
      console.log("VNPay timer variable initialized");
    }

    // Define updateTime function if it's missing
    if (typeof window.updateTime === "undefined") {
      window.updateTime = function () {
        // Stub function to prevent errors
        console.log("VNPay updateTime function called");
      };
    }

    // Catch and handle timer-related errors
    window.addEventListener("error", function (event) {
      if (event.message && event.message.includes("timer is not defined")) {
        console.warn("VNPay timer error caught and handled");
        event.preventDefault();
        return false;
      }
    });

    console.log("VNPay error handler initialized");
  }
})();
