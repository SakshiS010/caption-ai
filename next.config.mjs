/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // COOP + COEP are required to unlock SharedArrayBuffer (needed by FFmpeg multi-threaded WASM).
          // "credentialless" COEP is less restrictive than "require-corp" — it still enables
          // SharedArrayBuffer but allows anonymous cross-origin fetches (e.g. Hugging Face model downloads).
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Prevent webpack from bundling Node.js-only deps used by @xenova/transformers
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

export default nextConfig;
