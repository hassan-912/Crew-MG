"use client";

import { useState } from "react";
import {
  Shield, Hotel, Plane, Globe, FileText, CheckCircle2, Clock,
  ChevronRight, ExternalLink, Play, BookOpen, Map,
  ListOrdered, Layers, FileDown, Link2, BarChart2, Building2,
  GraduationCap,
} from "lucide-react";
import { COUNTRIES, type CountryData, type QuickLink } from "./countryData";

// ─── Basics data (component refs — no JSX at module scope) ───────────────────
const BASICS = [
  {
    id: "insurance", title: "Travel Insurance", accent: "violet", Icon: Shield,
    links: [{ label: "EPTI", url: "https://epti-egy.org/Traveltargetweb/Pages/Policy_Qry2/Default.aspx" }],
  },
  {
    id: "hotel", title: "Hotel Booking", accent: "sky", Icon: Hotel,
    links: [
      { label: "Booking.com", url: "https://www.booking.com/" },
      { label: "Agoda", url: "https://www.agoda.com/?ds=P9IxPFO00lRN63tY" },
      { label: "Expedia", url: "https://www.expedia.com/Hotels?locale=en_US&siteid=4406" },
      { label: "ALL.Accor", url: "https://all.accor.com/a/en.html" },
    ],
  },
  {
    id: "flight", title: "Flight Booking", accent: "emerald", Icon: Plane,
    links: [
      { label: "Flyin", url: "https://eg.flyin.com/en" },
      { label: "EgyptAir", url: "https://www.egyptair.com/en/Pages/HomePage.aspx" },
    ],
  },
];

const ACCENT: Record<string, { card: string; icon: string }> = {
  violet:  { card: "from-violet-50 to-purple-50 border-violet-100", icon: "bg-violet-100 text-violet-600" },
  sky:     { card: "from-sky-50 to-blue-50 border-sky-100",         icon: "bg-sky-100 text-sky-600"       },
  emerald: { card: "from-emerald-50 to-teal-50 border-emerald-100", icon: "bg-emerald-100 text-emerald-600"},
};

// ─── Shared components ────────────────────────────────────────────────────────

function VideoPlaceholder({ title }: { title: string }) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex flex-col items-center justify-center gap-3 group cursor-pointer">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
          <Play size={22} className="text-white ml-1" />
        </div>
        <p className="text-slate-300 text-xs font-medium text-center px-4 leading-snug">{title}</p>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">Video coming soon</span>
      </div>
    </div>
  );
}

function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">{icon}</div>
        <div>
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Basics content ───────────────────────────────────────────────────────────

