'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { SiTelegram } from 'react-icons/si'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isTelegramLoading, setIsTelegramLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL ||
            `${window.location.origin}/book`,
        },
      })
      if (error) throw error
      router.push('/book')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL ||
            `${window.location.origin}/book`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Google login failed')
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // ✅ NEW: Telegram OAuth handler
  const handleTelegramLogin = async () => {
    setIsTelegramLoading(true)
    setError(null)

    try {
      const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'KingMassageBot'
      const redirectUrl = `${window.location.origin}/auth/telegram-callback`
      
      sessionStorage.setItem('telegramRedirect', 'login')
      
      window.location.href = `https://t.me/${telegramBotUsername}?start=${encodeURIComponent(redirectUrl)}`
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Telegram login failed')
      setIsTelegramLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                  <div className="flex items-center gap-2 py-2">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-sm text-gray-500">Or continue with</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Google Button */}
                  <Button
                    type="button"
                    className="w-full bg-white border border-gray-300 text-gray-800 hover:bg-gray-50"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                  >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    {isGoogleLoading ? 'Processing...' : 'Continue with Google'}
                  </Button>

                  {/* ✅ NEW: Telegram Button */}
                  <Button
                    type="button"
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white transition-colors"
                    onClick={handleTelegramLogin}
                    disabled={isTelegramLoading}
                  >
                    <SiTelegram className="mr-2 h-5 w-5" />
                    {isTelegramLoading ? 'Processing...' : 'Continue with Telegram'}
                  </Button>
                </div>
              </form>
              <div className="mt-4 text-center text-sm">
                Don't have an account?{' '}
                <Link href="/auth/sign-up" className="text-primary underline">
                  Sign up here
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
