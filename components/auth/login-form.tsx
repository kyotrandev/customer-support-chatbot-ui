"use client"

import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from '@/schemas'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useTransition } from 'react'
import { CardWrapper } from '@/components/auth/card-wrapper'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { DEFAULT_LOGIN_REDIRECT } from '@/constants/route'
import Link from 'next/link'
import { LogIn, User, KeyRound } from 'lucide-react'
import { motion } from 'framer-motion'

const LoginForm = () => {
  const [isPending, startTransition] = useTransition()
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: ''
    },
  })

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          redirect: false,
          username: values.username,
          password: values.password,
        })
        if (result?.error) {
          toast.error('Login failed')
        } else {
          toast.success('Login successful')
          window.location.href = DEFAULT_LOGIN_REDIRECT
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        toast.error(err.message || 'Invalid data')
      }
    })
  }

  return (
    <CardWrapper
      headerLabel="Welcome back!"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="space-y-6"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Username field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-100">
                      <User className="h-5 w-5 text-teal-300" />
                      Username
                    </FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="relative"
                      >
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Enter your username"
                          type="text"
                          className="bg-gradient-to-r from-gray-800 to-gray-700 border border-transparent text-white placeholder-gray-400 focus:border-teal-400 pl-3"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-pink-400" />
                  </FormItem>
                )}
              />

              {/* Password field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-100">
                      <KeyRound className="h-5 w-5 text-teal-300" />
                      Password
                    </FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="relative"
                      >
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="••••••••"
                          type="password"
                          className="bg-gradient-to-r from-gray-800 to-gray-700 border border-transparent text-white placeholder-gray-400 focus:border-teal-400 pl-3"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-pink-400" />
                  </FormItem>
                )}
              />

              {/* Forgot password link */}
              <div className="flex justify-end">
                {isPending ? (
                  <span className="text-sm text-gray-500">Forgot password?</span>
                ) : (
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-teal-300 hover:text-teal-200 transition"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 py-3 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Login
                </>
              )}
            </Button>
          </form>
        </Form>
      </motion.div>
    </CardWrapper>
  )
}

export default LoginForm
