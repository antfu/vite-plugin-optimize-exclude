import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'

export async function scanNodeModules(
  root = process.cwd(),
): Promise<Map<string, string>> {
  const nodeModulesPath = join(root, 'node_modules')

  const found = new Map<string, string>()

  function add(name: string, path: string): void {
    const full = join(path, 'package.json')
    if (existsSync(full))
      found.set(name, full)
  }

  async function scanDir(dir: string, prefix = ''): Promise<void> {
    const paths = await fs.readdir(dir, { withFileTypes: true })
    for (const path of paths) {
      if (path.name.startsWith('.'))
        continue
      if (path.name.startsWith('@') && !prefix)
        await scanDir(join(dir, path.name), `${path.name}/`)
      else
        add(prefix + path.name, join(dir, path.name))
    }
  }

  await scanDir(nodeModulesPath)
  return found
}

export async function isNativeESM(packageJsonPath: string): Promise<boolean> {
  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
    if (packageJson.type === 'module')
      return true

    if (typeof packageJson.exports === 'object') {
      if (typeof packageJson.exports['.']?.import === 'string')
        return true
    }

    return false
  }
  catch {
    return false
  }
}

export async function scanPackagesList(): Promise<{
  esm: Set<string>
  nonEsm: Set<string>
}> {
  const packages = await scanNodeModules()

  const esm = new Set<string>()
  const nonEsm = new Set<string>()

  await Promise.all([...packages.entries()].map(
    async ([name, path]) => {
      if (await isNativeESM(path))
        esm.add(name)
      else
        nonEsm.add(name)
    },
  ))

  return {
    esm,
    nonEsm,
  }
}
