'use client'

import React, { useState } from 'react'
import type { Booking } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DollarSign } from 'lucide-react'

// Status badge helper
const getStatusBadge = (status: string) => {
  switch(status) {
    case 'pending': return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
    case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    case 'completed': return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
    case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
    default: return <Badge>{status}</Badge>
  }
}

// Default earnings per service type (matches new services)
const DEFAULT_SERVICE_EARNINGS = {
  'Swedish': 600,
  'Shiatsu': 600,
  'Thai': 600,
  'Combination': 600,
  'Ear Candling': 150,
  'Hot Stone': 200,
  'Ventusa': 200,
  'Fire Massage': 200
}

interface BookingsTableProps {
  bookings: (Booking & { users: { email: string } })[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [earningsInputs, setEarningsInputs] = useState<Record<string, number>>({})
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const supabase = createClient()

  // Initialize earnings inputs with defaults if available
  React.useEffect(() => {
    const initialInputs: Record<string, number> = {}
    const initialNotes: Record<string, string> = {}
    
    bookings.forEach(booking => {
      if (booking.earnings) initialInputs[booking.id] = booking.earnings
      if (booking.earnings_notes) initialNotes[booking.id] = booking.earnings_notes || ''
      if (!booking.earnings) initialInputs[booking.id] = DEFAULT_SERVICE_EARNINGS[booking.service as keyof typeof DEFAULT_SERVICE_EARNINGS] || 0
    })

    setEarningsInputs(initialInputs)
    setNotesInputs(initialNotes)
  }, [bookings])

  // Update earnings or notes
  const handleInputChange = (id: string, type: 'earnings' | 'notes', value: string | number) => {
    if (type === 'earnings') {
      setEarningsInputs(prev => ({ ...prev, [id]: Number(value) }))
    } else {
      setNotesInputs(prev => ({ ...prev, [id]: value as string }))
    }
  }

  // Mark booking as completed with earnings
  const completeBooking = async (id: string) => {
    if (earningsInputs[id] === undefined || earningsInputs[id] <= 0) {
      alert('Please enter valid earnings amount first!')
      return
    }

    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          earnings: earningsInputs[id],
          earnings_notes: notesInputs[id]
        })
        .eq('id', id)

      if (error) throw error
      window.location.reload()
    } catch (err) {
      console.error('Failed to complete booking:', err)
      alert('Error updating booking status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Update booking status (approve/reject)
  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      window.location.reload()
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Error updating booking status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Earnings (PHP)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map(booking => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="font-medium">{booking.name}</div>
                  <div className="text-sm text-muted-foreground">{booking.users.email}</div>
                </TableCell>
                <TableCell>{booking.service}</TableCell>
                <TableCell>
                  <div>{new Date(booking.created_at).toLocaleDateString('en-PH')}</div>
                  <div className="text-sm text-muted-foreground">{booking.time}</div>
                </TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>
                  {booking.status === 'completed' ? (
                    <div className="font-medium">₱{(booking.earnings || 0).toLocaleString('en-PH')}</div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        <Input
                          type="number"
                          min="0"
                          value={earningsInputs[booking.id] || ''}
                          onChange={(e) => handleInputChange(booking.id, 'earnings', e.target.value)}
                          className="w-24 text-sm"
                        />
                      </div>
                      <Input
                        placeholder="Notes (optional)"
                        value={notesInputs[booking.id] || ''}
                        onChange={(e) => handleInputChange(booking.id, 'notes', e.target.value)}
                        className="w-full text-xs"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(booking.id, 'approved')}
                          disabled={updatingId === booking.id}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(booking.id, 'rejected')}
                          disabled={updatingId === booking.id}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {booking.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => completeBooking(booking.id)}
                        disabled={updatingId === booking.id || !earningsInputs[booking.id]}
                      >
                        {updatingId === booking.id ? 'Processing...' : 'Complete'}
                      </Button>
                    )}
                    {booking.status === 'completed' && (
                      <Badge className="bg-emerald-100 text-emerald-800">Finalized</Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