function BasicCard({ card }: { card: (typeof BASICS)[0] }) {
  return (
    <div className={`flex flex-col rounded-2xl border bg-gradient-to-br ${ACCENT[card.accent].card} p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ACCENT[card.accent].icon}`}>
          <card.Icon size={22} />
        </div>
        <h3 className="font-semibold text-slate-800">{card.title}</h3>
      </div>
      <VideoPlaceholder title={`How to book ${card.title.toLowerCase()} step-by-step`} />
      <div className="mt-4 flex flex-wrap gap-2">
        {card.links.map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group">
            <ExternalLink size={11} className="text-slate-400 group-hover:text-slate-600" />{l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function BasicsContent() {
  return (
    <div>
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-8 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Layers size={20} className="text-indigo-600" />
        </div>
        <div>
          <h2 className="font-bold text-indigo-900 text-base">Common Tasks — All Schengen Countries</h2>
          <p className="text-indigo-700 text-sm mt-1 leading-relaxed">Complete these steps first. They apply identically regardless of your destination country.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {BASICS.map((card) => <BasicCard key={card.id} card={card} />)}
      </div>
    </div>
  );
}

// ─── Country content ──────────────────────────────────────────────────────────

const QUICK_ICON_CMP: Record<QuickLink["icon"], React.ElementType> = {
  list: FileText, portal: Link2, pdf: FileDown,
};
const QUICK_STYLE: Record<QuickLink["icon"], string> = {
  list:   "bg-indigo-600 hover:bg-indigo-700 text-white",
  portal: "bg-emerald-600 hover:bg-emerald-700 text-white",
  pdf:    "bg-amber-500 hover:bg-amber-600 text-white",
};

function QuickActionButton({ link }: { link: QuickLink }) {
  const IconCmp = QUICK_ICON_CMP[link.icon];
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${QUICK_STYLE[link.icon]}`}>
      <IconCmp size={15} />{link.label}
    </a>
  );
}

function ProcessingImagePlaceholder() {
  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex flex-col items-center justify-center gap-3 py-10">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
        <BarChart2 size={32} className="text-amber-500" />
      </div>
      <p className="text-amber-700 text-sm font-semibold">Processing Timeline Infographic</p>
      <span className="text-xs text-amber-500 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">Chart coming soon</span>
    </div>
  );
}

function CountryContent({ country }: { country: CountryData }) {
  const videos = [
    `${country.name} — How to fill the Visa Application Form`,
    `${country.name} — How to write a Motivation Letter`,
    `${country.name} — How to create a Travel Plan`,
  ];

  return (
    <div className="space-y-6">
      {/* Country header */}
      <div className="flex flex-wrap items-center gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <span className="text-5xl">{country.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900">{country.name} — Visa Guide</h2>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${country.agencyColor}`}>
              <Building2 size={11} />{country.agency}
            </span>
          </div>
          <p className="text-slate-500 text-sm">Everything you need to apply for a Schengen visa via {country.agency}.</p>
        </div>
        <div className="hidden lg:flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Clock size={18} className="text-amber-600" />
          <div>
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Processing Time</p>
            <p className="font-bold text-slate-800">{country.processingTime}</p>
          </div>
        </div>
      </div>

      {/* Row 1: Quick Actions | Processing Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard icon={<ExternalLink size={18} />} title="Quick Actions" subtitle="Official links for this embassy">
          <div className="flex flex-col gap-3">
            {country.quickLinks.map((l) => <QuickActionButton key={l.label} link={l} />)}
          </div>
        </SectionCard>
        <SectionCard icon={<Clock size={18} />} title="Processing Time" subtitle="Standard embassy timeline">
          <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-0.5">Typical Duration</p>
              <p className="text-slate-800 font-bold text-lg leading-tight">{country.processingTime}</p>
              <p className="text-slate-500 text-xs mt-1 leading-snug">{country.processingNote}</p>
            </div>
          </div>
          <ProcessingImagePlaceholder />
        </SectionCard>
      </div>

      {/* Row 2: 3 Video Tutorials */}
      <SectionCard icon={<Globe size={18} />} title="Video Tutorials" subtitle="Watch all three before your appointment">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {videos.map((t) => (
            <div key={t}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 truncate">{t.split("— ")[1]}</p>
              <VideoPlaceholder title={t} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Row 3: Required Docs | Arrangement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard icon={<FileText size={18} />} title="Required Documents" subtitle={`${country.requiredDocs.length} items to prepare`}>
          <div className="space-y-2">
            {country.requiredDocs.map((doc, i) => (
              <div key={i} className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl px-4 py-2.5 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group">
                <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0 group-hover:text-emerald-600" />
                <span className="text-sm text-slate-700 leading-snug">{doc}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard icon={<ListOrdered size={18} />} title="Submission Order" subtitle="Stack papers in this exact order">
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-3">
            <ChevronRight size={13} className="text-indigo-500 flex-shrink-0" />
            <p className="text-xs text-indigo-700 font-medium">Document #1 goes on top; each one underneath the previous.</p>
          </div>
          <ol className="space-y-2">
            {country.arrangement.map((step, i) => (
              <li key={i} className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl px-4 py-2.5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{i + 1}</div>
                <span className="text-sm text-slate-700 leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>
    </div>
  );
}

// ─── LMS Sidebar ─────────────────────────────────────────────────────────────

function Sidebar({ activeView, setActiveView }: { activeView: string; setActiveView: (v: string) => void }) {
  const isBasics = activeView === "basics";

  return (
    <nav className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Sidebar header */}
      <div className="bg-gradient-to-r from-[#0f0c29] to-[#302b63] px-4 py-4">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} className="text-indigo-300" />
          <span className="text-sm font-bold text-white">Course Curriculum</span>
        </div>
      </div>

      {/* Section 1: Schengen Basics */}
      <div className="p-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 py-2">Module 1</p>
        <button
          type="button"
          onClick={() => setActiveView("basics")}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isBasics
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isBasics ? "bg-white/20" : "bg-indigo-100"}`}>
            <BookOpen size={14} className={isBasics ? "text-white" : "text-indigo-600"} />
          </div>
          <span className="text-left leading-snug">Schengen Basics</span>
          {isBasics && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-slate-100" />

      {/* Section 2: Country Guides */}
      <div className="p-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 py-2">Module 2 — Country Guides</p>
        <div className="space-y-1">
          {COUNTRIES.map((c) => {
            const isActive = activeView === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveView(c.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-lg flex-shrink-0">{c.flag}</span>
                <span className="text-left">{c.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mx-4 mb-4 mt-1 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400 text-center">6 modules available</p>
      </div>
    </nav>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function SchengenDashboard() {
  const [activeView, setActiveView] = useState<string>("basics");

  const activeCountry = COUNTRIES.find((c) => c.id === activeView) ?? null;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Dark hero banner ── */}
      <div className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 flex-shrink-0">
              <Map size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Schengen Visa Training Portal</h1>
              <p className="text-slate-300 text-sm mt-1">
                Internal resource for Schengen visa requirements, booking platforms, and country-specific documentation.
              </p>
            </div>
            <div className="sm:ml-auto flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2">
              <GraduationCap size={16} className="text-indigo-300" />
              <span className="text-sm font-semibold text-white">LMS Training Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── LMS 2-column layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

          {/* Left: Sticky sidebar */}
          <aside className="md:col-span-1 md:sticky md:top-6">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
          </aside>

          {/* Right: Main content classroom */}
          <main className="md:col-span-3 min-w-0">
            {activeView === "basics" ? (
              <BasicsContent />
            ) : activeCountry ? (
              <CountryContent country={activeCountry} />
            ) : null}
          </main>

        </div>
      </div>
    </div>
  );
}
