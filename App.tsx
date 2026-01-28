
import React, { useState, useEffect, useCallback } from 'react';
import { ToothMap } from './components/ToothMap';
import { TreatmentForm } from './components/TreatmentForm';
import { Timeline } from './components/Timeline';
import { DentistForm } from './components/DentistForm';
import { CalendarView } from './components/CalendarView';
import { INITIAL_TEETH } from './constants';
import { Tooth, Treatment, ToothStatus, UserProfile, Dentist } from './types';
import {
  supabase,
  isSupabaseConfigured,
  signInWithGoogle,
  signOut,
  fetchTreatments,
  saveTreatment,
  deleteTreatment,
  fetchDentists,
  saveDentist as saveDentistToDb,
  fetchTeethStatus,
  saveToothStatus,
  localStore,
  setupDeepLinkListener,
} from './lib/supabase';
import {
  Plus, Calendar, Activity, X,
  Settings, Home, LayoutGrid, UserPlus,
  Users, ChevronRight, Phone, Building2, Stethoscope,
  CalendarDays, List, Loader2, Cloud, CloudOff, History, Filter
} from 'lucide-react';

// Type for Supabase user
interface User {
  id: string;
  email?: string;
}

export default function App() {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- App State ---
  const [teeth, setTeeth] = useState<Tooth[]>(INITIAL_TEETH);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [selectedToothId, setSelectedToothId] = useState<number | null>(null);
  const [view, setView] = useState<'map' | 'timeline' | 'profile'>('map');
  const [isAddingTreatment, setIsAddingTreatment] = useState(false);
  const [isAddingDentist, setIsAddingDentist] = useState(false);
  const [journalViewMode, setJournalViewMode] = useState<'list' | 'calendar'>('calendar');
  const [selectedDateTreatments, setSelectedDateTreatments] = useState<{ date: string; treatments: Treatment[] } | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [showToothActions, setShowToothActions] = useState(false);
  const [journalToothFilter, setJournalToothFilter] = useState<number | null>(null);

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Guest User',
    dob: '',
    bloodType: 'O+',
    allergies: '',
    medicalNotes: '',
  });

  // ============================================
  // LOAD DATA FUNCTIONS
  // ============================================

  const loadLocalData = useCallback(() => {
    const localTreatments = localStore.getTreatments();
    const localDentists = localStore.getDentists();
    const localTeethStatus = localStore.getTeethStatus();

    setTreatments(localTreatments);
    setDentists(localDentists);

    // Apply stored teeth status
    if (Object.keys(localTeethStatus).length > 0) {
      setTeeth(prev => prev.map(t => ({
        ...t,
        status: localTeethStatus[t.id] || t.status,
      })));
    }
  }, []);

  const loadCloudData = useCallback(async (userId: string) => {
    setIsSyncing(true);
    try {
      // Fetch all data in parallel
      const [cloudTreatments, cloudDentists, cloudTeethStatus] = await Promise.all([
        fetchTreatments(userId),
        fetchDentists(userId),
        fetchTeethStatus(userId),
      ]);

      setTreatments(cloudTreatments);
      setDentists(cloudDentists);

      // Apply teeth status
      if (Object.keys(cloudTeethStatus).length > 0) {
        setTeeth(prev => prev.map(t => ({
          ...t,
          status: cloudTeethStatus[t.id] || t.status,
        })));
      }

      // Also update local storage for offline access
      localStore.setTreatments(cloudTreatments);
      localStore.setDentists(cloudDentists);
      localStore.setTeethStatus(cloudTeethStatus);

    } catch (error) {
      console.error('Error loading cloud data:', error);
      // Fall back to local data if cloud fails
      loadLocalData();
    } finally {
      setIsSyncing(false);
    }
  }, [loadLocalData]);

  // ============================================
  // AUTH LISTENER
  // ============================================

  // Refresh auth state (used by deep link handler)
  const refreshAuthState = useCallback(async () => {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser({ id: session.user.id, email: session.user.email });
      setUserProfile(prev => ({ ...prev, name: session.user.email?.split('@')[0] || 'User' }));
      loadCloudData(session.user.id);
    }
  }, [loadCloudData]);

  useEffect(() => {
    // Setup deep link listener for native OAuth callback
    setupDeepLinkListener(refreshAuthState);

    // Check if Supabase is configured
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Supabase not configured, using local storage only');
      loadLocalData();
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        setUserProfile(prev => ({ ...prev, name: session.user.email?.split('@')[0] || 'User' }));
        loadCloudData(session.user.id);
      } else {
        loadLocalData();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        setUserProfile(prev => ({ ...prev, name: session.user.email?.split('@')[0] || 'User' }));
        loadCloudData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(prev => ({ ...prev, name: 'Guest User' }));
        // Keep local data after logout
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadCloudData, loadLocalData, refreshAuthState]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleLogin = async () => {
    if (!isSupabaseConfigured()) {
      alert('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
      return;
    }

    setIsSyncing(true);
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Login error:', error);
      setIsSyncing(false);
    }
    // Auth state change listener will handle the rest
  };

  const handleLogout = async () => {
    setIsSyncing(true);
    await signOut();
    setUser(null);
    setIsSyncing(false);
    setView('profile');
  };

  const handleToothClick = (tooth: Tooth) => {
    setSelectedToothId(tooth.id);
    setShowToothActions(true);
  };

  const handleViewToothHistory = () => {
    if (selectedToothId) {
      setJournalToothFilter(selectedToothId);
      setJournalViewMode('list');
      setView('timeline');
      setShowToothActions(false);
    }
  };

  const handleAddTreatmentForTooth = () => {
    setShowToothActions(false);
    setIsAddingTreatment(true);
  };

  const handleSaveTreatment = async (data: Omit<Treatment, 'id'>, existingId?: string) => {
    let newTreatmentId = existingId;

    // Save to cloud if logged in
    if (user && isSupabaseConfigured()) {
      setIsSyncing(true);
      const { data: savedData, error } = await saveTreatment(user.id, data, existingId);
      setIsSyncing(false);

      if (error) {
        console.error('Error saving treatment:', error);
      } else if (savedData) {
        newTreatmentId = savedData.id;
      }
    }

    // Update local state
    if (existingId) {
      setTreatments(prev => {
        const updated = prev.map(t =>
          t.id === existingId ? { ...data, id: existingId } : t
        );
        localStore.setTreatments(updated);
        return updated;
      });
    } else {
      const newTreatment: Treatment = {
        ...data,
        id: newTreatmentId || Math.random().toString(36).substr(2, 9),
      };
      setTreatments(prev => {
        const updated = [newTreatment, ...prev];
        localStore.setTreatments(updated);
        return updated;
      });
    }

    setIsAddingTreatment(false);
    setEditingTreatment(null);
    setSelectedDateTreatments(null);

    // Update tooth status
    if (data.toothId) {
      let newStatus: ToothStatus | null = null;

      if (data.type === 'Extraction') newStatus = ToothStatus.MISSING;
      else if (data.type === 'Root Canal') newStatus = ToothStatus.TREATED;
      else if (data.type === 'Crown') newStatus = ToothStatus.CROWN;
      else if (data.type === 'Filling') newStatus = ToothStatus.FILLED;
      else if (data.type === 'Veneer') newStatus = ToothStatus.VENEER;
      else if (data.type === 'Implant') newStatus = ToothStatus.IMPLANT;

      if (newStatus) {
        setTeeth(prev => {
          const updated = prev.map(t =>
            t.id === data.toothId ? { ...t, status: newStatus! } : t
          );

          // Update local storage
          const statusMap: Record<number, ToothStatus> = {};
          updated.forEach(t => { statusMap[t.id] = t.status; });
          localStore.setTeethStatus(statusMap);

          return updated;
        });

        // Save to cloud
        if (user && isSupabaseConfigured()) {
          saveToothStatus(user.id, data.toothId, newStatus);
        }
      }
    }
  };

  const handleSaveDentist = async (data: Omit<Dentist, 'id' | 'isVerified'>) => {
    let newDentistId: string | undefined;

    // Save to cloud if logged in
    if (user && isSupabaseConfigured()) {
      setIsSyncing(true);
      const { data: savedData, error } = await saveDentistToDb(user.id, data);
      setIsSyncing(false);

      if (error) {
        console.error('Error saving dentist:', error);
      } else if (savedData) {
        newDentistId = savedData.id;
      }
    }

    const newDentist: Dentist = {
      ...data,
      id: newDentistId || Math.random().toString(36).substr(2, 9),
      isVerified: false,
    };

    setDentists(prev => {
      const updated = [...prev, newDentist];
      localStore.setDentists(updated);
      return updated;
    });

    setIsAddingDentist(false);
  };

  const handleDeleteTreatment = async (treatmentId: string) => {
    // Delete from cloud if logged in
    if (user && isSupabaseConfigured()) {
      setIsSyncing(true);
      const { error } = await deleteTreatment(user.id, treatmentId);
      setIsSyncing(false);
      if (error) {
        console.error('Error deleting treatment:', error);
      }
    }

    // Update local state
    setTreatments(prev => {
      const updated = prev.filter(t => t.id !== treatmentId);
      localStore.setTreatments(updated);
      return updated;
    });
  };

  const selectedTooth = teeth.find(t => t.id === selectedToothId) || null;

  // Filter treatments for journal view
  const filteredTreatments = journalToothFilter
    ? treatments.filter(t => t.toothId === journalToothFilter)
    : treatments;

  // Show loading screen
  if (isLoading) {
    return (
      <div className="h-[100dvh] w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-dental-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col font-sans text-slate-800 overflow-hidden">

      {/* Header - Fixed at top */}
      <header className="flex-shrink-0 bg-white px-6 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] flex items-center justify-between border-b border-slate-200 shadow-sm z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-dental-600 rounded-lg flex items-center justify-center text-white">
                <Activity size={20} />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">DentTrack</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Sync status indicator */}
          {isSyncing ? (
            <Loader2 className="w-5 h-5 animate-spin text-dental-600" />
          ) : user ? (
            <Cloud className="w-5 h-5 text-green-500" />
          ) : (
            <CloudOff className="w-5 h-5 text-slate-300" />
          )}
          <button onClick={() => setView('profile')} className="text-slate-400 hover:text-dental-600 transition-colors">
              <Settings size={22} />
          </button>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 overscroll-none">
        <div className="max-w-xl mx-auto flex flex-col p-4 md:p-6 pb-20">
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
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-slate-900">Journal</h2>
                            {journalToothFilter && (
                                <button
                                    onClick={() => setJournalToothFilter(null)}
                                    className="flex items-center gap-1 bg-dental-100 text-dental-700 px-2 py-1 rounded-lg text-sm font-medium"
                                >
                                    <Filter size={14} />
                                    Tooth {journalToothFilter}
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* View Toggle */}
                            <div className="flex bg-slate-100 rounded-lg p-1">
                                <button
                                    onClick={() => setJournalViewMode('calendar')}
                                    className={`p-2 rounded-md transition-colors ${journalViewMode === 'calendar' ? 'bg-white shadow-sm text-dental-600' : 'text-slate-400'}`}
                                >
                                    <CalendarDays size={18} />
                                </button>
                                <button
                                    onClick={() => setJournalViewMode('list')}
                                    className={`p-2 rounded-md transition-colors ${journalViewMode === 'list' ? 'bg-white shadow-sm text-dental-600' : 'text-slate-400'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {journalViewMode === 'calendar' ? (
                        <CalendarView
                            treatments={filteredTreatments}
                            onSelectDate={(date, dateTreatments) => {
                                setSelectedDateTreatments({ date, treatments: dateTreatments });
                            }}
                        />
                    ) : (
                        <Timeline
                            treatments={filteredTreatments}
                            onSelectTreatment={() => {}}
                            onToothClick={(id) => { setView('map'); setSelectedToothId(id); }}
                            onEditTreatment={(t) => setEditingTreatment(t)}
                            onDeleteTreatment={handleDeleteTreatment}
                        />
                    )}

                    {/* Selected Date Treatments Modal */}
                    {selectedDateTreatments && (
                        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                            <div className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[80vh] flex flex-col pb-[env(safe-area-inset-bottom)] shadow-2xl">
                                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <div>
                                        <span className="font-bold text-slate-800">
                                            {new Date(selectedDateTreatments.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        <p className="text-sm text-slate-500">{selectedDateTreatments.treatments.length} treatment(s) · tap to edit</p>
                                    </div>
                                    <button onClick={() => setSelectedDateTreatments(null)} className="p-2 text-slate-400 hover:text-slate-600">
                                        <X size={24}/>
                                    </button>
                                </div>
                                <div className="overflow-y-auto p-4 space-y-3">
                                    {selectedDateTreatments.treatments.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => {
                                                setEditingTreatment(t);
                                                setSelectedDateTreatments(null);
                                            }}
                                            className="w-full text-left bg-slate-50 p-4 rounded-xl hover:bg-slate-100 transition-colors"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-slate-800">{t.type}</span>
                                                {t.toothId && (
                                                    <span className="text-xs bg-dental-100 text-dental-600 px-2 py-1 rounded-md font-medium">
                                                        Tooth {t.toothId}
                                                    </span>
                                                )}
                                            </div>
                                            {t.notes && <p className="text-sm text-slate-600">{t.notes}</p>}
                                            {t.cost && (
                                                <p className="text-sm text-green-600 font-medium mt-2">
                                                    {t.cost} {t.currency}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {view === 'profile' && (
                <div className="animate-fade-in space-y-6">
                    <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-bold text-slate-900">Account</h2>
                         <button onClick={() => setView('map')} className="text-slate-400"><X size={24}/></button>
                    </div>

                    {/* Sync Status Card */}
                    {!user ? (
                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-dental-50 text-dental-600 rounded-xl flex items-center justify-center">
                                    <CloudOff size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900">Cloud Sync</h3>
                                    <p className="text-slate-500 text-sm">
                                      {isSupabaseConfigured()
                                        ? 'Sign in to backup your data'
                                        : 'Supabase not configured'}
                                    </p>
                                </div>
                                <button
                                  onClick={handleLogin}
                                  disabled={!isSupabaseConfigured() || isSyncing}
                                  className="bg-slate-900 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSyncing && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Sign In
                                </button>
                            </div>
                            {!isSupabaseConfigured() && (
                              <p className="text-xs text-orange-600 mt-3 bg-orange-50 p-2 rounded-lg">
                                Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local
                              </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                    <Cloud size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Synced</p>
                                    <p className="font-medium text-slate-900 text-sm">{user.email}</p>
                                </div>
                                <button
                                  onClick={handleLogout}
                                  disabled={isSyncing}
                                  className="text-red-500 text-sm font-medium bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 disabled:opacity-50"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Menu Options */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <button
                            onClick={() => setIsAddingDentist(true)}
                            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
                        >
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <UserPlus size={20} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-medium text-slate-900">Add Dentist</p>
                                <p className="text-slate-500 text-sm">Save your dentist's contact info</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300" />
                        </button>

                        <button
                            onClick={() => {}}
                            className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <Users size={20} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-medium text-slate-900">My Dentists</p>
                                <p className="text-slate-500 text-sm">{dentists.length} saved</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300" />
                        </button>
                    </div>

                    {/* Dentist List */}
                    {dentists.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Your Dentists</h3>
                            {dentists.map((dentist) => (
                                <div key={dentist.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Stethoscope size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900">{dentist.name}</p>
                                            {dentist.type && (
                                                <p className="text-dental-600 text-sm font-medium">{dentist.type}</p>
                                            )}
                                            {dentist.clinicName && (
                                                <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                                                    <Building2 size={14} />
                                                    <span>{dentist.clinicName}</span>
                                                </div>
                                            )}
                                            {dentist.phone && (
                                                <div className="flex items-center gap-1 text-slate-500 text-sm">
                                                    <Phone size={14} />
                                                    <span>{dentist.phone}</span>
                                                </div>
                                            )}
                                            {dentist.notes && (
                                                <p className="text-slate-400 text-sm mt-2 italic">{dentist.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>

      {/* Bottom Navigation - Fixed at bottom */}
      <nav className="flex-shrink-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex justify-around items-center px-4 py-2">
          <button onClick={() => setView('map')} className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'map' ? 'text-dental-600' : 'text-slate-300'}`}>
              <Home size={22} />
              <span className="text-[10px] font-bold">Home</span>
          </button>
          <button onClick={() => setView('timeline')} className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'timeline' ? 'text-dental-600' : 'text-slate-300'}`}>
              <Calendar size={22} />
              <span className="text-[10px] font-bold">Journal</span>
          </button>
          <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-0.5 transition-colors ${view === 'profile' ? 'text-dental-600' : 'text-slate-300'}`}>
              <Settings size={22} />
              <span className="text-[10px] font-bold">Account</span>
          </button>
        </div>
        {/* Safe area spacer */}
        <div className="pb-[env(safe-area-inset-bottom)]"></div>
      </nav>

      {/* Procedure Modal */}
      {(isAddingTreatment || editingTreatment) && (
            <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col pb-[env(safe-area-inset-bottom)] shadow-2xl">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="font-bold text-slate-800">
                          {editingTreatment ? 'Edit Procedure' : 'Log New Procedure'}
                        </span>
                        <button onClick={() => { setIsAddingTreatment(false); setEditingTreatment(null); }} className="p-2 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                     </div>
                     <div className="overflow-y-auto p-4 md:p-6">
                        <TreatmentForm
                          selectedTooth={selectedTooth}
                          onCancel={() => { setIsAddingTreatment(false); setEditingTreatment(null); }}
                          onSave={handleSaveTreatment}
                          dentists={dentists}
                          onAddDentist={() => {
                            setIsAddingTreatment(false);
                            setIsAddingDentist(true);
                          }}
                          editingTreatment={editingTreatment}
                        />
                     </div>
                </div>
            </div>
        )}

      {/* Add Dentist Modal */}
      {isAddingDentist && (
            <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col pb-[env(safe-area-inset-bottom)] shadow-2xl">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <span className="font-bold text-slate-800">Add Dentist</span>
                        <button onClick={() => setIsAddingDentist(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                     </div>
                     <div className="overflow-y-auto p-4 md:p-6">
                        <DentistForm onCancel={() => setIsAddingDentist(false)} onSave={handleSaveDentist} />
                     </div>
                </div>
            </div>
        )}

      {/* Tooth Actions Modal */}
      {showToothActions && selectedTooth && (
            <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="w-full md:max-w-sm bg-white rounded-t-3xl md:rounded-3xl overflow-hidden pb-[env(safe-area-inset-bottom)] shadow-2xl">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <span className="font-bold text-slate-800">Tooth {selectedTooth.id}</span>
                            <p className="text-sm text-slate-500">{selectedTooth.status}</p>
                        </div>
                        <button onClick={() => setShowToothActions(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={24}/></button>
                     </div>
                     <div className="p-4 space-y-3">
                        <button
                            onClick={handleAddTreatmentForTooth}
                            className="w-full bg-dental-600 hover:bg-dental-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <Plus size={20} />
                            Record New Treatment
                        </button>
                        <button
                            onClick={handleViewToothHistory}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <History size={20} />
                            View History ({treatments.filter(t => t.toothId === selectedTooth.id).length})
                        </button>
                     </div>
                </div>
            </div>
        )}
    </div>
  );
}
