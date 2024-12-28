/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() { // when accessing source, redirect to destination
    return [
      {
        source: '/master',
        destination: '/master/supplier',
        permanent: true,
      },
      {
        source: '/inventory',
        destination: '/inventory/product',
        permanent: true,
      },
      {
        source: '/transaction',
        destination: '/transaction/purchase-order',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/settings/user',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
