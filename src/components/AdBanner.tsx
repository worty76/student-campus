'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Crown } from 'lucide-react';

interface AdBannerProps {
  className?: string;
}

interface PremiumStatus {
  isPremium: boolean;
}

export default function AdBanner({ className = "" }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({ isPremium: false });

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      if (!token) return;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/premium/status/${userId}`);
      const data = await response.json();
      
      if (data.success && data.isPremium) {
        setPremiumStatus({ isPremium: true });
        setIsVisible(false); // Hide ad for premium users
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleUpgrade = () => {
    window.location.href = '/premium';
  };

  // Don't render if user is premium or ad is closed
  if (!isVisible || premiumStatus.isPremium) {
    return null;
  }

  return (
    <Card className={`bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Crown className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
              <p className="text-blue-100 text-sm">
                Remove ads and unlock exclusive features
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleUpgrade}
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
            <Button
              onClick={handleClose}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 