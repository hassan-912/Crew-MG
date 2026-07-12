import Link from 'next/link';

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  if (category !== 'schengen') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-extrabold capitalize text-slate-900 mb-6">{category} Visa Training</h1>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Training content for {category} is currently being updated. Please check back later.
        </p>
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-6 py-3 rounded-xl transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const countries = [
    { id: 'france', name: 'France', flag: '🇫🇷' },
    { id: 'germany', name: 'Germany', flag: '🇩🇪' },
    { id: 'italy', name: 'Italy', flag: '🇮🇹' },
    { id: 'spain', name: 'Spain', flag: '🇪🇸' },
    { id: 'netherlands', name: 'Netherlands', flag: '🇳🇱' },
    { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="text-4xl">🇪🇺</span> Schengen Area
          </h1>
          <p className="mt-2 text-slate-600">Select a member state to view specific processing workflows and training modules.</p>
        </div>
        <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 shadow-sm px-4 py-2 rounded-lg transition-all hover:bg-slate-50 self-start sm:self-auto flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {countries.map((c) => (
              <Link 
                key={c.id} 
                href={`/visa/schengen/${c.id}`}
                className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md hover:ring-1 hover:ring-blue-400 transition-all group"
              >
                <span className="text-3xl drop-shadow-sm">{c.flag}</span>
                <span className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{c.name}</span>
                <svg className="ml-auto h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[380px] shrink-0 sticky top-24">
          <div className="bg-gradient-to-br from-slate-900 to-[#0f0c29] rounded-2xl p-6 text-white shadow-2xl border border-slate-800">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Global Requirements
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Standard checklist required across all Schengen member states prior to specific country processing.
            </p>
            <ul className="space-y-4 text-sm font-medium">
              {[
                'Valid Passport (6 months validity)',
                'Travel Medical Insurance (€30,000 coverage)',
                'Proof of Accommodation',
                'Round-trip Flight Itinerary',
                'Financial Means (Bank statements)',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="mt-0.5 bg-blue-500/20 p-1 rounded-full shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  </div>
                  <span className="text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
