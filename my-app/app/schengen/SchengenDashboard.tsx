"use client";

import { useState } from "react";
import {
  Shield, Hotel, Plane, Globe, FileText, CheckCircle2,
  ChevronRight, ExternalLink, Play, BookOpen, Map,
  ListOrdered, Layers, FileDown, Link2, Building2,
  GraduationCap, ArrowLeft, Timer, Film, MapPin,
} from "lucide-react";
import { COUNTRIES, type CountryData, type QuickLink } from "./countryData";

// ─── Gradient palette per country id / accent ─────────────────────────────────

const COUNTRY_GRADIENT: Record<string, string> = {
  spain:       "from-red-500 via-yellow-400 to-red-600",
  france:      "from-blue-600 via-indigo-500 to-blue-800",
  germany:     "from-slate-800 via-slate-700 to-yellow-500",
  italy:       "from-green-500 via-white to-red-500",
  netherlands: "from-orange-500 via-white to-blue-700",
};

const BASICS_GRADIENT: Record<string, string> = {
  insurance: "from-violet-500 via-purple-500 to-indigo-600",
  hotel:     "from-sky-500 via-cyan-400 to-blue-600",
  flight:    "from-emerald-500 via-teal-400 to-green-600",
};

// ─── Basics data ──────────────────────────────────────────────────────────────

const BASICS = [
  {
    id: "insurance", title: "Travel Insurance", accent: "violet", Icon: Shield,
    links: [{ label: "EPTI", url: "https://epti-egy.org/Traveltargetweb/Pages/Policy_Qry2/Default.aspx" }],
    video: { url: "", thumbnail: "" },
  },
  {
    id: "hotel", title: "Hotel Booking", accent: "sky", Icon: Hotel,
    links: [
      { label: "Booking.com", url: "https://www.booking.com/" },
      { label: "Agoda", url: "https://www.agoda.com/?ds=P9IxPFO00lRN63tY" },
      { label: "Expedia", url: "https://www.expedia.com/Hotels?locale=en_US&siteid=4406" },
      { label: "ALL.Accor", url: "https://all.accor.com/a/en.html" },
    ],
    video: { url: "", thumbnail: "" },
  },
  {
    id: "flight", title: "Flight Booking", accent: "emerald", Icon: Plane,
    links: [
      { label: "Flyin", url: "https://eg.flyin.com/en" },
      { label: "EgyptAir", url: "https://www.egyptair.com/en/Pages/HomePage.aspx" },
    ],
    video: { url: "", thumbnail: "" },
  },
];

const ACCENT: Record<string, { card: string; icon: string }> = {
  violet:  { card: "from-violet-50 to-purple-50 border-violet-100", icon: "bg-violet-100 text-violet-600" },
  sky:     { card: "from-sky-50 to-blue-50 border-sky-100",         icon: "bg-sky-100 text-sky-600"       },
  emerald: { card: "from-emerald-50 to-teal-50 border-emerald-100", icon: "bg-emerald-100 text-emerald-600"},
};

// ─── UdemyCard ────────────────────────────────────────────────────────────────
// A fully reusable Udemy-style card: media top, title middle, tags bottom.

interface UdemyCardTag {
  label: string;
  icon?: React.ElementType;
}

interface UdemyCardProps {
  /** Rendered inside the top media block */
  media: React.ReactNode;
  /** Card headline */
  title: React.ReactNode;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Info tags rendered in the card footer */
  tags: UdemyCardTag[];
  /** Click handler for the whole card */
  onClick?: () => void;
  /** Extra classes on the outer wrapper */
  className?: string;
}

