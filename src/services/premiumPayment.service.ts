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
   * Initialize VNPay timer protection before payment
   */
  private static initializeVNPayProtection(): void {
    console.log("PremiumPaymentService - Initializing VNPay timer protection");

    // Ensure timer object exists before VNPay redirect
    if (typeof window !== "undefined" && !(window as any).timer) {
      (window as any).timer = {
        remaining: 1800, // 30 minutes
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
          this.interval = null;
          return this;
        },
        update: function () {
          /* Safe update */
        },
        formatTime: function () {
          const m = Math.floor(this.remaining / 60);
          const s = this.remaining % 60;
          return m + ":" + (s < 10 ? "0" : "") + s;
        },
      };
    }

    // Ensure updateTime function exists
    if (typeof window !== "undefined" && !(window as any).updateTime) {
      (window as any).updateTime = function () {
        try {
          if ((window as any).timer && (window as any).timer.remaining > 0) {
            (window as any).timer.remaining--;
          }
        } catch (e) {
          console.warn("updateTime handled safely in service");
        }
      };
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
