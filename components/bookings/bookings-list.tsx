'use client'

import { useState } from 'react'
import type { Booking } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { format, parseISO, startOfDay, isBefore } from 'date-fns'
import { Calendar, Clock, MapPin, Sparkles, MessageCircle, CheckCircle, Clock3, XCircle, Loader2 } from 'lucide-react'
import { ChatDialog } from '@/components/chat/chat-dialog'
import { CancelDialog } from './cancel-dialog' // Ensure you created this file
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface BookingsListProps {
  bookings: Booking[]
  userId: string
}

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
}

const STATUS_LABELS = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function BookingsList({ bookings, userId }: BookingsListProps) {
  const [chatOpen, setChatOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleOpenCancelModal = (id: string) => {
    setSelectedBookingId(id)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return
    
    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', selectedBookingId)

      if (error) throw error
      
      setIsCancelModalOpen(false)
      router.refresh()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsSubmitting(false)
      setSelectedBookingId(null)
    }
  }

  // --- Logic Fix: Using startOfDay so "Today" stays in Upcoming ---
  const today = startOfDay(new Date())

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = startOfDay(parseISO(booking.date as string))
    const isFutureOrToday = !isBefore(bookingDate, today)
    const isActive = booking.status !== 'cancelled' && booking.status !== 'completed'
    return isFutureOrToday && isActive
  })

  const pastBookings = bookings.filter(booking => {
    const bookingDate = startOfDay(parseISO(booking.date as string))
    const isPastDate = isBefore(bookingDate, today)
    const isFinalized = booking.status === 'cancelled' || booking.status === 'completed'
    return isPastDate || isFinalized
  })

  if (bookings.length === 0) {
    return (
      <Empty
        icon={Calendar}
        title="No bookings yet"
        description="Book your first massage session to get started"
      >
        <Button asChild>
          <a href="/book">Book Now</a>
        </Button>
      </Empty>
    )
  }

  return (
    <>
      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Clock3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-green-700">Upcoming Bookings</h2>
          </div>
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onChatOpen={() => setChatOpen(true)} 
                onCancel={() => handleOpenCancelModal(booking.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past/Archived Bookings */}
      {pastBookings.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-muted-foreground">Past & Activity</h2>
          </div>
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onChatOpen={() => setChatOpen(true)} 
                isPast 
              />
            ))}
          </div>
        </div>
      )}

      {/* Premium Dialogs */}
      <ChatDialog 
        open={chatOpen} 
        onOpenChange={setChatOpen} 
        userId={userId}
      />

      <CancelDialog 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isLoading={isSubmitting}
      />
    </>
  )
}

function BookingCard({ booking, onChatOpen, onCancel, isPast = false }: any) {
  const canCancel = !isPast && (booking.status === 'pending' || booking.status === 'approved')

  return (
    <Card className={`overflow-hidden transition-all ${isPast ? 'opacity-75 bg-muted/20 grayscale-[0.2]' : 'border-l-4 border-l-green-600 shadow-sm'}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${isPast ? 'text-muted-foreground' : 'text-primary'}`} />
                <span className="font-medium">{booking.service} Massage</span>
              </div>
              <Badge className={STATUS_STYLES[booking.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.pending} variant="secondary">
                {STATUS_LABELS[booking.status as keyof typeof STATUS_LABELS] || booking.status}
              </Badge>
            </div>
            
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {booking.time} ({(booking.duration || 60) + (booking.extra_minutes || 0)} min)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1 italic">{booking.location}</span>
              </div>
            </div>
          </div>
          
          <div className="flex md:flex-col items-center justify-center gap-2 p-4 md:border-l bg-muted/10 md:w-32">
            <Button variant="outline" size="sm" className="w-full h-9" onClick={onChatOpen}>
              <MessageCircle className="w-4 h-4 mr-2" /> Chat
            </Button>

            {canCancel && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full h-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={onCancel}
              >
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
