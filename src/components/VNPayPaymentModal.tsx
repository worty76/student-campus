"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VNPayPaymentModalProps {
  paymentUrl: string;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export default function VNPayPaymentModal({
  paymentUrl,
  onClose,
  onPaymentComplete,
}: VNPayPaymentModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Monitor iframe for navigation changes
    const iframe = document.getElementById("vnpay-iframe") as HTMLIFrameElement;

    const checkPaymentComplete = () => {
      try {
        // Check if iframe navigated to success/failure page
        const currentUrl = iframe?.contentWindow?.location?.href;
        if (
          currentUrl &&
          (currentUrl.includes("payment-result") ||
            currentUrl.includes("success=true") ||
            currentUrl.includes("success=false"))
        ) {
          onPaymentComplete();
          onClose();
        }
      } catch {
        // Cross-origin restrictions prevent direct access
        // This is expected when iframe navigates to different domain
        console.log("Iframe navigation detected");
      }
    };

    // Check periodically
    const interval = setInterval(checkPaymentComplete, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [onClose, onPaymentComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">VNPay Payment</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Đang tải trang thanh toán...</p>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          id="vnpay-iframe"
          src={paymentUrl}
          className="flex-1 w-full border-0"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
        />

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-600">
            Trang thanh toán an toàn được cung cấp bởi VNPay
          </p>
        </div>
      </div>
    </div>
  );
}
