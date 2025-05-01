import { JmsOptions, JmsOptionsWithDefaults, JmsContext, JmsSection, JmsSettings, JmsStructure, JmsFile, defaultSettings, defaultStructure } from "./interfaces";

let initialized = false;

export function useJsonMs() {
  const bindToEditor = <D, S = string, L = string>(options: JmsOptions<D, S, L> = {}) => {
    if (!initialized && typeof window !== 'undefined' && window.self !== window.top) {
      initialized = true;
      options.targetOrigin = options.targetOrigin ?? '*';

      window.parent.postMessage({name: 'jsonms', type: 'init'}, options.targetOrigin);
      window.addEventListener('message', event => {
        if (event.data.name === 'jsonms') {
          switch (event.data.type) {
            case 'init':
              const init = JSON.parse(event.data.data);
              if (options.onSectionInit instanceof Function) {
                options.onSectionInit(init.section);
              }
              if (options.onLocaleInit instanceof Function) {
                options.onLocaleInit(init.locale);
              }
              if (options.onSettingsInit instanceof Function) {
                options.onSettingsInit(init.settings);
              }
              if (options.onStructureInit instanceof Function) {
                options.onStructureInit(init.structure);
              }
              break;
            case 'data':
              if (options.onDataChange instanceof Function) {
                const data = JSON.parse(event.data.data);
                options.onDataChange(data);
              }
              break;
            case 'section':
              if (options.onSectionChange instanceof Function) {
                try {
                  const section = JSON.parse(event.data.data);
                  options.onSectionChange(section);
                } catch (e) {
                  console.error(e);
                }
              }
              break;
            case 'locale':
              if (options.onLocaleChange instanceof Function) {
                const locale = event.data.data;
                options.onLocaleChange(locale);
              }
              break;
            case 'settings':
              const settings = JSON.parse(event.data.data);
              if (options.onSettingsChange instanceof Function) {
                options.onSettingsChange(settings);
              }
              break;
            case 'structure':
              if (options.onStructureChange instanceof Function) {
                const structure = JSON.parse(event.data.data);
                options.onStructureChange(structure);
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
    bindToEditor,
  }
}

export const getFilePath = (file: JmsFile | null = { path: null, meta: {} }, settings: JmsSettings = defaultSettings): string => {
  if (file === null) {
    return settings.publicUrl;
  }
  if (typeof file.path === 'string' && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  return settings.publicUrl + file.path;
}

export async function fetchContext<D, S, L>(publicUrl: string, hash: string, secretApiKey: string): Promise<JmsContext<D, S, L>> {
  return await fetch(`${publicUrl}/data/${hash}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'X-Jms-Api-Key': secretApiKey,
    },
  }).then(response => response.json())
}

export function getFallbackLocale(defaultLocale: string = 'en-US', lengthLimit = 255): string {
  if (navigator.languages && navigator.languages.length > 0) {
    return navigator.languages[0].substring(0, lengthLimit);
  } else if (navigator.language) {
    return navigator.language.substring(0, lengthLimit);
  }
  return defaultLocale;
}

export {
  JmsSection,
  JmsSettings,
  JmsStructure,
  JmsOptions,
  JmsOptionsWithDefaults,
  JmsContext,
  JmsFile,
  defaultSettings,
  defaultStructure,
}