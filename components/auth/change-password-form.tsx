"use client";

import React from "react";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { changePassword } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Components
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
import { changePasswordSchema } from "@/schemas";

export default function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { email: "", oldPassword: "", newPassword: "" },
  });

  const handleChangePassword = (values: z.infer<typeof changePasswordSchema>) => {
    startTransition(async () => {
      try {
        const result = await changePassword(
          values.email,
          values.oldPassword,
          values.newPassword
        );
        if (result.success) {
          toast.success("Đổi mật khẩu thành công!");
          router.push("/auth/login");
        } else {
          toast.error(result.error || "Đổi mật khẩu thất bại");
        }
      } catch {
        toast.error("Đã xảy ra lỗi khi đổi mật khẩu");
      }
    });
  };

  return (
    <CardWrapper
      headerLabel="Đổi mật khẩu"
      backButtonLabel="Back to Home"
      backButtonHref="/"
      showSocial={false}
    >
      <Form {...form}>
        <motion.form
          onSubmit={form.handleSubmit(handleChangePassword)}
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
          }}
        >
          {[
            { name: "email", label: "Email", type: "email", placeholder: "example@exam.com" },
            { name: "oldPassword", label: "Mật khẩu cũ", type: "password", placeholder: "Nhập mật khẩu cũ" },
            { name: "newPassword", label: "Mật khẩu mới", type: "password", placeholder: "Nhập mật khẩu mới" },
          ].map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name={field.name as any}
              render={({ field: hookField }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-base">
                    {field.label}
                  </FormLabel>
                  <FormControl>
                    <motion.div
                      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Input
                        {...hookField}
                        disabled={isPending}
                        placeholder={field.placeholder}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        type={field.type as any}
                        className="focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition"
                      />
                    </motion.div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          ))}

          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <Button
              type="submit"
              className="w-full py-3 font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 transition-transform transform hover:scale-105"
              disabled={isPending}
            >
              {isPending ? (
                <span>Đang xử lý...</span>
              ) : (
                <span>Đổi mật khẩu</span>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </Form>
    </CardWrapper>
  );
}
