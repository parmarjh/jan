/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'

import { ScrollArea } from '@janhq/uikit'
import { motion as m } from 'framer-motion'

import { twMerge } from 'tailwind-merge'

import Advanced from '@/screens/Settings/Advanced'
import AppearanceOptions from '@/screens/Settings/Appearance'
import PluginCatalog from '@/screens/Settings/CorePlugins/PluginsCatalog'
import PreferencePlugins from '@/screens/Settings/CorePlugins/PreferencePlugins'

import { formatPluginsName } from '@/utils/converter'

const SettingsScreen = () => {
  const [activeStaticMenu, setActiveStaticMenu] = useState('Appearance')
  const [menus, setMenus] = useState<any[]>([])
  const [preferenceItems, setPreferenceItems] = useState<any[]>([])
  const [preferenceValues, setPreferenceValues] = useState<any[]>([])

  useEffect(() => {
    const menu = ['Appearance']

    if (typeof window !== 'undefined' && window.electronAPI) {
      menu.push('Core Plugins')
    }
    menu.push('Advanced')
    setMenus(menu)
  }, [])

  /**
   * Fetches the active plugins and their preferences from the `plugins` and `preferences` modules.
   * If the `experimentComponent` extension point is available, it executes the extension point and
   * appends the returned components to the `experimentRef` element.
   * If the `PluginPreferences` extension point is available, it executes the extension point and
   * fetches the preferences for each plugin using the `preferences.get` function.
   */
  useEffect(() => {
    const getActivePluginPreferences = async () => {
      // setPreferenceItems(Array.isArray(data) ? data : [])
      // TODO: Add back with new preferences mechanism
      // Promise.all(
      //   (Array.isArray(data) ? data : []).map((e) =>
      //     preferences
      //       .get(e.pluginName, e.preferenceKey)
      //       .then((k) => ({ key: e.preferenceKey, value: k }))
      //   )
      // ).then((data) => {
      //   setPreferenceValues(data)
      // })
    }
    getActivePluginPreferences()
  }, [])

  const preferencePlugins = preferenceItems
    .map((x) => x.pluginName)
    .filter((x, i) => {
      //     return prefere/nceItems.map((x) => x.pluginName).indexOf(x) === i
    })

  const [activePreferencePlugin, setActivePreferencePlugin] = useState('')

  const handleShowOptions = (menu: string) => {
    switch (menu) {
      case 'Core Plugins':
        return <PluginCatalog />

      case 'Appearance':
        return <AppearanceOptions />

      case 'Advanced':
        return <Advanced />

      default:
        return (
          <PreferencePlugins
            pluginName={menu}
            preferenceItems={preferenceItems}
            preferenceValues={preferenceValues}
          />
        )
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex h-full w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-border">
        <ScrollArea className="h-full w-full">
          <div className="p-4">
            <div className="flex-shrink-0">
              <label className="font-bold uppercase text-muted-foreground">
                Options
              </label>
              <div className="mt-2 font-medium">
                {menus.map((menu, i) => {
                  const isActive = activeStaticMenu === menu
                  return (
                    <div key={i} className="relative my-0.5 block py-1.5">
                      <div
                        onClick={() => {
                          setActiveStaticMenu(menu)
                          setActivePreferencePlugin('')
                        }}
                        className="block w-full cursor-pointer"
                      >
                        <span className={twMerge(isActive && 'relative z-10')}>
                          {menu}
                        </span>
                      </div>
                      {isActive && (
                        <m.div
                          className="absolute inset-0 -left-3 h-full w-[calc(100%+24px)] rounded-md bg-primary/50"
                          layoutId="active-static-menu"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 flex-shrink-0">
              {preferencePlugins.length > 0 && (
                <label className="font-bold uppercase text-muted-foreground">
                  Core plugins
                </label>
              )}
              <div className="mt-2 font-medium">
                {preferencePlugins.map((menu, i) => {
                  const isActive = activePreferencePlugin === menu
                  return (
                    <div key={i} className="relative my-0.5 block py-1.5">
                      <div
                        onClick={() => {
                          setActivePreferencePlugin(menu)
                          setActiveStaticMenu('')
                        }}
                        className="block w-full cursor-pointer"
                      >
                        <span
                          className={twMerge(
                            'capitalize',
                            isActive && 'relative z-10'
                          )}
                        >
                          {formatPluginsName(String(menu))}
                        </span>
                      </div>
                      {isActive ? (
                        <m.div
                          className="absolute inset-0 -left-3 h-full w-[calc(100%+24px)] rounded-md bg-primary/50"
                          layoutId="active-static-menu"
                        />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="h-full w-full bg-background/50">
        <ScrollArea className="h-full w-full">
          <div className="p-4">
            {handleShowOptions(activeStaticMenu || activePreferencePlugin)}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default SettingsScreen
