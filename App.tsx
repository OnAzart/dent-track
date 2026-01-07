
import React, { useState, useEffect } from 'react';
import { ToothMap } from './components/ToothMap';
import { TreatmentForm } from './components/TreatmentForm';
import { Timeline } from './components/Timeline';
import { INITIAL_TEETH } from './constants';
import { Tooth, Treatment, ToothStatus, UserProfile } from './types';
import { supabaseMock } from './lib/supabase';
import { 
  Plus, Calendar, Activity, X, 
  Settings, Home, LayoutGrid
} from 'lucide-react';

export default function App() {
  // --- Auth State ---
  const [session, setSession] = useState<{ user: any } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- App State ---
  const [teeth, setTeeth] = useState<Tooth[]>(INITIAL_TEETH);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedToothId, setSelectedToothId] = useState<number | null>(null);
  const [view, setView] = useState<'map' | 'timeline' | 'profile'>('map');
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  
  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Guest User',
    dob: '',
    bloodType: 'O+',
    allergies: '',
    medicalNotes: '',
  });

  // Simulate data fetching
  useEffect(() => {
    if (session) {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            setUserProfile(prev => ({ ...prev, name: 'Alex Doe' }));
        }, 800);
    }
  }, [session]);

  // --- Handlers ---
  const handleLogin = async () => {
      setIsSyncing(true);
      await supabaseMock.auth.signInWithGoogle();
      setTimeout(() => {
          setSession({ user: supabaseMock.auth.getUser() });
          setIsSyncing(false);
      }, 1000);
  };

  const handleLogout = () => {
      setSession(null);
      setView('profile');
  };

  const handleToothClick = (tooth: Tooth) => {
    setSelectedToothId(tooth.id);
    setIsAddingTreatment(false);
    setView('map');
  };

  const handleSaveTreatment = (data: Omit<Treatment, 'id'>) => {
    const newTreatment: Treatment = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setTreatments(prev => [newTreatment, ...prev]);
    setIsAddingTreatment(false);

    if (data.toothId) {
        setTeeth(prev => prev.map(t => {
            if (t.id === data.toothId) {
                if (data.type === 'Extraction') return { ...t, status: ToothStatus.MISSING };
                if (data.type === 'Root Canal') return { ...t, status: ToothStatus.TREATED };
                if (data.type === 'Crown') return { ...t, status: ToothStatus.CROWN };
                if (data.type === 'Filling') return { ...t, status: ToothStatus.FILLED };
                if (data.type === 'Veneer') return { ...t, status: ToothStatus.VENEER };
            }
            return t;
        }));
    }
  };

  const selectedTooth = teeth.find(t => t.id === selectedToothId) || null;

  return (
    <div className="h-[100dvh] w-full bg-slate-50 flex flex-col font-sans text-slate-800 overflow-hidden">
      
      {/* Header */}
      <header className="bg-white px-6 py-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-dental-600 rounded-lg flex items-center justify-center text-white">
                <Activity size={20} />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">DentTrack</h1>
        </div>
        <button onClick={() => setView('profile')} className="text-slate-400 hover:text-dental-600 transition-colors">
            <Settings size={22} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pb-[calc(5rem+env(safe-area-inset-bottom))] bg-slate-50">
        <div className="max-w-xl mx-auto h-full flex flex-col p-4 md:p-6">
            {view === 'map' && (
                <div className="flex-1 flex flex-col animate-fade-in space-y-6">
                    {/* The Interactive Map */}
                    <div className="flex-1 flex items-center justify-center min-h-[400px]">
                        <ToothMap 
                          teeth={teeth} 
                          onToothClick={handleToothClick} 
                          selectedToothId={selectedToothId} 
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col gap-3">
                         <button 
                            onClick={() => setIsAddingTreatment(true)}
                            className="w-full bg-dental-600 hover:bg-dental-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-dental-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <Plus size={20} />
                            Record New Treatment
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setView('timeline')}
                                className="bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50"
                            >
                                <Calendar size={18} />
                                History
                            </button>
                            <button 
                                className="bg-white border border-slate-200 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50"
                            >
                                <LayoutGrid size={18} />
                                Analysis
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {view === 'timeline' && (
                <div className="animate-fade-in space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Treatment Journal</h2>
                        <button onClick={() => setView('map')} className="text-sm font-bold text-dental-600 uppercase tracking-widest">Map View</button>
                    </div>
                    <Timeline treatments={treatments} onSelectTreatment={() => {}} onToothClick={(id) => { setView('map'); setSelectedToothId(id); }} />
                </div>
            )}

            {view === 'profile' && (
                <div className="animate-fade-in space-y-6">
                    <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
                         <button onClick={() => setView('map')} className="text-slate-400"><X size={24}/></button>
                    </div>
                    
                    {!session ? (
                         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
                            <div className="w-16 h-16 bg-dental-50 text-dental-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                <Activity size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Cloud Synchronization</h2>
                            <p className="text-slate-500 text-sm">Backup your dental records securely and access them from any device.</p>
                            <button onClick={handleLogin} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-colors">Sign in with Google</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                                <div>
                                    <p className="text-xs font-bold text-dental-600 uppercase tracking-widest mb-1">Status</p>
                                    <p className="font-bold text-slate-900">Sync Active: {session.user.email}</p>
                                </div>
                                <button onClick={handleLogout} className="text-red-500 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100">Log Out</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center px-4 py-3 pb-[calc(1rem+env(safe-area-inset-bottom))] z-10 shadow-lg">
        <button onClick={() => setView('map')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'map' ? 'text-dental-600' : 'text-slate-300'}`}>
            <Home size={24} />
            <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => setView('timeline')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'timeline' ? 'text-dental-600' : 'text-slate-300'}`}>
            <Calendar size={24} />
            <span className="text-[10px] font-bold">Journal</span>
        </button>
        <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 transition-colors ${view === 'profile' ? 'text-dental-600' : 'text-slate-300'}`}>
            <Settings size={24} />
            <span className="text-[10px] font-bold">Account</span>
        </button>
      </nav>

      {/* Procedure Modal */}
      {isAddingTreatment && (
            <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col pb-[env(safe-area-inset-bottom)] shadow-2xl">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="font-bold text-slate-800">Log New Procedure</span>
                        <button onClick={() => setIsAddingTreatment(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                     </div>
                     <div className="overflow-y-auto p-4 md:p-6">
                        <TreatmentForm selectedTooth={selectedTooth} onCancel={() => setIsAddingTreatment(false)} onSave={handleSaveTreatment} />
                     </div>
                </div>
            </div>
        )}
    </div>
  );
}
