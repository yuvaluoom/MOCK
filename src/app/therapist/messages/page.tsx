'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, Search, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createDemoThreads, formatMessageTime, type DemoThread } from '@/lib/demo/therapist-demo';

const QUICK_REPLIES = [
  'Thanks for letting me know.',
  'Let’s discuss this in our next session.',
  'That works for me — I’ve updated the calendar.',
];

export default function TherapistMessagesPage() {
  const [threads, setThreads] = useState<DemoThread[]>(() => createDemoThreads());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const selected = threads.find((t) => t.id === selectedId) ?? null;

  const visibleThreads = useMemo(
    () =>
      threads
        .filter((t) => t.patientName.toLowerCase().includes(query.toLowerCase()))
        .sort(
          (a, b) =>
            b.messages[b.messages.length - 1].at.getTime() - a.messages[a.messages.length - 1].at.getTime()
        ),
    [threads, query]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages.length, selectedId]);

  const openThread = (id: string) => {
    setSelectedId(id);
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };

  const send = (text: string) => {
    const content = text.trim();
    if (!content || !selected) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: `m-${Date.now()}`, sender: 'therapist', content, at: new Date() },
              ],
            }
          : t
      )
    );
    setDraft('');
  };

  return (
    <div className="h-[calc(100vh-10rem)] min-h-[520px] flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Secure, encrypted communication with your patients</p>
      </div>

      <Card className="flex-1 min-h-0 grid md:grid-cols-[300px_1fr] overflow-hidden">
        {/* Thread list */}
        <div className={`border-r flex flex-col min-h-0 ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search conversations"
                className="pl-9 h-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {visibleThreads.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.id}
                  onClick={() => openThread(t.id)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedId === t.id ? 'bg-calm-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-calm-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-calm-700 font-medium">{t.patientName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm text-gray-900 truncate ${t.unread ? 'font-semibold' : 'font-medium'}`}>
                          {t.patientName}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatMessageTime(last.at)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={`text-xs truncate flex-1 ${t.unread ? 'text-gray-800' : 'text-gray-500'}`}>
                          {last.sender === 'therapist' && 'You: '}
                          {last.content}
                        </p>
                        {t.unread > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-calm-600 text-white text-xs flex items-center justify-center">
                            {t.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {visibleThreads.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-500">No conversations found</p>
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className={`flex-col min-h-0 ${selected ? 'flex' : 'hidden md:flex'}`}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-full bg-calm-50 flex items-center justify-center mb-3">
                <MessageCircle className="w-7 h-7 text-calm-600" />
              </div>
              <p className="font-medium text-gray-900">Select a conversation</p>
              <p className="text-sm text-gray-500 mt-1">Choose a patient on the left to view messages</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b flex items-center gap-3 flex-shrink-0">
                <button
                  className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100"
                  onClick={() => setSelectedId(null)}
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-full bg-calm-100 flex items-center justify-center">
                  <span className="text-calm-700 font-medium text-sm">{selected.patientName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selected.patientName}</p>
                  <p className="text-xs text-gray-500">Patient</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
                {selected.messages.map((m) => {
                  const mine = m.sender === 'therapist';
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                          mine
                            ? 'bg-calm-600 text-white rounded-br-md'
                            : 'bg-white text-gray-900 border rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[11px] mt-1 ${mine ? 'text-calm-100' : 'text-gray-400'}`}>
                          {m.at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <div className="p-3 border-t flex-shrink-0 space-y-2">
                <div className="flex gap-2 overflow-x-auto">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(draft);
                  }}
                >
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${selected.patientName.split(' ')[0]}...`}
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" variant="calm" disabled={!draft.trim()} className="gap-2">
                    <Send className="w-4 h-4" />
                    Send
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
