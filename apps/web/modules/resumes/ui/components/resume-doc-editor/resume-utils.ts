export function bulletsToHtml(bullets?: string[]): string {
  if (!bullets || bullets.length === 0) {
    return "<ul><li>Accomplished key milestones…</li></ul>";
  }
  return `<ul>${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>`;
}

export function htmlToBullets(html: string): string[] {
  if (typeof window === "undefined") return [];
  const div = document.createElement("div");
  div.innerHTML = html;
  const lis = Array.from(div.querySelectorAll("li"));
  if (lis.length > 0) {
    return lis.map((li) => li.innerHTML.trim()).filter(Boolean);
  }
  const ps = Array.from(div.querySelectorAll("p"));
  if (ps.length > 0) {
    return ps.map((p) => p.innerHTML.trim()).filter(Boolean);
  }
  return [div.innerHTML.trim()].filter(Boolean);
}
