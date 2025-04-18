declare module "next-auth" {
  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id: string
    username: string
    email: string
    accessToken: string
    refreshToken: string
    apiKeyAIService?: string
  }
  /**
   * The shape of the account object returned in the OAuth providers' `account` callback,
   * Usually contains information about the provider being used, like OAuth tokens (`access_token`, etc).
   */
  interface Account {
    provider: string
    type: string
    access_token?: string
    refresh_token?: string
    expires_at?: number
    token_type?: string
    id_token?: string
  }
 
  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    user: {
      id: string
      username: string
      email: string
    } 
    tokens: {
      accessToken: string
      refreshToken: string
    }
    apiKeyAIService?: string
  } 
}
 
// The `JWT` interface can be found in the `next-auth/jwt` submodule
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from "next-auth/jwt"
 
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    id: string
    username: string
    email: string
    accessToken: string
    refreshToken: string
    apiKeyAIService?: string
  }
}