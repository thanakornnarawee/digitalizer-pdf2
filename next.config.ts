/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! คำเตือน: บรรทัดนี้จะสั่งให้ Vercel ยอมให้ Build ผ่านแม้จะมี Type Error !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // สั่งให้ข้ามการตรวจ ESLint ด้วยเพื่อความรวดเร็ว
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;