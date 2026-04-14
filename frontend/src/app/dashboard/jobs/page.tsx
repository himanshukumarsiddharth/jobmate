"use client";

import { useEffect, useState } from "react";
import { Briefcase, Plus, Loader2, Edit3, Check, Trash2 } from "lucide-react";

type Job = {
  id: number;
  company_name: string;
  role: string;
  comments: string;
  status: string;
  created_at: string;
};

const STATUS_STAGES = ["applied", "interview scheduled", "rejected", "selected"];

export default function JobsBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newJob, setNewJob] = useState({ company_name: "", role: "", comments: "" });
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/jobs/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.company_name || !newJob.role) return alert("Company and Role required");

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/jobs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...newJob, status: "applied" })
      });
      if (res.ok) {
        setAdding(false);
        setNewJob({ company_name: "", role: "", comments: "" });
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const saveComment = async (id: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ comments: editingCommentText })
      });
      if (res.ok) {
        setEditingCommentId(null);
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteJob = async (id: number) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/jobs/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchJobs();
      setJobToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading Job Board...</div>;

  return (
    <div className="animate-fade-in-up w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center mr-4 shrink-0">
            <Briefcase className="w-6 h-6 text-neon-purple" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-pink-400">Job Tracker</h1>
            <p className="text-slate-400 mt-1">Manage your active applications across companies</p>
          </div>
        </div>

        <button
          onClick={() => setAdding(!adding)}
          className="px-4 py-2 bg-neon-purple hover:bg-purple-600 text-white rounded-lg font-medium flex items-center transition-colors shrink-0 line-clamp-1"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Application
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAddJob} className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/50 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text" placeholder="Company Name" required
            value={newJob.company_name} onChange={e => setNewJob({ ...newJob, company_name: e.target.value })}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />
          <input
            type="text" placeholder="Role (e.g. Frontend Dev)" required
            value={newJob.role} onChange={e => setNewJob({ ...newJob, role: e.target.value })}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />
          <input
            type="text" placeholder="Comments (optional)"
            value={newJob.comments} onChange={e => setNewJob({ ...newJob, comments: e.target.value })}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />
          <button type="submit" className="bg-neon-blue hover:bg-blue-600 text-white rounded-lg font-medium">
            Save Job
          </button>
        </form>
      )}

      {/* Kanban Board - Stretching full width & min height */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {STATUS_STAGES.map(stage => (
          <div key={stage} className="flex flex-col bg-slate-800/20 rounded-2xl p-4 border border-slate-700/50 h-[calc(100vh-250px)]">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4 flex justify-between items-center px-2 border-b border-slate-700/50 pb-3 shrink-0">
              {stage}
              <span className="bg-slate-700 text-xs px-2 py-0.5 rounded-full text-slate-300">
                {jobs.filter(j => j.status === stage).length}
              </span>
            </h3>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {jobs.filter(j => j.status === stage).map(job => (
                <div key={job.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-neon-purple/50 transition-colors shadow-lg group/card relative">
                  <button onClick={() => setJobToDelete(job)} className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity text-slate-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <h4 className="font-bold text-white text-lg leading-tight pr-8">{job.company_name}</h4>
                  <p className="text-neon-blue text-sm font-medium mb-3">{job.role}</p>

                  {/* Editable Comments Section */}
                  <div className="mb-4 bg-slate-900/50 rounded-lg relative group overflow-hidden">
                    {editingCommentId === job.id ? (
                      <div className="p-2">
                        <textarea
                          className="w-full bg-slate-900 text-xs text-white border border-slate-700 p-2 rounded resize-none outline-none focus:border-neon-purple"
                          rows={3}
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                        />
                        <div className="flex justify-end mt-2 space-x-2">
                          <button onClick={() => setEditingCommentId(null)} className="text-xs text-slate-400 hover:text-white px-2 py-1">Cancel</button>
                          <button onClick={() => saveComment(job.id)} className="text-xs text-white bg-neon-purple hover:bg-purple-600 rounded px-3 py-1 flex items-center">
                            <Check className="w-3 h-3 mr-1" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3">
                        <p className="text-xs text-slate-400 whitespace-pre-wrap">{job.comments || "No comments yet..."}</p>
                        <button
                          onClick={() => { setEditingCommentId(job.id); setEditingCommentText(job.comments || ""); }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300"
                          title="Edit Comment"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status and Date Footer */}
                  <div className="flex flex-col gap-3 mt-auto border-t border-slate-700/50 pt-3">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                      <select
                        className="bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:border-neon-purple w-[140px]"
                        value={job.status}
                        onChange={(e) => updateStatus(job.id, e.target.value)}
                      >
                        {STATUS_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="flex justify-between items-center w-full mt-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In stage since</span>
                      <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px] animate-fade-in">
          <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">Delete Application?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to permanently delete your tracked application to <strong className="text-white">{jobToDelete.company_name}</strong> for the <strong className="text-white">{jobToDelete.role}</strong> role? This cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setJobToDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteJob(jobToDelete.id)}
                className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors text-sm font-medium flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
