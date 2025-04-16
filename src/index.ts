type SizeUnit = 'B' | 'K' | 'M' | 'G' | 'T';

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
  publicUrl: typeof window !== 'undefined' ? window.location.origin : '',
  supportedFeatures: [],
  uploadMaxSize: '2M',
  version: '1.0.0',
}

export type TRule = { regex: string, message: string }
export type TEnum = {[key: string]: string[]} | {[key: string]: {[key: string]: string}}
export type TSchema = {[key: string]: { [key: string]: IField }}

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
  enums: { [key: string]: { [key: string]: string } },
  schemas: { [key: string]: IField },
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

export function useJsonMs() {

  const state = {
    data: {},
    locale: null,
    settings: {},
    structure: {},
  };

  const handler = {
    get(target: any, prop: string) {
      return target[prop];
    },
    set(target: any, prop: string, value: any) {
      target[prop] = value;
      return true;
    }
  }

  const proxy = new Proxy(state, handler);

  const getValueByPath = (obj: any, path: string): any => {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    return current;
  };

  const applyParams = (str: string, params?: { [key: string]: string | number }) => {
    if (!params) {
      return str;
    }
    const keys = Object.keys(params);
    keys.forEach(key => {
      str = str.replaceAll('{' + key + '}', params[key].toString());
    });
    return str;
  };

  const jms = (path: string, params?: { [key: string]: string | number }) => {
    return applyParams(getValueByPath(proxy.data, path), params);
  }

  const bindToEditor = <S = string, L = string>(options: {
    targetOrigin?: string,
    onDataChange?: (data: any) => void,
    onLocaleInit?: (locale: L) => void,
    onLocaleChange?: (locale: L) => void,
    onSectionInit?: (section: JmsSection<S>) => void,
    onSectionChange?: (section: JmsSection<S>) => void,
    onSettingsInit?: (settings: JmsSettings) => void,
    onSettingsChange?: (settings: JmsSettings) => void,
    onStructureInit?: (structure: JmsStructure) => void,
    onStructureChange?: (structure: JmsStructure) => void,
  } = {}) => {

    options.targetOrigin = options.targetOrigin ?? '*';

    if (typeof window !== 'undefined') {
      window.parent.postMessage({name: 'jsonms', type: 'init'}, options.targetOrigin);

      window.addEventListener('message', (event) => {
        if (event.data.name === 'jsonms') {
          switch (event.data.type) {
            case 'data':
              const data = JSON.parse(event.data.data);
              proxy.data = data.data;
              proxy.settings = data.settings;
              if (options.onDataChange) {
                options.onDataChange(data);
              }
              if (options.onSectionInit) {
                options.onSectionInit(data.section);
              }
              if (options.onLocaleInit) {
                options.onLocaleInit(data.locale);
              }
              if (options.onSettingsInit) {
                options.onSettingsInit(data.settings);
              }
              if (options.onStructureInit) {
                options.onStructureInit(data.structure);
              }
              break;
            case 'section':
              if (options.onSectionChange) {
                try {
                  options.onSectionChange(JSON.parse(event.data.data));
                } catch (e) {
                  console.error(e);
                }
              }
              break;
            case 'locale':
              if (options.onLocaleChange) {
                options.onLocaleChange(event.data.data);
              }
              break;
            case 'settings':
              if (options.onSettingsChange) {
                options.onSettingsChange(event.data.data);
              }
              break;
            case 'structure':
              if (options.onStructureChange) {
                options.onStructureChange(event.data.data);
              }
              break;
            case 'reload':
              window?.location.reload();
              break;
          }
        }
      });
    }
  }

  return {
    jms,
    bindToEditor,
    applyParams,
  }
}