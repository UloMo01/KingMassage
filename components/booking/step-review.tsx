// FILE: step-review.tsx
'use client'

import { useBookingStore } from '@/lib/booking-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, User, Massage, PlusCircle, CheckCircle } from 'lucide-react'

export function StepReview() {
  const { formData, prevStep, resetForm } = useBookingStore()
  const { calculateTotalDuration } = useBookingStore()
  const totalDuration = calculateTotalDuration()

  // Calculate pricing (adjust base prices to match your actual service costs)
  const BASE_SERVICE_PRICES = {
    Swedish: 600,
    Shiatsu: 650,
    Thai: 700,
    Combination: 750
  }
  const basePrice = BASE_SERVICE_PRICES[formData.service as keyof typeof BASE_SERVICE_PRICES] || 0
  const extraTimePrice = formData.extraMinutes === 15 ? 100 : formData.extraMinutes === 30 ? 200 : 0
  const totalPrice = basePrice + extraTimePrice + formData.addOnPrice

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-center">Review Your Booking</h3>
      <p className="text-sm text-muted-foreground text-center">Please confirm all details before submitting</p>

      {/* Service & Duration Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Massage className="h-5 w-5 text-primary" />
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Treatment Type:</span>
            <span>{formData.service}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Duration:</span>
            <span>{totalDuration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pressure Preference:</span>
            <span>{formData.pressurePreference}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Focus Area:</span>
            <span>{formData.focusArea}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Add-On Service:</span>
            <span>{formData.addOnService || 'None'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{formData.date ? new Date(formData.date).toLocaleDateString('en-PH', {
              year: 'numeric', month: 'long', day: 'numeric'
            }) : 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span>{formData.time || 'Not selected'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Personal Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            Your Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span>{formData.name || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile Number:</span>
            <span>{formData.mobile || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Location:</span>
            <span>{formData.location || 'Not provided'}</span>
          </div>
          {formData.specialRequests && (
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Additional Notes:</span>
              <span className="text-sm">{formData.specialRequests}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PlusCircle className="h-5 w-5 text-primary" />
            Pricing Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Service:</span>
            <span>₱{basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Extra Time:</span>
            <span>₱{extraTimePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Add-On:</span>
            <span>₱{formData.addOnPrice.toLocaleString()}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Total Amount:</span>
            <span className="text-lg text-primary">₱{totalPrice.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <Button variant="outline" className="flex-1" onClick={prevStep}>
          Back
        </Button>
        <Button className="flex-1" onClick={() => {
          // Add booking submission logic here (e.g., API call)
          alert('Booking submitted successfully!')
          resetForm()
        }}>
          <CheckCircle className="mr-2 h-4 w-4" />
          Submit Booking
        </Button>
      </div>
    </div>
  )
}
