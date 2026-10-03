import json
import re
import os
from collections import defaultdict
from typing import Dict, List, Any, Optional

TAXONOMY_PATH = os.path.join(os.path.dirname(__file__), "taxonomy.json")

class SkillExtractor:
    def __init__(self, taxonomy_file: str = TAXONOMY_PATH):
        with open(taxonomy_file, "r", encoding="utf-8") as f:
            self.taxonomy_data = json.load(f)
        self.categories = self.taxonomy_data.get("categories", {})
        self._build_lookup()

    def _build_lookup(self):
        """Build regex and alias mapping for fast matching."""
        self.skill_map = {} # alias_lower -> (canonical_name, category, meta)
        for cat_name, cat_data in self.categories.items():
            for skill_name, skill_meta in cat_data.get("skills", {}).items():
                entry = {
                    "name": skill_name,
                    "category": cat_name,
                    "color": cat_data.get("color", "#64748b"),
                    "weight": skill_meta.get("weight", 1.0),
                    "threshold": skill_meta.get("level_threshold", 3)
                }
                self.skill_map[skill_name.lower()] = entry
                for alias in skill_meta.get("aliases", []):
                    self.skill_map[alias.lower()] = entry

    def extract_from_repo(self, repo_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract skills from repo attributes:
        - name, description, readme, topics, languages, dependency_manifests
        """
        evidence_counter = defaultdict(lambda: {"count": 0, "sources": set(), "meta": None})
        
        # 1. Primary language & language distribution (High confidence)
        primary_lang = repo_data.get("primary_language") or repo_data.get("language")
        if primary_lang:
            norm_lang = primary_lang.lower().strip()
            if norm_lang in self.skill_map:
                meta = self.skill_map[norm_lang]
                evidence_counter[meta["name"]]["count"] += 4
                evidence_counter[meta["name"]]["sources"].add("primary_language")
                evidence_counter[meta["name"]]["meta"] = meta

        # 2. Repo topics / tags (High confidence)
        topics = repo_data.get("topics", [])
        for topic in topics:
            norm_topic = str(topic).lower().strip()
            if norm_topic in self.skill_map:
                meta = self.skill_map[norm_topic]
                evidence_counter[meta["name"]]["count"] += 3
                evidence_counter[meta["name"]]["sources"].add("github_topics")
                evidence_counter[meta["name"]]["meta"] = meta

        # 3. Dependencies manifests (package.json, requirements.txt, etc.) (Very High confidence)
        dependencies = repo_data.get("dependencies", [])
        for dep in dependencies:
            norm_dep = re.sub(r'[^a-zA-Z0-9-]', '', str(dep).lower())
            if norm_dep in self.skill_map:
                meta = self.skill_map[norm_dep]
                evidence_counter[meta["name"]]["count"] += 5
                evidence_counter[meta["name"]]["sources"].add("dependency_manifest")
                evidence_counter[meta["name"]]["meta"] = meta

        # 4. Text corpus: repo name, description, README text
        text_corpus = " ".join([
            str(repo_data.get("name", "")),
            str(repo_data.get("description", "")),
            str(repo_data.get("readme", ""))[:5000] # first 5k characters of README
        ]).lower()

        # Tokenize words and multi-word terms
        for alias, meta in self.skill_map.items():
            pattern = r'\b' + re.escape(alias) + r'\b'
            matches = len(re.findall(pattern, text_corpus))
            if matches > 0:
                evidence_counter[meta["name"]]["count"] += min(matches, 4)
                evidence_counter[meta["name"]]["sources"].add("code_text_nlp")
                evidence_counter[meta["name"]]["meta"] = meta

        # Calculate final confidence, proficiency level, and score
        extracted_skills = []
        commits = repo_data.get("commits_count", 15)
        stars = repo_data.get("stars", 0)

        for skill_name, data in evidence_counter.items():
            meta = data["meta"]
            raw_count = data["count"]
            weight = meta["weight"]
            
            # Confidence score between 0.40 and 0.99
            confidence = min(0.99, round(0.45 + (raw_count * 0.08) + (0.05 if "dependency_manifest" in data["sources"] else 0), 2))
            
            # Proficiency score 1-100 based on commit count, evidence count, and weight
            prof_score = min(100, int((raw_count * 12 + min(commits, 50) * 0.6 + min(stars, 20) * 0.5) * weight))
            
            level = "Beginner"
            if prof_score >= 80:
                level = "Expert"
            elif prof_score >= 55:
                level = "Advanced"
            elif prof_score >= 30:
                level = "Intermediate"

            extracted_skills.append({
                "name": skill_name,
                "category": meta["category"],
                "color": meta["color"],
                "confidence": confidence,
                "proficiency_score": prof_score,
                "level": level,
                "evidence_count": raw_count,
                "sources": list(data["sources"]),
                "weight": weight
            })

        # Sort by proficiency score descending
        extracted_skills.sort(key=lambda s: s["proficiency_score"], reverse=True)
        return extracted_skills
