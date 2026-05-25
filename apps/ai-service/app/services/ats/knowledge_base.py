from dataclasses import dataclass

from app.embeddings.semantic import semantic_search_scores


@dataclass(frozen=True)
class KnowledgeDocument:
    id: str
    title: str
    source_type: str
    content: str


KNOWLEDGE_BASE = [
    KnowledgeDocument(
        id="recruiter-screen-001",
        title="Recruiter screening checklist",
        source_type="recruiter_guideline",
        content=(
            "Recruiters scan the top third of a resume for role title alignment, "
            "required skills, recent company or project context, and measurable "
            "evidence. Strong resumes mirror the job language while tying each "
            "skill to a result."
        ),
    ),
    KnowledgeDocument(
        id="resume-pattern-ml-001",
        title="Machine learning resume pattern",
        source_type="resume_pattern",
        content=(
            "Machine learning bullets should connect data, model, evaluation, "
            "deployment, and business impact. Mention dataset size, model family, "
            "metric lift, latency, monitoring, or experiment tracking when relevant."
        ),
    ),
    KnowledgeDocument(
        id="resume-pattern-software-001",
        title="Software engineering resume pattern",
        source_type="resume_pattern",
        content=(
            "Software engineering bullets perform best when they show ownership, "
            "architecture decisions, scale, reliability, tests, and user or revenue "
            "impact rather than listing stack names alone."
        ),
    ),
    KnowledgeDocument(
        id="ats-formatting-001",
        title="ATS parser-friendly structure",
        source_type="recruiter_guideline",
        content=(
            "ATS parsers prefer standard section headings, plain text bullets, "
            "consistent dates, explicit skills sections, and simple contact links. "
            "Dense graphics, tables, and hidden text can reduce extraction quality."
        ),
    ),
    KnowledgeDocument(
        id="domain-gap-001",
        title="Skill-gap positioning",
        source_type="domain_knowledge",
        content=(
            "A missing required skill is strongest when addressed with a project, "
            "certification, production example, or adjacent experience. If direct "
            "experience is limited, describe a transferable system or workflow."
        ),
    ),
    KnowledgeDocument(
        id="outreach-001",
        title="Recruiter outreach evidence",
        source_type="recruiter_guideline",
        content=(
            "Cold outreach should mention the target role, one relevant proof point, "
            "and a concise reason the candidate fits the team's current problem."
        ),
    ),
]


def retrieve_guidance(query: str, limit: int = 3) -> list[tuple[KnowledgeDocument, int]]:
    scores = semantic_search_scores(query, [document.content for document in KNOWLEDGE_BASE])
    ranked = list(zip(KNOWLEDGE_BASE, scores))
    ranked.sort(key=lambda item: (-item[1], item[0].id))
    return ranked[:limit]
