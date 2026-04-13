import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn() {
      return true
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google') {
        token.googleId = account.providerAccountId
        token.avatar = (profile as any)?.picture
      }
      return token
    },
    async session({ session, token }) {
      ;(session as any).googleId = token.googleId
      ;(session as any).avatar = token.avatar
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'propsarathi-secret-2026',
})

export { handler as GET, handler as POST }
