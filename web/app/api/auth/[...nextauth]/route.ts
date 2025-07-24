import { GET } from './route';
import NextAuth from 'next-auth/next'
import { authConfig } from '@/lib/auth.config';

export const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }