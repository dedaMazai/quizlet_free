import { Accesses } from "@/shared/types/accesses"
import { FileTypeS3 } from "@/shared/types/types"
import { ReactComponent as RuIcon } from '@/shared/assets/icons/Russia.svg';
import { ReactComponent as EnIcon } from '@/shared/assets/icons/England.svg';
import { GenderUser } from "@/shared/const/const";

export const ROLE_NAMES = {
  admin: 'Администратор',
  user: 'Пользователь',
} as const;

export type RoleName = keyof typeof ROLE_NAMES;

export const LanguageUser = {
  ru: {
    label: 'Русский',
    value: 'ru',
    icon: RuIcon,
  },
  en: {
    label: 'Английский',
    value: 'en',
    icon: EnIcon,
  },
} as const;

export type TLanguageUser = keyof typeof LanguageUser

export interface RoleInfo {
  uuid: string
  name: RoleName
  accesses: Accesses[]
}

export interface UserInfoCreate {
  email?: string
  surname?: string
  name: string
  middle_name?: string
  tel?: string
  gender?: GenderUser
  role: RoleName
  avatar_file_uuid?: string
  avatar?: string
  description?: string
  language?: TLanguageUser
  timezone?: string
}

export interface UserInfo {
  uuid: string
  email: string
  surname?: string
  name: string
  middle_name?: string
  tel?: string
  gender?: GenderUser
  avatar_file_uuid?: string
  avatar?: string
  description?: string
  language?: TLanguageUser
  timezone?: string

  /** Пользователь заблокирован администратором — не может авторизоваться. */
  blocked?: boolean

  /** Персональный лимит запросов к ИИ (0–25, по умолчанию 5). */
  ai_limit?: number

  suspended_by_user_uuid?: string
  invited_by_user_uuid?: string

  created_at: string
  updated_at: string
  deleted_at?: string

  role?: RoleInfo
  last_active_at?: string
  last_signed_in_at?: string
  avatar_file?: FileTypeS3
}

export interface UserSchema {
  userInfo?: UserInfo
  _inited: boolean
  _loggedOut: boolean
}
