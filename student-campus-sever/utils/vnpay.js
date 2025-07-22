const crypto = require("crypto");
const querystring = require("qs");

class VNPayService {
  constructor() {
    this.vnp_TmnCode = process.env.VNP_TMNCODE;
    this.vnp_HashSecret = process.env.VNP_HASHSECRET;
    this.vnp_Url = process.env.VNP_URL;
    this.vnp_ReturnUrl = process.env.VNP_RETURN_URL;

    // Validate configuration on startup
    this.validateConfiguration();
  }

  // Validate VNPay configuration
  validateConfiguration() {
    const requiredEnvs = [
      "VNP_TMNCODE",
      "VNP_HASHSECRET",
      "VNP_URL",
      "VNP_RETURN_URL",
    ];
    const missing = requiredEnvs.filter((env) => !process.env[env]);

    if (missing.length > 0) {
      console.error(
        "VNPay Configuration Error - Missing environment variables:",
        missing
      );
      throw new Error(
        `Missing VNPay environment variables: ${missing.join(", ")}`
      );
    }

    // Validate Return URL accessibility
    this.validateReturnUrl();

    console.log("VNPay Configuration Validated Successfully:", {
      tmnCode: this.vnp_TmnCode,
      returnUrl: this.vnp_ReturnUrl,
      vnpUrl: this.vnp_Url,
      hashSecretLength: this.vnp_HashSecret ? this.vnp_HashSecret.length : 0,
    });
  }

