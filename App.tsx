import React, { useState, useEffect, useMemo } from 'react';
import { ToothMap } from './components/ToothMap';
import { TreatmentForm } from './components/TreatmentForm';
import { Timeline } from './components/Timeline';
import { INITIAL_TEETH } from './constants';
import { Tooth, Treatment, ToothStatus } from './types';
import { getDentalAdvice } from './services/geminiService';
import { Plus, Calendar, Activity, Settings, Info, Sparkles, X, ChevronRight, AlertTriangle, ArrowRight } from 'lucide-react';

// Simple text renderer for AI output to avoid extra dependencies
const MarkdownRenderer = ({ content }: { content: string }) => (
    <div className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-sm">
        {content.split('\n').map((line, i) => (
            <p key={i} className="mb-2">{line}</p>
        ))}
    </div>
);

export default function App() {
  // --- State ---
  const [teeth, setTeeth] = useState<Tooth[]>(INITIAL_TEETH);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedToothId, setSelectedToothId] = useState<number | null>(null);
  const [view, setView] = useState<'map' | 'timeline' | 'reminders'>('map');
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  
  // AI State
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Reminders Logic
  const nextCheckup = useMemo(() => {
    // Find last hygiene or checkup
    const lastCheckup = treatments
        .filter(t => t.type === 'Hygiene/Cleaning' || t.type === 'Checkup')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    if (!lastCheckup) return new Date().toISOString().split('T')[0]; // Due now if never

    const date = new Date(lastCheckup.date);
    date.setMonth(date.getMonth() + 6);
    return date.toISOString().split('T')[0];
  }, [treatments]);

  // --- Handlers ---

  const handleToothClick = (tooth: Tooth) => {
    setSelectedToothId(tooth.id);
    setIsAddingTreatment(false);
  };

  const handleSaveTreatment = (data: Omit<Treatment, 'id'>) => {
    const newTreatment: Treatment = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setTreatments(prev => [newTreatment, ...prev]);
    setIsAddingTreatment(false);

    // Auto-update tooth status based on treatment?
    if (data.toothId) {
        setTeeth(prev => prev.map(t => {
            if (t.id === data.toothId) {
                // Simple logic: if extraction -> missing, if crown -> crown, etc.
                if (data.type === 'Extraction') return { ...t, status: ToothStatus.MISSING };
                if (data.type === 'Root Canal') return { ...t, status: ToothStatus.TREATED };
                if (data.type === 'Crown') return { ...t, status: ToothStatus.CROWN };
                if (data.type === 'Filling') return { ...t, status: ToothStatus.FILLED };
                if (data.type === 'Veneer') return { ...t, status: ToothStatus.VENEER };
                // If it's just hygiene or checkup, don't change status generally
            }
            return t;
        }));
    }
  };

  const handleStatusChange = (toothId: number, newStatus: ToothStatus) => {
      setTeeth(prev => prev.map(t => t.id === toothId ? { ...t, status: newStatus } : t));
  };

  const handleAskAI = async () => {
    setIsAiLoading(true);
    setShowAiModal(true);
    const response = await getDentalAdvice(treatments, teeth);
    setAiAdvice(response);
    setIsAiLoading(false);
  };

  const selectedTooth = teeth.find(t => t.id === selectedToothId) || null;
  const toothTreatments = selectedToothId 
    ? treatments.filter(t => t.toothId === selectedToothId)
    : [];

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* Sidebar / Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 md:h-screen flex flex-col sticky top-0 z-30">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-dental-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-dental-200">D</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">DentTrack</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setView('map')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'map' ? 'bg-dental-50 text-dental-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Activity size={20} /> Dental Map
            </button>
            <button 
                onClick={() => setView('timeline')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'timeline' ? 'bg-dental-50 text-dental-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Calendar size={20} /> Journal
            </button>
             <button 
                onClick={() => setView('reminders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'reminders' ? 'bg-dental-50 text-dental-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <AlertTriangle size={20} /> Reminders
            </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
             <button 
                onClick={handleAskAI}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
             >
                 <Sparkles size={18} className="group-hover:animate-spin" /> AI Advisor
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative scroll-smooth">
        
        {view === 'map' && (
            <div className="max-w-6xl mx-auto flex flex-col xl:flex-row gap-6 h-full">
                
                {/* Map Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Interactive Map</h2>
                        <button 
                            onClick={() => { setSelectedToothId(null); setIsAddingTreatment(true); }}
                            className="bg-dental-600 text-white px-4 py-2 rounded-lg hover:bg-dental-700 transition-colors flex items-center gap-2 text-sm shadow-sm"
                        >
                            <Plus size={16} /> Add General Record
                        </button>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center min-h-[400px]">
                         <ToothMap 
                            teeth={teeth} 
                            onToothClick={handleToothClick} 
                            selectedToothId={selectedToothId} 
                        />
                    </div>
                </div>

                {/* Tooth Details Panel (Desktop: Side, Mobile: Modal-like below) */}
                <div className={`xl:w-96 bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col transition-all duration-300 ${selectedToothId ? 'opacity-100 translate-x-0' : 'opacity-50 xl:opacity-100'}`}>
                    {selectedToothId ? (
                         <>
                            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-xl">
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-800">Tooth {selectedTooth?.label}</h3>
                                    <div className="mt-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Status</label>
                                        <select 
                                            value={selectedTooth?.status} 
                                            onChange={(e) => handleStatusChange(selectedTooth!.id, e.target.value as ToothStatus)}
                                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-md focus:ring-dental-500 focus:border-dental-500 block w-full p-2 outline-none cursor-pointer"
                                        >
                                            {Object.values(ToothStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedToothId(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-1 shadow-sm border border-slate-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-semibold text-slate-700">History</h4>
                                    <button 
                                        onClick={() => setIsAddingTreatment(true)}
                                        className="text-dental-600 hover:text-dental-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-dental-50 px-2 py-1 rounded transition-colors"
                                    >
                                        <Plus size={14} /> Add Procedure
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    {toothTreatments.length === 0 ? (
                                        <div className="text-center text-slate-400 py-8 border-2 border-dashed border-slate-200 rounded-lg">
                                            <p className="text-sm">No records for this tooth.</p>
                                        </div>
                                    ) : (
                                        toothTreatments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                                            <div key={t.id} className="bg-white p-3 rounded-lg border border-slate-200 text-sm shadow-sm relative hover:border-dental-200 transition-colors">
                                                <div className="font-bold text-slate-700 flex justify-between">
                                                    {t.type}
                                                    <span className="text-slate-400 text-xs font-normal">{new Date(t.date).toLocaleDateString()}</span>
                                                </div>
                                                {t.notes && <div className="text-slate-600 mt-2 bg-slate-50 p-2 rounded text-xs italic">"{t.notes}"</div>}
                                                {t.cost && <div className="mt-2 text-xs font-medium text-green-600">{t.currency} {t.cost}</div>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                         </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center h-96 xl:h-auto">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Info size={32} className="opacity-40" />
                            </div>
                            <h3 className="text-slate-800 font-medium mb-1">Tooth Details</h3>
                            <p className="text-sm max-w-[200px]">Select a tooth from the map to view its history and add specific treatments.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {view === 'timeline' && (
             <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-end mb-6">
                     <h2 className="text-2xl font-bold text-slate-800">Treatment Journal</h2>
                     <span className="text-slate-400 text-sm">{treatments.length} records</span>
                </div>
                <Timeline 
                    treatments={treatments} 
                    onSelectTreatment={(t) => {
                         if(t.toothId) {
                             setView('map');
                             setSelectedToothId(t.toothId);
                         }
                    }}
                    onToothClick={(id) => {
                        setView('map');
                        setSelectedToothId(id);
                    }}
                />
             </div>
        )}

        {view === 'reminders' && (
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800">Reminders</h2>
                
                <div className="grid gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-dental-100 p-3 rounded-full text-dental-600 mt-1">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 mb-1">Next Hygiene Checkup</h3>
                                <p className="text-slate-500 text-sm">Recommended every 6 months to maintain optimal health.</p>
                            </div>
                        </div>
                         <div className="text-right pl-4">
                             <div className="text-2xl md:text-3xl font-bold text-dental-600">
                                {new Date(nextCheckup).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </div>
                             <div className={`text-xs font-bold uppercase tracking-wide mt-1 ${new Date(nextCheckup) < new Date() ? 'text-red-500' : 'text-green-500'}`}>
                                {new Date(nextCheckup) < new Date() ? 'Overdue' : 'Upcoming'}
                             </div>
                         </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
                        <h3 className="font-bold text-lg text-orange-900 mb-4 flex items-center gap-2">
                             <AlertTriangle size={20} className="text-orange-600" /> Active Warranties
                        </h3>
                         {treatments.filter(t => t.warrantyUntil && new Date(t.warrantyUntil) > new Date()).length > 0 ? (
                             <ul className="space-y-2">
                                 {treatments.filter(t => t.warrantyUntil && new Date(t.warrantyUntil) > new Date()).map(t => (
                                     <li key={t.id} className="flex justify-between items-center bg-white/60 p-3 rounded-lg border border-orange-100">
                                         <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                                            <span className="text-orange-900 font-medium">{t.type} {t.toothId ? `(Tooth ${t.toothId})` : ''}</span>
                                         </div>
                                         <span className="text-orange-700 text-sm font-mono bg-white px-2 py-1 rounded">Ends: {t.warrantyUntil}</span>
                                     </li>
                                 ))}
                             </ul>
                         ) : (
                             <div className="text-center py-4">
                                <p className="text-orange-800/60 text-sm italic">No active treatment warranties on file.</p>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        )}

        {/* Floating Modal for Add Treatment */}
        {isAddingTreatment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-fade-in">
                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
                    <TreatmentForm 
                        selectedTooth={selectedTooth} 
                        onCancel={() => setIsAddingTreatment(false)} 
                        onSave={handleSaveTreatment} 
                    />
                </div>
            </div>
        )}

        {/* AI Modal */}
        {showAiModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/20">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-start shrink-0">
                        <div>
                             <h3 className="text-white text-xl font-bold flex items-center gap-2">
                                <Sparkles className="text-yellow-300 animate-pulse" /> AI Dental Advisor
                             </h3>
                             <p className="text-indigo-100 text-sm mt-1">Powered by Gemini 2.5 Flash</p>
                        </div>
                        <button onClick={() => setShowAiModal(false)} className="text-indigo-100 hover:text-white hover:bg-white/10 rounded-full p-1 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto flex-1 bg-white">
                        {isAiLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4 h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                                <p className="text-slate-500 font-medium animate-pulse">Analyzing dental history...</p>
                            </div>
                        ) : (
                            <div className="prose prose-indigo prose-sm max-w-none">
                                <MarkdownRenderer content={aiAdvice} />
                            </div>
                        )}
                    </div>
                    
                    {!isAiLoading && (
                        <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-400 shrink-0">
                            AI advice is generated by a large language model and does not constitute medical advice.
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}