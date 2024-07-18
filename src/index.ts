/* eslint-disable no-console */
import type { Plugin } from 'vite'
import { scanPackagesList } from './scan'

export interface OptimizeExcludeOptions {
  debug?: boolean
}

function OptimizeExclude(options: OptimizeExcludeOptions = {}): Plugin {
  return {
    name: 'vite-plugin-optimize-exclude',
    enforce: 'post',
    async config(config) {
      const result = await scanPackagesList()

      if (options.debug) {
        console.debug('[Optimize Exclude] ESM packages:')
        console.debug([...result.esm].map(i => `  ${i}`).join('\n'))
        console.debug('[Optimize Exclude] Non-ESM packages:')
        console.debug([...result.nonEsm].map(i => `  ${i}`).join('\n'))
      }
      const exclude = [...result.esm]
        .filter(name => !config.optimizeDeps?.include?.includes(name))

      return {
        optimizeDeps: {
          exclude,
        },
      }
    },
  }
}

export default OptimizeExclude