  // Validate and optimize return URL
  validateReturnUrl() {
    if (!this.vnp_ReturnUrl) {
      throw new Error("VNP_RETURN_URL is required");
    }

    try {
      const url = new URL(this.vnp_ReturnUrl);

      // Ensure HTTPS in production
      if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
        console.warn(
          "VNPay Warning: Return URL should use HTTPS in production:",
          this.vnp_ReturnUrl
        );
      }

      // Validate URL structure
      if (!url.pathname.includes("/api/")) {
        console.warn("VNPay Warning: Return URL should point to API endpoint");
      }

      console.log("VNPay Return URL validated:", {
        protocol: url.protocol,
        host: url.host,
        pathname: url.pathname,
        isHttps: url.protocol === "https:",
      });
    } catch (error) {
      console.error("VNPay Return URL validation failed:", error.message);
      throw new Error(`Invalid VNP_RETURN_URL: ${this.vnp_ReturnUrl}`);
    }
  }

  // Extract real client IP address for production environments
  getClientIpAddress(req) {
    // Handle various proxy headers in order of priority
    const forwardedFor = req.headers["x-forwarded-for"];
    const realIp = req.headers["x-real-ip"];
    const cfConnectingIp = req.headers["cf-connecting-ip"]; // Cloudflare
    const xClientIp = req.headers["x-client-ip"];
    const xClusterClientIp = req.headers["x-cluster-client-ip"];
    const forwarded = req.headers["forwarded"];
    const trueClientIp = req.headers["true-client-ip"]; // Akamai
    const xOriginalForwardedFor = req.headers["x-original-forwarded-for"]; // AWS ALB

    // Debug logging for production troubleshooting
    console.log("VNPay IP Headers Debug:", {
      "x-forwarded-for": forwardedFor,
      "x-real-ip": realIp,
      "cf-connecting-ip": cfConnectingIp,
      "x-client-ip": xClientIp,
      "x-cluster-client-ip": xClusterClientIp,
      "true-client-ip": trueClientIp,
      "x-original-forwarded-for": xOriginalForwardedFor,
      forwarded: forwarded,
      "connection.remoteAddress": req.connection?.remoteAddress,
      "socket.remoteAddress": req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
      host: req.headers["host"],
    });

    let clientIp = null;

    // 1. Check X-Forwarded-For header (most common behind proxies/load balancers)
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one (original client)
      const ips = forwardedFor.split(",").map((ip) => ip.trim());
      clientIp = ips[0];
      console.log(
        "VNPay - Selected from X-Forwarded-For:",
        clientIp,
        "from chain:",
        ips
      );
    }
    // 2. Check True-Client-IP (Akamai, high priority)
    else if (trueClientIp) {
      clientIp = trueClientIp;
      console.log("VNPay - Selected from True-Client-IP:", clientIp);
    }
    // 3. Check Cloudflare's header
    else if (cfConnectingIp) {
      clientIp = cfConnectingIp;
      console.log("VNPay - Selected from CF-Connecting-IP:", clientIp);
    }
    // 4. Check X-Real-IP (nginx proxy)
    else if (realIp) {
      clientIp = realIp;
      console.log("VNPay - Selected from X-Real-IP:", clientIp);
    }
    // 5. Check X-Original-Forwarded-For (AWS ALB)
    else if (xOriginalForwardedFor) {
      const ips = xOriginalForwardedFor.split(",").map((ip) => ip.trim());
      clientIp = ips[0];
      console.log("VNPay - Selected from X-Original-Forwarded-For:", clientIp);
    }
    // 6. Check other proxy headers
    else if (xClientIp) {
      clientIp = xClientIp;
      console.log("VNPay - Selected from X-Client-IP:", clientIp);
    } else if (xClusterClientIp) {
      clientIp = xClusterClientIp;
      console.log("VNPay - Selected from X-Cluster-Client-IP:", clientIp);
    }
    // 5. Parse Forwarded header (RFC 7239)
    else if (forwarded) {
      const match = forwarded.match(/for=([^;,\s]+)/);
      if (match) {
        clientIp = match[1].replace(/"/g, "");
        // Remove port if present
        if (clientIp.startsWith("[")) {
          // IPv6 format
          clientIp = clientIp.replace(/^\[(.+)\]:\d+$/, "$1");
        } else {
          // IPv4 format
          clientIp = clientIp.replace(/:.*$/, "");
        }
      }
    }
    // 6. Fallback to connection remote address
    else if (req.connection && req.connection.remoteAddress) {
      clientIp = req.connection.remoteAddress;
    }
    // 7. Final fallback to socket remote address
    else if (req.socket && req.socket.remoteAddress) {
      clientIp = req.socket.remoteAddress;
    }

    // Validate and clean the IP address
    if (clientIp) {
      // Remove IPv6 prefix if present
      clientIp = clientIp.replace(/^::ffff:/, "");

      // Validate IP format (basic validation)
      const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
      const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

      if (ipv4Regex.test(clientIp) || ipv6Regex.test(clientIp)) {
        // Additional validation for public IP ranges
        const isPublicIP = this.isPublicIP(clientIp);
        console.log("VNPay - IP Validation:", {
          ip: clientIp,
          isValid: true,
          isPublic: isPublicIP,
          isIPv4: ipv4Regex.test(clientIp),
          isIPv6: ipv6Regex.test(clientIp),
        });

        console.log("VNPay - Final selected IP address:", clientIp);
        return clientIp;
      } else {
        console.log("VNPay - Invalid IP format detected:", clientIp);
      }
    }

    // Default fallback for localhost/development
    console.log("VNPay - Using fallback IP address: 127.0.0.1");
    return "127.0.0.1";
  }

  // Check if IP address is public (not private/internal)
  isPublicIP(ip) {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./, // Link-local
      /^::1$/, // IPv6 localhost
      /^fc00:/, // IPv6 unique local
      /^fe80:/, // IPv6 link-local
    ];

    return !privateRanges.some((range) => range.test(ip));
  }

  // Create payment URL
  createPaymentUrl(
    orderId,
    amount,
    orderDescription,
    bankCode,
    language,
    userId,
    ipAddr
  ) {
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 30 * 60000)); // Extended to 30 minutes

    console.log("VNPay Payment Timing:", {
      createDate,
      expireDate,
      expirationMinutes: 30,
      currentTime: date.toISOString(),
      expiresAt: new Date(date.getTime() + 30 * 60000).toISOString(),
    });

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: this.vnp_TmnCode,
      vnp_Locale: language || "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderDescription,
      vnp_OrderType: "premium_subscription",
      vnp_Amount: amount * 100, // VNPay expects amount in VND cents
      vnp_ReturnUrl: this.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr || "127.0.0.1",
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    // Add custom field for userId
    vnp_Params["vnp_OrderInfo"] = `${orderDescription} - UserID: ${userId}`;

    // Sort parameters for consistent hash generation
    vnp_Params = this.sortObject(vnp_Params);

    // Enhanced secure hash generation with validation
    const hashResult = this.generateSecureHash(vnp_Params);
    vnp_Params["vnp_SecureHash"] = hashResult.hash;

    console.log("VNPay Secure Hash Generation:", {
      parametersCount: Object.keys(vnp_Params).length - 1, // Exclude the hash itself
      signDataLength: hashResult.signData.length,
      hashAlgorithm: "SHA512",
      hashLength: hashResult.hash.length,
      success: true,
    });

    // Create payment URL with performance optimization
    const paymentUrl = this.buildPaymentUrl(vnp_Params);

    console.log("VNPay Payment URL Generated:", {
      urlLength: paymentUrl.length,
      baseUrl: this.vnp_Url,
      parametersCount: Object.keys(vnp_Params).length,
    });

    return paymentUrl;
  }

  // Enhanced secure hash generation
  generateSecureHash(params) {
    try {
      // Create sign data string
      const signData = querystring.stringify(params, { encode: false });

      // Validate sign data
      if (!signData || signData.length === 0) {
        throw new Error("Empty sign data for hash generation");
      }

      // Generate hash
      const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
      const hash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      // Validate generated hash
      if (!hash || hash.length !== 128) {
        // SHA512 produces 128 hex characters
        throw new Error("Invalid hash generated");
      }

      return {
        signData,
        hash,
        algorithm: "sha512",
      };
    } catch (error) {
      console.error("VNPay Hash Generation Error:", error);
      throw new Error(`Secure hash generation failed: ${error.message}`);
    }
  }

  // Build optimized payment URL
  buildPaymentUrl(params) {
    try {
      const queryString = querystring.stringify(params, { encode: false });
      const fullUrl = `${this.vnp_Url}?${queryString}`;

      // Validate final URL
      if (fullUrl.length > 2048) {
        console.warn(
          "VNPay Warning: URL length exceeds recommended limit:",
          fullUrl.length
        );
      }

      return fullUrl;
    } catch (error) {
      console.error("VNPay URL Building Error:", error);
      throw new Error(`Payment URL generation failed: ${error.message}`);
    }
  }

  // Enhanced verify return data with comprehensive validation
  verifyReturnUrl(vnp_Params) {
    try {
      console.log("VNPay Return Verification Started:", {
        parametersReceived: Object.keys(vnp_Params).length,
        hasSecureHash: !!vnp_Params.vnp_SecureHash,
        orderId: vnp_Params.vnp_TxnRef,
      });

      // Create a copy to avoid modifying the original object
      const params = { ...vnp_Params };
      const receivedHash = params["vnp_SecureHash"];

      // Validate required parameters
      if (!receivedHash) {
        console.error("VNPay Verification Error: Missing secure hash");
        return false;
      }

      // Remove hash parameters for verification
      delete params["vnp_SecureHash"];
      delete params["vnp_SecureHashType"];

      // Sort parameters for consistent verification
      const sortedParams = this.sortObject(params);

      // Generate verification hash
      const hashResult = this.generateSecureHash(sortedParams);
      const isValid = receivedHash === hashResult.hash;

      console.log("VNPay Return Verification Result:", {
        receivedHashLength: receivedHash.length,
        calculatedHashLength: hashResult.hash.length,
        hashesMatch: isValid,
        parametersCount: Object.keys(sortedParams).length,
        signDataLength: hashResult.signData.length,
      });

      if (!isValid) {
        console.error("VNPay Hash Mismatch:", {
          received: receivedHash.substring(0, 20) + "...",
          calculated: hashResult.hash.substring(0, 20) + "...",
          signData: hashResult.signData.substring(0, 100) + "...",
        });
      }

      return isValid;
    } catch (error) {
      console.error("VNPay Return Verification Error:", error);
      return false;
    }
  }

  // Format date for VNPay
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Enhanced sorting with performance optimization
  sortObject(obj) {
    try {
      const startTime = Date.now();
      const sorted = {};
      const keys = [];

      // Collect and encode keys efficiently
      for (const key in obj) {
        if (
          obj.hasOwnProperty(key) &&
          obj[key] !== null &&
          obj[key] !== undefined
        ) {
          keys.push(encodeURIComponent(key));
        }
      }

      // Sort keys
      keys.sort();

      // Build sorted object with optimized encoding
      for (const encodedKey of keys) {
        const originalKey = decodeURIComponent(encodedKey);
        const value = obj[originalKey];

        // Enhanced URL encoding with performance optimization
        if (typeof value === "string") {
          sorted[encodedKey] = encodeURIComponent(value)
            .replace(/%20/g, "+")
            .replace(/%21/g, "!")
            .replace(/%27/g, "'")
            .replace(/%28/g, "(")
            .replace(/%29/g, ")")
            .replace(/%2A/g, "*");
        } else {
          sorted[encodedKey] = encodeURIComponent(String(value)).replace(
            /%20/g,
            "+"
          );
        }
      }

      const processingTime = Date.now() - startTime;
      console.log("VNPay Object Sorting Performance:", {
        inputKeys: Object.keys(obj).length,
        outputKeys: keys.length,
        processingTimeMs: processingTime,
        optimized: true,
      });

      return sorted;
    } catch (error) {
      console.error("VNPay Object Sorting Error:", error);
      throw new Error(`Parameter sorting failed: ${error.message}`);
    }
  }

  // Performance monitoring for payment URL generation
  measurePerformance(operation, fn) {
    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage();

    try {
      const result = fn();
      const endTime = process.hrtime.bigint();
      const endMemory = process.memoryUsage();

      const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

      console.log(`VNPay Performance - ${operation}:`, {
        executionTimeMs: parseFloat(executionTime.toFixed(2)),
        memoryUsedBytes: memoryDelta,
        memoryUsedKB: parseFloat((memoryDelta / 1024).toFixed(2)),
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      console.error(`VNPay Performance Error in ${operation}:`, error);
      throw error;
    }
  }

  // Get response message
  getResponseMessage(responseCode) {
    const messages = {
      "00": "Giao dịch thành công",
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      10: "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      11: "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      12: "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      13: "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.",
      24: "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      51: "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      65: "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      75: "Ngân hàng thanh toán đang bảo trì.",
      79: "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch",
      99: "Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)",
    };
    return messages[responseCode] || "Lỗi không xác định";
  }
}

module.exports = new VNPayService();
