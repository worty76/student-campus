"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState("loading");
  const [paymentData, setPaymentData] = useState<{
    success?: boolean;
    responseCode?: string;
    responseMessage?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    const handlePaymentResult = () => {
      try {
        // Get URL parameters directly
        const success = searchParams.get("success");
        const orderId = searchParams.get("orderId");
        const responseCode = searchParams.get("responseCode");
        const message = searchParams.get("message");

        if (success === "true") {
          setPaymentStatus("success");
          setPaymentData({
            success: true,
            responseCode: responseCode || "00",
            message: "Thanh toán thành công!",
          });
        } else if (success === "false") {
          setPaymentStatus("failed");
          setPaymentData({
            success: false,
            responseCode: responseCode || "",
            message: decodeURIComponent(message || "Thanh toán thất bại"),
          });
        } else {
          setPaymentStatus("error");
        }
      } catch (error) {
        console.error("Error handling payment result:", error);
        setPaymentStatus("error");
      }
    };

    if (searchParams.toString()) {
      handlePaymentResult();
    } else {
      setPaymentStatus("error");
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "success":
        return (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        );
      case "failed":
        return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      case "loading":
        return (
          <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
        );
      default:
        return (
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        );
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case "success":
        return "Thanh toán thành công!";
      case "failed":
        return "Thanh toán thất bại";
      case "loading":
        return "Đang xử lý thanh toán...";
      default:
        return "Có lỗi xảy ra";
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "success":
        return "Cảm ơn bạn đã nâng cấp lên Premium! Tài khoản của bạn đã được kích hoạt thành công.";
      case "failed":
        return (
          paymentData?.message ||
          "Giao dịch không thành công. Vui lòng thử lại."
        );
      case "loading":
        return "Vui lòng chờ trong giây lát...";
      default:
        return "Đã có lỗi xảy ra trong quá trình xử lý thanh toán.";
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case "success":
        return "border-green-500 bg-green-50";
      case "failed":
        return "border-red-500 bg-red-50";
      case "loading":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-yellow-500 bg-yellow-50";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()} border-2`}>
        <CardHeader className="text-center">
          {getStatusIcon()}
          <CardTitle className="text-2xl font-bold text-gray-900">
            {getStatusTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{getStatusMessage()}</p>

          {paymentData && (
            <div className="text-sm text-gray-500 space-y-1">
              {paymentData.responseCode && (
                <p>Mã giao dịch: {paymentData.responseCode}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => router.push("/premium")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Quay lại trang Premium
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/home")}
              className="w-full"
            >
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
