import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes
} from "@/constants/route"
import { auth } from "@/lib/auth"


export default auth((req) => {
  const { nextUrl } = req
  const isLoggingIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname )
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute) {
    return 
  }

  if (isAuthRoute) {
    if (isLoggingIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return
  }

  if (!isLoggingIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", nextUrl))
  }

  return
})
 
// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: [// Chỉ áp dụng middleware cho các route cần bảo vệ
  "/private/:path*",
  "/dashboard/:path*",
  // Bỏ các route tĩnh hoặc không cần kiểm tra
  "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
]
}
