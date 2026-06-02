function ScoreCircle({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className="score-circle">
      <span>{safeScore}</span>
      <small>/100</small>
    </div>
  );
}

function ListCard({ title, items }) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="result-card-small">
      <h3>{title}</h3>
      {safeItems.length > 0 ? (
        <ul>
          {safeItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="empty-result">No items returned for this section.</p>
      )}
    </div>
  );
}

export default function ResultPanel({ result }) {
  if (!result || typeof result !== "object") {
    return (
      <section className="result-section">
        <div className="rewrite-card">
          <h3>Unable to display report</h3>
          <p>The analysis response was empty or invalid. Please try again.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="result-section">
      <div className="result-hero">
        <div>
          <p className="section-kicker">AI Match Report</p>
          <h2>{result.roleFit || "Resume match analysis"}</h2>
          <p>{result.summary || "No summary was returned for this analysis."}</p>
        </div>
        <ScoreCircle score={result.matchScore} />
      </div>

      <div className="result-grid">
        <ListCard title="Strong Matches" items={result.strongMatches} />
        <ListCard title="Missing / Weak Areas" items={result.missingSkills} />
        <ListCard title="CV Improvements" items={result.cvImprovements} />
        <ListCard title="Recommended Projects" items={result.recommendedProjects} />
        <ListCard title="Keywords To Add" items={result.keywordsToAdd} />
        <ListCard title="Interview Questions" items={result.interviewQuestions} />
      </div>

      <div className="rewrite-card">
        <h3>Suggested CV Summary</h3>
        <p>{result.suggestedSummary || "No suggested summary was returned."}</p>
      </div>
    </section>
  );
}
