import React, { useState } from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';
import { SafetyReport } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose }) => {
  const { currentPartner, reportPartner } = useSocialDiscovery();
  const [category, setCategory] = useState<SafetyReport['category']>('inappropriate');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !currentPartner) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportPartner(category, notes);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="relative w-full max-w-md p-5 sm:p-7 rounded-3xl glass-surface border border-white/80 dark:border-white/20 shadow-2xl bg-white/95 dark:bg-[#15152B]/95 text-[#1B1B3A] dark:text-white max-h-[90vh] overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill"
          aria-label="Close report dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-full bg-rose-500/20 text-rose-600">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                Trust & Safety
              </span>
            </div>

            <h3 id="report-modal-title" className="font-serif text-2xl font-medium mb-1">
              Report {currentPartner.pseudonym}
            </h3>
            <p className="text-xs text-[#4B4A68] dark:text-slate-300 mb-5">
              Reports are audited by the moderation console. Submitting immediately blocks this user and disconnects the session.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4B4A68] dark:text-slate-400 mb-2">
                Violation Category
              </label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'inappropriate' as const, label: 'Inappropriate or explicit media' },
                  { id: 'harassment' as const, label: 'Harassment, hate speech, or threats' },
                  { id: 'spam' as const, label: 'Commercial spam or unsolicited promotion' },
                  { id: 'underage' as const, label: 'Suspected underage participant (<18)' },
                  { id: 'other' as const, label: 'Other violation of community guidelines' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                      category === item.id
                        ? 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-800/40 text-[#1B1B3A] dark:text-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-category"
                      checked={category === item.id}
                      onChange={() => setCategory(item.id)}
                      className="text-rose-600"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4B4A68] dark:text-slate-400 mb-2">
                Additional Details (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what occurred during the session..."
                rows={3}
                className="w-full p-3 rounded-xl glass-surface text-xs text-[#1B1B3A] dark:text-white placeholder:text-[#4B4A68]/60 focus:outline-none focus:ring-2 focus:ring-rose-500"
                maxLength={500}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full text-xs font-semibold glass-pill"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-md"
              >
                Submit & Block
              </button>
            </div>
          </form>
        ) : (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Check className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-xl font-medium mb-1">
              Report Filed Successfully
            </h4>
            <p className="text-xs text-[#4B4A68] dark:text-slate-300 max-w-xs">
              Thank you for keeping Collide safe. This participant has been blocked from future matching.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
