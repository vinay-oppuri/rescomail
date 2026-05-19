from app.models.ats import (
    ATS_KEYWORD_HINTS,
    GENERIC_JOB_WORDS,
    STOP_WORDS,
)
from app.utils.text import compact_unique

NORMALIZED_HINTS = compact_unique(ATS_KEYWORD_HINTS)
NOISE_WORDS = STOP_WORDS | GENERIC_JOB_WORDS

REQUIRED_MARKERS = {
    "require",
    "required",
    "requirement",
    "requirements",
    "must",
    "need",
    "needs",
    "minimum",
    "essential",
    "mandatory",
}

PREFERRED_MARKERS = {
    "preferred",
    "nice to have",
    "nice-to-have",
    "bonus",
    "plus",
    "advantage",
    "familiarity",
}

RESPONSIBILITY_MARKERS = {
    "build",
    "create",
    "design",
    "develop",
    "drive",
    "improve",
    "lead",
    "manage",
    "own",
    "partner",
    "ship",
    "support",
}

CERTIFICATION_TERMS = {
    "aws certified",
    "azure certified",
    "cissp",
    "cpa",
    "pmp",
    "scrum master",
    "security+",
}
