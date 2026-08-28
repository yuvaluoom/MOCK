'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TherapistMessagesPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data
  const threads = [
    { id: '1', patientName: 'Israel Israeli', lastMessage: 'Thank you very much על הSession הOtherונה', time: '10:30', unread: 2 },
    { id: '2', patientName: 'Sarah Cohen', lastMessage: 'האם אפשר לשנs את הSession?', time: 'אתedל', unread: 0 },
    { id: '3', patientName: 'David Levi', lastMessage: 'ראיתי את ההמלצs Your', time: '3 ימs', unread: 0 },
  ];

  const messages = [
    { id: '1', sender: 'patient', content: 'Hello, רציתי לשorל לגבי הSession Nextה', time: '10:00' },
    { id: '2', sender: 'therapist', content: 'כedבן, אשמח לעThisר. מה רצית לשorל?', time: '10:15' },
    { id: '3', sender: 'patient', content: 'האם אפשר להזיז את הSession בTime?', time: '10:20' },
    { id: '4', sender: 'patient', content: 'Thank you very much על הSession הOtherונה', time: '10:30' },
  ];

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">תקשורת With הPatients Your</p>
      </div>

      <div className="flex-1 min-h-0 grid md:grid-cols-3 gap-4">
        {/* Thread List */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="py-3 border-b flex-shrink-0">
            <CardTitle className="text-sm font-medium text-gray-500">שיחs</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThread(thread.id)}
                  className={`w-full text-right p-4 hover:bg-gray-50 transition-colors ${
                    selectedThread === thread.id ? 'bg-calm-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-calm-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-calm-700 font-medium">
                        {thread.patientName.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 text-sm">{thread.patientName}</span>
                        <span className="text-xs text-gray-400">{thread.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 truncate flex-1">{thread.lastMessage}</p>
                        {thread.unread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-calm-600 text-white text-xs flex items-center justify-center">
                            {thread.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message View */}
        <Card className="md:col-span-2 flex flex-col">
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              בחר שיחה לView
            </div>
          ) : (
            <>
              {/* Header */}
              <CardHeader className="py-3 border-b flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-calm-100 flex items-center justify-center">
                    <span className="text-calm-700 font-medium text-sm">י</span>
                  </div>
                  <CardTitle className="text-sm font-medium">Israel Israeli</CardTitle>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'therapist' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                          msg.sender === 'therapist'
                            ? 'bg-calm-600 text-white rounded-br-md'
                            : 'bg-white text-gray-900 border rounded-bl-md shadow-sm'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender === 'therapist' ? 'text-calm-100' : 'text-gray-400'
                        }`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Input */}
              <div className="p-3 border-t flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="הקלד Message..."
                    className="flex-1"
                  />
                  <Button variant="calm" disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
