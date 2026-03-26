'use client'

import { useBookingStore } from '@/lib/booking-store'
import { SERVICES, DURATIONS, EXTRA_MINUTES, type ServiceType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Sparkles, Clock, Plus, MessageSquare } from 'lucide-react'

export function StepService() {
  const { formData, updateFormData, nextStep } = useBookingStore()

  const isValid = formData.service && formData.duration

  return (
    <div className="space-y-6">
      {/* Existing Service Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Select Your Treatment
        </Label>
        <div className="grid gap-3">
          {SERVICES.map((service) => (
            <Card
              key={service.value}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:border-primary/50',
                formData.service === service.value && 'border-primary bg-primary/5 ring-1 ring-primary'
              )}
              onClick={() => updateFormData({ service: service.value as ServiceType })}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <RadioGroup value={formData.service}>
                  <RadioGroupItem value={service.value} id={service.value} />
                </RadioGroup>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{service.label}</p>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Existing Duration Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Session Duration
        </Label>
        <div className="flex flex-wrap gap-3">
          {DURATIONS.map((duration) => (
            <Button
              key={duration.value}
              type="button"
              variant={formData.duration === duration.value ? 'default' : 'outline'}
              className={cn(
                'flex-1 min-w-[100px]',
                formData.duration === duration.value && 'ring-2 ring-primary/20'
              )}
              onClick={() => updateFormData({ duration: duration.value })}
            >
              {duration.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Existing Extra Time Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          Extra Time (Optional)
        </Label>
        <div className="flex flex-wrap gap-3">
          {EXTRA_MINUTES.map((extra) => (
            <Button
              key={extra.value}
              type="button"
              variant={formData.extraMinutes === extra.value ? 'default' : 'outline'}
              className="flex-1 min-w-[100px]"
              onClick={() => updateFormData({ extraMinutes: extra.value })}
            >
              {extra.label}
            </Button>
          ))}
        </div>
      </div>

      {/* NEW: Special Requests Section with Dropdowns */}
      <div className="space-y-4 border-t pt-4">
        <Label className="text-base font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Session Preferences
        </Label>
        
        {/* Pressure Preference Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="pressure-preference">Preferred Pressure Level</Label>
          <Select 
            value={formData.pressurePreference} 
            onValueChange={(value) => updateFormData({ pressurePreference: value })}
          >
            <SelectTrigger id="pressure-preference">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-preference">No Preference</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="firm">Firm/Deep</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Focus Areas Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="focus-area">Primary Focus Areas</Label>
          <Select 
            value={formData.focusArea} 
            onValueChange={(value) => updateFormData({ focusArea: value })}
          >
            <SelectTrigger id="focus-area">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-body">Full Body (Even Distribution)</SelectItem>
              <SelectItem value="back-shoulders">Back & Shoulders</SelectItem>
              <SelectItem value="legs-feet">Legs & Feet</SelectItem>
              <SelectItem value="neck-upper-back">Neck & Upper Back</SelectItem>
              <SelectItem value="other">Other (Specify Below)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Requirements Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="additional-needs">Additional Needs</Label>
          <Select 
            value={formData.additionalNeeds} 
            onValueChange={(value) => updateFormData({ additionalNeeds: value })}
          >
            <SelectTrigger id="additional-needs">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Special Needs</SelectItem>
              <SelectItem value="oil-allergy">Oil Allergy</SelectItem>
              <SelectItem value="table-assistance">Need Table Setup Help</SelectItem>
              <SelectItem value="quiet-session">Quiet Session (No Conversation)</SelectItem>
              <SelectItem value="aromatherapy">Aromatherapy Preferred</SelectItem>
              <SelectItem value="other">Other (Specify Below)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Additional Details Input */}
        <div className="space-y-2">
          <Label htmlFor="special-requests">Additional Details (Optional)</Label>
          <Input
            id="special-requests"
            placeholder="Specify allergies, injuries, or extra preferences here..."
            value={formData.specialRequests || ''}
            onChange={(e) => updateFormData({ specialRequests: e.target.value })}
          />
        </div>
      </div>

      {/* Existing Continue Button */}
      <Button 
        className="w-full mt-6" 
        size="lg"
        onClick={nextStep}
        disabled={!isValid}
      >
        Continue to Schedule
      </Button>
    </div>
  )
}
