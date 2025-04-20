import { assets } from "@/assets/assets";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import { ArrowRight, Bot } from "lucide-react";
import Link from "next/link";

const HeaderHome = ({ session }: { session: Session | null }) => {
  const displayName = session?.user?.username || "Khách hàng";

  return (
    <div className="flex flex-col items-center pt-16 px-4 text-center space-y-8">
      {/* Chào mừng người dùng */}
      {session && (
        <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 animate-fadeIn">
          <span className="text-lg">Chào mừng trở lại, {displayName}!</span>
          <div className="w-6 h-6 relative">
            <Image
              src={assets.hand_wave}
              alt="Vẫy tay"
              fill
              className="object-contain animate-wave"
            />
          </div>
        </div>
      )}

      {/* Tiêu đề bán hàng hấp dẫn */}
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl leading-tight">
        Trợ lý AI Bán Hàng{" "}
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-red-500">
          Thông Minh & Hiệu Quả
        </span>
      </h1>

      {/* Mô tả sản phẩm */}
      <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto font-light">
        Tự động hóa bán hàng, chăm sóc khách hàng 24/7, gợi ý thông minh và tăng tỷ lệ chuyển đổi – tất cả trong một trợ lý Sen AI mạnh mẽ.
      </p>

      {/* Nút CTA tùy thuộc vào trạng thái đăng nhập */}
      {session ? (
        <Link href="/chat">
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-full px-8 py-6 text-lg mt-6 group transition-all"
          >
            Bắt đầu chốt đơn
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      ) : (
        <Link href="/auth/login">
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-full px-8 py-6 text-lg mt-6 group transition-all"
          >
            Trải nghiệm ngay💕
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      )}

      {/* Biểu tượng AI có hoạt ảnh */}
      <div className="relative w-48 h-48 mt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-red-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <div className="relative w-full h-full bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
          <Bot className="w-20 h-20 text-pink-300" />
        </div>
      </div>
    </div>
  );
};

export default HeaderHome;
