import type {Config} from '@react-router/dev/config';
import {vercelPreset} from '@vercel/react-router/vite';

/**
 * React Router configuration for Hydrogen on Vercel.
 *
 * Vercel's preset generates the serverless functions for React Router's
 * server-rendered routes.
 */
export default {
  ssr: true,
  presets: [vercelPreset()],
} satisfies Config;
