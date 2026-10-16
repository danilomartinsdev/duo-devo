export type TemaPaleta = 'indigo' | 'oceano' | 'floresta' | 'mel' | 'grafeno' | 'magenta'
export type TemaModo = 'claro' | 'escuro' | 'sistema'

export type Profile = {
  id: string
  display_name: string
  avatar_url: string | null
  theme_color: string
  theme_mode: string
  timezone: string
}