import React, { useState } from 'react';
import { Treatment, TreatmentType, Tooth } from '../types';
import { X, Upload, Plus } from 'lucide-react';

interface TreatmentFormProps {
  selectedTooth: Tooth | null;
  onSave: (treatment: Omit<Treatment, 'id'>) => void;
  onCancel: () => void;
}

export const TreatmentForm: React.FC<TreatmentFormProps> = ({ selectedTooth, onSave, onCancel }) => {
  const [type, setType] = useState<TreatmentType>(TreatmentType.FILLING);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [warranty, setWarranty] = useState<string>('');
  
  // Simplified file handling for MVP (visual only mostly)
  const [files, setFiles] = useState<File[]>([]);

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
    const attachments = files.map(f => ({
      id: Math.random().toString(36),
      name: f.name,
      url: URL.createObjectURL(f) // This works for the session duration
    }));

    onSave({
      toothId: selectedTooth ? selectedTooth.id : null,
      type,
      date,
      notes,
      cost: cost ? parseFloat(cost) : undefined,
      currency,
      warrantyUntil: warranty || undefined,
      attachments
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">
          Add Procedure {selectedTooth ? `(Tooth ${selectedTooth.label})` : '(General)'}
        </h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value as TreatmentType)}
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none"
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
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none"
                    required
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none"
                placeholder="Doctor's comments, diagnosis..."
            />
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Cost</label>
                <input 
                    type="number" 
                    value={cost} 
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none"
                    placeholder="0.00"
                />
            </div>
             <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                 <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none"
                >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="UAH">UAH</option>
                </select>
            </div>
            <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Warranty</label>
                 <input 
                    type="date" 
                    value={warranty} 
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-dental-500 outline-none"
                />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Photos (Max 3)</label>
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
                        {files.length > 0 ? `${files.length} files selected` : 'Click to upload'}
                    </span>
                </label>
            </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
             <button 
                type="submit" 
                className="flex-1 bg-dental-600 text-white py-2 px-4 rounded-md hover:bg-dental-500 transition-colors font-medium flex items-center justify-center gap-2"
            >
                <Plus size={18} />
                Save Record
            </button>
        </div>

      </form>
    </div>
  );
};