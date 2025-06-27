module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['finziopay.com'],
  },
  // Bypass SSL verification (only for development)
  experimental: {
    serverActions: {
      allowedOrigins: ['http://meefo.shop:4000'],
    },
  },
}