import React, { useState } from 'react';
import { Dentist, DentistType } from '../types';
import { X, UserPlus } from 'lucide-react';

interface DentistFormProps {
  onSave: (dentist: Omit<Dentist, 'id' | 'isVerified'>) => void;
  onCancel: () => void;
}

export const DentistForm: React.FC<DentistFormProps> = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [type, setType] = useState<DentistType | ''>('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      clinicName: clinicName.trim() || undefined,
      type: type || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Dentist Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-dental-500 outline-none text-base"
          placeholder="Dr. John Smith"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Clinic Name</label>
        <input
          type="text"
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-dental-500 outline-none text-base"
          placeholder="Smile Dental Clinic"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as DentistType)}
          className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-dental-500 outline-none text-base bg-white"
        >
          <option value="">Select specialty (optional)</option>
          {Object.values(DentistType).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-dental-500 outline-none text-base"
          placeholder="+1 234 567 8900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-dental-500 outline-none text-base resize-none"
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-medium hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 bg-dental-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-dental-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <UserPlus size={18} />
          Save Dentist
        </button>
      </div>
    </form>
  );
};
