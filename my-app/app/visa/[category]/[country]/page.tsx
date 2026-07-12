'use client';

import Link from 'next/link';
import { use, useState } from 'react';

// Using 'use client' since we have interactive checklists
// We need to unwrap the params promise using React.use()
export default function CountryTrainingPage({ params }: { params: Promise<{ category: string; country: string }> }) {
  const resolvedParams = use(params);
  const { category, country } = resolvedParams;
  
  // State for interactive checklists
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (stepId: number, docIndex: number) => {
    const key = `${stepId}-${docIndex}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const steps = [
    { id: 1, title: 'Aman Insurance', desc: 'Secure required travel medical insurance.', docs: ['Policy Certificate', 'Payment Receipt'] },
    { id: 2, title: 'Visa Application Form', desc: 'Complete the official application accurately.', docs: ['Signed Form', 'Photo (ICAO standard)'] },
    { id: 3, title: 'Hotel Booking', desc: 'Reserve verifiable accommodation.', docs: ['Booking Confirmation', 'Guest List Match'] },
    { id: 4, title: 'Flight Booking', desc: 'Secure round-trip flight reservations.', docs: ['Flight Itinerary', 'PNR Code'] },
    { id: 5, title: 'Motivation & Travel Plan', desc: 'Draft a clear intent of travel.', docs: ['Cover Letter', 'Day-by-Day Itinerary'] },
    { id: 6, title: 'Bank Statement', desc: 'Prepare financial proof documents.', docs: ['6-Month Bank Statement', 'HR Letter'] },
    { id: 7, title: 'Translation', desc: 'Translate non-English/local documents.', docs: ['Certified Translations', 'Originals Attached'] },
    { id: 8, title: 'Review Folder Structure', desc: 'Organize physical and digital folders.', docs: ['Printed Set', 'Digital PDF Archive'] },
    { id: 9, title: 'Log Notes', desc: 'Document client interactions and status.', docs: ['CRM Update', 'Client Confirmation'] },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-10">
        <Link href={`/visa/${category}`} className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 mb-6 transition-colors">
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {category.toUpperCase()}
        </Link>
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
              {country} Training Timeline
            </h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Follow this 9-step training sequence to ensure proper visa processing. Watch each video module and complete the checklist.
            </p>
          </div>
          <div className="hidden sm:block text-5xl opacity-80" aria-hidden>
             🎓
          </div>
        </div>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:via-blue-300 before:to-blue-200">
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            
            {/* Timeline Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-600 text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {step.id}
            </div>
            
            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-1">{step.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{step.desc}</p>
              
              {/* Video Player Container */}
              <div className="mb-6 rounded-lg overflow-hidden bg-slate-900 aspect-video relative border border-slate-800 flex items-center justify-center group/video cursor-pointer">
                <div className="absolute inset-0 bg-black/40 group-hover/video:bg-black/20 transition-colors"></div>
                <svg className="w-16 h-16 text-white/80 group-hover/video:text-white group-hover:scale-110 transition-all drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-mono px-2 py-1 rounded">
                  {Math.floor(Math.random() * 4) + 4}:{Math.floor(Math.random() * 50) + 10}
                </div>
              </div>

              {/* Document Checklist */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Required Documents</h4>
                <div className="grid grid-cols-1 gap-2">
                  {step.docs.map((doc, dIdx) => {
                    const isChecked = checkedItems[`${step.id}-${dIdx}`] || false;
                    return (
                      <label key={dIdx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors group/label border border-transparent hover:border-slate-200">
                        <div className="relative flex items-center justify-center w-5 h-5">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => toggleCheck(step.id, dIdx)}
                            className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-blue-600 checked:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all cursor-pointer"
                          />
                          <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-slate-400 line-through' : 'text-slate-700 group-hover/label:text-slate-900'}`}>
                          {doc}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
