import React, { useState, useEffect } from 'react';
import { Task, DailyLog, Status } from '../types';
import { Calendar as CalendarIcon, Save, Plus, Clock, Calendar } from 'lucide-react';

interface DailyJournalProps {
  tasks: Task[];
  logs: DailyLog[];
  onAddLog: (log: Omit<DailyLog, 'id'>) => void;
  onUpdateTask: (taskId: string, updates: { status?: Status; dueDate?: string }) => void;
  initialTaskId?: string;
}

const DailyJournal: React.FC<DailyJournalProps> = ({ tasks, logs, onAddLog, onUpdateTask, initialTaskId }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // State for new entry form
  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTaskId || '');
  const [content, setContent] = useState('');

  // Sync state if prop changes (e.g. navigation from dashboard)
  useEffect(() => {
    if (initialTaskId) {
      setSelectedTaskId(initialTaskId);
    }
  }, [initialTaskId]);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !content.trim()) return;

    onAddLog({
      date: selectedDate,
      taskId: selectedTaskId,
      content: content.trim()
    });
    
    // Reset form but keep date
    setContent('');
    setSelectedTaskId('');
  };

  // Filter logs for selected date
  const daysLogs = logs.filter(l => l.date === selectedDate);
  // Sort incomplete tasks to top for selection
  const sortedTasks = [...tasks].sort((a, b) => a.status === Status.DONE ? 1 : -1);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Plus size={24} className="text-indigo-600"/>
          Daily Journal
        </h2>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm w-full">
          <CalendarIcon size={18} className="text-slate-400" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-sm text-slate-700 outline-none font-medium w-full"
          />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleAddEntry} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Task Reference</label>
            <select 
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
              required
            >
              <option value="">Select a task...</option>
              {sortedTasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.displayId} - {t.description.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          {/* Quick Edit Controls for Selected Task */}
          {selectedTask && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 animate-fade-in">
               <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase mb-1">
                    <Clock size={10} /> Status
                  </label>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => onUpdateTask(selectedTask.id, { status: e.target.value as Status })}
                    className="w-full p-1.5 text-xs border border-indigo-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none bg-white text-slate-800"
                  >
                     {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>
               <div>
                  <label className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 uppercase mb-1">
                    <Calendar size={10} /> Due Date
                  </label>
                  <input 
                    type="date"
                    value={selectedTask.dueDate}
                    onChange={(e) => onUpdateTask(selectedTask.id, { dueDate: e.target.value })}
                    className="w-full p-1.5 text-xs border border-indigo-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none bg-white text-slate-800"
                  />
               </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Activity / Progress</label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you work on?"
              className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none bg-slate-50"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Save size={18} />
            Log Activity
          </button>
        </form>
      </div>

      {/* Timeline Display */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-[300px]">
        <h3 className="font-semibold text-slate-800 pl-1 mb-3 text-sm uppercase tracking-wide">
          Timeline: {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
        </h3>
        
        {daysLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center p-4">
            <p className="text-slate-400 text-sm">No logs yet.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6 py-2">
            {daysLogs.slice().reverse().map((log) => {
              const task = tasks.find(t => t.id === log.taskId);
              return (
                <div key={log.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-white border-2 border-indigo-300"></div>
                  
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                         {task?.displayId || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">{log.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyJournal;