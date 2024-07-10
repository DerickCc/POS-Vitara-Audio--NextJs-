/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/master',
        destination: '/master/supplier',
        permanent: true,
      },
      
    ]
  }
}

module.exports = nextConfig
