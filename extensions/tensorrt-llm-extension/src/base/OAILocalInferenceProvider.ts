import {
  events,
  ModelEvent,
  Model,
  executeOnMain,
  joinPath,
  getJanDataFolderPath,
} from '@janhq/core'
import { OAIInferenceProvider } from './OAIInferenceProvider'

/**
 * Base OAI Local Inference Provider
 * Added the implementation of loading and unloading model (applicable to local inference providers)
 */
export abstract class OAILocalInferenceProvider extends OAIInferenceProvider {
  // The inference engine
  loadModelFunctionName: string = 'loadModel'
  unloadModelFunctionName: string = 'unloadModel'

  /**
   * On extension load, subscribe to events.
   */
  onLoad() {
    super.onLoad()
    // These events are applicable to local inference providers
    events.on(ModelEvent.OnModelInit, (model: Model) => this.onModelInit(model))
    events.on(ModelEvent.OnModelStop, (model: Model) => this.onModelStop(model))
  }

  /**
   * Load the model.
   */
  async onModelInit(model: Model) {
    if (model.engine.toString() !== this.provider) return

    const modelFolder = await joinPath([
      await getJanDataFolderPath(),
      this.modelFolder,
      model.id,
    ])

    const res = await executeOnMain(
      this.nodeModule,
      this.loadModelFunctionName,
      {
        modelFolder,
        model,
      }
    )

    if (res?.error) {
      events.emit(ModelEvent.OnModelFail, {
        ...model,
        error: res.error,
      })
      return
    } else {
      this.loadedModel = model
      events.emit(ModelEvent.OnModelReady, model)
    }
  }
  /**
   * Stops the model.
   */
  async onModelStop(model: Model) {
    if (model.engine?.toString() !== this.provider) return

    await executeOnMain(this.nodeModule, this.unloadModelFunctionName)
    events.emit(ModelEvent.OnModelStopped, {})
  }
}