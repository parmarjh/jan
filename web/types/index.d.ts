/* eslint-disable @typescript-eslint/no-explicit-any */
export {}

declare global {
  declare const PLUGIN_CATALOG: string
  declare const VERSION: string
  interface Window {
    core?: any | undefined
    electronAPI?: any | undefined
  }
}
