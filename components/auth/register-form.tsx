"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Poppins } from "next/font/google";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { sendOTP, verifyOTP, signUp } from "@/lib/api";
import { cn } from "@/lib/utils";

// Zod schemas
const emailSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});

const otpSchema = z.object({
  otp: z.string().min(6, { message: "Mã OTP phải có ít nhất 6 ký tự" }),
});

const RegisterSchema = z.object({
  username: z.string().min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  // Forms
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    defaultValues: { email: "" },
  });
  
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    defaultValues: { otp: "" },
  });
  
  const signUpForm = useForm<z.infer<typeof RegisterSchema>>({
    defaultValues: { username: "", password: "" },
  });

  // Handlers
  const handleSendOTP = (values: z.infer<typeof emailSchema>) => {
    startTransition(async () => {
      try {
        const result = await sendOTP(values.email);
        if (result.success) {
          setEmail(values.email);
          setStep(2);
          toast.success("OTP đã được gửi!");
        } else {
          toast.error(result.error || "Gửi OTP thất bại");
        }
      } catch (error) {
        toast.error("Lỗi khi gửi OTP");
      }
    });
  };

  const handleVerifyOTP = (values: z.infer<typeof otpSchema>) => {
    startTransition(async () => {
      try {
        const result = await verifyOTP(email, values.otp);
        if (result.success) {
          signUpForm.reset({ username: "", password: "" });
          setStep(3);
          toast.success("OTP xác thực thành công!");
        } else {
          toast.error(result.error || "Xác thực OTP thất bại");
        }
      } catch (error) {
        toast.error("Lỗi khi xác thực OTP");
      }
    });
  };

  const handleSignUp = (values: z.infer<typeof RegisterSchema>) => {
    startTransition(async () => {
      try {
        const result = await signUp(values.username, email, values.password);
        if (result.success) {
          toast.success("Đăng ký thành công!");
          window.location.href = "/auth/login";
        } else {
          toast.error(result.error || "Đăng ký thất bại");
        }
      } catch (error) {
        toast.error("Lỗi khi đăng ký");
      }
    });
  };

  const steps = ["Email", "OTP", "Tài khoản"];
  
  const headerLabel = step === 1 
    ? "Nhập email" 
    : step === 2 
    ? "Nhập mã OTP" 
    : "Tạo tài khoản";

  return (
    <CardWrapper
      headerLabel={headerLabel}
      backButtonLabel="Quay về đăng nhập"
      backButtonHref="/auth/login"
      showSocial={false}
    >
      {/* Progress Bar */}
      <div className="flex gap-2 mb-6">
        {steps.map((label, idx) => (
          <motion.div
            key={idx}
            initial={{ flex: 1 }}
            animate={{ flex: idx + 1 <= step ? 3 : 1 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "h-1 rounded-full", 
              idx + 1 <= step 
                ? "bg-gradient-to-r from-indigo-400 to-pink-400" 
                : "bg-white/20"
            )}
          />
        ))}
      </div>

      {/* Step 1: Email Form */}
      {step === 1 && (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="example@domain.com"
                        type="email"
                        className="bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400"
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage className="text-pink-300" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isPending ? "Đang gửi..." : "Gửi OTP"}
            </Button>
          </form>
        </Form>
      )}

      {/* Step 2: OTP Verification Form */}
      {step === 2 && (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Mã OTP</FormLabel>
                  <FormControl>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="XXXXXX"
                        className="bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400"
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage className="text-pink-300" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500"
            >
              {isPending ? "Đang xác thực..." : "Xác thực OTP"}
            </Button>
          </form>
        </Form>
      )}

      {/* Step 3: Account Creation Form */}
      {step === 3 && (
        <Form {...signUpForm}>
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
            <FormField
              control={signUpForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Tên đăng nhập</FormLabel>
                  <FormControl>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Chọn tên đăng nhập"
                        className="bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400"
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage className="text-pink-300" />
                </FormItem>
              )}
            />
            <FormField
              control={signUpForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Mật khẩu</FormLabel>
                  <FormControl>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Nhập mật khẩu"
                        type="password"
                        className="bg-white/10 text-white placeholder-white/50 focus:ring-2 focus:ring-indigo-400"
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage className="text-pink-300" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
            >
              {isPending ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
        </Form>
      )}
    </CardWrapper>
  );
}