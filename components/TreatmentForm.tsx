import React, { useState, useEffect } from 'react';
import { Treatment, TreatmentType, Tooth, Dentist } from '../types';
import { X, Upload, Plus, UserPlus, Save } from 'lucide-react';

// All FDI tooth numbers
const ALL_TEETH = [
  // Upper Right (18-11)
  18, 17, 16, 15, 14, 13, 12, 11,
  // Upper Left (21-28)
  21, 22, 23, 24, 25, 26, 27, 28,
  // Lower Left (31-38)
  31, 32, 33, 34, 35, 36, 37, 38,
  // Lower Right (41-48)
  41, 42, 43, 44, 45, 46, 47, 48,
];

interface TreatmentFormProps {
  selectedTooth: Tooth | null;
  onSave: (treatment: Omit<Treatment, 'id'>, existingId?: string) => void;
  onCancel: () => void;
  dentists?: Dentist[];
  onAddDentist?: () => void;
  editingTreatment?: Treatment | null;
}

export const TreatmentForm: React.FC<TreatmentFormProps> = ({
  selectedTooth,
  onSave,
  onCancel,
  dentists = [],
  onAddDentist,
  editingTreatment,
}) => {
  const [type, setType] = useState<TreatmentType>(TreatmentType.FILLING);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [dentistId, setDentistId] = useState<string>('');
  const [toothId, setToothId] = useState<string>('');

  // Simplified file handling for MVP (visual only mostly)
  const [files, setFiles] = useState<File[]>([]);

  // Initialize form with editing data or selected tooth
  useEffect(() => {
    if (editingTreatment) {
      setType(editingTreatment.type);
      setDate(editingTreatment.date.split('T')[0]);
      setNotes(editingTreatment.notes);
      setCost(editingTreatment.cost?.toString() || '');
      setCurrency(editingTreatment.currency);
      setDentistId(editingTreatment.dentistId || '');
      setToothId(editingTreatment.toothId?.toString() || '');
    } else if (selectedTooth) {
      setToothId(selectedTooth.id.toString());
    }
  }, [editingTreatment, selectedTooth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 3); // Max 3
      setFiles(newFiles);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, upload files to storage and get URLs.
    // Here we make fake attachments
    const newAttachments = files.map(f => ({
      id: Math.random().toString(36),
      name: f.name,
      url: URL.createObjectURL(f)
    }));

    // Keep existing attachments when editing
    const attachments = editingTreatment
      ? [...editingTreatment.attachments, ...newAttachments]
      : newAttachments;

    onSave({
      toothId: toothId ? parseInt(toothId) : null,
      type,
      date,
      notes,
      cost: cost ? parseFloat(cost) : undefined,
      currency,
      attachments,
      dentistId: dentistId || undefined,
    }, editingTreatment?.id);
  };

  const isEditing = !!editingTreatment;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          {isEditing ? 'Edit Procedure' : 'Add Procedure'}
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Tooth Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tooth Number</label>
          <select
            value={toothId}
            onChange={(e) => setToothId(e.target.value)}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none text-base md:text-sm"
          >
            <option value="">General (no specific tooth)</option>
            <optgroup label="Upper Right (18-11)">
              {[18, 17, 16, 15, 14, 13, 12, 11].map(n => (
                <option key={n} value={n}>Tooth {n}</option>
              ))}
            </optgroup>
            <optgroup label="Upper Left (21-28)">
              {[21, 22, 23, 24, 25, 26, 27, 28].map(n => (
                <option key={n} value={n}>Tooth {n}</option>
              ))}
            </optgroup>
            <optgroup label="Lower Left (31-38)">
              {[31, 32, 33, 34, 35, 36, 37, 38].map(n => (
                <option key={n} value={n}>Tooth {n}</option>
              ))}
            </optgroup>
            <optgroup label="Lower Right (41-48)">
              {[41, 42, 43, 44, 45, 46, 47, 48].map(n => (
                <option key={n} value={n}>Tooth {n}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TreatmentType)}
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none text-base md:text-sm"
                >
                    {Object.values(TreatmentType).map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none text-base md:text-sm"
                    required
                />
            </div>
        </div>

        {/* Dentist Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dentist</label>
          <div className="flex gap-2">
            <select
              value={dentistId}
              onChange={(e) => setDentistId(e.target.value)}
              className="flex-1 border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none text-base md:text-sm"
            >
              <option value="">Select dentist (optional)</option>
              {dentists.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}{d.clinicName ? ` - ${d.clinicName}` : ''}
                </option>
              ))}
            </select>
            {onAddDentist && (
              <button
                type="button"
                onClick={onAddDentist}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors flex items-center gap-1"
                title="Add new dentist"
              >
                <UserPlus size={18} />
              </button>
            )}
          </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none text-base md:text-sm"
                placeholder="Doctor's comments, diagnosis..."
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
                <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none text-base md:text-sm"
                    placeholder="0.00"
                />
            </div>
             <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                 <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none text-base md:text-sm"
                >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="UAH">UAH</option>
                </select>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Photos (Max 3)</label>
            {/* Show existing attachments when editing */}
            {isEditing && editingTreatment.attachments.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {editingTreatment.attachments.map((att) => (
                  <div key={att.id} className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600">
                    {att.name}
                  </div>
                ))}
              </div>
            )}
            <div className="border-2 border-dashed border-slate-300 rounded-md p-4 text-center hover:bg-slate-50 transition-colors">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="text-slate-400 mb-2" size={24} />
                    <span className="text-sm text-slate-500">
                        {files.length > 0 ? `${files.length} new files selected` : 'Click to upload'}
                    </span>
                </label>
            </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
             <button
                type="submit"
                className="flex-1 bg-dental-600 text-white py-2 px-4 rounded-md hover:bg-dental-500 transition-colors font-medium flex items-center justify-center gap-2 text-base md:text-sm"
            >
                {isEditing ? <Save size={18} /> : <Plus size={18} />}
                {isEditing ? 'Update Record' : 'Save Record'}
            </button>
        </div>

      </form>
    </div>
  );
};
