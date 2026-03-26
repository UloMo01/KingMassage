'use client'

import React, { useState } from 'react'
import { useBookingStore } from '@/lib/booking-store'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronDown, Plus, Clock, ClipboardList, Info } from 'lucide-react'

// Define add-on services
const ADD_ON_SERVICES = [
  { name: 'None', price: 0 },
  { name: 'Ear Candling', price: 150 },
  { name: 'Hot Stone', price: 200 },
  { name: 'Ventusa', price: 200 },
  { name: 'Fire Massage', price: 200 }
]

export function SessionDetailsStep() {
  const { formData, updateFormData, nextStep } = useBookingStore()
  const [expandedExtraTime, setExpandedExtraTime] = useState(false)

  // Handle duration selection
  const selectDuration = (duration: number) => {
    updateFormData({ duration })
  }

  // Handle extra time selection
  const selectExtraTime = (extraMinutes: number) => {
    updateFormData({ extraMinutes })
  }

  // Handle add-on selection
  const selectAddOn = (addOn: string, price: number) => {
    updateFormData({
      addOnService: addOn,
      addOnPrice: price
    })
  }

  return (
    <div className="space-y-6">
      {/* Session Duration Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Session Duration</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={formData.duration === 60 ? 'default' : 'outline'}
            onClick={() => selectDuration(60)}
            className="py-3"
          >
            60 minutes
          </Button>
          <Button
            variant={formData.duration === 90 ? 'default' : 'outline'}
            onClick={() => selectDuration(90)}
            className="py-3"
          >
            90 minutes
          </Button>
          <Button
            variant={formData.duration === 120 ? 'default' : 'outline'}
            onClick={() => selectDuration(120)}
            className="py-3"
          >
            120 minutes
          </Button>
          <Button
            variant={formData.duration === 150 ? 'default' : 'outline'}
            onClick={() => selectDuration(150)}
            className="py-3"
          >
            150 minutes
          </Button>
        </div>

        {/* Extra Time (Optional) */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setExpandedExtraTime(!expandedExtraTime)}
            className="flex items-center gap-2 text-sm font-medium text-green-600"
          >
            <Plus className="h-4 w-4" />
            Extra Time (Optional)
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expandedExtraTime ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedExtraTime && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button
                variant={formData.extraMinutes === 0 ? 'default' : 'outline'}
                onClick={() => selectExtraTime(0)}
                className="py-2"
              >
                No extra time
              </Button>
              <Button
                variant={formData.extraMinutes === 15 ? 'default' : 'outline'}
                onClick={() => selectExtraTime(15)}
                className="py-2"
              >
                +15 minutes
              </Button>
              <Button
                variant={formData.extraMinutes === 30 ? 'default' : 'outline'}
                onClick={() => selectExtraTime(30)}
                className="py-2 col-span-2"
              >
                +30 minutes
              </Button>
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Session Preferences Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Session Preferences</h3>
        </div>

        <div className="space-y-3">
          {/* Preferred Pressure Level */}
          <div className="space-y-2">
            <Label className="text-sm">Preferred Pressure Level</Label>
            <Select
              value={formData.pressurePreference}
              onValueChange={(val) => updateFormData({ pressurePreference: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pressure level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-preference">No Preference</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="firm">Firm/Deep</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Focus Areas */}
          <div className="space-y-2">
            <Label className="text-sm">Primary Focus Areas</Label>
            <Select
              value={formData.focusArea}
              onValueChange={(val) => updateFormData({ focusArea: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select focus area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-body">Full Body (Even Distribution)</SelectItem>
                <SelectItem value="back-shoulders">Back & Shoulders</SelectItem>
                <SelectItem value="legs-feet">Legs & Feet</SelectItem>
                <SelectItem value="neck-upper-back">Neck & Upper Back</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Needs */}
          <div className="space-y-2">
            <Label className="text-sm">Additional Needs</Label>
            <Select
              value={formData.additionalNeeds}
              onValueChange={(val) => updateFormData({ additionalNeeds: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select additional needs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Special Needs</SelectItem>
                <SelectItem value="oil-allergy">Oil Allergy</SelectItem>
                <SelectItem value="table-assistance">Needs Table Setup Help</SelectItem>
                <SelectItem value="quiet-session">Quiet Session (No Conversation)</SelectItem>
                <SelectItem value="aromatherapy">Aromatherapy Preferred</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label className="text-sm">Additional Details (Optional)</Label>
            <Input
              placeholder="Specify allergies, injuries, or extra preferences..."
              value={formData.specialRequests || ''}
              onChange={(e) => updateFormData({ specialRequests: e.target.value })}
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* --- ADD-ON SERVICES SECTION (AFTER SESSION PREFERENCES) --- */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Add-On Services</h3>
        </div>

        {/* Note about additional 15 minutes */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md text-amber-800 text-sm">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p><strong>Important Note:</strong> All add-on services include an additional 15 minutes added to your total session duration.</p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm">Select Add-On (Optional)</Label>
          <Select
            value={formData.addOnService || 'None'}
            onValueChange={(val) => {
              const selected = ADD_ON_SERVICES.find(s => s.name === val)
              selectAddOn(selected.name, selected.price)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an add-on service" />
            </SelectTrigger>
            <SelectContent>
              {ADD_ON_SERVICES.map(service => (
                <SelectItem 
                  key={service.name} 
                  value={service.name}
                >
                  {service.name} {service.price > 0 ? `(+₱${service.price})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {formData.addOnService && formData.addOnService !== 'None' && (
            <div className="p-2 bg-green-50 rounded-md text-sm text-green-700">
              ✔ {formData.addOnService} added (+₱{formData.addOnPrice} | +15 minutes to total duration)
            </div>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <Button
        className="w-full py-6 text-base font-medium"
        onClick={nextStep}
        disabled={!formData.duration}
      >
        Continue to Schedule
      </Button>
    </div>
  )
}
