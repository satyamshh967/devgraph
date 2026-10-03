import math
from typing import Dict, Any, List

class ComplexityScorer:
    def calculate_complexity(self, repo_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluate structural, dependency, and architectural complexity of a repository.
        """
        languages = repo_data.get("languages", {})
        dependencies = repo_data.get("dependencies", [])
        lines_of_code = repo_data.get("lines_of_code", 12000)
        file_count = repo_data.get("file_count", 45)
        commits_count = repo_data.get("commits_count", 80)
        stars = repo_data.get("stars", 10)
        branches_count = repo_data.get("branches_count", 3)

        # 1. Multi-language Entropy (Shannon entropy)
        total_bytes = sum(languages.values()) if languages else 1
        entropy = 0.0
        if languages and total_bytes > 0:
            for count in languages.values():
                p = count / total_bytes
                if p > 0:
                    entropy -= p * math.log2(p)
        # Normalized entropy score (0 to 25)
        entropy_score = min(25.0, round(entropy * 12.5, 2))

        # 2. Dependency Depth & Scale score (0 to 25)
        dep_count = len(dependencies)
        dep_score = min(25.0, round((dep_count * 1.2), 2))

        # 3. Code Volume & File Scale score (0 to 25)
        volume_factor = math.log10(max(10, lines_of_code)) # 3 for 1000, 4 for 10000, 5 for 100k
        file_factor = min(15.0, file_count * 0.15)
        volume_score = min(25.0, round((volume_factor * 3.5) + file_factor, 2))

        # 4. Activity & Collaboration Density score (0 to 25)
        density_score = min(25.0, round((math.log10(max(1, commits_count)) * 5) + (branches_count * 1.5), 2))

        # Total Composite Score (0 - 100)
        total_score = min(100, round(entropy_score + dep_score + volume_score + density_score, 1))

        # Tier classification
        if total_score >= 75:
            tier = "Enterprise / High Complexity"
            level = "Tier 4"
            color = "#ef4444" # red
        elif total_score >= 50:
            tier = "Complex Distributed System"
            level = "Tier 3"
            color = "#f59e0b" # amber
        elif total_score >= 25:
            tier = "Modular Production Service"
            level = "Tier 2"
            color = "#3b82f6" # blue
        else:
            tier = "Script / Lightweight Prototype"
            level = "Tier 1"
            color = "#10b981" # green

        # Cyclomatic & architectural index approximation
        cyclomatic_index = round(min(10.0, 1.5 + (total_score / 14)), 1)
        modularity_index = round(max(50.0, 100.0 - (total_score * 0.3)), 1)

        return {
            "overall_score": total_score,
            "tier": tier,
            "level": level,
            "badge_color": color,
            "metrics": {
                "language_entropy": entropy_score,
                "dependency_density": dep_score,
                "codebase_scale": volume_score,
                "activity_velocity": density_score,
                "lines_of_code": lines_of_code,
                "file_count": file_count,
                "dependency_count": dep_count,
                "estimated_cyclomatic_index": cyclomatic_index,
                "modularity_index": modularity_index
            }
        }
