import Link from 'next/link';

export default function DashboardPage() {
  const categories = [
    {
      id: 'schengen',
      name: 'Schengen Area',
      description: 'Training and requirements for European Schengen states.',
      color: 'bg-blue-500',
      icon: '🇪🇺',
    },
    {
      id: 'usa',
      name: 'USA',
      description: 'Comprehensive guide for United States visa processes.',
      color: 'bg-red-600',
      icon: '🇺🇸',
    },
    {
      id: 'uk',
      name: 'United Kingdom',
      description: 'Step-by-step procedures for UK visa applications.',
      color: 'bg-indigo-800',
      icon: '🇬🇧',
    },
    {
      id: 'canada',
      name: 'Canada',
      description: 'Detailed instructions for Canadian visa requirements.',
      color: 'bg-red-500',
      icon: '🇨🇦',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
          Visa Training Modules
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Select a region below to access standardized training materials, timelines, and document checklists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/visa/${cat.id}`}
            className="group block relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-full h-1.5 ${cat.color} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
            <div className="text-5xl mb-5 drop-shadow-sm">{cat.icon}</div>
            <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {cat.name}
            </h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              {cat.description}
            </p>
            <div className="mt-6 flex items-center text-sm font-semibold text-blue-600">
              View Modules
              <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
