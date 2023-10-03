"use client";
import { useEffect, useRef, useState } from "react";
import {
  setup,
  plugins,
  extensionPoints,
  activationPoints,
} from "@/../../electron/core/plugin-manager/execution/index";
import {
  ChartPieIcon,
  CommandLineIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";

import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";

/* eslint-disable @next/next/no-sync-scripts */
export const Preferences = () => {
  const [search, setSearch] = useState<string>("");
  const [activePlugins, setActivePlugins] = useState<any[]>([]);
  const [isTestAvailable, setIsTestAvailable] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  };

  const preferenceRef = useRef(null);
  useEffect(() => {
    async function setupPE() {
      // Enable activation point management
      setup({
        //@ts-ignore
        importer: (plugin) =>
          import(/* webpackIgnore: true */ plugin).catch((err) => {
            console.log(err);
          }),
      });

      // Register all active plugins with their activation points
      await plugins.registerActive();
    }

    const activePlugins = async () => {
      const plgs = await plugins.getActive();
      setActivePlugins(plgs);
      // Activate alls
      setTimeout(async () => {
        await activationPoints.trigger("init");
        if (extensionPoints.get("experimentComponent")) {
          const components = await Promise.all(
            extensionPoints.execute("experimentComponent")
          );
          if (components.length > 0) {
            setIsTestAvailable(true);
          }
          components.forEach((e) => {
            if (preferenceRef.current) {
              // @ts-ignore
              preferenceRef.current.appendChild(e);
            }
          });
        }
      }, 500);
    };
    setupPE().then(() => activePlugins());
  }, []);

  // Install a new plugin on clicking the install button
  const install = async (e: any) => {
    e.preventDefault();
    //@ts-ignore
    const pluginFile = new FormData(e.target).get("plugin-file").path;

    // Send the filename of the to be installed plugin
    // to the main process for installation
    const installed = await plugins.install([pluginFile]);
    if (installed) window.electronAPI.relaunch();
  };

  // Uninstall a plugin on clicking uninstall
  const uninstall = async (name: string) => {
    //@ts-ignore

    // Send the filename of the to be uninstalled plugin
    // to the main process for removal
    //@ts-ignore
    const res = await plugins.uninstall([name]);
    console.log(
      res
        ? "Plugin successfully uninstalled"
        : "Plugin could not be uninstalled"
    );
    if (res) window.electronAPI.relaunch();
  };

  // Update all plugins on clicking update plugins
  const update = async (plugin: string) => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      await window.pluggableElectronIpc.update([plugin], true);
      window.electronAPI.relaunch();
    }
    // plugins.update(active.map((plg) => plg.name));
  };

  return (
    <div className="w-full h-screen overflow-scroll">
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white shadow-sm sm:gap-x-6 sm:px-6 px-8">
        {/* Separator */}
        <div className="h-6 w-px bg-gray-900/10 hidden" aria-hidden="true" />

        <div className="flex flex-1 self-stretch gap-x-6">
          <form className="relative flex flex-1" action="#" method="GET">
            <label htmlFor="search-field" className="sr-only">
              Search
            </label>
            <MagnifyingGlassIcon
              className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
              aria-hidden="true"
            />
            <input
              defaultValue={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-field"
              className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              placeholder="Search..."
              type="search"
              name="search"
            />
          </form>
        </div>
      </div>

      <main className="py-5">
        <div className="sm:px-6 px-8">
          {/* Content */}
          <div className="flex flex-row items-center my-4">
            <ChartPieIcon width={30} />
            Install Plugin
          </div>
          <form id="plugin-file" onSubmit={install}>
            <div className="flex flex-row items-center space-x-10">
              <div className="flex items-center justify-center w-[300px]">
                <label className="h-[120px] flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                  {!fileName ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        TGZ (MAX 50MB)
                      </p>
                    </div>
                  ) : (
                    <>{fileName}</>
                  )}
                  <input
                    id="dropzone-file"
                    name="plugin-file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className={classNames(
                  "rounded-md px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
                  fileName ? "bg-indigo-600 hover:bg-indigo-500" : "bg-gray-500"
                )}
              >
                Install Plugin
              </button>
            </div>
          </form>

          <div className="flex flex-row items-center my-4">
            <CommandLineIcon width={30} />
            Installed Plugins
          </div>
          <div className="grid grid-cols-2 items-stretch gap-4">
            {activePlugins
              .filter(
                (e) =>
                  search.trim() === "" ||
                  e.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((e) => (
                <div
                  key={e.name}
                  className="flex flex-col h-full p-6 bg-white border border-gray-200 rounded-sm dark:border-gray-300"
                >
                  <div className="flex flex-row space-x-2 items-center">
                    <span className="relative inline-block mt-1">
                      <img
                        className="h-14 w-14 rounded-md"
                        src={e.icon ?? "icons/app_icon.svg"}
                        alt=""
                      />
                    </span>
                    <div className="flex flex-col">
                      <p className="text-xl font-bold tracking-tight text-gray-900 dark:text-white capitalize">
                        {e.name.replaceAll("-", " ")}
                      </p>
                      <p className="font-normal text-gray-700 dark:text-gray-400">
                        Version: {e.version}
                      </p>
                    </div>
                  </div>

                  <p className="flex-1 mt-2 text-sm font-normal text-gray-500 dark:text-gray-400 w-full">
                    {e.description ?? "Jan's Plugin"}
                  </p>
                  <div className="flex flex-row space-x-5">
                    <button
                      type="submit"
                      onClick={() => {
                        uninstall(e.name);
                      }}
                      className="mt-5 rounded-md bg-red-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      Uninstall
                    </button>
                    <button
                      type="submit"
                      onClick={() => {
                        update(e.name);
                      }}
                      className="mt-5 rounded-md bg-blue-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
          </div>
          {activePlugins.length > 0 && isTestAvailable && (
            <div className="flex flex-row items-center my-4">
              <PlayIcon width={30} />
              Test Plugins
            </div>
          )}
          <div className="h-full w-full" ref={preferenceRef}></div>
          {/* Content */}
        </div>
      </main>
    </div>
  );
};
