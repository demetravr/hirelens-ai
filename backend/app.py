import json
import os
import re

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)


RESPONSE_SCHEMA = {
    "matchScore": 78,
    "roleFit": "Strong junior-level fit with some missing advanced skills",
    "summary": "A clear 4-5 sentence explanation of the candidate's fit.",
    "strongMatches": ["Strong match 1", "Strong match 2"],
    "missingSkills": ["Missing or weak skill 1", "Missing or weak skill 2"],
    "cvImprovements": ["Specific CV improvement 1", "Specific CV improvement 2"],
    "recommendedProjects": ["Portfolio project idea 1", "Portfolio project idea 2"],
    "keywordsToAdd": ["keyword 1", "keyword 2"],
    "interviewQuestions": ["Likely interview question 1", "Likely interview question 2"],
    "suggestedSummary": "A rewritten professional summary tailored to the role."
}


def create_prompt(resume: str, job_description: str, target_role: str) -> str:
    return f"""
You are a technical recruiter and career coach.

Analyze how well this resume matches this job description.

Target role:
{target_role}

Resume:
{resume}

Job description:
{job_description}

Return ONLY valid JSON with this exact structure:
{json.dumps(RESPONSE_SCHEMA, indent=2)}

Rules:
- Be honest and realistic.
- Do not exaggerate the candidate's experience.
- Assume the candidate is a graduate or junior unless the resume proves otherwise.
- Focus on practical improvements.
- Match score must be from 0 to 100.
- Keep recommendations specific, useful, and actionable.
"""


def parse_json_response(content: str) -> dict:
    """Parse model output and handle accidental Markdown code fences."""
    if not content:
        raise ValueError("AI provider returned an empty response.")

    cleaned = content.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    return json.loads(cleaned)


def demo_response(target_role: str) -> dict:
    return {
        "matchScore": 76,
        "roleFit": f"Good graduate-level fit for {target_role}",
        "summary": "The resume shows a strong foundation in software development, APIs, databases, and AI-related projects. The candidate appears suitable for junior AI application or full-stack AI roles, especially where practical building and fast learning matter. The biggest gaps are deeper production experience, deployment, RAG implementation, and advanced agent frameworks.",
        "strongMatches": [
            "Python, JavaScript, REST APIs, and database foundations match many junior AI application roles.",
            "AI projects using Flask and LLM APIs show practical AI integration.",
            "Full-stack project work demonstrates frontend/backend communication.",
            "Internship in a regulated financial environment is relevant for fintech companies."
        ],
        "missingSkills": [
            "Limited professional software engineering experience.",
            "No clear production deployment experience yet.",
            "RAG, embeddings, vector databases, and agent frameworks are not strongly demonstrated.",
            "More testing, Docker, and cloud deployment evidence would strengthen the profile."
        ],
        "cvImprovements": [
            "Move AI projects above older academic projects.",
            "Add GitHub and live demo links for each project.",
            "Use project bullets focused on APIs, structured outputs, and AI workflows.",
            "Use graduate-friendly language such as 'built', 'developed', and 'explored'."
        ],
        "recommendedProjects": [
            "RAG document assistant that answers questions from uploaded PDFs.",
            "AI operations assistant that classifies and summarizes support tickets.",
            "AI travel planner with real weather or cost API integration.",
            "Small multi-step workflow with planner, writer, and reviewer components."
        ],
        "keywordsToAdd": [
            "LLM APIs", "Prompt Engineering", "Structured Outputs", "React", "Flask",
            "REST APIs", "Workflow Automation", "RAG Concepts"
        ],
        "interviewQuestions": [
            "How does your frontend communicate with your Flask backend?",
            "How do you keep API keys secure?",
            "How would you improve the reliability of LLM outputs?",
            "What is the difference between calling an LLM API and building a RAG system?",
            "How would you deploy this project online?"
        ],
        "suggestedSummary": "Computer Science graduate with strong foundations in full-stack development, APIs, databases, and AI-powered applications. Built personal projects using Python, JavaScript, React, Flask, REST APIs, and LLM integrations. Interested in practical AI systems, workflow automation, and building user-focused software products."
    }


def call_openai(prompt: str) -> dict:
    from openai import OpenAI

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = client.chat.completions.create(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        messages=[
            {
                "role": "system",
                "content": "You are a technical recruiter and career coach. Return valid JSON only."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.25
    )

    content = response.choices[0].message.content
    return parse_json_response(content)


def call_anthropic(prompt: str) -> dict:
    from anthropic import Anthropic

    client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    response = client.messages.create(
        model=os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-latest"),
        max_tokens=1600,
        temperature=0.25,
        system="You are a technical recruiter and career coach. Return valid JSON only.",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    content = "".join(
        block.text for block in response.content
        if getattr(block, "type", None) == "text"
    )
    return parse_json_response(content)


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "HireLens AI backend is running.",
        "provider": os.getenv("AI_PROVIDER", "demo").lower()
    })


@app.route("/analyze-match", methods=["POST"])
def analyze_match():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Missing JSON body."}), 400

    resume = data.get("resume", "").strip()
    job_description = data.get("jobDescription", "").strip()
    target_role = data.get("targetRole", "AI Engineer").strip()

    if not resume or not job_description:
        return jsonify({"error": "Please provide both resume and job description."}), 400

    max_chars = int(os.getenv("MAX_INPUT_CHARS", "12000"))
    if len(resume) > max_chars or len(job_description) > max_chars:
        return jsonify({
            "error": f"Resume or job description is too long. Please keep each field under {max_chars} characters."
        }), 400

    provider = os.getenv("AI_PROVIDER", "demo").lower()
    prompt = create_prompt(resume, job_description, target_role)

    try:
        if provider == "openai":
            if not os.getenv("OPENAI_API_KEY"):
                return jsonify({"error": "Missing OPENAI_API_KEY."}), 500
            result = call_openai(prompt)
        elif provider == "anthropic":
            if not os.getenv("ANTHROPIC_API_KEY"):
                return jsonify({"error": "Missing ANTHROPIC_API_KEY."}), 500
            result = call_anthropic(prompt)
        elif provider == "demo":
            result = demo_response(target_role)
        else:
            return jsonify({"error": "Invalid AI_PROVIDER. Use demo, openai, or anthropic."}), 400

        return jsonify(result)

    except json.JSONDecodeError:
        return jsonify({"error": "AI provider returned invalid JSON. Please try again."}), 500
    except Exception as error:
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(debug=True)
