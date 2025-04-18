/**
 * Mảng route có thể truy cấp đến public
 * Các route không cần authentication
 * @type {string[]}
 */
export const publicRoutes = [
    "/",
    "/auth/error"
]

/**
 * Các route dùng cho authentication
 * Các route có thể chuyển hướng người dùng /setting
 * @type {string[]}
 */
export const authRoutes = [
    "/auth/login",
    "/auth/register",
    // "/auth/error",
    "/auth/forgot-password"
]

/**
 * Tiền tố cho API authentication routes
 * Các router bắt đầu bằng các tiền tố này dùng cho API Authentication route
 * @type {string[]}
 */
export const apiAuthPrefix = "/api/auth"

/**
 * Đường dẫn mặc định cho login
 * @type {string[]}
 */
export const DEFAULT_LOGIN_REDIRECT = "/private/profile"