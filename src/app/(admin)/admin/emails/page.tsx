'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc } from '@/lib/trpc/client';

// Icons
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-500">
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-500">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

type TabType = 'dashboard' | 'history' | 'broadcast' | 'personal' | 'triggers';

export default function AdminEmailsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('');
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [personalUserId, setPersonalUserId] = useState('');
  const [personalUserEmail, setPersonalUserEmail] = useState('');
  const [personalUserName, setPersonalUserName] = useState('');
  const [personalSubject, setPersonalSubject] = useState('');
  const [personalContent, setPersonalContent] = useState('');
  const [emailDetailId, setEmailDetailId] = useState<string | null>(null);

  // Fetch data
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.adminEmail.getStatistics.useQuery();
  const { data: emailHistory, isLoading: historyLoading, refetch: refetchHistory } = trpc.adminEmail.getEmailHistory.useQuery({
    page: 1,
    limit: 20,
    search: searchQuery || undefined,
  });
  const { data: audiences } = trpc.adminEmail.getBroadcastAudiences.useQuery();
  const { data: triggers } = trpc.adminEmail.getTriggers.useQuery();
  const { data: users } = trpc.adminEmail.getUsers.useQuery({ limit: 50 });

  // Mutations
  const sendBroadcastMutation = trpc.adminEmail.sendBroadcast.useMutation({
    onSuccess: () => {
      refetchStats();
      refetchHistory();
      setBroadcastSubject('');
      setBroadcastContent('');
      setSelectedAudience('');
      alert('Broadcast sent successfully!');
    },
  });

  const sendPersonalMutation = trpc.adminEmail.sendPersonalEmail.useMutation({
    onSuccess: () => {
      refetchStats();
      refetchHistory();
      setPersonalSubject('');
      setPersonalContent('');
      setPersonalUserId('');
      setPersonalUserEmail('');
      setPersonalUserName('');
      alert('Email sent successfully!');
    },
  });

  const handleSendBroadcast = () => {
    if (!selectedAudience || !broadcastSubject || !broadcastContent) {
      alert('Please fill in all fields');
      return;
    }
    sendBroadcastMutation.mutate({
      subject: broadcastSubject,
      htmlContent: broadcastContent,
      targetAudience: selectedAudience as any,
    });
  };

  const handleSendPersonal = () => {
    if (!personalUserId || !personalSubject || !personalContent) {
      alert('Please fill in all fields');
      return;
    }
    sendPersonalMutation.mutate({
      userId: personalUserId,
      userEmail: personalUserEmail,
      userName: personalUserName,
      subject: personalSubject,
      htmlContent: personalContent,
    });
  };

  const handleSelectUser = (user: { id: string; email: string; name: string }) => {
    setPersonalUserId(user.id);
    setPersonalUserEmail(user.email);
    setPersonalUserName(user.name);
  };

  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: MailIcon },
    { id: 'history' as TabType, label: 'Email History', icon: ClockIcon },
    { id: 'broadcast' as TabType, label: 'Broadcast', icon: UsersIcon },
    { id: 'personal' as TabType, label: 'Personal Email', icon: SendIcon },
    { id: 'triggers' as TabType, label: 'Trigger Mapping', icon: MailIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Control Center</h1>
          <p className="text-gray-600 mt-1">Manage email communications and broadcasts</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { refetchStats(); refetchHistory(); }}>
          <RefreshIcon />
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <MailIcon />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : stats?.total ?? 0}</p>
                    <p className="text-sm text-gray-500">Total Emails</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircleIcon />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : stats?.sent ?? 0}</p>
                    <p className="text-sm text-gray-500">Sent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                    <XCircleIcon />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : stats?.failed ?? 0}</p>
                    <p className="text-sm text-gray-500">Failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <ClockIcon />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{statsLoading ? '-' : stats?.last24Hours ?? 0}</p>
                    <p className="text-sm text-gray-500">Last 24h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provider Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Provider Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Connected</span>
                </div>
                <div className="text-gray-500">
                  Provider: <span className="font-medium text-gray-900">{stats?.providerStatus?.name || 'development'}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                In development mode, emails are logged to console. Connect SendGrid, AWS SES, Postmark, or Resend for production.
              </p>
            </CardContent>
          </Card>

          {/* Audience Counts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Broadcast Audiences</CardTitle>
              <CardDescription>Available recipient groups for email broadcasts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {audiences?.map((audience) => (
                  <div key={audience.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{audience.name}</span>
                      <span className="text-lg font-bold text-blue-600">{audience.count}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{audience.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Email Types Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emails by Type</CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.byType && Object.keys(stats.byType).length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-lg font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-500">{type.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No emails sent yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Email History</CardTitle>
              <Input
                type="search"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : emailHistory?.emails && emailHistory.emails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Timestamp</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Recipient</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Subject</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Trigger</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {emailHistory.emails.map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setEmailDetailId(email.id)}>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(email.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{email.to}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{email.subject}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {email.triggerEvent}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            email.status === 'SENT' || email.status === 'DELIVERED'
                              ? 'bg-green-100 text-green-700'
                              : email.status === 'FAILED' || email.status === 'BOUNCED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {email.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No emails found
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Broadcast Tab */}
      {activeTab === 'broadcast' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Broadcast Email</CardTitle>
              <CardDescription>Send an email to a group of users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <select
                  value={selectedAudience}
                  onChange={(e) => setSelectedAudience(e.target.value)}
                  className="w-full h-10 px-3 border rounded-md"
                >
                  <option value="">Select audience...</option>
                  {audiences?.map((audience) => (
                    <option key={audience.id} value={audience.id}>
                      {audience.name} ({audience.count} recipients)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject (supports {{firstName}})"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Content (HTML)</Label>
                <textarea
                  placeholder="Email content (supports {{firstName}}, {{lastName}}, {{email}})"
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <Button
                variant="calm"
                className="w-full"
                onClick={handleSendBroadcast}
                disabled={sendBroadcastMutation.isPending || !selectedAudience}
              >
                {sendBroadcastMutation.isPending ? 'Sending...' : 'Send Broadcast'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Placeholders</CardTitle>
              <CardDescription>Use these in your subject and content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['firstName', 'lastName', 'email'].map((placeholder) => (
                  <div key={placeholder} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <code className="px-2 py-1 bg-white rounded text-sm">{`{{${placeholder}}}`}</code>
                    <span className="text-sm text-gray-600">User's {placeholder}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">Preview Note</h4>
                <p className="text-sm text-amber-700">
                  In development mode, emails are logged to the console. Connect a production provider to send real emails.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Personal Email Tab */}
      {activeTab === 'personal' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Send Personal Email</CardTitle>
              <CardDescription>Send an email to a specific user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <select
                  value={personalUserId}
                  onChange={(e) => {
                    const user = users?.find(u => u.id === e.target.value);
                    if (user) handleSelectUser(user);
                  }}
                  className="w-full h-10 px-3 border rounded-md"
                >
                  <option value="">Select user...</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) - {user.role}
                    </option>
                  ))}
                </select>
              </div>

              {personalUserId && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{personalUserName}</p>
                  <p className="text-sm text-gray-500">{personalUserEmail}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Email subject"
                  value={personalSubject}
                  onChange={(e) => setPersonalSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Content (HTML)</Label>
                <textarea
                  placeholder="Email content"
                  value={personalContent}
                  onChange={(e) => setPersonalContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <Button
                variant="calm"
                className="w-full"
                onClick={handleSendPersonal}
                disabled={sendPersonalMutation.isPending || !personalUserId}
              >
                {sendPersonalMutation.isPending ? 'Sending...' : 'Send Email'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <CardDescription>Click to select a recipient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users?.slice(0, 10).map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      personalUserId === user.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.role === 'therapist' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Triggers Tab */}
      {activeTab === 'triggers' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email Trigger Mapping</CardTitle>
            <CardDescription>Complete list of system events that trigger emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Event</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Recipient</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Subject</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Template</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {triggers?.map((trigger) => (
                    <tr key={trigger.event} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{trigger.event}</p>
                        <p className="text-xs text-gray-500">{trigger.eventDescription}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trigger.recipient === 'patient' ? 'bg-green-100 text-green-700' :
                          trigger.recipient === 'therapist' ? 'bg-purple-100 text-purple-700' :
                          trigger.recipient === 'admin' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {trigger.recipient}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs">{trigger.subject}</td>
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 rounded text-xs">{trigger.templateName}</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          trigger.priority === 'high' ? 'bg-red-100 text-red-700' :
                          trigger.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {trigger.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Detail Modal */}
      {emailDetailId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEmailDetailId(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Email Details</h3>
                <button onClick={() => setEmailDetailId(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  ×
                </button>
              </div>
              {emailHistory?.emails.find(e => e.id === emailDetailId) && (
                <div className="space-y-4">
                  {(() => {
                    const email = emailHistory.emails.find(e => e.id === emailDetailId)!;
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-500">Recipient</Label>
                            <p className="font-medium">{email.to}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Status</Label>
                            <p className="font-medium">{email.status}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Type</Label>
                            <p className="font-medium">{email.type}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Trigger</Label>
                            <p className="font-medium">{email.triggerEvent}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Created</Label>
                            <p className="font-medium">{new Date(email.createdAt).toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-gray-500">Sent</Label>
                            <p className="font-medium">{email.sentAt ? new Date(email.sentAt).toLocaleString() : '-'}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-500">Subject</Label>
                          <p className="font-medium">{email.subject}</p>
                        </div>
                        {email.errorMessage && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <Label className="text-red-700">Error</Label>
                            <p className="text-red-600">{email.errorMessage}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
