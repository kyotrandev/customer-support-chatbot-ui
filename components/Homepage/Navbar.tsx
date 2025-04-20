import { assets } from "@/assets/assets";
import { Button } from "@/components/ui/button";
import AvatarDropdown from "@/components/Homepage/AvartarDropdown"; // Client component for dropdown
import { Session } from "next-auth";
import Link from "next/link";
import { Bot } from "lucide-react";

const NavBarHome = ({ session } : { session: Session | null}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              Sen AI
            </span>
          </Link>

          {/* Liên kết điều hướng */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">
              Tính năng
            </Link>
            <Link href="/#pricing" className="text-slate-300 hover:text-white transition-colors">
              Bảng giá
            </Link>
            <Link href="/#about" className="text-slate-300 hover:text-white transition-colors">
              Giới thiệu
            </Link>
          </div>

          {/* Nút đăng nhập hoặc avatar */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-slate-300 hidden sm:block">
                  {session.user.username}
                </div>
                <AvatarDropdown
                  image={assets.logo}
                  name={session.user.username || "Người dùng"}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="order-indigo-500/50 hover:border-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="order-indigo-500/50 hover:border-black bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBarHome;