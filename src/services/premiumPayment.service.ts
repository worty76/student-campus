/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASEURL } from "../app/constants/url";
import {
  PremiumPurchaseRequest,
  PremiumPurchaseResponse,
  PremiumStatus,
  PremiumPaymentError,
} from "../types/premium.types";

class PremiumPaymentService {
  private readonly API_BASE_URL = BASEURL;

  /**
   * Initialize comprehensive VNPay timer protection before payment redirect
   */
  private static initializeVNPayProtection(): void {
    console.log(
      "PremiumPaymentService - Initializing comprehensive VNPay timer protection"
    );

    if (typeof window !== "undefined") {
      // Create comprehensive timer object
      if (!(window as any).timer) {
        (window as any).timer = {
          remaining: 1800, // 30 minutes
          interval: null,
          isActive: false,
          startTime: Date.now(),

          init: function () {
            console.log("Service timer init");
            this.isActive = true;
            this.startTime = Date.now();
            return this;
          },
          start: function () {
            console.log("Service timer start");
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
              const timeString =
                minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

              const elements = document.querySelectorAll(
                '#timer, .timer, [id*="timer"], [class*="timer"]'
              );
              elements.forEach((el: any) => {
                if (el) el.textContent = timeString;
              });
            } catch (e) {
              // Handle silently
            }
          },
          formatTime: function () {
            const m = Math.floor(this.remaining / 60);
            const s = this.remaining % 60;
            return m + ":" + (s < 10 ? "0" : "") + s;
          },
          reset: function (newTime: number) {
            this.remaining = newTime || 1800;
            this.isActive = true;
            return this;
          },
          onExpire: function () {
            console.warn("Service timer expired");
            this.isActive = false;
            this.stop();
          },
        };

        console.log("Service timer object created");
      }

      // Create updateTime function
      if (!(window as any).updateTime) {
        (window as any).updateTime = function () {
          try {
            if (
              (window as any).timer &&
              typeof (window as any).timer.update === "function"
            ) {
              (window as any).timer.update();
            }
          } catch (e) {
            console.warn("Service updateTime handled safely");
          }
        };

        console.log("Service updateTime function created");
      }

      // Create additional timer functions that VNPay might expect
      if (!(window as any).startTimer) {
        (window as any).startTimer = function () {
          if ((window as any).timer) {
            (window as any).timer.start();
          }
        };
      }

      if (!(window as any).stopTimer) {
        (window as any).stopTimer = function () {
          if ((window as any).timer) {
            (window as any).timer.stop();
          }
        };
      }

      // Enhanced error handling for VNPay redirect
      const originalOnError = window.onerror;
      window.onerror = function (message, source, lineno, colno, error) {
        if (typeof message === "string") {
          const msg = message.toLowerCase();
          if (
            msg.includes("timer is not defined") ||
            msg.includes("updatetime is not defined") ||
            msg.includes("referenceerror: timer")
          ) {
            console.warn("Service prevented timer error:", message);

            // Re-initialize if needed
            PremiumPaymentService.initializeVNPayProtection();
            return true;
          }
        }

        return originalOnError
          ? originalOnError.call(this, message, source, lineno, colno, error)
          : false;
      };

      console.log("Service VNPay protection initialized successfully");
    }
  }

  /**
   * Redirect to VNPay with timer protection
   */
  private static redirectToVNPayWithProtection(paymentUrl: string): void {
    console.log("Redirecting to VNPay with timer protection");

    // Initialize protection before redirect
    this.initializeVNPayProtection();

    // Add error handler for the redirect
    const handleRedirectError = (error: ErrorEvent) => {
      if (error.message && error.message.toLowerCase().includes("timer")) {
        console.warn("VNPay redirect timer error handled:", error.message);
        return false;
      }
    };

    window.addEventListener("error", handleRedirectError, { once: true });

    // Redirect to VNPay
    window.location.href = paymentUrl;
  }

  /**
   * Purchase premium subscription with VNPay
   */
  static async purchaseWithVNPay(
    token: string,
    purchaseData: PremiumPurchaseRequest
  ): Promise<PremiumPurchaseResponse> {
    try {
      console.log("Starting VNPay premium purchase with timer protection");

      // Initialize VNPay protection before API call
      this.initializeVNPayProtection();
      const response = await fetch(`${BASEURL}/api/premium/vnpay/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: purchaseData.userId,
          amount: purchaseData.amount,
          bankCode: purchaseData.bankCode || "NCB",
          language: purchaseData.locale || "vn",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new PremiumPaymentError("Vui lòng đăng nhập lại", 401);
        }

        if (response.status === 400) {
          throw new PremiumPaymentError(
            data.message || "Yêu cầu thanh toán không hợp lệ",
            400
          );
        }

        if (response.status === 429) {
          throw new PremiumPaymentError(
            data.message ||
              "Quá nhiều yêu cầu thanh toán. Vui lòng thử lại sau.",
            429
          );
        }

        if (response.status === 500) {
          throw new PremiumPaymentError(
            "Lỗi máy chủ. Vui lòng thử lại sau.",
            500
          );
        }

        throw new PremiumPaymentError(
          data.message || "Có lỗi xảy ra khi xử lý thanh toán",
          response.status
        );
      }

      // Handle successful response with payment URL
      if (data.success && data.paymentUrl) {
        console.log(
          "VNPay payment URL received, redirecting with timer protection"
        );

        // Use protected redirect instead of direct redirect
        this.redirectToVNPayWithProtection(data.paymentUrl);

        // Return the response for any additional handling
        return data as PremiumPurchaseResponse;
      }

      return data as PremiumPurchaseResponse;
    } catch (error) {
      if (error instanceof PremiumPaymentError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new PremiumPaymentError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet."
        );
      }

      throw new PremiumPaymentError(
        "Có lỗi xảy ra khi xử lý thanh toán VNPay",
        undefined,
        error
      );
    }
  }

  /**
   * Check premium subscription status
   */
  static async checkPremiumStatus(
    token: string,
    userId: string
  ): Promise<PremiumStatus> {
    try {
      const response = await fetch(`${BASEURL}/api/premium/status/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new PremiumPaymentError("Vui lòng đăng nhập lại", 401);
        }

        throw new PremiumPaymentError(
          data.message || "Không thể kiểm tra trạng thái premium",
          response.status
        );
      }

      if (data.success) {
        return {
          isPremium: data.isPremium,
          premiumExpiry: data.premiumExpiry,
          premiumPurchaseDate: data.premiumPurchaseDate,
        };
      }

      throw new PremiumPaymentError(
        "Không thể lấy thông tin trạng thái premium"
      );
    } catch (error) {
      if (error instanceof PremiumPaymentError) {
        throw error;
      }

      throw new PremiumPaymentError(
        "Có lỗi xảy ra khi kiểm tra trạng thái premium",
        undefined,
        error
      );
    }
  }

  /**
   * Store pending payment info
   */
  static storePendingPayment(orderId: string, amount: number): void {
    const pendingPayment = {
      orderId,
      amount,
      timestamp: Date.now(),
    };

    localStorage.setItem("pendingPayment", JSON.stringify(pendingPayment));
  }

  /**
   * Clear pending payment info
   */
  static clearPendingPayment(): void {
    localStorage.removeItem("pendingPayment");
  }

  /**
   * Get pending payment info if it exists and is still valid
   */
  static getPendingPayment(): {
    orderId: string;
    amount: number;
    timestamp: number;
  } | null {
    try {
      const pendingPayment = localStorage.getItem("pendingPayment");
      if (!pendingPayment) return null;

      const paymentInfo = JSON.parse(pendingPayment);

      // Check if payment is older than 30 minutes
      if (Date.now() - paymentInfo.timestamp > 30 * 60 * 1000) {
        this.clearPendingPayment();
        return null;
      }

      return paymentInfo;
    } catch {
      this.clearPendingPayment();
      return null;
    }
  }
}

export default PremiumPaymentService;
