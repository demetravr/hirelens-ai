import { useState } from "react";

const sampleResume = `Computer Science graduate with strong foundations in software development, full-stack web applications, APIs, and databases. Built AI projects using JavaScript, React, Flask, Python, REST APIs, OpenAI API, and Anthropic API.

Skills: Python, JavaScript, React, Flask, SQL, REST APIs, HTML, CSS, Git, OpenAI API, Anthropic API, Prompt Engineering, JSON, MySQL.

Projects:
- HireLens AI: Resume and job description analysis tool using React, Flask, OpenAI API, and Anthropic API.
- Weather Dashboard: Full-stack web app using JavaScript, PHP, MySQL, and external APIs.
- Accommodation Management System: Database project using Microsoft SQL Server.

Experience:
IT Intern at Central Bank of Cyprus. Worked with SQL queries, enterprise reporting systems, and BI Publisher migration.`;

const sampleJob = `We are looking for a Junior AI Engineer / AI Application Developer to build AI-powered internal tools and workflow automation systems. The candidate should have knowledge of Python, JavaScript, APIs, frontend/backend development, databases, and LLM integrations. Experience with React, Flask or FastAPI, prompt engineering, structured outputs, RAG concepts, and Git is a plus. The role involves building prototypes, integrating AI APIs, improving business workflows, and collaborating with product and operations teams.`;

export default function MatchForm({ onAnalyze, loading }) {
  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Junior AI Engineer");

  function useExample() {
    setResume(sampleResume);
    setJobDescription(sampleJob);
    setTargetRole("Junior AI Engineer");
  }

  function clearInputs() {
    setResume("");
    setJobDescription("");
    setTargetRole("Junior AI Engineer");
  }

  function handleSubmit(event) {
    event.preventDefault();
    onAnalyze({ resume, jobDescription, targetRole });
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <p className="section-kicker">Input</p>
          <h2>Analyze your fit</h2>
        </div>

        <div className="button-row">
          <button className="secondary-btn" type="button" onClick={useExample}>Use example</button>
          <button className="secondary-btn" type="button" onClick={clearInputs}>Clear</button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Target role
          <input
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            placeholder="Example: Junior AI Engineer"
            required
          />
        </label>

        <div className="text-grid">
          <label>
            Resume / CV text
            <textarea
              value={resume}
              onChange={(event) => setResume(event.target.value)}
              placeholder="Paste your CV text here..."
              required
            />
          </label>

          <label>
            Job description
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description here..."
              required
            />
          </label>
        </div>

        <button className="primary-btn" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Match"}
        </button>
      </form>
    </section>
  );
}
