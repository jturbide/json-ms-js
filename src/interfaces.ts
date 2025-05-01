type SizeUnit = 'B' | 'K' | 'M' | 'G' | 'T';

export type TRule = { regex: string, message: string }
export type TEnum = {[key: string]: string[]} | {[key: string]: {[key: string]: string}}
export type TSchema = {[key: string]: { [key: string]: IField }}

export interface JmsFile {
  path: string | null
  meta: {
    size?: number | null
    type?: string
    width?: number | null
    height?: number | null
    timestamp?: number
    frameRate?: number
    duration?: number
    originalFileName?: string
  }
}

export interface JmsSection<N> {
  name: N,
  paths: string[],
}

export interface JmsSettings {
  postMaxSize: `${number}${SizeUnit}`
  publicUrl: string,
  supportedFeatures: string[],
  uploadMaxSize: `${number}${SizeUnit}`
  version: `${number}.${number}.${number}`
}

export const defaultSettings: JmsSettings = {
  postMaxSize: '2M',
  publicUrl: typeof window !== 'undefined' ? (window.location.origin + '/') : '',
  supportedFeatures: [],
  uploadMaxSize: '2M',
  version: '1.0.0',
}

export interface IField {
  type: string
  label: string
  required?: boolean
  default?: any
  icon?: string
  hint?: string
  multiple?: boolean
  inline?: boolean
  min?: number
  max?: number
  length?: number
  step?: number
  'half-increments'?: boolean
  prepend?: string
  append?: string
  accept?: string | string[]
  'append-inner'?: string
  'prepend-inner'?: string
  fields: {[key: string]: IField}
  items?: {[key: string]: string} | string[] | string
  conditional?: string
  rules?: TRule[]
  collapsable?: boolean
  collapsed?: boolean
  swatches?: boolean
  canvas?: boolean
  inputs?: boolean
  sliders?: boolean
}

export interface JmsStructure {
  global: {
    title: string,
    icon?: string,
    preview?: string,
  },
  locales: { [key: string]: string },
  enums: TEnum,
  schemas: TSchema,
  sections: { [key: string]: IField },
}

export const defaultStructure: JmsStructure = {
  global: {
    title: 'Untitled',
  },
  locales: {},
  enums: {},
  schemas: {},
  sections: {}
}

export interface JmsOptions<D, S, L = string> {
  targetOrigin?: string
  onDataChange?: (value: D) => void
  onLocaleInit?: (locale: L) => void
  onLocaleChange?: (locale: L) => void
  onSectionInit?: (section: JmsSection<S>) => void
  onSectionChange?: (section: JmsSection<S>) => void
  onSettingsInit?: (settings: JmsSettings) => void
  onSettingsChange?: (settings: JmsSettings) => void
  onStructureInit?: (structure: JmsStructure) => void
  onStructureChange?: (structure: JmsStructure) => void
}

export interface JmsOptionsWithDefaults<D, S, L = string> extends JmsOptions<D, S, L> {
  defaultData: D
  defaultSection: JmsSection<S>
  defaultLocale: L
  defaultSettings?: JmsSettings,
  defaultStructure?: JmsStructure,
}

export interface JmsContext<D, S = string, L = string> {
  data: D,
  locale: L,
  section: JmsSection<S>,
  settings: JmsSettings,
  structure: JmsStructure,
}