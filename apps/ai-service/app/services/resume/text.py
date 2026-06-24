from app.schemas.resume import StructuredResume


def structured_resume_to_text(resume: StructuredResume) -> str:
    parts: list[str] = []
    personal_info = resume.personalInfo

    contact_items = [
        personal_info.name,
        personal_info.email,
        personal_info.phone,
        personal_info.portfolioUrl,
        personal_info.githubUrl,
        personal_info.linkedinUrl,
    ]
    parts.append(" ".join(item for item in contact_items if item))

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

    if resume.projects:
        parts.append("Projects:")

        for project in resume.projects:
            project_text = f"{project.title}: {project.description}"
            if project.technologies:
                project_text += f" (Technologies: {', '.join(project.technologies)})"
            parts.append(project_text)

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

