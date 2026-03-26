'use client'

import React, { useState } from 'react'; // Add React import for production safety
import type { User, Booking } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, Phone, Calendar, Clock, User as UserIcon, 
  ChevronDown, ChevronUp, Separator 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator as UiSeparator } from '@/components/ui/separator';

interface ClientsListProps {
  users: User[];
  bookings: (Booking & { users: { email: string } })[];
}

export function ClientsList({ users, bookings }: ClientsListProps) {
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Get booking data for a client (with FULL null safety)
  const getClientBookings = (clientId: string) => {
    const clientBookings = bookings.filter(b => b.user_id === clientId);
    return {
      total: clientBookings.length,
      approved: clientBookings.filter(b => b.status === 'approved').length,
      pending: clientBookings.filter(b => b.status === 'pending').length,
      latest: clientBookings.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0] || null
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Clients</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {users.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No clients registered yet</p>
        ) : (
          users.map((user) => {
            const bookingStats = getClientBookings(user.id);
            const isExpanded = expandedClientId === user.id;

            // Safe date parsing
            const joinDate = user.created_at 
              ? new Date(user.created_at).toLocaleDateString() 
              : 'N/A';

            return (
              <div key={user.id} className="py-4">
                {/* Client Header Row */}
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedClientId(isExpanded ? null : user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Joined {joinDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {bookingStats.total} {bookingStats.total === 1 ? 'Booking' : 'Bookings'}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </Button>
                  </div>
                </div>

                {/* Expanded Details (Safe for production) */}
                {isExpanded && (
                  <div className="mt-3 pl-13 space-y-3">
                    <UiSeparator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Contact Info</p>
                        <p className="text-xs text-muted-foreground">User ID: {user.id.slice(0, 8)}...</p>
                        <p className="text-xs text-muted-foreground">Email: {user.email}</p>
                        <p className="text-xs text-muted-foreground">Join Date: {joinDate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Booking Stats</p>
                        <p className="text-xs text-muted-foreground">
                          {bookingStats.approved} Approved • {bookingStats.pending} Pending
                        </p>
                        {bookingStats.latest && (
                          <div className="mt-2 p-2 bg-muted/50 rounded-md">
                            <p className="text-xs">Latest: {bookingStats.latest?.service} ({bookingStats.latest?.status})</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
