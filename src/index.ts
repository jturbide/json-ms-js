export interface JmsSection<N> {
  name: N,
  paths: string[],
}

type SizeUnit = 'B' | 'K' | 'M' | 'G' | 'T';
export interface JmsSettings {
  postMaxSize: `${number}${SizeUnit}`
  publicUrl: string,
  supportedFeatures: string[],
  uploadMaxSize: `${number}${SizeUnit}`
  version: `${number}.${number}.${number}`
}

export const defaultSettings: JmsSettings = {
  postMaxSize: '2M',
  publicUrl: window.location.origin,
  supportedFeatures: [],
  uploadMaxSize: '2M',
  version: '1.0.0',
}

export function useJsonMs() {

  const state = {
    data: {},
    locale: null,
    settings: {},
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

  const bindToEditor = <S = string>(options: {
    targetOrigin?: string,
    onDataChange?: (data: any) => void,
    onLocaleChange?: (locale: string) => void,
    onSectionChange?: (section: JmsSection<S>) => void,
  } = {}) => {

    options.targetOrigin = options.targetOrigin ?? '*';

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
            if (options.onSectionChange) {
              options.onSectionChange(data.section);
            }
            if (options.onLocaleChange) {
              options.onLocaleChange(data.locale);
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
          case 'reload':
            window.location.reload();
            break;
        }
      }
    });
  }

  return {
    jms,
    bindToEditor,
    applyParams,
  }
}
