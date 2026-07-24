/**
 * app/page.tsx
 *
 * Region Selection Hub — the entry point after a successful magic link login.
 *
 * Renders a premium UdemyCard grid for Schengen, USA, UK, and Canada.
 * Matches the UdemyCard design from SchengenDashboard.tsx so the visual
 * language is consistent throughout the portal.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Training Portal — Crew-MG',
  description: 'Select your visa training region to get started.',
};

// ─── Region definitions ───────────────────────────────────────────────────────

interface Region {
  id:          string;
  name:        string;
  flag:        string;
  description: string;
  href:        string;
  gradient:    string;
  flagUrl:     string;
  tags:        string[];
  available:   boolean;
}

const REGIONS: Region[] = [
  {
    id:          'schengen',
    name:        'Schengen Area',
    flag:        '🇪🇺',
    description: 'Insurance, hotel & flight basics + country-specific guides for Spain, France, Germany, Italy, and the Netherlands.',
    href:        '/schengen',
    gradient:    'from-blue-600 via-indigo-500 to-violet-600',
    flagUrl:     'https://flagcdn.com/eu.svg',
    tags:        ['5 Countries', 'Insurance', 'Document Checklist'],
    available:   true,
  },
  {
    id:          'usa',
    name:        'United States',
    flag:        '🇺🇸',
    description: 'DS-160, B1/B2 visa interview preparation, ESTA, and embassy appointment booking walkthroughs.',
    href:        '/visa/usa',
    gradient:    'from-red-600 via-rose-500 to-red-700',
    flagUrl:     'https://flagcdn.com/us.svg',
    tags:        ['DS-160', 'B1/B2 Visa', 'ESTA'],
    available:   false,
  },
  {
    id:          'uk',
    name:        'United Kingdom',
    flag:        '🇬🇧',
    description: 'Standard Visitor Visa, IHS surcharge, biometrics, and online UK Visas & Immigration portal guide.',
    href:        '/visa/uk',
    gradient:    'from-indigo-700 via-blue-800 to-slate-800',
    flagUrl:     'https://flagcdn.com/gb.svg',
    tags:        ['Standard Visitor', 'Biometrics', 'UKVI Portal'],
    available:   false,
  },
  {
    id:          'canada',
    name:        'Canada',
    flag:        '🇨🇦',
    description: 'TRV (Temporary Resident Visa), eTA, IRCC portal, medical examination, and biometrics requirements.',
    href:        '/visa/canada',
    gradient:    'from-red-500 via-red-600 to-rose-700',
    flagUrl:     'https://flagcdn.com/ca.svg',
    tags:        ['TRV / eTA', 'IRCC Portal', 'Medical Exam'],
    available:   false,
  },
];

// ─── Card media block ─────────────────────────────────────────────────────────

function RegionMedia({ region }: { region: Region }) {
  return (
    <div className="w-full relative">
      {/* Flag */}
      <img
        src={region.flagUrl}
        alt={`${region.name} flag`}
        className="w-full h-32 object-cover rounded-t-2xl"
      />
      {/* "Coming Soon" ribbon */}
      {!region.available && (
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/20 z-10">
          Coming Soon
        </div>
      )}
    </div>
  );
}

// ─── UdemyCard (self-contained for this page) ─────────────────────────────────

function RegionCard({ region }: { region: Region }) {
  const card = (
    <div
      className={`
        flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden
        shadow-sm transition-all duration-300
        ${region.available
          ? 'hover:shadow-2xl hover:-translate-y-1.5 cursor-pointer'
          : 'opacity-70 cursor-not-allowed'
        }
      `}
    >
      {/* Media */}
      <div className="w-full">
        <RegionMedia region={region} />
      </div>

      {/* Title + description */}
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-lg font-extrabold text-white leading-snug">
          {region.name}
        </h2>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed flex-1">
          {region.description}
        </p>
      </div>

      {/* Tags footer */}
      <div className="px-5 pb-5 pt-0 border-t border-white/10">
        <div className="flex flex-wrap gap-2 pt-4">
          {region.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
          {region.available && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full ml-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (!region.available) return card;

  return (
    <Link href={region.href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl">
      {card}
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegionHubPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-[#0f0c29] via-[#1a1550] to-[#24243e] py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-5">
            Visa Training Portal
          </span>
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Select Your Region
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Choose a destination below to access standardised training materials,
            document checklists, and step-by-step visa guides.
          </p>
        </div>
      </div>

      {/* Card grid */}
      <div className="flex-1 bg-[#0f0c29] py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {REGIONS.map((region) => (
              <RegionCard key={region.id} region={region} />
            ))}
          </div>

          <p className="mt-10 text-center text-xs text-slate-400">
            Additional modules for USA, UK, and Canada are being prepared and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
