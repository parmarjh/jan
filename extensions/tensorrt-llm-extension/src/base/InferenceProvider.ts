import {
  BaseExtension,
  events,
  Model,
  joinPath,
  getJanDataFolderPath,
  fs,
  ModelEvent,
} from '@janhq/core'

/**
 * Base Inference Provider
 * Applicable to all inference providers
 */
export abstract class InferenceProvider extends BaseExtension {
  // The inference engine
  abstract provider: string
  // The model folder
  modelFolder: string = 'models'

  abstract models(): Model[]

  /**
   * On extension load, subscribe to events.
   */
  onLoad() {
    this.prePopulateModels()
  }

  /**
   * Pre-populate models to App Data Folder
   */
  private prePopulateModels() {
    const models = this.models()
    const prePoluateOperations = models.map((model) =>
      getJanDataFolderPath()
        .then((janDataFolder) =>
          // Attempt to create the model folder
          joinPath([janDataFolder, this.modelFolder, model.id]).then((path) =>
            fs
              .mkdirSync(path)
              .catch()
              .then(() => path)
          )
        )
        .then((path) => joinPath([path, 'model.json']))
        .then((path) => {
          // Do not overwite existing model.json
          return fs.existsSync(path).then((exist: any) => {
            if (!exist)
              return fs.writeFileSync(path, JSON.stringify(model, null, 2))
          })
        })
        .catch((e: Error) => {})
    )
    Promise.all(prePoluateOperations).then(() =>
      // Emit event to update models
      // So the UI can update the models list
      events.emit(ModelEvent.OnModelsUpdate, {})
    )
  }
}
