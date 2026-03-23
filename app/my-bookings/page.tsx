'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { BookingsList } from '@/components/bookings/bookings-list'
import { Calendar, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/auth/login?redirect=/my-bookings')
          return
        }

        setUserId(user.id)

        // Fetch bookings for this user
        const { data, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        if (bookingError) {
          console.error('Booking fetch error:', bookingError)
          setError(bookingError.message)
          setBookings([])
        } else {
          console.log('Fetched bookings:', data)
          setBookings(data || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-3xl flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Bookings</h1>
              <p className="text-sm text-muted-foreground">View and manage your appointments</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              Error: {error}
            </div>
          )}
          
          <BookingsList bookings={bookings} userId={userId} />
        </div>
      </main>
    </div>
  )
}
