import React, { useState } from 'react';
import { Observation, ObservationStatus } from '../types';
import { StickyNote, Plus, Trash2, Save, Edit2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ObservationsLogProps {
  observations: Observation[];
  onAddObservation: (obs: Observation) => void;
  onEditObservation: (obs: Observation) => void;
  onDeleteObservation: (id: string) => void;
}

const ObservationsLog: React.FC<ObservationsLogProps> = ({ observations, onAddObservation, onEditObservation, onDeleteObservation }) => {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<ObservationStatus>(ObservationStatus.NEW);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingId) {
      // Find original to preserve timestamp
      const original = observations.find(o => o.id === editingId);
      onEditObservation({
        id: editingId,
        timestamp: original?.timestamp || new Date().toISOString(),
        content: content.trim(),
        status
      });
      setEditingId(null);
    } else {
      onAddObservation({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        content: content.trim(),
        status
      });
    }
    
    // Reset Form
    setContent('');
    setStatus(ObservationStatus.NEW);
  };

  const handleEditClick = (obs: Observation) => {
    setEditingId(obs.id);
    setContent(obs.content);
    setStatus(obs.status);
    // Smooth scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setContent('');
    setStatus(ObservationStatus.NEW);
  };

  const getStatusColor = (s: ObservationStatus) => {
    switch (s) {
      case ObservationStatus.NEW: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ObservationStatus.REVIEWING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ObservationStatus.RESOLVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case ObservationStatus.ARCHIVED: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900">General Observations</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Log your thoughts, feedback, or general notes about the tool or your workflow here.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="md:col-span-1">
          <div className={`bg-white p-6 rounded-xl border shadow-sm sticky top-6 transition-colors duration-300 ${editingId ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200'}`}>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                {editingId ? <Edit2 size={18} className="text-indigo-600"/> : <Plus size={18} className="text-indigo-600"/>}
                {editingId ? 'Edit Note' : 'New Note'}
              </span>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  <X size={12}/> Cancel
                </button>
              )}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ObservationStatus)}
                  className="w-full p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                >
                  {Object.values(ObservationStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your observation here..."
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-48 resize-none bg-white text-slate-900"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-medium transition-colors ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? 'Update Note' : 'Add Note'}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="md:col-span-2 space-y-4">
          {observations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
              <StickyNote size={32} className="text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No observations logged yet.</p>
            </div>
          ) : (
            observations.slice().reverse().map((obs) => (
              <div key={obs.id} className={`bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-all group ${editingId === obs.id ? 'border-indigo-400 ring-1 ring-indigo-100' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStatusColor(obs.status)}`}>
                    {obs.status}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditClick(obs)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDeleteObservation(obs.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{obs.content}</p>
                
                <div className="mt-3 pt-3 border-t border-slate-100 text-right">
                   <span className="text-xs font-mono text-slate-400">
                    {new Date(obs.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ObservationsLog;