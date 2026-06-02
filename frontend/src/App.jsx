import { useState } from "react";
import { BriefcaseBusiness, FileText, Sparkles, Target } from "lucide-react";
import MatchForm from "./components/MatchForm.jsx";
import ResultPanel from "./components/ResultPanel.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/analyze-match";

export default function App() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("Ready to analyze your resume.");
  const [loading, setLoading] = useState(false);

  async function handleAnalyze(formData) {
    setLoading(true);
    setStatus("Analyzing resume and job description...");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResult(data);
      setStatus("Analysis complete.");
    } catch (error) {
      setStatus("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <nav className="nav">
        <div className="brand">
          <span className="brand-icon">H</span>
          <span>HireLens AI</span>
        </div>
        <span className="nav-pill">Resume Match Analyzer</span>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">AI resume assistant</p>
          <h1>Match your CV to any job description.</h1>
          <p className="hero-text">
            Paste your resume and a job post. HireLens analyzes the match, finds missing skills,
            suggests improvements, and generates interview preparation questions.
          </p>

          <div className="feature-row">
            <div><FileText /><span>CV analysis</span></div>
            <div><Target /><span>Match score</span></div>
            <div><BriefcaseBusiness /><span>Job alignment</span></div>
            <div><Sparkles /><span>AI suggestions</span></div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-step"><strong>01</strong><span>Paste resume</span></div>
          <div className="hero-step active"><strong>02</strong><span>Paste job description</span></div>
          <div className="hero-step"><strong>03</strong><span>Get match report</span></div>
        </div>
      </section>

      <MatchForm onAnalyze={handleAnalyze} loading={loading} />
      <p className={status.startsWith("Error") ? "status error" : "status"}>{status}</p>
      {result && <ResultPanel result={result} />}

      <footer className="footer">
        Built by Demetra Avramopoulou · React · Flask · LLM APIs
      </footer>
    </main>
  );
}
