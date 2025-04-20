import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "@/lib/api";

export const {
  auth,
  handlers,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Authorize called with credentials:", credentials);
        if (
          typeof credentials?.username !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          console.error("Missing or invalid credentials:", credentials);
          return null;
        }

        try {
          const response = await login(credentials.username as string, credentials.password as string);
          if (response.success && response.data?.code === 200) {
            const data = response.data;
            const user = {
              id: data.account.id,
              username: data.account.username,
              email: data.account.email,
              accessToken: data.tokens.accessToken,
              refreshToken: data.tokens.refreshToken
            };
            return user;
          } else {
            console.error("Login failed:", response.error);
            return null;
          }
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: { 
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 ngày
    updateAge: 12 * 60 * 60 // Update session after 12h
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = user.username;
        token.email = user.email as string;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {
        id: "",
        username: "",
        email: "",
        apiKeyAIService: "",
      };

      session.user.id = token.id || "";
      session.user.username = token.username || "";
      session.user.email = token.email || "";

      session.tokens = {
        accessToken: token.accessToken || "",
        refreshToken: token.refreshToken || "",
      };
      // console.log("Session callback:", { session, token });
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});