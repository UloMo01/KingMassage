'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { Send, User, MessageSquare } from 'lucide-react'

export default function AdminMessagesPage() {
  const [chats, setChats] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // 1. Fetch all unique users who have messaged
  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await supabase
        .from('messages')
        .select('user_id, message, created_at')
        .order('created_at', { ascending: false })
      
      // Filter unique users to show in the sidebar
      const uniqueChats = Array.from(new Map(data?.map(item => [item.user_id, item])).values())
      setChats(uniqueChats)
    }
    fetchChats()
  }, [supabase])

  // 2. Fetch messages for selected user & Subscribe to Real-time
  useEffect(() => {
    if (!selectedUser) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', selectedUser)
        .order('created_at', { ascending: true })
      setMessages(data || [])
    }
    fetchMessages()

    const channel = supabase
      .channel(`admin_chat:${selectedUser}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages', 
        filter: `user_id=eq.${selectedUser}` 
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedUser, supabase])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return
    const { error } = await supabase.from('messages').insert({
      user_id: selectedUser,
      message: newMessage.trim(),
      is_admin: true // THIS IS THE KEY: Mark as admin so the client sees it on the left
    })
    if (!error) setNewMessage('')
  }

  return (
    <div className="flex h-screen bg-gray-100 p-4 gap-4">
      {/* Sidebar: User List */}
      <Card className="w-80 flex flex-col overflow-hidden rounded-2xl">
        <div className="p-4 border-b bg-white font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-600" />
          Inbox
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.user_id}
              onClick={() => setSelectedUser(chat.user_id)}
              className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${selectedUser === chat.user_id ? 'bg-green-50 border-r-4 border-r-green-600' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 p-2 rounded-full"><User className="w-4 h-4" /></div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm truncate">{chat.user_id.slice(0, 8)}...</p>
                  <p className="text-xs text-gray-500 truncate">{chat.message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden rounded-2xl shadow-xl">
        {selectedUser ? (
          <>
            <div className="p-4 border-b bg-white font-bold">Chatting with User: {selectedUser.slice(0, 8)}</div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.is_admin ? 'bg-black text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>
                    {msg.message}
                    <p className="text-[10px] mt-1 opacity-50">{format(new Date(msg.created_at), 'HH:mm')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t bg-white flex gap-2">
              <Input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Type your reply..." 
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} className="bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 italic">
            Select a conversation to start chatting
          </div>
        )}
      </Card>
    </div>
  )
}
