'use client'

import React, { useState } from 'react';
import type { User, Booking } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, ChevronUp, UserCircle, 
  MessageSquare, Phone, History 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ClientsListProps {
  users: User[];
  bookings: (Booking & { users: { email: string } })[];
}

export function ClientsList({ users, bookings }: ClientsListProps) {
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getClientStats = (clientId: string) => {
    const clientBookings = bookings.filter(b => b.user_id === clientId);
    const sorted = [...clientBookings].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return {
      total: clientBookings.length,
      approved: clientBookings.filter(b => b.status === 'approved').length,
      pending: clientBookings.filter(b => b.status === 'pending').length,
      latest: sorted[0] || null
    };
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="px-1 space-y-4">
        <Input 
          placeholder="Search bookings or clients..." 
          className="bg-white border-slate-200 rounded-xl h-12 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <h2 className="text-lg font-bold text-slate-800">
          Registered Clients <span className="text-slate-400 font-normal">({users.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.map((user) => {
          const stats = getClientStats(user.id);
          const isExpanded = expandedClientId === user.id;
          const clientMobile = stats.latest?.mobile || '';

          return (
            <Card key={user.id} className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200">
              <CardContent className="p-0">
                <div 
                  className="p-4 flex items-center gap-4 bg-slate-50/50 cursor-pointer"
                  onClick={() => setExpandedClientId(isExpanded ? null : user.id)}
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <UserCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate text-sm">{user.email}</h3>
                    <p className="text-[10px] text-slate-500">
                      Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">
                      {stats.total} Bookings
                    </Badge>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-white p-4 space-y-4">
                    <div className="grid grid-cols-1 gap-4 text-xs text-slate-600">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Contact Info</p>
                        <p>Email: {user.email}</p>
                        <p className="font-medium text-slate-900">Mobile: {clientMobile || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Booking Stats</p>
                        <p>{stats.approved} Approved • {stats.pending} Pending</p>
                        {stats.latest && (
                          <div className="flex items-center gap-2 font-medium text-slate-700">
                            <History size={14} /> Latest: {stats.latest.service}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 h-9 text-xs gap-2" asChild disabled={!clientMobile}>
                        <a href={`sms:${clientMobile}`}><MessageSquare size={14} /> SMS</a>
                      </Button>
                      <Button className="flex-1 h-9 text-xs bg-slate-900 text-white gap-2" asChild disabled={!clientMobile}>
                        <a href={`tel:${clientMobile}`}><Phone size={14} /> Call</a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
