"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function VNPayRedirectPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const paymentUrl = searchParams.get("url");

    if (paymentUrl) {
      // Inject our fix script into VNPay page
      const script = `
        // VNPay Timer Fix
        window.timer = window.timer || { remaining: 900, interval: null };
        window.updateTime = window.updateTime || function() {
          try {
            if (window.timer && window.timer.remaining > 0) {
              window.timer.remaining--;
              const timeElement = document.querySelector('#timer, .timer, [id*="timer"]');
              if (timeElement) {
                const minutes = Math.floor(window.timer.remaining / 60);
                const seconds = window.timer.remaining % 60;
                timeElement.textContent = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
              }
            }
          } catch(e) { console.warn('Timer update handled:', e.message); }
        };
        
        // Auto-inject fix when VNPay page loads
        if (!window.timer.interval) {
          window.timer.interval = setInterval(function() {
            if (typeof window.updateTime === 'function') {
              window.updateTime();
            }
          }, 1000);
        }
      `;

      // Create a new window with our fix injected
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Đang chuyển hướng đến VNPay...</title>
              <script>${script}</script>
            </head>
            <body>
              <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
                <h2>Đang chuyển hướng đến trang thanh toán VNPay...</h2>
                <p>Vui lòng chờ trong giây lát...</p>
              </div>
              <script>
                setTimeout(function() {
                  window.location.href = decodeURIComponent('${encodeURIComponent(
                    paymentUrl
                  )}');
                }, 2000);
              </script>
            </body>
          </html>
        `);
        newWindow.document.close();
        window.close(); // Close the redirect page
      } else {
        // Fallback: direct redirect
        window.location.href = paymentUrl;
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Đang chuẩn bị thanh toán
        </h2>
        <p className="text-gray-600">
          Đang khởi tạo trang thanh toán VNPay an toàn...
        </p>
      </div>
    </div>
  );
}