function UdemyCard({ media, title, subtitle, tags, onClick, className = "" }: UdemyCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      onClick={onClick}
      className={`
        flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden
        hover:shadow-xl hover:-translate-y-1 transition-all duration-300
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {/* ── Top: Media ─────────────────────────────────────── */}
      <div className="w-full">
        {media}
      </div>

      {/* ── Middle: Title ──────────────────────────────────── */}
      <div className="p-5 flex-1 flex flex-col justify-center">
        <h3 className="text-base font-extrabold text-white leading-snug line-clamp-2">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{subtitle}</p>}
      </div>

      {/* ── Bottom: Tags ───────────────────────────────────── */}
      <div className="px-5 pb-5 pt-0 border-t border-white/10">
        <div className="flex flex-wrap gap-2 pt-4">
          {tags.map((tag, i) => {
            const TagIcon = tag.icon;
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full"
              >
                {TagIcon && <TagIcon size={11} className="text-slate-400 flex-shrink-0" />}
                {tag.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Country gradient media block ─────────────────────────────────────────────

function CountryMediaBlock({ country }: { country: CountryData }) {
  return (
    <div className="w-full relative">
      <img 
        src={country.flagUrl} 
        alt={`${country.name} flag`} 
        className="w-full h-32 object-cover rounded-t-2xl" 
      />
    </div>
  );
}

// ─── VideoPlayer — renders real video or a styled placeholder ─────────────────

function VideoPlayer({
  url,
  thumbnail,
  title,
  index = 0,
}: {
  url: string;
  thumbnail: string;
  title: string;
  index?: number;
}) {
  if (url) {
    // ── Real video: poster shows thumbnail until play is pressed ────────────
    return (
      <video
        src={url}
        poster={thumbnail || undefined}
        controls
        preload="metadata"
        className="w-full aspect-video rounded-xl object-cover border border-slate-200"
      />
    );
  }

  // ── Placeholder: thumbnail as blurred bg if available, else dark gradient ──
  const tints = [
    "from-slate-900 via-slate-800 to-indigo-950",
    "from-slate-900 via-slate-800 to-violet-950",
    "from-slate-900 via-slate-800 to-blue-950",
  ];

  return (
    <div
      className="w-full aspect-video rounded-xl overflow-hidden relative border border-slate-700/60 group flex flex-col items-center justify-center gap-3"
      style={
        thumbnail
          ? { backgroundImage: `url(${thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {/* Dark overlay (solid if no thumbnail, semi-transparent if thumbnail) */}
      <div
        className={`absolute inset-0 ${
          thumbnail
            ? "bg-black/55"
            : `bg-gradient-to-br ${tints[index % tints.length]}`
        }`}
      />
      {/* Grid lines (only when no thumbnail) */}
      {!thumbnail && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/25 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300 shadow-xl">
          <Play size={24} className="text-white ml-1" />
        </div>
        <p className="text-slate-200 text-xs font-medium text-center px-6 leading-snug drop-shadow">{title}</p>
        <span className="text-xs text-slate-400 bg-black/50 px-2.5 py-1 rounded-full border border-white/10">
          Video coming soon
        </span>
      </div>
    </div>
  );
}

// ─── Basics gradient media block ──────────────────────────────────────────────

function BasicsMediaBlock({ id }: { id: string }) {
  const gradient = BASICS_GRADIENT[id] ?? "from-indigo-500 to-purple-600";
  const card = BASICS.find((b) => b.id === id);
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 relative overflow-hidden group`}>
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Play overlay */}
      <div className="relative z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/25 group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300 shadow-xl">
        <Play size={20} className="text-white ml-1" />
      </div>
      {card && (
        <span className="relative z-10 text-white/80 text-xs font-semibold tracking-wide uppercase">
          {card.title}
        </span>
      )}
    </div>
  );
}

// ─── Country Grid (Home view) ─────────────────────────────────────────────────

function CountryGrid({ setActiveView }: { setActiveView: (v: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Globe size={20} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="font-bold text-indigo-100 text-base">Country Visa Guides</h2>
          <p className="text-indigo-200/80 text-sm mt-1 leading-relaxed">
            Select a destination to view the complete visa application guide, required documents, and video walkthroughs.
          </p>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COUNTRIES.map((country) => (
          <UdemyCard
            key={country.id}
            onClick={() => setActiveView(country.id)}
            media={<CountryMediaBlock country={country} />}
            title={
              <span className="flex items-center gap-2">
                <span className="text-xl">{country.flag}</span>
                <span>{country.name}</span>
              </span>
            }
            subtitle={`Everything you need to apply for a Schengen visa via ${country.agency}.`}
            tags={[
              { label: country.agency, icon: Building2 },
              { label: country.locations.map((l) => l.city).join(" · "), icon: MapPin },
              { label: `${country.requiredDocs.length} Documents`, icon: FileText },
            ]}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-indigo-300 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Basics content ───────────────────────────────────────────────────────────

function BasicsContent() {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Layers size={20} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="font-bold text-indigo-100 text-base">Common Tasks — All Schengen Countries</h2>
          <p className="text-indigo-200/80 text-sm mt-1 leading-relaxed">
            Complete these steps first. They apply identically regardless of your destination country.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BASICS.map((card, i) => (
          <div key={card.id} className="flex flex-col gap-3">
            {/* Card title */}
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</p>
            {/* Smart video player or placeholder */}
            <VideoPlayer
              url={card.video.url}
              thumbnail={card.video.thumbnail}
              title={`How to book ${card.title.toLowerCase()} step-by-step`}
              index={i}
            />
            {/* Status tags */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                <Film size={11} className="text-slate-400" />Tutorial
              </span>
              {card.video.url ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  <Play size={11} className="text-emerald-500" />Ready to watch
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  <Play size={11} className="text-slate-300" />Video coming soon
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Booking links below the cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BASICS.map((card) => (
          <div key={card.id + "-links"} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <ExternalLink size={11} /> Quick links — {card.title}
            </p>
            <div className="flex flex-wrap gap-2">
              {card.links.map((l) => (
                <a
                  key={l.label}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-slate-300 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <ExternalLink size={11} className="text-slate-400 group-hover:text-indigo-500" />
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        ))}
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
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${QUICK_STYLE[link.icon]}`}
    >
      <IconCmp size={15} />{link.label}
    </a>
  );
}



function CountryContent({
  country,
  onBack,
}: {
  country: CountryData;
  onBack: () => void;
}) {
  const videos = [
    {
      title: `How to fill the Visa Application Form`,
      subtitle: `Step-by-step walkthrough for the official ${country.name} Schengen form.`,
      url:       country.videos.form.url,
      thumbnail: country.videos.form.thumbnail,
    },
    {
      title: `How to write a Motivation Letter`,
      subtitle: `Tips on framing your travel purpose and convincing the consulate.`,
      url:       country.videos.motivation.url,
      thumbnail: country.videos.motivation.thumbnail,
    },
    {
      title: `How to create a Travel Plan`,
      subtitle: `Building a day-by-day itinerary that matches your visa request.`,
      url:       country.videos.itinerary.url,
      thumbnail: country.videos.itinerary.thumbnail,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ← Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 px-4 py-2 rounded-xl transition-all duration-200"
      >
        <ArrowLeft size={15} />
        Back to All Courses
      </button>

      {/* Country header */}
      <div className="flex flex-wrap items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
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
        <div className="hidden lg:flex items-center gap-2 flex-wrap">
          {country.locations.map((loc) => (
            <a
              key={loc.city}
              href={loc.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200"
            >
              <MapPin size={11} />{loc.city}
            </a>
          ))}
        </div>
      </div>

      {/* Row 1: Quick Actions | Agency Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard icon={<ExternalLink size={18} />} title="Quick Actions" subtitle="Official links for this embassy">
          <div className="flex flex-col gap-3">
            {country.quickLinks.map((l) => (
              <QuickActionButton key={l.label} link={l} />
            ))}
          </div>
        </SectionCard>
        <SectionCard icon={<MapPin size={18} />} title="Agency Locations" subtitle="Where to submit your application in Egypt">
          <div className="flex flex-wrap gap-3">
            {country.locations.map((loc) => (
              <a
                key={loc.city}
                href={loc.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 hover:bg-indigo-600 hover:border-indigo-600 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 group-hover:border-white/30 transition-colors">
                  <MapPin size={15} className="text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-100 group-hover:text-white transition-colors">{loc.city}</p>
                  <p className="text-xs text-indigo-500 group-hover:text-indigo-100 transition-colors flex items-center gap-1">
                    {country.agency} · Open in Maps
                  </p>
                </div>
              </a>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Row 2: Video Tutorials */}
      <SectionCard
        icon={<Globe size={18} />}
        title="Video Tutorials"
        subtitle="Watch all three before your appointment"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {videos.map((video, i) => (
            <div key={video.title} className="flex flex-col gap-3">
              {/* Title above the player */}
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                {video.title}
              </p>
              {/* Smart player: real video or placeholder */}
              <VideoPlayer url={video.url} thumbnail={video.thumbnail} title={video.title} index={i} />
              {/* Tags row */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                  <Timer size={11} className="text-slate-400" />~10 mins
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={11} className="text-slate-400" />Required
                </span>
                {video.url ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <Play size={11} className="text-emerald-500" />Ready to watch
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    <Film size={11} className="text-slate-300" />Video coming soon
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Row 3: Required Docs — full width horizontal grid */}
      <SectionCard
        icon={<FileText size={18} />}
        title="Required Documents"
        subtitle={`${country.requiredDocs.length} items to prepare`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {country.requiredDocs.map((doc, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors group">
              <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 flex-shrink-0 group-hover:text-emerald-600" />
              <span className="text-sm text-slate-300 leading-snug">{doc}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Row 4: Submission Order — full width horizontal grid */}
      <SectionCard
        icon={<ListOrdered size={18} />}
        title="Submission Order"
        subtitle="Stack papers in this exact order"
      >
        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mb-4">
          <ChevronRight size={13} className="text-indigo-500 flex-shrink-0" />
          <p className="text-xs text-indigo-700 font-medium">Document #1 goes on top; each one underneath the previous.</p>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {country.arrangement.map((step, i) => (
            <li key={i} className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-colors group">
              <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {i + 1}
              </div>
              <span className="text-sm text-slate-300 leading-snug">{step}</span>
            </li>
          ))}
        </ol>
      </SectionCard>
    </div>
  );
}

// ─── LMS Sidebar ──────────────────────────────────────────────────────────────

function Sidebar({
  activeView,
  setActiveView,
}: {
  activeView: string;
  setActiveView: (v: string) => void;
}) {
  const isBasics = activeView === "basics";
  const isHome   = activeView === "home";

  return (
    <nav className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm overflow-hidden">
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
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isBasics ? "bg-white/20" : "bg-white/10"}`}>
            <BookOpen size={14} className={isBasics ? "text-white" : "text-slate-300"} />
          </div>
          <span className="text-left leading-snug">Schengen Basics</span>
          {isBasics && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Section 2: Country Guides */}
      <div className="p-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 py-2">Module 2 — Country Guides</p>

        {/* "All Countries" card grid button */}
        <button
          type="button"
          onClick={() => setActiveView("home")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-1 ${
            isHome
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isHome ? "bg-white/20" : "bg-white/10"}`}>
            <Globe size={14} className={isHome ? "text-white" : "text-slate-300"} />
          </div>
          <span className="text-left">All Countries</span>
          {isHome && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
        </button>

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
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
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
      <div className="mx-4 mb-4 mt-1 border-t border-white/10 pt-4">
        <p className="text-xs text-slate-400 text-center">6 modules available</p>
      </div>
    </nav>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function SchengenDashboard() {
  // Default to the new country-grid home view
  const [activeView, setActiveView] = useState<string>("home");

  const activeCountry = COUNTRIES.find((c) => c.id === activeView) ?? null;

  return (
    <div className="min-h-screen bg-[#0f0c29]">

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
              <CountryContent
                country={activeCountry}
                onBack={() => setActiveView("home")}
              />
            ) : (
              <CountryGrid setActiveView={setActiveView} />
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
