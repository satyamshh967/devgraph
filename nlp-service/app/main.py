import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from skill_extractor import SkillExtractor
from complexity_scorer import ComplexityScorer
from compatibility_scorer import CompatibilityScorer

app = FastAPI(
    title="Developer Knowledge Graph - NLP & Analytics Service",
    version="1.0.0",
    description="NLP-driven skill extraction, repository complexity scoring, and team compatibility engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

skill_extractor = SkillExtractor()
complexity_scorer = ComplexityScorer()
compatibility_scorer = CompatibilityScorer()

class RepoAnalysisRequest(BaseModel):
    name: str
    description: Optional[str] = ""
    readme: Optional[str] = ""
    primary_language: Optional[str] = ""
    language: Optional[str] = ""
    languages: Optional[Dict[str, int]] = {}
    topics: Optional[List[str]] = []
    dependencies: Optional[List[str]] = []
    commits_count: Optional[int] = 20
    stars: Optional[int] = 0
    lines_of_code: Optional[int] = 10000
    file_count: Optional[int] = 30
    branches_count: Optional[int] = 2

class CompatibilityRequest(BaseModel):
    candidate_skills: List[Dict[str, Any]]
    target_requirements: Dict[str, Any]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "python-nlp-analytics",
        "taxonomy_categories": list(skill_extractor.categories.keys()),
        "total_skills_indexed": len(skill_extractor.skill_map)
    }

@app.get("/taxonomy")
def get_taxonomy():
    return skill_extractor.taxonomy_data

@app.post("/analyze")
def analyze_repository(req: RepoAnalysisRequest):
    repo_dict = req.dict()
    extracted_skills = skill_extractor.extract_from_repo(repo_dict)
    complexity = complexity_scorer.calculate_complexity(repo_dict)
    return {
        "repository": req.name,
        "extracted_skills": extracted_skills,
        "complexity": complexity
    }

@app.post("/complexity")
def score_complexity(req: RepoAnalysisRequest):
    repo_dict = req.dict()
    complexity = complexity_scorer.calculate_complexity(repo_dict)
    return complexity

@app.post("/compatibility")
def score_compatibility(req: CompatibilityRequest):
    result = compatibility_scorer.calculate_compatibility(
        req.candidate_skills,
        req.target_requirements
    )
    return result

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
