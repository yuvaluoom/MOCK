'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
} from 'lucide-react';

type TabType = 'pending' | 'completed' | 'all';

interface SessionDoc {
  id: string;
  patientName: string;
  sessionDate: string;
  sessionNumber: number;
  documentationStatus: 'DRAFT' | 'SUBMITTED' | 'AMENDED' | 'LOCKED';
  isOverdue: boolean;
  deadline: string;
  completionPercentage: number;
}

export default function TherapistDocumentationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  // Mock data - will be replaced with tRPC calls
  const mockSessions: SessionDoc[] = [
    {
      id: '1',
      patientName: 'ישראל ישראלי',
      sessionDate: '2024-02-06',
      sessionNumber: 5,
      documentationStatus: 'DRAFT',
      isOverdue: true,
      deadline: '2024-02-08',
      completionPercentage: 45,
    },
    {
      id: '2',
      patientName: 'שרה כהן',
      sessionDate: '2024-02-07',
      sessionNumber: 3,
      documentationStatus: 'DRAFT',
      isOverdue: false,
      deadline: '2024-02-09',
      completionPercentage: 80,
    },
    {
      id: '3',
      patientName: 'דוד לוי',
      sessionDate: '2024-02-05',
      sessionNumber: 8,
      documentationStatus: 'SUBMITTED',
      isOverdue: false,
      deadline: '2024-02-07',
      completionPercentage: 100,
    },
    {
      id: '4',
      patientName: 'מרים אברהם',
      sessionDate: '2024-02-04',
      sessionNumber: 12,
      documentationStatus: 'LOCKED',
      isOverdue: false,
      deadline: '2024-02-06',
      completionPercentage: 100,
    },
  ];

  const pendingSessions = mockSessions.filter(s => s.documentationStatus === 'DRAFT');
  const completedSessions = mockSessions.filter(s => s.documentationStatus !== 'DRAFT');
  const overdueSessions = pendingSessions.filter(s => s.isOverdue);

  const getFilteredSessions = () => {
    switch (activeTab) {
      case 'pending':
        return pendingSessions;
      case 'completed':
        return completedSessions;
      default:
        return mockSessions;
    }
  };

  const tabs = [
    { id: 'pending' as TabType, label: 'ממתין לתיעוד', count: pendingSessions.length },
    { id: 'completed' as TabType, label: 'הושלם', count: completedSessions.length },
    { id: 'all' as TabType, label: 'הכל', count: mockSessions.length },
  ];

  const getStatusBadge = (status: SessionDoc['documentationStatus'], isOverdue: boolean) => {
    if (isOverdue && status === 'DRAFT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertTriangle className="w-3 h-3" />
          באיחור
        </span>
      );
    }

    const statusConfig = {
      DRAFT: { label: 'טיוטה', className: 'bg-yellow-100 text-yellow-700' },
      SUBMITTED: { label: 'הוגש', className: 'bg-green-100 text-green-700' },
      AMENDED: { label: 'תוקן', className: 'bg-blue-100 text-blue-700' },
      LOCKED: { label: 'נעול', className: 'bg-gray-100 text-gray-700' },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {status === 'SUBMITTED' || status === 'LOCKED' ? (
          <CheckCircle className="w-3 h-3" />
        ) : null}
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">תיעוד קליני</h1>
          <p className="text-gray-600 mt-1">ניהול ותיעוד פגישות טיפוליות</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-r-4 border-r-yellow-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingSessions.length}</p>
                <p className="text-sm text-gray-600">ממתינים לתיעוד</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-r-4 ${overdueSessions.length > 0 ? 'border-r-red-500' : 'border-r-gray-300'}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${overdueSessions.length > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <Clock className={`w-6 h-6 ${overdueSessions.length > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{overdueSessions.length}</p>
                <p className="text-sm text-gray-600">באיחור</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedSessions.length}</p>
                <p className="text-sm text-gray-600">הושלמו השבוע</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdueSessions.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">תיעוד באיחור</h3>
              <p className="text-sm text-red-700 mt-1">
                יש לך {overdueSessions.length} פגישות שחלף מועד התיעוד שלהן.
                נא להשלים את התיעוד בהקדם האפשרי.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-calm-600 text-calm-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-calm-100 text-calm-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {getFilteredSessions().map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  session.isOverdue && session.documentationStatus === 'DRAFT'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    session.isOverdue && session.documentationStatus === 'DRAFT'
                      ? 'bg-red-100'
                      : 'bg-calm-100'
                  }`}>
                    <FileText className={`w-6 h-6 ${
                      session.isOverdue && session.documentationStatus === 'DRAFT'
                        ? 'text-red-600'
                        : 'text-calm-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{session.patientName}</p>
                      {getStatusBadge(session.documentationStatus, session.isOverdue)}
                    </div>
                    <p className="text-sm text-gray-500">
                      פגישה #{session.sessionNumber} • {new Date(session.sessionDate).toLocaleDateString('he-IL')}
                    </p>
                    {session.documentationStatus === 'DRAFT' && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              session.isOverdue ? 'bg-red-500' : 'bg-calm-500'
                            }`}
                            style={{ width: `${session.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{session.completionPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.documentationStatus === 'DRAFT' && (
                    <>
                      <Button
                        size="sm"
                        variant={session.isOverdue ? 'destructive' : 'calm'}
                        onClick={() => window.location.href = `/therapist/documentation/${session.id}`}
                      >
                        המשך תיעוד
                      </Button>
                    </>
                  )}
                  {session.documentationStatus === 'SUBMITTED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/therapist/documentation/${session.id}`}
                    >
                      צפייה
                    </Button>
                  )}
                  {session.documentationStatus === 'LOCKED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/therapist/documentation/${session.id}`}
                    >
                      צפייה
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {getFilteredSessions().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>אין פגישות להצגה</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
