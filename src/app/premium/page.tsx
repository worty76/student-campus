'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle,
  CreditCard,
  Zap,
  Star
} from 'lucide-react';

interface PremiumStatus {
  isPremium: boolean;
  premiumExpiry: string | null;
  premiumPurchaseDate: string | null;
}

export default function PremiumPage() {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    isPremium: false,
    premiumExpiry: null,
    premiumPurchaseDate: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      // Get user ID from token or context
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) return;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/status/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setPremiumStatus({
          isPremium: data.isPremium,
          premiumExpiry: data.premiumExpiry,
          premiumPurchaseDate: data.premiumPurchaseDate
        });
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (amount: number, paymentMethod: string) => {
    setIsPurchasing(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) {
        alert('Please login to purchase premium');
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          paymentMethod
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Premium subscription purchased successfully!');
        checkPremiumStatus(); // Refresh status
      } else {
        alert('Failed to purchase premium: ' + data.message);
      }
    } catch (error) {
      console.error('Error purchasing premium:', error);
      alert('Failed to purchase premium. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading premium status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Crown className="w-8 h-8 mr-3 text-yellow-500" />
                Premium Features
              </h1>
              <p className="text-gray-600">Unlock the full potential of Student Campus</p>
            </div>
            {premiumStatus.isPremium && (
              <Badge className="bg-green-100 text-green-800">
                <Shield className="w-4 h-4 mr-2" />
                Premium Active
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {premiumStatus.isPremium ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                Premium Subscription Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <strong>Purchase Date:</strong> {premiumStatus.premiumPurchaseDate ? new Date(premiumStatus.premiumPurchaseDate).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-gray-600">
                  <strong>Expires:</strong> {premiumStatus.premiumExpiry ? new Date(premiumStatus.premiumExpiry).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Upgrade to Premium
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Enjoy an ad-free experience and unlock exclusive features to enhance your learning journey.
            </p>
          </div>
        )}

        {/* Features Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Free Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-center">Free Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold">₫0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Access to basic features</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Share documents</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Connect with friends</span>
                </li>
                <li className="flex items-center">
                  <EyeOff className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-gray-500">Ads displayed</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-blue-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-blue-500 text-white">
                <Star className="w-4 h-4 mr-1" />
                Recommended
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-center text-blue-600">Premium Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className="text-3xl font-bold">₫99,000</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Ad-free experience</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Advanced features</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Exclusive content</span>
                </li>
              </ul>
              {!premiumStatus.isPremium && (
                <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handlePurchase(99000, 'momo')}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Purchase Premium
                      </div>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Secure payment via MoMo, ZaloPay, or Bank Transfer
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-500" />
              Premium Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Ad-Free Experience</h3>
                <p className="text-gray-600">
                  Enjoy a clean, distraction-free learning environment without any advertisements.
                </p>
                
                <h3 className="font-semibold text-lg">Priority Support</h3>
                <p className="text-gray-600">
                  Get faster response times and dedicated support for any issues you encounter.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Advanced Features</h3>
                <p className="text-gray-600">
                  Access to premium tools and features that enhance your learning experience.
                </p>
                
                <h3 className="font-semibold text-lg">Exclusive Content</h3>
                <p className="text-gray-600">
                  Get early access to new features and exclusive educational content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 