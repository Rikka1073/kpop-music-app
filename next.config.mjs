/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 開発環境用のダミー環境変数を設定します
  // 注意: 本番環境では実際の環境変数を使用する必要があります
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://your-supabase-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'your-supabase-anon-key',
  },
}

export default nextConfig