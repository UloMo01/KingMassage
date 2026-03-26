'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingsTable } from './bookings-table'
import { ClientsList } from './clients-list'
import type { Booking, User } from '@/lib/types'
import { Calendar, Users, LayoutDashboard, Search, Filter, Download, Bell, DollarSign, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/firebase' // Import your DB config
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'

interface AdminDashboardProps {
  bookings: (Booking & { users: { email: string } })[]
  users: User[]
}

// Format Philippine Pesos currency
const formatPHP = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0
  }).format(amount)
}

// Get current month range for earnings calculation
const getCurrentMonthRange = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { start, end, label: `${now.toLocaleString('en-PH', { month: 'long' })} ${now.getFullYear()}` }
}

export function AdminDashboard({ bookings, users }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookingFilter, setBookingFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [addOns, setAddOns] = useState<any[]>([]) // Store available add-ons
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null) // Track which booking is being edited
  const [selectedAddOn, setSelectedAddOn] = useState<any>(null) // Track selected add-on for the booking

  // Fetch available add-ons from database on load
  useEffect(() => {
    const fetchAddOns = async () => {
      const addOnsRef = collection(db, 'add-ons')
      const addOnsSnapshot = await getDocs(addOnsRef)
      const addOnsData = addOnsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAddOns(addOnsData)
    }
    fetchAddOns()
  }, [])

  // Filter bookings based on search and filter
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchQuery === '' || 
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = bookingFilter === 'all' || booking.status === bookingFilter
    return matchesSearch && matchesFilter
  })

  // Handle adding/updating add-on for a booking
  const handleAddOnSelect = async (bookingId: string, addOn: any) => {
    if (!bookingId || !addOn) return
    
    // Find the booking to update
    const bookingToUpdate = bookings.find(b => b.id === bookingId)
    if (!bookingToUpdate) return

    // Calculate new total earnings (base + add-on price)
    const newEarnings = (bookingToUpdate.earnings || 0) + addOn.price

    // Update the booking in database
    const bookingRef = doc(db, 'bookings', bookingId)
    await updateDoc(bookingRef, {
      addOnService: addOn.name,
      addOnPrice: addOn.price,
      earnings: newEarnings,
      updatedAt: new Date().toISOString()
    })

    // Refresh bookings (you can add a refetch here or pass updated data up)
    window.location.reload() // Temporary refresh; replace with state update in production
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Monthly Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatPHP(
                  bookings.filter(b => b.status === 'completed' && 
                    new Date(b.date) >= getCurrentMonthRange().start && 
                    new Date(b.date) <= getCurrentMonthRange().end
                  ).reduce((sum, b) => sum + (b.earnings || 0), 0)
                )}</p>
                <p className="text-sm text-muted-foreground">{getCurrentMonthRange().label}</p>
              </CardContent>
            </Card>
            
            {/* Other stats cards */}
          </div>

          {/* Search & Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search bookings or clients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bookings" className="mb-8">
            <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
              <TabsTrigger value="bookings" onClick={() => setActiveTab('bookings')}>
                <Calendar className="h-4 w-4 mr-2" /> Bookings
              </TabsTrigger>
              <TabsTrigger value="clients" onClick={() => setActiveTab('clients')}>
                <Users className="h-4 w-4 mr-2" /> Clients <Badge>{users.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Bookings</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setBookingFilter('all')}>All</Button>
                  <Button variant="outline" size="sm" onClick={() => setBookingFilter('pending')}>Pending</Button>
                  <Button variant="outline" size="sm" onClick={() => setBookingFilter('approved')}>Approved</Button>
                  <Button variant="outline" size="sm" onClick={() => setBookingFilter('completed')}>Completed</Button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Date & Time</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Earnings (PHP)</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b">
                        <td className="px-4 py-3">{new Date(booking.date).toLocaleDateString('en-PH')}<br/>{booking.time}</td>
                        <td className="px-4 py-3"><Badge variant={booking.status === 'approved' ? 'success' : 'pending'}>{booking.status}</Badge></td>
                        <td className="px-4 py-3">{formatPHP(booking.earnings || 0)}</td>
                        <td className="px-4 py-3">
                          {/* Add-On Button - opens selection menu */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingBookingId(booking.id)}
                            className="mr-2 mb-2"
                          >
                            Add Add-On
                          </Button>

                          {/* Add-On Selection Dropdown - shows when editing */}
                          {editingBookingId === booking.id && (
                            <div className="absolute bg-white p-3 rounded shadow-lg z-10 mt-1">
                              <h4 className="text-sm font-medium mb-2">Select Add-On</h4>
                              <div className="space-y-2">
                                {addOns.map((addOn) => (
                                  <button
                                    key={addOn.id}
                                    className="block w-full text-left px-3 py-1 hover:bg-accent rounded"
                                    onClick={() => handleAddOnSelect(booking.id, addOn)}
                                  >
                                    {addOn.name} - {formatPHP(addOn.price)}
                                  </button>
                                ))}
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setEditingBookingId(null)}
                                  className="w-full mt-2"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Clients Tab */}
            <TabsContent value="clients">
              <ClientsList users={users} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
