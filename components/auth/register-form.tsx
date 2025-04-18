"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendOTP, verifyOTP, signUp } from "@/lib/api";
import { emailSchema, otpSchema, RegisterSchema } from "@/schemas";
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
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  // Forms
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });
  const signUpForm = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
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
      } catch {
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
      } catch {
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
          window.location.href = "/login";
        } else {
          toast.error(result.error || "Đăng ký thất bại");
        }
      } catch {
        toast.error("Lỗi khi đăng ký");
      }
    });
  };

  const steps = ["Email", "OTP", "Account"];

  return (
      <CardWrapper
        headerLabel={
          step === 1
            ? "Nhập email"
            : step === 2
            ? "Nhập mã OTP"
            : "Tạo tài khoản"
        }
        backButtonLabel="Quay về đăng nhập"
        backButtonHref="/auth/login"
        showSocial={false}
      >
        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((label, idx) => (
            <motion.div
              key={idx}
              initial={{ flex: 1 }}
              animate={{ flex: idx + 1 <= step ? 3 : 1 }}
              transition={{ duration: 0.3 }}
              className={`h-1 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 ${
                idx + 1 > step && "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Forms */}
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

        {step === 3 && (
          <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              <FormField
                control={signUpForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Username</FormLabel>
                    <FormControl>
                      <motion.div whileFocus={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Chọn username"
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
                    <FormLabel className="text-white">Password</FormLabel>
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