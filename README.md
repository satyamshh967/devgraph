# 🌐 Developer Knowledge Graph Platform

> An intelligent graph-based analytics platform that evaluates developer repositories, extracts technical capabilities using NLP, and constructs an interactive knowledge graph mapping skills, growth trajectory, and codebase complexity.

---

## 📌 Problem Statement
Traditional resumes and static portfolio pages fail to accurately represent developer capabilities, learning trajectories, and actual code ownership. 

The **Developer Knowledge Graph Platform** solves this by:
1. Ingesting GitHub repositories and dependency manifests.
2. Applying Natural Language Processing (NLP) over codebases, commit metadata, and dependency trees to extract normalized technical skills.
3. Modeling developers, repositories, contributions, and skills as a connected **property graph** in **Neo4j** (with dual-mode in-memory fallback).
4. Providing recruiters, engineering leaders, and developers with interactive graph exploration, career trajectory timelines, codebase complexity metrics, and algorithmic team compatibility scoring.

---

## 🏗️ Architecture & Component Topology

```
┌─────────────────────────────────────────────────────────────┐
│                 React Visualization UI                      │
│   (Vite + Tailwind CSS + Canvas Force-Directed Engine)      │
│  - 2D Knowledge Graph       - Skill Evolution Timeline      │
│  - Team Compatibility Fit   - Repo Complexity Scoring       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Node.js API Gateway                      │
│        (Express + Neo4j Driver + Resilient Engine)          │
│  - Ingestion Orchestration   - Graph Subgraph Traversal     │
│  - Ego-Graph Neighborhoods   - Dual-Mode Aura / Memory Sync │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│      Python NLP Service      │ │     Neo4j Graph Database    │
│    (FastAPI + Taxonomy)      │ │   (Neo4j Aura Cloud /       │
│  - Skill Extraction Pipeline │ │    In-Memory Graph Engine)  │
│  - Cyclomatic & LOC Scorer   │ │  - Property Graph Entities  │
│  - Skill Vector Similarity   │ │  - Dependency & Co-occur    │
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## 📊 Data Model & Graph Ontology

### 1. Nodes
* **`Developer`**: `{ id, username, name, avatar, bio, totalStars, totalCommits, followers, reposCount }`
* **`Repository`**: `{ id, name, fullName, language, stars, forks, complexityScore, complexityTier, topics }`
* **`Contribution`**: `{ id, developerId, repoId, commitCount, role, year }`
* **`Skill`**: `{ id, name, category, color, score, level, firstUsedYear }`

### 2. Dependency Edges
* `(Developer)-[:AUTHORED]->(Contribution)`
* `(Contribution)-[:IN_REPO]->(Repository)`
* `(Repository)-[:REQUIRES_SKILL {proficiency, confidence}]->(Skill)`
* `(Developer)-[:HAS_SKILL {score, level, firstUsedYear}]->(Skill)`
* `(Skill)-[:RELATED_TO {weight}]->(Skill)` *(Skill co-occurrence across codebases)*
* `(Repository)-[:DEPENDS_ON]->(Repository)`

---

## ✨ Key Features

### 🌟 Core Features (MVP)
* **GitHub Repo Ingestion (`POST /api/github/import`)**:
  * Live GitHub API profiling and repository metadata harvesting.
  * Catalog of realistic benchmark developer profiles (*Alex Chen - Fullstack*, *Priya Sharma - AI/ML*, *Marcus Vance - DevOps*, *Sophia Lin - Frontend*).
* **NLP Skill Extraction (`POST /api/skills/analyze`)**:
  * Scans repository descriptions, READMEs, topics, and dependency manifests (`package.json`, `pom.xml`, `requirements.txt`).
  * Normalizes aliases, assigns confidence scores, and determines proficiency tiers (*Beginner*, *Intermediate*, *Advanced*, *Expert*).
* **Interactive Force-Directed Knowledge Graph (`GET /api/graph/data`)**:
  * 60fps HTML5 Canvas physics simulation with zoom, pan, node dragging, category filtering, search highlighting, and ego-graph drawer inspection.
* **Contribution Analytics (`GET /api/analytics/contributions`)**:
  * Quantitative breakdown of lines of code, commit frequency, verified author activity, and multi-language allocation.

### 🚀 Advanced Features
* **Skill Evolution Timeline (`GET /api/analytics/skill-evolution`)**:
  * Scrubbable and auto-playable career trajectory slider (2021 → 2026).
  * Visualizes annual skill unlocks, career milestone cards, and technical breadth expansion over time.
* **Team Compatibility & Role Fit Scoring (`POST /api/analytics/team-compatibility`)**:
  * Vector alignment calculating Cosine & Jaccard overlap against target job requirements or team profiles.
  * Highlights **Core Skill Matches**, **Upskilling Gaps**, **Missing Skills**, and **Complementary Strengths**.
* **Repository Complexity Scoring (`GET /api/analytics/repo-complexity`)**:
  * Composite scoring based on **Shannon language entropy**, **dependency density**, **code volume (LOC)**, and **cyclomatic branching estimate**.
  * Classifies codebases into: *Script / Prototype*, *Modular Production Service*, *Complex Distributed System*, or *Enterprise Monorepo*.

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/github/import` | Ingests a GitHub user or benchmark profile into the knowledge graph |
| `GET` | `/api/github/benchmarks` | Lists pre-configured realistic developer personas |
| `GET` | `/api/developers` | Fetches all ingested developer nodes |
| `GET` | `/api/developers/:id` | Returns deep profile and aggregated skills for a developer |
| `POST` | `/api/skills/analyze` | Invokes Python NLP engine on arbitrary repo metadata |
| `GET` | `/api/graph/data` | Queries graph nodes and edges with category and score filters |
| `GET` | `/api/graph/node/:id` | Returns 1-hop ego-graph neighborhood for any selected node |
| `GET` | `/api/graph/status` | Reports Neo4j Aura connectivity and in-memory graph statistics |
| `GET` | `/api/analytics/contributions` | Returns commit velocity and language distribution |
| `GET` | `/api/analytics/skill-evolution` | Returns milestone progression across career years |
| `POST` | `/api/analytics/team-compatibility` | Evaluates candidate fit against target role requirements |
| `GET` | `/api/analytics/repo-complexity` | Evaluates complexity metrics across managed repositories |

