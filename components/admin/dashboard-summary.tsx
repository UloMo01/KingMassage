// components/admin/dashboard-summary.tsx
'use client'

import React from 'react'

type SummaryProps = {
  pending: number
  approved: number
  clients: number
}

export default function DashboardSummary({ pending, approved, clients }: SummaryProps) {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card title="Pending Bookings" value={pending} status={`${pending} Awaiting approval`} accent="amber" />
      <Card title="Approved Bookings" value={approved} status={`${approved} Confirmed sessions`} accent="emerald" />
      <Card title="Total Clients" value={clients} status={`${clients} Registered users`} accent="sky" />
    </div>
  )
}

function Card({ title, value, status, accent }: { title: string; value: number; status: string; accent: string }) {
  const accentClass = {
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    sky: 'bg-sky-50 text-sky-700',
  }[accent] ?? 'bg-slate-50 text-slate-700'

  return (
    <div className={`flex flex-col justify-between p-4 rounded-lg shadow-sm border ${accentClass}`}>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase">{title}</p>
        <p className="text-3xl font-extrabold mt-2">{value}</p>
      </div>
      <div className="mt-3">
        <p className="text-xs text-slate-500">{status}</p>
      </div>
    </div>
  )
}
