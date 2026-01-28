import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Treatment, Dentist, Tooth, ToothStatus } from '../types';

// Get these from your Supabase Dashboard -> Settings -> API
// Add to .env.local file:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Check if Supabase is configured
export const isSupabaseConfigured = () => !!supabase;

// Check if running in native app
export const isNative = () => Capacitor.isNativePlatform();

// Get the correct redirect URL based on platform
const getRedirectUrl = () => {
  if (isNative()) {
    return 'com.denttrack.app://login-callback';
  }
  return window.location.origin;
};

// ============================================
// AUTH FUNCTIONS
// ============================================

export const signInWithGoogle = async () => {
  if (!supabase) {
    console.warn('Supabase not configured');
    return { error: new Error('Supabase not configured') };
  }

  const redirectTo = getRedirectUrl();

  if (isNative()) {
    // For native apps, use the browser plugin
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (data?.url) {
      // Open the OAuth URL in the system browser
      await Browser.open({ url: data.url });
    }

    return { data, error };
  } else {
    // For web, use standard redirect
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    return { data, error };
  }
};

// Setup deep link listener for OAuth callback (call this in App.tsx)
export const setupDeepLinkListener = (onAuthChange: () => void) => {
  if (!isNative()) return;

  App.addListener('appUrlOpen', async ({ url }) => {
    // Check if this is our OAuth callback
    if (url.includes('login-callback')) {
      // Close the browser
      await Browser.close();

      // Extract tokens from URL
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.hash.slice(1)); // Remove # from hash
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken && supabase) {
        // Set the session with the tokens
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        onAuthChange();
      }
    }
  });
};

export const signOut = async () => {
  if (!supabase) return { error: null };
  return await supabase.auth.signOut();
};

export const getSession = async () => {
  if (!supabase) return { data: { session: null }, error: null };
  return await supabase.auth.getSession();
};

export const getUser = async () => {
  if (!supabase) return { data: { user: null }, error: null };
  return await supabase.auth.getUser();
};

// ============================================
// TREATMENTS CRUD
// ============================================

export const fetchTreatments = async (userId: string): Promise<Treatment[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching treatments:', error);
    return [];
  }

  // Transform from snake_case to camelCase
  return (data || []).map(t => ({
    id: t.id,
    toothId: t.tooth_id,
    type: t.type,
    date: t.date,
    notes: t.notes || '',
    cost: t.cost,
    currency: t.currency || 'USD',
    attachments: t.attachments || [],
    dentistId: t.dentist_id,
  }));
};

export const saveTreatment = async (userId: string, treatment: Omit<Treatment, 'id'>, existingId?: string) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };

  const treatmentData = {
    user_id: userId,
    tooth_id: treatment.toothId,
    type: treatment.type,
    date: treatment.date,
    notes: treatment.notes,
    cost: treatment.cost,
    currency: treatment.currency,
    attachments: treatment.attachments,
    dentist_id: treatment.dentistId,
  };

  if (existingId) {
    // Update existing
    const { data, error } = await supabase
      .from('treatments')
      .update(treatmentData)
      .eq('id', existingId)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('treatments')
      .insert(treatmentData)
      .select()
      .single();

    return { data, error };
  }
};

export const deleteTreatment = async (userId: string, treatmentId: string) => {
  if (!supabase) return { error: new Error('Supabase not configured') };

  const { error } = await supabase
    .from('treatments')
    .delete()
    .eq('id', treatmentId)
    .eq('user_id', userId);

  return { error };
};

// ============================================
// DENTISTS CRUD
// ============================================

export const fetchDentists = async (userId: string): Promise<Dentist[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('dentists')
    .select('*')
    .eq('user_id', userId)
    .order('name');

  if (error) {
    console.error('Error fetching dentists:', error);
    return [];
  }

  return (data || []).map(d => ({
    id: d.id,
    name: d.name,
    clinicName: d.clinic_name,
    type: d.type,
    phone: d.phone,
    notes: d.notes,
    isVerified: d.is_verified || false,
  }));
};

export const saveDentist = async (userId: string, dentist: Omit<Dentist, 'id' | 'isVerified'>) => {
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };

  const { data, error } = await supabase
    .from('dentists')
    .insert({
      user_id: userId,
      name: dentist.name,
      clinic_name: dentist.clinicName,
      type: dentist.type,
      phone: dentist.phone,
      notes: dentist.notes,
      is_verified: false,
    })
    .select()
    .single();

  return { data, error };
};

export const deleteDentist = async (userId: string, dentistId: string) => {
  if (!supabase) return { error: new Error('Supabase not configured') };

  const { error } = await supabase
    .from('dentists')
    .delete()
    .eq('id', dentistId)
    .eq('user_id', userId);

  return { error };
};

// ============================================
// TEETH STATUS CRUD
// ============================================

export const fetchTeethStatus = async (userId: string): Promise<Record<number, ToothStatus>> => {
  if (!supabase) return {};

  const { data, error } = await supabase
    .from('teeth_status')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching teeth status:', error);
    return {};
  }

  const statusMap: Record<number, ToothStatus> = {};
  (data || []).forEach(t => {
    statusMap[t.tooth_id] = t.status as ToothStatus;
  });

  return statusMap;
};

export const saveToothStatus = async (userId: string, toothId: number, status: ToothStatus) => {
  if (!supabase) return { error: new Error('Supabase not configured') };

  const { error } = await supabase
    .from('teeth_status')
    .upsert({
      user_id: userId,
      tooth_id: toothId,
      status: status,
    }, {
      onConflict: 'user_id,tooth_id',
    });

  return { error };
};

// ============================================
// LOCAL STORAGE FALLBACK (for offline/guest mode)
// ============================================

const STORAGE_KEYS = {
  TREATMENTS: 'denttrack_treatments',
  DENTISTS: 'denttrack_dentists',
  TEETH_STATUS: 'denttrack_teeth_status',
};

export const localStore = {
  getTreatments: (): Treatment[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TREATMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setTreatments: (treatments: Treatment[]) => {
    localStorage.setItem(STORAGE_KEYS.TREATMENTS, JSON.stringify(treatments));
  },

  getDentists: (): Dentist[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DENTISTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setDentists: (dentists: Dentist[]) => {
    localStorage.setItem(STORAGE_KEYS.DENTISTS, JSON.stringify(dentists));
  },

  getTeethStatus: (): Record<number, ToothStatus> => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEETH_STATUS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  setTeethStatus: (status: Record<number, ToothStatus>) => {
    localStorage.setItem(STORAGE_KEYS.TEETH_STATUS, JSON.stringify(status));
  },

  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.TREATMENTS);
    localStorage.removeItem(STORAGE_KEYS.DENTISTS);
    localStorage.removeItem(STORAGE_KEYS.TEETH_STATUS);
  },
};
