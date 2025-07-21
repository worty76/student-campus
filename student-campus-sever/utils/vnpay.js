const crypto = require("crypto");
const querystring = require("qs");

class VNPayService {
  constructor() {
    this.vnp_TmnCode = process.env.VNP_TMNCODE;
    this.vnp_HashSecret = process.env.VNP_HASHSECRET;
    this.vnp_Url = process.env.VNP_URL;
    this.vnp_ReturnUrl = process.env.VNP_RETURN_URL;
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

    // Debug logging for production troubleshooting
    console.log("IP Headers Debug:", {
      "x-forwarded-for": forwardedFor,
      "x-real-ip": realIp,
      "cf-connecting-ip": cfConnectingIp,
      "x-client-ip": xClientIp,
      "x-cluster-client-ip": xClusterClientIp,
      forwarded: forwarded,
      "connection.remoteAddress": req.connection?.remoteAddress,
      "socket.remoteAddress": req.socket?.remoteAddress,
    });

    let clientIp = null;

    // 1. Check X-Forwarded-For header (most common behind proxies/load balancers)
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs, take the first one (original client)
      const ips = forwardedFor.split(",").map((ip) => ip.trim());
      clientIp = ips[0];
    }
    // 2. Check Cloudflare's header
    else if (cfConnectingIp) {
      clientIp = cfConnectingIp;
    }
    // 3. Check X-Real-IP (nginx proxy)
    else if (realIp) {
      clientIp = realIp;
    }
    // 4. Check other proxy headers
    else if (xClientIp) {
      clientIp = xClientIp;
    } else if (xClusterClientIp) {
      clientIp = xClusterClientIp;
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
        console.log("Final selected IP address:", clientIp);
        return clientIp;
      }
    }

    // Default fallback for localhost/development
    console.log("Final selected IP address: 127.0.0.1 (fallback)");
    return "127.0.0.1";
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
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60000)); // 15 minutes

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
      // Add custom parameter to help with JavaScript fixes
      vnp_OrderInfo: `${orderDescription} - UserID: ${userId} - FixJS: enabled`,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    // Sort parameters
    vnp_Params = this.sortObject(vnp_Params);

    // Create secure hash
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    // Create payment URL
    const baseUrl =
      this.vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

    // Add additional parameters that might help with VNPay's JavaScript issues
    // These don't affect the payment but might help with their frontend
    const enhancedUrl = baseUrl + "&timer_fix=1&js_enhanced=true";

    return enhancedUrl;
  }

  // Verify return data
  verifyReturnUrl(vnp_Params) {
    // Create a copy to avoid modifying the original object
    const params = { ...vnp_Params };
    const secureHash = params["vnp_SecureHash"];
    delete params["vnp_SecureHash"];
    delete params["vnp_SecureHashType"];

    // Sort parameters
    const sortedParams = this.sortObject(params);

    // Create secure hash for verification
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    return secureHash === signed;
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

  // Sort object by key
  sortObject(obj) {
    const sorted = {};
    const str = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
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
