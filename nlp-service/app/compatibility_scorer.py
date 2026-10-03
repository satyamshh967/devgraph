import math
from typing import Dict, List, Any

class CompatibilityScorer:
    def calculate_compatibility(self, candidate_skills: List[Dict[str, Any]], target_requirements: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate candidate fit against a target team role or team skill profile.
        candidate_skills: list of {name, category, proficiency_score, level}
        target_requirements: {
            "role_title": str,
            "required_skills": [{"name": str, "min_score": int, "weight": float}],
            "preferred_skills": [{"name": str, "min_score": int, "weight": float}]
        }
        """
        candidate_skill_map = {s["name"].lower(): s for s in candidate_skills}
        
        required_list = target_requirements.get("required_skills", [])
        preferred_list = target_requirements.get("preferred_skills", [])

        matched_skills = []
        missing_skills = []
        growth_needed = []
        complementary_skills = []

        total_req_weight = sum(item.get("weight", 1.0) for item in required_list) or 1.0
        earned_req_points = 0.0

        for req in required_list:
            req_name = req["name"]
            req_key = req_name.lower()
            min_score = req.get("min_score", 50)
            weight = req.get("weight", 1.0)

            if req_key in candidate_skill_map:
                cand_skill = candidate_skill_map[req_key]
                cand_score = cand_skill.get("proficiency_score", 0)
                
                if cand_score >= min_score:
                    earned_req_points += weight
                    matched_skills.append({
                        "name": req_name,
                        "candidate_score": cand_score,
                        "required_score": min_score,
                        "status": "Proficient",
                        "category": cand_skill.get("category", "General")
                    })
                else:
                    # Partial match
                    ratio = cand_score / max(1, min_score)
                    earned_req_points += weight * ratio * 0.7
                    growth_needed.append({
                        "name": req_name,
                        "candidate_score": cand_score,
                        "required_score": min_score,
                        "status": "Upskilling Needed",
                        "gap": min_score - cand_score,
                        "category": cand_skill.get("category", "General")
                    })
            else:
                missing_skills.append({
                    "name": req_name,
                    "candidate_score": 0,
                    "required_score": min_score,
                    "status": "Missing",
                    "category": req.get("category", "General")
                })

        # Preferred skills evaluation
        total_pref_weight = sum(item.get("weight", 1.0) for item in preferred_list) or 1.0
        earned_pref_points = 0.0

        for pref in preferred_list:
            pref_name = pref["name"]
            pref_key = pref_name.lower()
            if pref_key in candidate_skill_map:
                cand_skill = candidate_skill_map[pref_key]
                earned_pref_points += pref.get("weight", 1.0)
                matched_skills.append({
                    "name": pref_name,
                    "candidate_score": cand_skill.get("proficiency_score", 0),
                    "required_score": pref.get("min_score", 30),
                    "status": "Bonus / Preferred Match",
                    "category": cand_skill.get("category", "General")
                })

        # Complementary skills (candidate has high skills that weren't explicitly asked for)
        req_keys = {r["name"].lower() for r in required_list} | {p["name"].lower() for p in preferred_list}
        for s in candidate_skills:
            if s["name"].lower() not in req_keys and s.get("proficiency_score", 0) >= 60:
                complementary_skills.append({
                    "name": s["name"],
                    "category": s.get("category", "General"),
                    "score": s.get("proficiency_score", 0)
                })

        req_score_norm = (earned_req_points / total_req_weight) * 75.0
        pref_score_norm = (earned_pref_points / total_pref_weight) * 20.0
        bonus_comp = min(5.0, len(complementary_skills) * 1.5)

        compatibility_percentage = min(100.0, round(req_score_norm + pref_score_norm + bonus_comp, 1))

        if compatibility_percentage >= 85:
            recommendation = "Strong Hire / High Alignment"
            badge = "Exceptional Match"
        elif compatibility_percentage >= 70:
            recommendation = "Recommended / Good Fit with minor ramp-up"
            badge = "Solid Match"
        elif compatibility_percentage >= 50:
            recommendation = "Potential Fit with guided training"
            badge = "Moderate Match"
        else:
            recommendation = "Significant Skill Gap for this specific role"
            badge = "Low Alignment"

        return {
            "compatibility_percentage": compatibility_percentage,
            "recommendation": recommendation,
            "badge": badge,
            "breakdown": {
                "matched_count": len(matched_skills),
                "growth_needed_count": len(growth_needed),
                "missing_count": len(missing_skills),
                "complementary_count": len(complementary_skills)
            },
            "matched_skills": matched_skills,
            "growth_needed": growth_needed,
            "missing_skills": missing_skills,
            "complementary_skills": complementary_skills[:5]
        }
