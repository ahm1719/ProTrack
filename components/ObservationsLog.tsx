import React, { useState } from 'react';
import { Observation } from '../types';
import { StickyNote, Plus, Trash2, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ObservationsLogProps {
  observations: Observation[];
  onAddObservation: (obs: Observation) => void;
  onDeleteObservation: (id: string) => void;
}

const ObservationsLog: React.FC<ObservationsLogProps> = ({ observations, onAddObservation, onDeleteObservation }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddObservation({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      content: content.trim()
    });
    setContent('');
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
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-600"/>
              New Note
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your observation here..."
                className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-48 resize-none bg-white text-slate-900"
                required
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                <Save size={18} />
                Save Note
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
              <div key={obs.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-400">
                    {new Date(obs.timestamp).toLocaleString()}
                  </span>
                  <button 
                    onClick={() => onDeleteObservation(obs.id)}
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{obs.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ObservationsLog;