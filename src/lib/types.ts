export type Profile = {
  id: string
  display_name: string
  avatar_url: string | null
  theme_color: string
  theme_mode: 'claro' | 'escuro' | 'sistema'
  timezone: string
}