'use client'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Page() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          if (error.message.includes('PKCE')) {
            setError('Please sign in again (clear cache if needed)')
          } else {
            setError(error.message)
          }
        } else if (user) {
          setIsLoggedIn(true)
        }
      } catch (err) {
        setError('Failed to check session')
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 bg-gray-50">
      <Card className="w-full max-w-sm shadow-md p-5">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">Thank you for signing up!</h2>
        {isLoading && <p className="text-center text-gray-500">Finalizing your account...</p>}
        {error && <p className="text-center text-red-500 text-sm mt-2">{error}</p>}
        {!isLoading && !error && (
          <>
            {isLoggedIn ? (
              <Link href="/book" className="block w-full mt-6">
                <Button className="w-full py-2">Go to Bookings</Button>
              </Link>
            ) : (
              <>
                <p className="text-center text-gray-600 mt-4 text-sm">
                  Check your email for a verification link!
                </p>
                <Link 
                  href="/auth/login" 
                  className="block text-center mt-4 text-primary font-medium"
                >
                  Already verified? Login here
                </Link>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
