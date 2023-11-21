import { PluginType, fs, downloadFile, abortDownload } from '@janhq/core'
import { ModelPlugin } from '@janhq/core/lib/plugins'
import { Model, ModelCatalog } from '@janhq/core/lib/types'
import { parseToModel } from './helpers/modelParser'
import { join } from 'path'

/**
 * A plugin for managing machine learning models.
 */
export default class JanModelPlugin implements ModelPlugin {
  private static readonly _homeDir = 'models'
  private static readonly _modelMetadataFileName = 'model.json'

  /**
   * Implements type from JanPlugin.
   * @override
   * @returns The type of the plugin.
   */
  type(): PluginType {
    return PluginType.Model
  }

  /**
   * Called when the plugin is loaded.
   * @override
   */
  onLoad(): void {
    /**  Cloud Native
     * TODO: Fetch all downloading progresses?
     **/
    fs.mkdir(JanModelPlugin._homeDir)
  }

  /**
   * Called when the plugin is unloaded.
   * @override
   */
  onUnload(): void {}

  /**
   * Downloads a machine learning model.
   * @param model - The model to download.
   * @returns A Promise that resolves when the model is downloaded.
   */
  async downloadModel(model: Model): Promise<void> {
    // create corresponding directory
    const directoryPath = join(JanModelPlugin._homeDir, model.id)
    await fs.mkdir(directoryPath)

    // path to model binary
    const path = join(directoryPath, model.id)
    downloadFile(model.source_url, path)
  }

  /**
   * Cancels the download of a specific machine learning model.
   * @param {string} modelId - The ID of the model whose download is to be cancelled.
   * @returns {Promise<void>} A promise that resolves when the download has been cancelled.
   */
  async cancelModelDownload(name: string, modelId: string): Promise<void> {
    return abortDownload(join(JanModelPlugin._homeDir, name, modelId)).then(
      () => {
        fs.deleteFile(join(JanModelPlugin._homeDir, name, modelId))
      }
    )
  }

  /**
   * Deletes a machine learning model.
   * @param filePath - The path to the model file to delete.
   * @returns A Promise that resolves when the model is deleted.
   */
  async deleteModel(modelId: string): Promise<void> {
    try {
      const dirPath = join(JanModelPlugin._homeDir, modelId)
      await fs.rmdir(dirPath)
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Saves a machine learning model.
   * @param model - The model to save.
   * @returns A Promise that resolves when the model is saved.
   */
  async saveModel(model: Model): Promise<void> {
    const jsonFilePath = join(
      JanModelPlugin._homeDir,
      model.id,
      JanModelPlugin._modelMetadataFileName
    )

    try {
      await fs.writeFile(jsonFilePath, JSON.stringify(model, null, 2))
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Gets all downloaded models.
   * @returns A Promise that resolves with an array of all models.
   */
  async getDownloadedModels(): Promise<Model[]> {
    const results: Model[] = []
    const allDirs: string[] = await fs.listFiles(JanModelPlugin._homeDir)
    for (const dir of allDirs) {
      const modelDirPath = join(JanModelPlugin._homeDir, dir)
      const isModelDir = await fs.isDirectory(modelDirPath)
      if (!isModelDir) {
        // if not a directory, ignore
        continue
      }

      const jsonFiles: string[] = (await fs.listFiles(modelDirPath)).filter(
        (fileName: string) => fileName === JanModelPlugin._modelMetadataFileName
      )

      for (const json of jsonFiles) {
        const model: Model = JSON.parse(
          await fs.readFile(join(modelDirPath, json))
        )
        results.push(model)
      }
    }

    return results
  }

  /**
   * Gets all available models.
   * @returns A Promise that resolves with an array of all models.
   */
  getConfiguredModels(): Promise<ModelCatalog[]> {
    // Add a timestamp to the URL to prevent caching
    return import(
      /* webpackIgnore: true */ MODEL_CATALOG_URL + `?t=${Date.now()}`
    ).then((module) => module.default.map((e) => parseToModel(e)))
  }
}
