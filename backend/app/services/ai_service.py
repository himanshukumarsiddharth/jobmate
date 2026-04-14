import os
import re
import PyPDF2
from typing import List, Dict, Any

common_skills = [
        # Programming Languages
        "python", "java", "javascript", "typescript", "c", "c++", "c#", "go", "golang", "rust",
        "kotlin", "swift", "php", "ruby", "scala", "bash", "shell scripting",

        # Frontend
        "html", "css", "html/css", "sass", "scss", "less",
        "javascript", "typescript",
        "react", "next.js", "vue.js", "nuxt.js", "angular", "svelte",
        "redux", "zustand", "jquery",
        "bootstrap", "tailwind css", "material ui", "chakra ui",
        "webpack", "vite", "babel", "parcel",
        "responsive design", "cross-browser compatibility",

        # Backend
        "node.js", "express.js", "nestjs",
        "django", "flask", "fastapi",
        "spring boot", "spring mvc",
        "asp.net", ".net core",
        "laravel", "codeigniter",
        "ruby on rails",

        # APIs & Architecture
        "rest api", "graphql", "grpc",
        "microservices", "monolithic architecture",
        "api gateway", "webhooks",

        # Databases
        "sql", "mysql", "postgresql", "sqlite", "oracle",
        "mongodb", "redis", "cassandra", "dynamodb",
        "firebase", "supabase",
        "database design", "query optimization",

        # DevOps & Cloud
        "aws", "azure", "google cloud", "gcp",
        "docker", "kubernetes", "helm",
        "terraform", "ansible", "chef", "puppet",
        "ci/cd", "jenkins", "github actions", "gitlab ci",
        "nginx", "apache",

        # Version Control & Collaboration
        "git", "github", "gitlab", "bitbucket",

        # Testing
        "unit testing", "integration testing", "e2e testing",
        "jest", "mocha", "chai", "cypress", "selenium",
        "pytest", "junit",

        # Security
        "jwt", "oauth", "authentication", "authorization",
        "web security", "owasp",

        # Mobile Development
        "react native", "flutter", "android", "ios",
        "xamarin",

        # Data & AI
        "pandas", "numpy", "matplotlib", "scikit-learn",
        "tensorflow", "pytorch",
        "data analysis", "machine learning",

        # Messaging & Streaming
        "kafka", "rabbitmq", "pub/sub",

        # Operating Systems
        "linux", "unix", "windows",

        # Monitoring & Logging
        "prometheus", "grafana", "elk stack", "splunk",

        # Build Tools
        "maven", "gradle", "npm", "yarn", "pnpm",

        # Game / Graphics / Design (your original included)
        "unity", "unreal engine", "vuforia sdk", "processing",
        "rhino 3d", "rhino3d", "autodesk maya", "autocad", "revit",
        "grasshopper", "vray",
        "adobe creative suite", "adobe illustrator", "adobe photoshop"
]

# Pre-compile regex patterns once at module load for robust parsing
def _get_pattern(skill: str):
    # Boundary logic that seamlessly supports symbols like ++, #, .net!
    start = r'\b' if skill[0].isalnum() else r'(?:\s|^)'
    end = r'\b' if skill[-1].isalnum() else r'(?:\W|$)'
    return re.compile(start + re.escape(skill) + end, re.IGNORECASE)

_skill_patterns = {
    skill: _get_pattern(skill)
    for skill in common_skills
}

def _extract_skills(text: str) -> set:
    """Return the set of skills from common_skills that appear as whole words in text."""
    return {skill for skill, pattern in _skill_patterns.items() if pattern.search(text)}

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from the uploaded PDF resume."""
    if not os.path.exists(file_path):
        return ""
    text = ""
    try:
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print(f"Error extracting PDF: {e}")
    return text

def parse_resume_content(text: str) -> Dict[str, Any]:
    """Use whole-word regex to extract skills from the full resume text."""
    found_skills = sorted(_extract_skills(text))
    return {
        "skills": found_skills,
        "word_count": len(text.split()),
        "raw_text": text
    }

def analyze_match(resume_text: str, job_description: str) -> Dict[str, Any]:
    """Compare Resume vs Job Description using word-boundary skill matching.
    Both sides use the same common_skills list so scoring is always consistent.
    """
    resume_skills = _extract_skills(resume_text)
    job_skills = _extract_skills(job_description)

    if not job_skills:
        return {"score": 100.0, "missing_keywords": []}

    matched = resume_skills.intersection(job_skills)
    score = (len(matched) / len(job_skills)) * 100.0
    missing_keywords = sorted(job_skills.difference(resume_skills))

    return {
        "score": round(score, 2),
        "missing_keywords": missing_keywords
    }
