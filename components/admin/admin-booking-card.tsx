'use client'

import React from 'react'
import { Booking } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Clock, 
  Calendar, 
  Activity, 
  Target,
  PlusCircle,
  CheckCircle
} from 'lucide-react'

interface AdminBookingCardProps {
  booking: Booking
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onComplete: (id: string) => void // ✅ Added complete action
}

export function AdminBookingCard({ booking, onApprove, onReject, onComplete }: AdminBookingCardProps) {
  // Normalize status to lowercase to prevent "Pending" vs "pending" bugs
  const status = booking.status?.toLowerCase()

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-6">
      {/* 1. Header */}
      <div className="p-6 flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-black text-slate-900 leading-tight">{booking.service}</h3>
          <div className="flex items-center gap-2 mt-1 text-slate-500 font-bold">
            <User className="w-4 h-4" />
            <span className="text-sm">{booking.name}</span>
          </div>
        </div>
        <Badge className={cn(
          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none",
          status === 'pending' && "bg-amber-100 text-amber-700",
          status === 'approved' && "bg-emerald-100 text-emerald-700",
          status === 'completed' && "bg-blue-100 text-blue-700",
          status === 'rejected' && "bg-red-100 text-red-700"
        )}>
          {booking.status}
        </Badge>
      </div>

      {/* 2. Date & Time */}
      <div className="grid grid-cols-2 border-y border-slate-50">
        <div className="p-5 border-r border-slate-50 flex items-center gap-4">
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black">Date</p>
            <p className="text-sm font-black text-slate-800">{booking.date}</p>
          </div>
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-black">Time</p>
            <p className="text-sm font-black text-slate-800">{booking.time} ({booking.duration}m)</p>
          </div>
        </div>
      </div>

      {/* 3. Session Preferences */}
      <div className="p-6 space-y-4 bg-slate-50/30">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-600" />
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Session Details</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-bold">Pressure</p>
              <p className="text-xs font-black text-slate-700 capitalize">{booking.pressure_preference || 'Medium'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-bold">Focus Area</p>
              <p className="text-xs font-black text-slate-700 capitalize">{booking.focus_area?.replace('-', ' ') || 'Full Body'}</p>
            </div>
          </div>
        </div>

        {/* Add-on Display (Matching your schema) */}
        {booking.add_on_service && booking.add_on_service !== 'None' && (
           <div className="mt-2 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex justify-between items-center">
             <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tight">Add-on: {booking.add_on_service}</span>
             <span className="text-xs font-black text-emerald-800">+₱{booking.add_on_price}</span>
           </div>
        )}
      </div>

      {/* 4. Action Buttons Logic */}
      <div className="px-6 pb-6 bg-white">
        {status === 'pending' && (
          <div className="flex gap-4 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 h-14 border-red-100 text-red-600 hover:bg-red-50 rounded-2xl font-black"
              onClick={() => onReject(booking.id)}
            >
              <XCircle className="w-5 h-5 mr-2" /> Reject
            </Button>
            <Button 
              className="flex-1 h-14 bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg"
              onClick={() => onApprove(booking.id)}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" /> Approve
            </Button>
          </div>
        )}

        {status === 'approved' && (
          <Button 
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg mt-2"
            onClick={() => onComplete(booking.id)}
          >
            <CheckCircle className="w-5 h-5 mr-2" /> Mark as Completed
          </Button>
        )}
      </div>

      {/* 5. Pricing Footer */}
      <div className="p-6 bg-slate-900 flex justify-between items-center">
        <p className="text-[10px] text-white/50 uppercase font-black">Total Payment</p>
        <p className="text-xl font-black text-white">₱{booking.total_price}</p>
      </div>
    </div>
  )
}
