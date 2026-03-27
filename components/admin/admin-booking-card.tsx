'use client'

import React, { useState } from 'react'
import { Booking } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  User, 
  Info,
  ChevronDown,
  Clock,
  PlusCircle
} from 'lucide-react'

interface AdminBookingCardProps {
  booking: Booking
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onComplete: (id: string) => void 
  onExtendTime?: (id: string, minutes: number) => void
  onAddService?: (id: string, service: string) => void
}

export function AdminBookingCard({ 
  booking, 
  onApprove, 
  onReject, 
  onComplete,
  onExtendTime,
  onAddService
}: AdminBookingCardProps) {
  const status = booking.status?.toLowerCase()
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedService, setSelectedService] = useState('')

  return (
    <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-md ring-1 ring-slate-100 overflow-hidden mb-6">
      {/* 1. Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-slate-900 text-2xl leading-tight truncate">
              {booking.service}
            </h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">
              {booking.name} • {booking.date?.split('-').slice(1).join(' ')}
            </p>
          </div>
        </div>
        
        <Badge className={cn(
          "px-4 py-1.5 rounded-full text-[11px] font-bold uppercase border-none tracking-widest shadow-sm",
          status === 'pending' && "bg-amber-100 text-amber-700",
          status === 'approved' && "bg-emerald-100 text-emerald-700",
          status === 'completed' && "bg-blue-100 text-blue-700",
          status === 'rejected' && "bg-red-100 text-red-700"
        )}>
          {status}
        </Badge>
      </div>

      {/* 2. Expanded Content */}
      <div className="px-6 pb-6 space-y-6">
        {/* Preferences */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Pressure</span>
            <p className="text-sm font-bold text-slate-800 capitalize">{booking.pressure_preference || 'Medium'}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Focus Area</span>
            <p className="text-sm font-bold text-slate-800 capitalize">{booking.focus_area?.replace('-', ' ') || 'Upper Body'}</p>
          </div>
        </div>

        {/* Active Services */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Services</span>
          </div>
          <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl">
            <Badge className="bg-emerald-50 text-emerald-700 font-bold text-xs px-4 py-2 rounded-full shadow-sm">
              {booking.service} ({booking.duration}m)
            </Badge>
            {booking.add_on_service && booking.add_on_service !== 'None' && (
              <Badge className="bg-emerald-100 text-emerald-700 font-bold text-xs px-4 py-2 rounded-full shadow-sm">
                {booking.add_on_service} (+₱{booking.add_on_price})
              </Badge>
            )}
            {booking.extension && (
              <Badge className="bg-amber-100 text-amber-700 font-bold text-xs px-4 py-2 rounded-full shadow-sm">
                +{booking.extension}m Extension
              </Badge>
            )}
          </div>
        </div>

        {/* Admin Actions (only when approved) */}
        {status === 'approved' && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200">
            <p className="text-xs font-black text-slate-600 mb-3">Admin Actions</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <select
                  className="border rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-emerald-50 transition-all duration-200"
                  value={selectedTime}
                  onChange={(e) => {
                    setSelectedTime(e.target.value)
                    onExtendTime?.(booking.id, parseInt(e.target.value))
                  }}
                >
                  <option value="">Extend Time</option>
                  <option value="15">+15m</option>
                  <option value="30">+30m</option>
                  <option value="60">+60m</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-slate-500" />
                <select
                  className="border rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-emerald-50 transition-all duration-200"
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value)
                    onAddService?.(booking.id, e.target.value)
                  }}
                >
                  <option value="">Add Service</option>
                  <option value="Ear Candling">Ear Candling (+₱150)</option>
                  <option value="Hot Stones">Hot Stones (+₱200)</option>
                  <option value="Aromatherapy">Aromatherapy (+₱250)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Earnings</span>
            <div className="flex items-baseline gap-1">
              <span className="text-emerald-600 font-black text-xl">₱</span>
              <span className="text-slate-900 font-black text-3xl">{booking.total_price}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {status === 'pending' && (
              <>
                <button 
                  onClick={() => onReject(booking.id)}
                  className="text-red-500 font-bold text-sm px-2 active:opacity-50 transition-opacity"
                >
                  Reject
                </button>
                <button 
                  onClick={() => onApprove(booking.id)}
                  className="bg-slate-900 text-white rounded-2xl h-12 px-10 flex items-center justify-center font-bold text-xs active:scale-95 transition-transform shadow-lg"
                >
                  Approve
                </button>
              </>
            )}
            {status === 'approved' && (
              <button 
                onClick={() => onComplete(booking.id)}
                className="bg-emerald-600 text-white rounded-2xl h-14 px-12 flex items-center justify-center font-bold text-sm shadow-xl shadow-emerald-100 active:scale-95 transition-transform"
              >
                Finish Session
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
