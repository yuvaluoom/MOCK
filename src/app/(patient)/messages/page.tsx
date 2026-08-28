'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc/client';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import type { ChatMessage, TypingEvent } from '@/lib/realtime';

// Icons
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-400">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

const OnlineIndicator = ({ isOnline }: { isOnline: boolean }) => (
  <span
    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
      isOnline ? 'bg-green-500' : 'bg-gray-300'
    }`}
    title={isOnline ? 'Online' : 'Offline'}
  />
);

function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  }
}

interface Thread {
  id: string;
  subject: string | null;
  lastMessageAt: Date | null;
  patient: { id: string; firstName: string; lastName: string } | null;
  therapist: { id: string; firstName: string; lastName: string; photoThumbnailUrl: string | null } | null;
  unreadCount: number;
  isOtherOnline?: boolean;
  lastMessage: { content: string; createdAt: Date } | null;
}

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  readAt: Date | null;
  createdAt: Date;
}

export default function MessagesPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch threads
  const { data: threads, isLoading: threadsLoading, refetch: refetchThreads } = trpc.messages.getThreads.useQuery();

  // Fetch messages for selected thread
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = trpc.messages.getMessages.useQuery(
    { threadId: selectedThreadId ?? '', page: 1, limit: 50 },
    { enabled: !!selectedThreadId }
  );

  // Mutations
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: (newMsg) => {
      setNewMessage('');
      // Add to local messages immediately for instant feedback
      setLocalMessages((prev) => [...prev, newMsg as unknown as Message]);
      refetchThreads();
    },
  });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      refetchThreads();
    },
  });

  const sendTypingMutation = trpc.messages.sendTypingIndicator.useMutation();

  // Mock user ID (in production, get from auth context)
  const userId = 'user-patient-1';

  // Handle incoming real-time messages
  const handleNewMessage = useCallback((message: ChatMessage) => {
    if (message.senderId !== userId) {
      setLocalMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, {
          id: message.id,
          senderId: message.senderId,
          senderRole: message.senderRole,
          content: message.content,
          readAt: null,
          createdAt: message.createdAt,
        }];
      });
    }
  }, [userId]);

  // Handle typing indicators
  const handleTyping = useCallback((event: TypingEvent) => {
    if (event.userId !== userId) {
      setTypingUsers((prev) => {
        if (event.isTyping) {
          return { ...prev, [event.userId]: event.userName };
        } else {
          const { [event.userId]: _, ...rest } = prev;
          return rest;
        }
      });
    }
  }, [userId]);

  // Real-time chat connection
  const threadIdsList = threads?.map((t) => t.id) ?? [];
  const { isConnected, connectionError } = useRealtimeChat({
    userId,
    threadIds: threadIdsList,
    onMessage: handleNewMessage,
    onTyping: handleTyping,
  });

  // Sync local messages with server data
  useEffect(() => {
    if (messagesData?.messages) {
      setLocalMessages(messagesData.messages);
    }
  }, [messagesData?.messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages]);

  // Mark messages as read when selecting a thread
  useEffect(() => {
    if (selectedThreadId) {
      markAsReadMutation.mutate({ threadId: selectedThreadId });
    }
  }, [selectedThreadId]);

  // Focus input when thread is selected
  useEffect(() => {
    if (selectedThreadId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedThreadId]);

  const selectedThread = threads?.find((t) => t.id === selectedThreadId);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedThread) return;

    // Clear typing indicator
    if (selectedThreadId) {
      sendTypingMutation.mutate({ threadId: selectedThreadId, isTyping: false });
    }

    sendMessageMutation.mutate({
      threadId: selectedThreadId ?? undefined,
      recipientId: selectedThread.therapist?.id ?? '',
      content: newMessage.trim(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    // Send typing indicator
    if (selectedThreadId) {
      sendTypingMutation.mutate({ threadId: selectedThreadId, isTyping: true });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (selectedThreadId) {
          sendTypingMutation.mutate({ threadId: selectedThreadId, isTyping: false });
        }
      }, 2000);
    }
  };

  // Mobile: show thread list or messages
  const showThreadList = !selectedThreadId;

  // Get typing indicator text
  const typingText = Object.values(typingUsers).length > 0
    ? `${Object.values(typingUsers).join(', ')} is typing...`
    : null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Messages</h1>
          <p className="text-xs text-gray-500">Communicate with your therapists</p>
        </div>
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live' : connectionError || 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid md:grid-cols-3 gap-3">
        {/* Thread List */}
        <div className={`${showThreadList ? 'block' : 'hidden md:block'} md:col-span-1`}>
          <Card className="h-full flex flex-col">
            <CardHeader className="py-2 px-3 border-b">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto">
              {threadsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-calm-600"></div>
                </div>
              ) : !threads || threads.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageCircleIcon />
                  <p className="text-sm text-gray-500 mt-2">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start by booking a session
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThreadId(thread.id)}
                      className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                        selectedThreadId === thread.id ? 'bg-calm-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {/* Avatar with online indicator */}
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-full bg-calm-100 flex items-center justify-center">
                            <span className="text-calm-700 font-medium text-sm">
                              {thread.therapist?.firstName?.charAt(0) ?? 'T'}
                            </span>
                          </div>
                          <OnlineIndicator isOnline={thread.isOtherOnline ?? false} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {thread.therapist?.firstName} {thread.therapist?.lastName}
                            </span>
                            {thread.lastMessageAt && (
                              <span className="text-[10px] text-gray-400 flex-shrink-0">
                                {formatMessageTime(new Date(thread.lastMessageAt))}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-gray-500 truncate flex-1">
                              {thread.lastMessage?.content ?? 'No messages'}
                            </p>
                            {thread.unreadCount > 0 && (
                              <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-calm-600 text-white text-[10px] flex items-center justify-center px-1">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message View */}
        <div className={`${!showThreadList ? 'block' : 'hidden md:block'} md:col-span-2`}>
          <Card className="h-full flex flex-col">
            {!selectedThread ? (
              <div className="flex-1 flex items-center justify-center text-center p-4">
                <div>
                  <MessageCircleIcon />
                  <p className="text-sm text-gray-500 mt-2">Select a conversation</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Choose a thread to view messages
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <CardHeader className="py-2 px-3 border-b flex flex-row items-center gap-2">
                  <button
                    onClick={() => setSelectedThreadId(null)}
                    className="md:hidden p-1 hover:bg-gray-100 rounded"
                    aria-label="Back to threads"
                  >
                    <BackIcon />
                  </button>
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-calm-100 flex items-center justify-center">
                      <span className="text-calm-700 font-medium text-sm">
                        {selectedThread.therapist?.firstName?.charAt(0) ?? 'T'}
                      </span>
                    </div>
                    <OnlineIndicator isOnline={selectedThread.isOtherOnline ?? false} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium truncate">
                      {selectedThread.therapist?.firstName} {selectedThread.therapist?.lastName}
                    </CardTitle>
                    <p className="text-[10px] text-gray-500">
                      {selectedThread.isOtherOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-3 overflow-y-auto bg-gray-50">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-calm-600"></div>
                    </div>
                  ) : localMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">No messages yet</p>
                      <p className="text-xs text-gray-400 mt-1">Send a message to start</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {localMessages.map((msg) => {
                        const isOwn = msg.senderRole === 'PATIENT';
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                                isOwn
                                  ? 'bg-calm-600 text-white rounded-br-md'
                                  : 'bg-white text-gray-900 border rounded-bl-md shadow-sm'
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              <p
                                className={`text-[10px] mt-1 ${
                                  isOwn ? 'text-calm-100' : 'text-gray-400'
                                }`}
                              >
                                {formatMessageTime(new Date(msg.createdAt))}
                                {isOwn && msg.readAt && (
                                  <span className="ml-1">• Read</span>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {/* Typing indicator */}
                      {typingText && (
                        <div className="flex justify-start">
                          <div className="bg-white border rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
                            <div className="flex items-center gap-1">
                              <span className="flex gap-0.5">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </span>
                              <span className="text-xs text-gray-500 ml-1">{typingText}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </CardContent>

                {/* Input */}
                <div className="flex-shrink-0 p-2 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 h-9 text-sm"
                      disabled={sendMessageMutation.isPending}
                    />
                    <Button
                      variant="calm"
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="px-3 h-9"
                    >
                      <SendIcon />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
