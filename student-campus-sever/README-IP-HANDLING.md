# Production IP Address Handling for VNPay Integration

## Overview

This implementation provides robust IP address extraction for VNPay payment processing in production environments. The system correctly handles various proxy configurations, load balancers, and CDN setups.

## Problem Solved

VNPay requires the real client IP address (`vnp_IpAddr`) for payment processing. In production deployments behind proxies, load balancers, or CDNs, the standard `req.socket.remoteAddress` returns the proxy's IP, not the client's IP.

## Features

### 1. Multi-Header Support

Handles IP extraction from various headers in priority order:

- `X-Forwarded-For` (most common)
- `CF-Connecting-IP` (Cloudflare)
- `True-Client-IP` (Akamai, CDNs)
- `X-Real-IP` (Nginx proxy)
- `X-Original-Forwarded-For` (AWS ALB)
- `X-Client-IP` (alternative)
- `X-Cluster-Client-IP` (load balancers)
- `Forwarded` (RFC 7239 standard)

### 2. Production Environments Supported

- **Nginx Reverse Proxy**: Uses `X-Real-IP` and `X-Forwarded-For`
- **Apache Reverse Proxy**: Uses `X-Forwarded-For`
- **Cloudflare CDN**: Uses `CF-Connecting-IP`
- **AWS Application Load Balancer**: Uses `X-Forwarded-For` and `X-Original-Forwarded-For`
- **Google Cloud Load Balancer**: Uses `X-Forwarded-For`
- **Heroku**: Uses `X-Forwarded-For`
- **Vercel**: Uses `X-Forwarded-For`
- **DigitalOcean App Platform**: Uses `X-Forwarded-For`

### 3. IP Address Validation

- IPv4 format validation
- IPv6 format validation
- IPv6 prefix removal (`::ffff:`)
- Port number stripping

### 4. Debug Logging

Comprehensive logging for production troubleshooting:

```javascript
// Enable debug mode
const clientIp = vnpayService.getClientIpAddress(req, true);
```

## Usage Examples

### Express.js with Trust Proxy

```javascript
// Enable trust proxy for Express.js
app.set("trust proxy", true);

// In your route handler
app.post("/api/vnpay/create-payment", (req, res) => {
  const clientIp = vnpayService.getClientIpAddress(req);
  // Use clientIp for VNPay payment creation
});
```

### Nginx Configuration

```nginx
server {
    location / {
        proxy_pass http://your-app;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ProxyPreserveHost On
    ProxyPass / http://your-app/
    ProxyPassReverse / http://your-app/
</VirtualHost>
```

### Cloudflare Setup

No additional configuration needed. The system automatically detects `CF-Connecting-IP` header.

## Testing

### Local Development

```javascript
// Returns '127.0.0.1' for local development
const clientIp = vnpayService.getClientIpAddress(req);
```

### Production Testing

```javascript
// Enable debug logging to see all headers
const clientIp = vnpayService.getClientIpAddress(req, true);
```

Debug output example:

```
IP Headers Debug: {
  'x-forwarded-for': '203.113.xxx.xxx, 172.31.xxx.xxx',
  'x-real-ip': '203.113.xxx.xxx',
  'cf-connecting-ip': undefined,
  'connection.remoteAddress': '172.31.xxx.xxx',
  'socket.remoteAddress': '172.31.xxx.xxx'
}
Final selected IP address: 203.113.xxx.xxx
```

## Security Considerations

### 1. Trusted Proxies

Only use this implementation when you trust your proxy infrastructure. Malicious clients can potentially spoof headers.

### 2. IP Validation

The system validates IP format but doesn't verify IP authenticity. For high-security applications, consider additional validation.

### 3. Rate Limiting

Use the extracted IP for rate limiting VNPay payment requests:

```javascript
const clientIp = vnpayService.getClientIpAddress(req);
// Apply rate limiting based on clientIp
```

## Common Deployment Scenarios

### 1. Heroku

```javascript
// Heroku automatically sets X-Forwarded-For
// No additional configuration needed
const clientIp = vnpayService.getClientIpAddress(req);
```

### 2. Vercel

```javascript
// Vercel handles X-Forwarded-For automatically
const clientIp = vnpayService.getClientIpAddress(req);
```

### 3. AWS EC2 + ALB

```javascript
// AWS ALB sets multiple headers
// System prioritizes X-Forwarded-For over X-Original-Forwarded-For
const clientIp = vnpayService.getClientIpAddress(req);
```

### 4. Docker + Reverse Proxy

```dockerfile
# Ensure your reverse proxy sets proper headers
# Example: Traefik, nginx-proxy, etc.
```

## Troubleshooting

### Issue: Always returns '127.0.0.1'

**Solution**: Check if your reverse proxy/load balancer is setting IP headers correctly.

### Issue: Returns proxy IP instead of client IP

**Solution**: Configure your proxy to set `X-Forwarded-For` or `X-Real-IP` headers.

### Issue: IPv6 addresses not working

**Solution**: The system handles IPv6 automatically, including `::ffff:` prefix removal.

## Performance Impact

- **Minimal overhead**: Simple header parsing
- **No external dependencies**: Uses only Node.js built-ins
- **Efficient validation**: Basic regex matching
- **Optional logging**: Debug mode only when needed

## Future Enhancements

1. **GeoIP Integration**: Add location-based validation
2. **Header Priority Configuration**: Allow custom header priority
3. **IP Whitelisting**: Add trusted IP range validation
4. **Caching**: Cache IP extraction for repeated requests

## Related Files

- `utils/vnpay.js` - Main VNPay service with IP extraction
- `utils/ip-utils.js` - Standalone IP utility functions
- `controllers/premium.controller.js` - VNPay payment controller
- `README-IP-HANDLING.md` - This documentation file
