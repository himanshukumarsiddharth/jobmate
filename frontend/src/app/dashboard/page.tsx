"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, ChevronRight, Sparkles, AlertCircle, Target } from "lucide-react";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith(".pdf")) {
        alert("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/resume/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
          },
          body: formData
        });

        if (!response.ok) throw new Error("Upload failed.");
        const data = await response.json();
        setResumeData(data);
      } catch (err: any) {
        alert(err.message);
        setFile(null);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRunMatch = async () => {
    if (!resumeData || !jobDesc) {
      alert("Please upload a resume and paste a job description first.");
      return;
    }
    setMatching(true);

    try {
      const token = localStorage.getItem("access_token");

      // Ephemeral Match - doesn't hit DB
      const matchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/match/ephemeral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          resume_skills: resumeData.parsed_data.skills || [],
          job_description: jobDesc
        })
      });

      if (!matchRes.ok) throw new Error("Match failed to run.");

      const matchResult = await matchRes.json();
      setMatchData(matchResult);

    } catch (e: any) {
      alert(e.message);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header>
        <h1 className="text-3xl font-outfit font-bold tracking-tight text-white mb-2">
          Your ATS Workspace
        </h1>
        <p className="text-slate-400">Match your resume to a job description to discover what skills you are missing.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Upload Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-700/50 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-neon-blue/10 flex items-center justify-center mb-6">
            <UploadCloud className="h-8 w-8 text-neon-blue" />
          </div>
          <h2 className="text-xl font-bold mb-2">Upload Resume</h2>
          <p className="text-slate-400 text-sm mb-6">Drop your PDF resume here to extract skills.</p>

          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 font-medium text-white hover:bg-slate-700 hover:border-slate-600 transition-all focus:outline-none flex items-center disabled:opacity-50 w-full justify-center"
          >
            {uploading ? "Analyzing NLP Data..." : (resumeData ? `Uploaded: ${file?.name}` : "Select PDF File")}
          </button>

          {resumeData && (
            <div className="mt-6 w-full text-left bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <h3 className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Extracted Core Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.parsed_data?.skills?.map((skill: string) => (
                  <span key={skill} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-medium text-neon-blue capitalize">
                    {skill}
                  </span>
                ))}
                {resumeData.parsed_data?.skills?.length === 0 && <span className="text-slate-500 text-sm">No standard keywords identified.</span>}
              </div>
            </div>
          )}
        </div>

        {/* Job Target / Match Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-700/50 relative overflow-hidden flex flex-col">
          {/* <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
            <Target className="w-32 h-32" />
          </div> */}
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="w-2 h-6 bg-neon-purple rounded mr-3"></span>
            Target Job Description
          </h2>

          <div className="space-y-4 relative z-10 w-full mb-6 flex-1">
            <input
              type="text"
              placeholder="Job Title (e.g. Senior Architecture)"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-sm"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <textarea
              placeholder="Paste the full job description here..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-neon-purple/50 text-sm resize-none"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            ></textarea>
          </div>

          <button
            onClick={handleRunMatch}
            disabled={!resumeData || !jobDesc || matching}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-purple to-purple-600 font-semibold text-white shadow-lg hover:shadow-neon-purple/50 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            {matching ? "Analyzing Fit..." : "Calculate ATS Match Score"}
          </button>
        </div>
      </div>

      {/* Match Results Pane */}
      {matchData && (
        <div className="glass-panel p-8 rounded-3xl border border-neon-blue/30 relative overflow-hidden animate-fade-in-up mt-8">
          {/* <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
            <Sparkles className="w-48 h-48" />
          </div> */}
          <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
            Match Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="col-span-1 flex flex-col items-center justify-center p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
              <div className="text-5xl font-outfit font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-2">
                {matchData.score}%
              </div>
              <p className="text-slate-400 text-sm text-center">Estimated ATS Score</p>
            </div>

            <div className="col-span-2 p-6 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
              <h3 className="text-md font-semibold text-slate-200 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-500 mr-2" /> Missing Keywords
              </h3>
              <p className="text-sm text-slate-400 mb-4">Add these keywords from the job description to your resume to increase your chance of passing the ATS scan:</p>
              <div className="flex flex-wrap gap-2">
                {matchData.missing_keywords && matchData.missing_keywords.length > 0 ? (
                  matchData.missing_keywords.map((kw: string) => (
                    <span key={kw} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-medium text-amber-400">
                      + {kw}
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-400 text-sm font-medium">No critical missing keywords discovered!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
