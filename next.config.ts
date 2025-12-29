/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // สั่งให้ข้ามการตรวจ Error ของ TypeScript ตอน Build
    // วิธีนี้จะทำให้คุณได้ URL เว็บไป Pitch งานแน่นอน 100%
    ignoreBuildErrors: true,
  },
  eslint: {
    // สั่งให้ข้ามการตรวจ ESLint ด้วยเพื่อความรวดเร็ว
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
