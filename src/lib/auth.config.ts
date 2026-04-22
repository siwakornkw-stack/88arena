import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/sport/auth/signin',
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.emailVerified = (user as { emailVerified?: Date | null }).emailVerified ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isAdminPath = nextUrl.pathname.startsWith('/sport/admin');
      const isBookingsPath = nextUrl.pathname.startsWith('/sport/bookings');

      if (isAdminPath) {
        if (!isLoggedIn) return Response.redirect(new URL(`/sport/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl));
        if (role !== 'ADMIN') return Response.redirect(new URL('/sport', nextUrl));
        return true;
      }

      if (isBookingsPath) {
        if (!isLoggedIn) return Response.redirect(new URL(`/sport/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl));
        return true;
      }

      const isProfilePath = nextUrl.pathname.startsWith('/sport/profile');
      if (isProfilePath) {
        if (!isLoggedIn) return Response.redirect(new URL(`/sport/auth/signin?callbackUrl=${nextUrl.pathname}`, nextUrl));
        return true;
      }

      return true;
    },
  },
};
