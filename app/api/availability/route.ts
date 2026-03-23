import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addMinutes, format, setHours, setMinutes } from 'date-fns'

// Business hours: 8:30 AM to 3:00 AM next day
const WORKING_HOURS_START_HOUR = 8
const WORKING_HOURS_START_MINUTE = 30
const SLOT_INTERVAL = 90 // 1 hour gap between slots

// Generate all possible time slots for a day
function generateTimeSlots(): string[] {
  const slots: string[] = []
  
  // Start time: 8:30 AM
  let currentTime = setMinutes(setHours(new Date(), WORKING_HOURS_START_HOUR), WORKING_HOURS_START_MINUTE)
  
  // Generate 19 slots (covers 8:30 AM to 3:00 AM next day = ~18.5 hours)
  for (let i = 0; i < 19; i++) {
    slots.push(format(currentTime, 'h:mm a'))
    currentTime = addMinutes(currentTime, SLOT_INTERVAL)
  }

  return slots
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dateParam = searchParams.get('date')

  if (!dateParam) {
    return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    
    // Get all bookings for the requested date
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('time, duration, extra_minutes')
      .eq('date', dateParam)
      .in('status', ['pending', 'approved'])

    if (error) {
      console.error('Database error:', error)
      // If database errors, still return all slots as available
      const allSlots = generateTimeSlots()
      return NextResponse.json({ 
        slots: allSlots.map(time => ({ time, available: true }))
      })
    }

    // Generate all time slots
    const allSlots = generateTimeSlots()
    
    // Mark slots as unavailable if they conflict with existing bookings
    const slotsWithAvailability = allSlots.map((slotTime) => {
      const isBooked = bookings?.some((booking) => {
        // Simple check: if a booking exists at this exact time, mark as unavailable
        return booking.time === slotTime
      })

      return {
        time: slotTime,
        available: !isBooked,
      }
    })

    return NextResponse.json({ slots: slotsWithAvailability })
  } catch (error) {
    console.error('Availability API error:', error)
    // Return all slots as available if error occurs
    const allSlots = generateTimeSlots()
    return NextResponse.json({ 
      slots: allSlots.map(time => ({ time, available: true }))
    })
  }
}
