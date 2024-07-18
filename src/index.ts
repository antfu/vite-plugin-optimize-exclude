import type { Plugin } from 'vite'
import { scanPackagesList } from './scan'

function OptimizeExclude(): Plugin {
  return {
    name: 'vite-plugin-optimize-exclude',
    enforce: 'post',
    async config(config) {
      const result = await scanPackagesList()
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
