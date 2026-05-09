"use client";
import { useState } from "react";

interface TutorResponse {
  explanation: string;
  codeExample?: string;
  commonMistakes: string[];
  nextTopicsToLearn: string[];
  encouragement: string;
  difficulty: string;
  concepts: string[];
}

const LANGUAGES = ["JavaScript", "Python", "TypeScript", "HTML/CSS", "React", "SQL", "Java", "C++"];
const LEVELS = ["beginner", "intermediate", "advanced"];

export default function AICodeTutor() {
  const [question, setQuestion] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [level, setLevel] = useState("beginner");
  const [response, setResponse] = useState<TutorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, code, language, level }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResponse(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const difficultyColors: Record<string, string> = { beginner: "bg-green-100 text-green-800", intermediate: "bg-yellow-100 text-yellow-800", advanced: "bg-red-100 text-red-800" };

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-violet-900 mb-3">AI Coding Tutor</h1>
          <p className="text-violet-600 text-lg">Your patient, personalized bootcamp coding assistant</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400">
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400">
                {LEVELS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Question *</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g., What is a closure? Why does my loop not work? How do I fetch data from an API?" rows={3} required className="w-full border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Code (optional)</label>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your code here if you have a specific problem..." rows={6} className="w-full font-mono text-sm border border-gray-300 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50" />
          </div>
          <button type="submit" disabled={loading || !question.trim()} className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
            {loading ? "Tutor is thinking..." : "Ask Your Tutor"}
          </button>
        </form>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">{error}</div>}
        {response && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-violet-900">Explanation</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[response.difficulty] || "bg-gray-100"}`}>{response.difficulty}</span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">{response.explanation}</p>
              {response.concepts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {response.concepts.map((c, i) => <span key={i} className="bg-violet-100 text-violet-800 px-2 py-1 rounded-full text-xs">{c}</span>)}
                </div>
              )}
            </div>
            {response.codeExample && (
              <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-3">Code Example</div>
                <pre className="text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">{response.codeExample}</pre>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {response.commonMistakes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-red-800 mb-3">Common Mistakes to Avoid</h3>
                  {response.commonMistakes.map((m, i) => <div key={i} className="text-sm text-gray-700 mb-2">&#9888; {m}</div>)}
                </div>
              )}
              {response.nextTopicsToLearn.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-violet-800 mb-3">What to Learn Next</h3>
                  {response.nextTopicsToLearn.map((t, i) => <div key={i} className="text-sm text-gray-700 mb-2">&#128218; {t}</div>)}
                </div>
              )}
            </div>
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="text-sm font-semibold opacity-80 mb-1">From your tutor</div>
              <p className="text-lg">{response.encouragement}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
