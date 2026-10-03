'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, FileText, MessageCircle, Search, TrendingUp, Users, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PatientProfileModal } from '@/components/PatientProfileModal';
import {
  demoPatients,
  formatRelativeDay,
  formatShortDate,
  type DemoPatient,
  type PatientStatus,
} from '@/lib/demo/therapist-demo';

const STATUS_STYLE: Record<PatientStatus, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-green-100 text-green-700' },
  new: { label: 'New', cls: 'bg-blue-100 text-blue-700' },
  inactive: { label: 'Inactive', cls: 'bg-gray-100 text-gray-600' },
};

const PROGRESS_STYLE: Record<DemoPatient['progress'], { label: string; cls: string }> = {
  improving: { label: 'Improving', cls: 'text-green-700' },
  stable: { label: 'Stable', cls: 'text-gray-600' },
  'needs-attention': { label: 'Needs attention', cls: 'text-amber-700' },
};

type Filter = 'all' | PatientStatus;

export default function TherapistPatientsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<DemoPatient | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: demoPatients.length,
      active: demoPatients.filter((p) => p.status === 'active').length,
      new: demoPatients.filter((p) => p.status === 'new').length,
      inactive: demoPatients.filter((p) => p.status === 'inactive').length,
    }),
    []
  );

  const filtered = demoPatients.filter(
    (p) =>
      (filter === 'all' || p.status === filter) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.concerns.some((c) => c.toLowerCase().includes(query.toLowerCase())))
  );

  const totalSessions = demoPatients.reduce((s, p) => s + p.totalSessions, 0);
  const avgMatch = Math.round(demoPatients.reduce((s, p) => s + p.matchScore, 0) / demoPatients.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600 mt-1">Your caseload at a glance</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name or concern"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Active patients', value: counts.active },
          { icon: CalendarDays, label: 'Sessions held', value: totalSessions },
          { icon: TrendingUp, label: 'Avg. match score', value: `${avgMatch}%` },
          { icon: Users, label: 'New this month', value: counts.new },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-calm-50 flex items-center justify-center">
                <Icon className="w-5 h-5 text-calm-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'new', 'inactive'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-calm-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : STATUS_STYLE[f].label} <span className="opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {filtered.map((p) => (
            <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3 hover:bg-gray-50 transition-colors">
              <button className="flex items-center gap-4 flex-1 min-w-0 text-left" onClick={() => setSelected(p)}>
                <div className="w-11 h-11 rounded-full bg-calm-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-calm-700 font-semibold">{p.name.split(' ').map((n) => n[0]).join('')}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLE[p.status].cls}`}>
                      {STATUS_STYLE[p.status].label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {p.concerns.join(' · ')} · {p.healthFund}
                  </p>
                </div>
              </button>
              <div className="grid grid-cols-3 gap-4 text-xs md:w-[360px]">
                <div>
                  <p className="text-gray-400">Last session</p>
                  <p className="text-gray-800 font-medium">{p.lastSession ? formatRelativeDay(p.lastSession) : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Next session</p>
                  <p className="text-gray-800 font-medium">{p.nextSession ? formatRelativeDay(p.nextSession) : '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Progress</p>
                  <p className={`font-medium ${PROGRESS_STYLE[p.progress].cls}`}>{PROGRESS_STYLE[p.progress].label}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelected(p)}>
                Details
              </Button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-10 text-gray-500">No patients found</p>}
        </CardContent>
      </Card>

      {/* Quick details drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <aside className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="p-6 border-b flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-calm-100 flex items-center justify-center">
                  <span className="text-calm-700 font-semibold">{selected.name.split(' ').map((n) => n[0]).join('')}</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selected.age} · {selected.city} · {selected.healthFund}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className="text-lg font-bold text-gray-900">{selected.totalSessions}</p>
                  <p className="text-[11px] text-gray-500">Sessions</p>
                </div>
                <div className="rounded-xl bg-calm-50 p-3">
                  <p className="text-lg font-bold text-calm-700">{selected.matchScore}%</p>
                  <p className="text-[11px] text-gray-500">Match</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <p className={`text-sm font-semibold mt-1 ${PROGRESS_STYLE[selected.progress].cls}`}>
                    {PROGRESS_STYLE[selected.progress].label}
                  </p>
                  <p className="text-[11px] text-gray-500">Progress</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Presenting concerns</p>
                <div className="flex flex-wrap gap-2">
                  {selected.concerns.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-full bg-calm-50 text-calm-700 text-xs font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Last session</span>
                  <span className="text-gray-900">{selected.lastSession ? formatShortDate(selected.lastSession) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Next session</span>
                  <span className="text-gray-900">
                    {selected.nextSession
                      ? `${formatShortDate(selected.nextSession)}, ${selected.nextSession.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                      : 'Not scheduled'}
                  </span>
                </div>
              </div>
              <div className="grid gap-2">
                {selected.profileId && (
                  <Button variant="calm" onClick={() => setProfileId(selected.profileId!)}>
                    View full intake profile
                  </Button>
                )}
                <Button variant="outline" asChild className="gap-2">
                  <Link href="/therapist/messages">
                    <MessageCircle className="w-4 h-4" /> Send message
                  </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                  <Link href="/therapist/documentation">
                    <FileText className="w-4 h-4" /> Session documentation
                  </Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {profileId && (
        <PatientProfileModal patientId={profileId} isOpen={!!profileId} onClose={() => setProfileId(null)} />
      )}
    </div>
  );
}
