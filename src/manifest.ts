// manifest.ts
import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  description: packageData.description,
  version: packageData.version,
  manifest_version: 3,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-32.png',
    128: 'img/logo.png',
  },
  action: {
    default_title: "Flight Incidents",
    default_popup: 'popup.html',
    default_icon: 'img/logo.png',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://www.google.com/travel/flights/*'],
      js: ['src/contentScript/index.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-32.png', 'img/logo.png'],
      matches: [],
    },
  ],
  permissions: ['storage'],
  // chrome_url_overrides: {
  //   newtab: 'newtab.html',
  // },
})
