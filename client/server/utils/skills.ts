import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getAllSkills, selectSkillsByPrompt } from '../../lib/ai/skills'

const skillCache = new Map<string, string>()

export async function loadSkill(skillId: string) {
  const skill = getAllSkills().find(item => item.id === skillId) ?? getAllSkills().find(item => item.id === 'general-assistant')!

  if (skillCache.has(skill.id)) return skillCache.get(skill.id)!

  try {
    const content = await readFile(join(process.cwd(), 'lib/ai/skills', skill.file), 'utf8')
    skillCache.set(skill.id, content)

    return content
  } catch (error) {
    console.error(`Skill ${skill.id} gagal dibaca:`, error)

    if (skill.id !== 'general-assistant') return loadSkill('general-assistant')
    return 'Kamu adalah asisten Literasiku. Jawab jelas, aman, dan tidak mengarang fakta.'
  }
}

export function selectSkillIds(prompt: string, forcedSkillIds: string[] = []) {
  const selected = selectSkillsByPrompt(prompt).map(skill => skill.id)
  const merged = [...forcedSkillIds, ...selected, 'general-assistant']

  return [...new Set(merged)].slice(0, 4)
}

export async function buildSkillsSystemPrompt(prompt: string, forcedSkillIds: string[] = []) {
  const skillIds = selectSkillIds(prompt, forcedSkillIds)
  const sections = await Promise.all(skillIds.map(async id => `## Skill: ${id}\n${await loadSkill(id)}`))

  return sections.join('\n\n')
}
