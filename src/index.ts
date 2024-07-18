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
        console.log('[Optimize Exclude] ESM packages:')
        console.log([...result.esm].map(i => `  ${i}`).join('\n'))
        console.log('[Optimize Exclude] Non-ESM packages:')
        console.log([...result.nonEsm].map(i => `  ${i}`).join('\n'))
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
