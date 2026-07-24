const fs = require('fs');

const file = 'app/schengen/SchengenDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacements = [
  // Outer bg
  ['<div className="min-h-screen bg-slate-50">', '<div className="min-h-screen bg-[#0f0c29]">'],
  
  // UdemyCard
  ['bg-white border border-slate-200 rounded-xl', 'bg-white/5 backdrop-blur-md border border-white/10 rounded-xl'],
  ['text-slate-900 leading-snug', 'text-white leading-snug'],
  ['text-slate-500 mt-1', 'text-slate-400 mt-1'],
  ['border-t border-slate-100', 'border-t border-white/10'],
  ['text-slate-600 bg-slate-100 border border-slate-200', 'text-slate-300 bg-white/10 border border-white/20'],

  // SectionCard
  ['bg-white rounded-2xl border border-slate-200 shadow-sm p-6', 'bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm p-6'],
  ['bg-indigo-100 flex items-center justify-center text-indigo-600', 'bg-white/10 flex items-center justify-center text-indigo-300'],
  ['text-slate-800">{title}', 'text-white">{title}'],
  ['text-slate-500 mt-0.5">{subtitle}', 'text-slate-400 mt-0.5">{subtitle}'],

  // CountryGrid / BasicsContent Headers
  ['bg-indigo-50 border border-indigo-100', 'bg-indigo-500/10 border border-indigo-500/20'],
  ['bg-indigo-100 flex items-center justify-center', 'bg-indigo-500/20 flex items-center justify-center'],
  ['text-indigo-600" />', 'text-indigo-400" />'],
  ['text-indigo-900', 'text-indigo-100'],
  ['text-indigo-700 text-sm mt-1', 'text-indigo-200/80 text-sm mt-1'],

  // Sidebar
  ['bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden', 'bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm overflow-hidden'],
  ['text-slate-600 hover:bg-slate-50 hover:text-slate-900', 'text-slate-300 hover:bg-white/10 hover:text-white'],
  ['bg-indigo-100"}', 'bg-white/10"}'],
  ['text-indigo-600"}', 'text-slate-300"}'],
  ['border-t border-slate-100', 'border-t border-white/10'],

  // BasicsContent links
  ['bg-white border border-slate-200 rounded-xl p-4', 'bg-white/5 border border-white/10 rounded-xl p-4'],
  ['bg-slate-50 border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700', 'bg-white/10 border border-white/20 text-slate-300 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-white'],

  // CountryContent Back Button & Header
  ['text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100', 'text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30'],
  ['bg-white rounded-2xl border border-slate-200 shadow-sm', 'bg-white/5 rounded-2xl border border-white/10 shadow-sm'],
  ['bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600', 'bg-white/10 border border-white/20 text-slate-300 hover:bg-indigo-500 hover:text-white'],
  ['bg-indigo-50 border border-indigo-100 rounded-xl', 'bg-indigo-500/10 border border-indigo-500/20 rounded-xl'],
  ['bg-indigo-100 border border-indigo-200', 'bg-indigo-500/20 border border-indigo-500/30'],

  // CountryContent Required Docs
  ['bg-white border border-slate-100 rounded-xl px-4 py-3 hover:border-emerald-200 hover:bg-emerald-50/30', 'bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:border-emerald-500/40 hover:bg-emerald-500/10'],
  ['text-slate-700 leading-snug', 'text-slate-300 leading-snug'],
  
  // CountryContent Submission Order
  ['hover:border-indigo-200 hover:bg-indigo-50/30', 'hover:border-indigo-500/40 hover:bg-indigo-500/10'],

  // Tags and badges in Basics / Country
  ['text-slate-400 bg-slate-50 border border-slate-200', 'text-slate-400 bg-white/5 border border-white/10'],
  ['text-emerald-700 bg-emerald-50 border border-emerald-200', 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'],
];

replacements.forEach(([search, replace]) => {
  content = content.split(search).join(replace);
});

fs.writeFileSync(file, content);
console.log('Replacements complete');
