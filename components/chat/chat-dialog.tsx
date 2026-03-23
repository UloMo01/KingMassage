'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Scroll } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

interface Message {
  id: string
  user_id: string
  message: string
  created_at: string
  is_admin: boolean
}

export function ChatDialog({ open, onOpenChange, userId }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const fetchMessages = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true })

        setMessages(data || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
  }, [open, userId])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('messages').insert({
        user_id: userId,
        message: newMessage,
        is_admin: false,
      })

      if (error) throw error

      setNewMessage('')
      
      // Refresh messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      setMessages(data || [])
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chat with "King"</DialogTitle>
          <DialogDescription>Ask questions about your booking</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-96 space-y-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 border rounded-lg p-4 bg-muted/30">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Scroll className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet. Start a conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.is_admin
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage()
                }
              }}
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