---

## 🚀 Quickstart & Setup

### Prerequisites
* **Node.js**: v18+ (tested on v24)
* **Python**: 3.10+ (tested on 3.12)

### 1. Start Python NLP Analysis Service
```powershell
# In project root:
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir nlp-service/app --port 8000
```

### 2. Start Node.js API Gateway
```powershell
cd server
npm start
```
*(Runs on `http://localhost:5000`)*

### 3. Start React Visualization UI
```powershell
cd client
npm run dev
```
*(Runs on `http://localhost:3000`)*

---

## ☁️ Neo4j Aura Database Configuration (Optional)
The platform operates in **Dual-Mode**:
* If `NEO4J_URI`, `NEO4J_USER`, and `NEO4J_PASSWORD` are configured in `.env`, it automatically writes and queries your Neo4j Aura cloud database.
* If omitted or offline, the platform automatically switches to the zero-setup **In-Memory Graph Engine**, guaranteeing zero downtime.

---

## 💼 Resume Highlights
* **Designed and engineered an end-to-end Developer Knowledge Graph Platform** utilizing React, Node.js, Python, and Neo4j to model multi-repository developer skills and career growth trajectories.
* **Implemented an NLP skill extraction engine** matching codebase tokens, README semantics, and package dependencies against an ontology of 40+ technologies with automated confidence scoring.
* **Built interactive 60fps force-directed canvas graph visualization** featuring ego-graph inspection, dynamic category filtering, and real-time sub-graph traversal.
* **Developed algorithmic team compatibility and codebase complexity scoring**, evaluating skill vector alignment and Shannon entropy to quantify architectural depth and role suitability.
