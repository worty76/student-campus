"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NavigationBar from "@/app/(main)/layouts/navbar";
import PremiumPaymentService from "@/services/premiumPayment.service";
import { PremiumStatus, PremiumPaymentError } from "@/types/premium.types";
import {
  Crown,
  Shield,
  EyeOff,
  CheckCircle,
  CreditCard,
  Zap,
  Star,
} from "lucide-react";

export default function PremiumPage() {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    premiumExpiry: null,
    premiumPurchaseDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkPremiumStatus = async (
      authToken: string,
      userIdParam: string
    ) => {
      try {
        const status = await PremiumPaymentService.checkPremiumStatus(
          authToken,
          userIdParam
        );
        setPremiumStatus(status);
      } catch (error) {
        console.error("Error checking premium status:", error);

        if (error instanceof PremiumPaymentError && error.statusCode === 401) {
          alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        console.error("Error checking premium status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check if user is logged in and get userId from localStorage
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      window.location.href = "/login";
      return;
    }

    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setToken(storedToken);
      setUserId(storedId);
      checkPremiumStatus(storedToken, storedId);

      // Check for pending payments using the service
      const pendingPayment = PremiumPaymentService.getPendingPayment();
      if (pendingPayment) {
        // Check payment status after 3 seconds and clear pending payment
        setTimeout(() => {
          checkPremiumStatus(storedToken, storedId);
          PremiumPaymentService.clearPendingPayment();
        }, 3000);
      }
    }
  }, []);

  const handlePurchase = async (amount: number) => {
    setIsPurchasing(true);

    try {
      if (!userId || !token) {
        alert("Vui lòng đăng nhập để mua gói Premium");
        return;
      }

      // Using the new purchase service with better error handling
      const response = await PremiumPaymentService.purchaseWithVNPay(token, {
        userId,
        amount,
        bankCode: "NCB",
        locale: "vn",
      });

      if (response.success && response.paymentUrl) {
        // Store pending payment info
        if (response.orderId) {
          PremiumPaymentService.storePendingPayment(response.orderId, amount);
        }

        // Inform user about redirection
        alert("Chuyển hướng đến trang thanh toán VNPay...");

        // Redirect to VNPay payment page
        setTimeout(() => {
          window.location.href = response.paymentUrl!;
        }, 1000);
      } else {
        alert(response.message || "Không thể khởi tạo thanh toán VNPay");
      }
    } catch (error) {
      let errorMessage = "Có lỗi xảy ra khi xử lý thanh toán";

      if (error instanceof PremiumPaymentError) {
        errorMessage = error.message;

        if (error.statusCode === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
      }

      alert("Lỗi thanh toán: " + errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#F1F1E6] min-h-screen pb-20 flex flex-col relative overflow-x-hidden">
        {/* Enhanced decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#0694FA]/10 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-[#1E293B]/10 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-[#0694FA]/10 rounded-full blur-3xl opacity-25 -z-10" />

        {/* Enhanced top gradient bar */}
        <div className="w-full h-1 bg-[#0694FA] shadow-sm" />

        {/* Fixed Navigation Bar with enhanced shadow */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-[#1E293B]/10">
          <NavigationBar />
        </div>

        {/* Loading Content Area */}
        <div className="flex-1 flex items-center justify-center pt-20 px-4">
          <div className="flex flex-col items-center space-y-4 sm:space-y-6">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-[#0694FA]/30 rounded-full animate-spin border-t-[#0694FA]"></div>
              <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-3 sm:border-4 border-transparent rounded-full animate-pulse border-t-[#1E293B]"></div>
            </div>
            <div className="text-[#0694FA] font-medium text-base sm:text-lg">
              Đang tải trạng thái premium...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F1F1E6] min-h-screen pb-24 lg:pb-20 flex flex-col relative overflow-x-hidden">
      {/* Enhanced decorative elements */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-[#0694FA]/10 rounded-full blur-3xl opacity-40 -z-10" />
      <div className="absolute top-20 right-0 w-36 h-36 sm:w-56 sm:h-56 lg:w-72 lg:h-72 bg-[#1E293B]/10 rounded-full blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-1/2 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-[#0694FA]/10 rounded-full blur-3xl opacity-25 -z-10" />

      {/* Enhanced top gradient bar */}
      <div className="w-full h-1 bg-[#0694FA] shadow-sm" />

      {/* Fixed Navigation Bar with enhanced shadow */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-[#1E293B]/10">
        <NavigationBar />
      </div>

      {/* Header */}
      <div className="pt-20 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-[#1E293B]/10 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-[#1E293B] flex items-center">
                  <Crown className="w-8 h-8 mr-3 text-yellow-500" />
                  Premium Features
                </h1>
                <p className="text-[#1E293B]/70 mt-2">
                  Mở khóa toàn bộ tiềm năng của Student Campus
                </p>
              </div>
              {premiumStatus.isPremium && (
                <Badge className="bg-green-100 text-green-800 border border-green-300">
                  <Shield className="w-4 h-4 mr-2" />
                  Premium Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {premiumStatus.isPremium ? (
          <Card className="mb-8 border border-[#1E293B]/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                Đăng ký Premium đang hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <div className="space-y-2 pt-4">
                <p className="text-[#1E293B]/70">
                  <strong className="text-[#1E293B]">Ngày mua:</strong>{" "}
                  {premiumStatus.premiumPurchaseDate
                    ? new Date(
                        premiumStatus.premiumPurchaseDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-[#1E293B]/70">
                  <strong className="text-[#1E293B]">Hết hạn:</strong>{" "}
                  {premiumStatus.premiumExpiry
                    ? new Date(premiumStatus.premiumExpiry).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-[#1E293B]/10 p-8 hover:shadow-xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-[#1E293B] mb-4">
                Nâng cấp lên Premium
              </h2>
              <p className="text-[#1E293B]/70 max-w-2xl mx-auto">
                Tận hưởng trải nghiệm không quảng cáo và mở khóa các tính năng
                độc quyền để nâng cao hành trình học tập của bạn.
              </p>
            </div>
          </div>
        )}

        {/* Features Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Free Plan */}
          <Card className="border-2 border-[#1E293B]/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="text-center text-[#1E293B]">
                Gói Miễn phí
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="text-center pt-4">
                <span className="text-3xl font-bold text-[#1E293B]">₫0</span>
                <span className="text-[#1E293B]/70">/tháng</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-[#1E293B]">
                    Truy cập các tính năng cơ bản
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-[#1E293B]">Chia sẻ tài liệu</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-[#1E293B]">Kết nối với bạn bè</span>
                </li>
                <li className="flex items-center">
                  <EyeOff className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-[#1E293B]/50">Hiển thị quảng cáo</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-[#0694FA] relative shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-[#0694FA] text-white border border-[#0694FA]">
                <Star className="w-4 h-4 mr-1" />
                Khuyến nghị
              </Badge>
            </div>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-center text-[#0694FA]">
                Gói Premium
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 bg-white">
              <div className="text-center pt-4">
                <span className="text-3xl font-bold text-[#1E293B]">
                  ₫99,000
                </span>
                <span className="text-[#1E293B]/70">/tháng</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-[#1E293B]">
                    Mọi thứ trong gói Miễn phí
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-[#1E293B]">
                    Trải nghiệm không quảng cáo
                  </span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-[#1E293B]">Hỗ trợ ưu tiên</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-[#1E293B]">Tính năng nâng cao</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-[#1E293B]">Nội dung độc quyền</span>
                </li>
              </ul>
              {!premiumStatus.isPremium && (
                <div className="space-y-3 pt-4">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handlePurchase(99000)}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Thanh toán qua VNPay
                      </div>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Thanh toán an toàn qua VNPay với thẻ ngân hàng, ATM hoặc QR
                    Code
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="border border-[#1E293B]/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardTitle className="flex items-center text-[#1E293B]">
              <Zap className="w-6 h-6 mr-2 text-yellow-500" />
              Lợi ích Premium
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-[#1E293B]">
                  Trải nghiệm không quảng cáo
                </h3>
                <p className="text-[#1E293B]/70">
                  Tận hưởng môi trường học tập sạch sẽ, không bị phân tâm bởi
                  bất kỳ quảng cáo nào.
                </p>

                <h3 className="font-semibold text-lg text-[#1E293B]">
                  Hỗ trợ ưu tiên
                </h3>
                <p className="text-[#1E293B]/70">
                  Nhận được thời gian phản hồi nhanh hơn và hỗ trợ chuyên biệt
                  cho bất kỳ vấn đề nào bạn gặp phải.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-[#1E293B]">
                  Tính năng nâng cao
                </h3>
                <p className="text-[#1E293B]/70">
                  Truy cập các công cụ và tính năng premium giúp nâng cao trải
                  nghiệm học tập của bạn.
                </p>

                <h3 className="font-semibold text-lg text-[#1E293B]">
                  Nội dung độc quyền
                </h3>
                <p className="text-[#1E293B]/70">
                  Truy cập sớm các tính năng mới và nội dung giáo dục độc quyền.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced bottom gradient bar */}
      <div className="fixed left-0 bottom-0 w-full bg-[#0694FA] h-1 z-40 shadow-lg" />
    </div>
  );
}
