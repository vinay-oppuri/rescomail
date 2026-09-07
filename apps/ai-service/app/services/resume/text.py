from app.schemas.resume import SkillGroup, StructuredResume


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

    if resume.summary:
        parts.append(f"Summary: {resume.summary}")

    if resume.skills:
        skill_lines: list[str] = []
        has_categories = False
        for item in resume.skills:
            if isinstance(item, SkillGroup):
                sub_skills = ", ".join(s for s in item.skills if s)
                if item.category.strip():
                    has_categories = True
                    skill_lines.append(f"{item.category.strip()}: {sub_skills}")
                elif sub_skills:
                    skill_lines.append(sub_skills)
            elif isinstance(item, dict):
                cat = str(item.get("category", "")).strip()
                sub = item.get("skills", [])
                sub_skills = (
                    ", ".join(str(s) for s in sub if s)
                    if isinstance(sub, list)
                    else str(sub)
                )
                if cat:
                    has_categories = True
                    skill_lines.append(f"{cat}: {sub_skills}")
                elif sub_skills:
                    skill_lines.append(sub_skills)
            elif isinstance(item, str) and item.strip():
                skill_lines.append(item.strip())

        if skill_lines:
            joiner = " | " if has_categories else ", "
            parts.append("Skills: " + joiner.join(skill_lines))

    if resume.experience:
        parts.append("Experience:")

        for experience in resume.experience:
            desc_str = " ".join(experience.description)
            parts.append(
                " ".join(
                    item
                    for item in [
                        experience.role,
                        experience.company,
                        experience.duration,
                        desc_str,
                    ]
                    if item
                )
            )

    if resume.projects:
        parts.append("Projects:")

        for project in resume.projects:
            desc_str = " ".join(project.description)
            project_text = f"{project.title}: {desc_str}"
            if project.technologies:
                project_text += f" (Technologies: {', '.join(project.technologies)})"
            links = []
            if project.githubUrl:
                links.append(f"GitHub: {project.githubUrl}")
            if project.liveUrl:
                links.append(f"Live: {project.liveUrl}")
            if links:
                project_text += f" ({', '.join(links)})"
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

