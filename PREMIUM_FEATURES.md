# Premium Features Implementation

## Overview
This document describes the premium feature system implemented for the Student Campus platform, including user premium subscriptions, admin dashboard, and ad-free experience.

## Features Implemented

### 1. Premium Subscription System
- **User Premium Status**: Users can purchase premium subscriptions for ₫99,000/month
- **Premium Benefits**: 
  - Ad-free experience
  - Priority support
  - Advanced features
  - Exclusive content access

### 2. Admin Dashboard
- **User Management**: View and manage all users, their roles, and premium status
- **Revenue Management**: Track earnings, transactions, and premium conversion rates
- **Post Management**: Moderate user-generated content and manage posts

### 3. Ad System
- **Ad Banner**: Displays premium upgrade banner for non-premium users
- **Ad-Free Experience**: Premium users automatically have ads hidden

## Database Schema Updates

### User Model (`user.model.js`)
Added premium-related fields:
```javascript
role: { type: String, enum: ['user', 'admin'], default: 'user' },
isPremium: { type: Boolean, default: false },
premiumExpiry: { type: Date },
premiumPurchaseDate: { type: Date },
premiumAmount: { type: Number, default: 0 }
```

### Premium Transaction Model (`premium_transaction.model.js`)
New model for tracking premium purchases:
```javascript
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
amount: { type: Number, required: true },
currency: { type: String, default: 'VND' },
transactionType: { type: String, enum: ['premium_purchase', 'premium_renewal'] },
status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'] },
paymentMethod: { type: String, enum: ['momo', 'zalo_pay', 'bank_transfer', 'credit_card'] },
transactionId: { type: String, unique: true },
createdAt: { type: Date, default: Date.now },
completedAt: { type: Date }
```

## API Endpoints

### Premium User Endpoints
- `POST /api/premium/purchase` - Purchase premium subscription
- `GET /api/premium/status/:userId` - Check premium status

### Admin Endpoints
- `GET /api/premium/admin/users` - Get all users with premium info
- `GET /api/premium/admin/revenue` - Get revenue statistics
- `GET /api/premium/admin/posts` - Get all posts for management
- `DELETE /api/premium/admin/posts/:postId` - Delete a post
- `PUT /api/premium/admin/users/:userId/role` - Update user role
- `GET /api/premium/admin/transactions` - Get transaction history

## Frontend Components

### Premium Page (`/premium`)
- Premium subscription purchase interface
- Feature comparison between free and premium plans
- Premium status display for existing subscribers

### Admin Dashboard (`/dashboard`)
- Main dashboard with overview statistics
- Navigation to specific management pages:
  - `/dashboard/users` - User management
  - `/dashboard/revenue` - Revenue management  
  - `/dashboard/posts` - Post management

### Ad Banner Component
- Automatically hidden for premium users
- Displays upgrade prompt for non-premium users
- Integrated into the landing page

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the client directory:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Server Setup
The premium routes are already integrated into the main server file (`index.js`).

### 3. Database
The new schemas will be automatically created when the server starts.

## Usage

### For Users
1. Navigate to `/premium` to view premium features
2. Click "Purchase Premium" to buy subscription
3. Premium users will automatically have ads hidden

### For Admins
1. Access `/dashboard` for the admin dashboard
2. Use the navigation tabs to access different management sections
3. Manage users, track revenue, and moderate content

## Payment Integration
The system supports multiple payment methods:
- MoMo
- ZaloPay  
- Bank Transfer
- Credit Card

## Security Features
- JWT token-based authentication
- Role-based access control (user/admin)
- Secure premium status checking
- Transaction tracking and validation

## Future Enhancements
- Automatic premium renewal
- More payment gateway integrations
- Advanced analytics and reporting
- Premium content management system
- Referral and affiliate programs 