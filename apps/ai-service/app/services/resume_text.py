from app.schemas.resume import StructuredResume


def structured_resume_to_text(resume: StructuredResume) -> str:
    parts: list[str] = []
    personal_info = resume.personalInfo

    parts.append(
        " ".join(
            item
            for item in [personal_info.name, personal_info.email, personal_info.phone]
            if item
        )
    )

    if resume.skills:
        parts.append("Skills: " + ", ".join(resume.skills))

    if resume.experience:
        parts.append("Experience:")

        for experience in resume.experience:
            parts.append(
                " ".join(
                    item
                    for item in [
                        experience.role,
                        experience.company,
                        experience.duration,
                        experience.description,
                    ]
                    if item
                )
            )

    if resume.education:
        parts.append("Education:")

        for education in resume.education:
            parts.append(
                " ".join(
                    item
                    for item in [education.degree, education.school, education.year]
                    if item
                )
            )

    return "\n".join(part for part in parts if part.strip()).strip()
