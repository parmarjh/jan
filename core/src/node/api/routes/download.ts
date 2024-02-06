import { DownloadRoute } from '../../../api'
import { join } from 'path'
import { DownloadManager, DownloadProperties } from '../../download'
import { HttpServer } from '../HttpServer'
import { createWriteStream } from 'fs'
import { getJanDataFolderPath } from '../../utils'
import { normalizeFilePath } from '../../path'

export const downloadRouter = async (app: HttpServer) => {
  app.get(`/${DownloadRoute.getDownloadProgress}/:modelId`, async (req, res) => {
    const modelId = req.params.modelId

    console.debug(`Getting download progress for model ${modelId}`)
    console.debug(
      `All Download progress: ${JSON.stringify(DownloadManager.instance.downloadProgressMap)}`
    )

    // check if null DownloadManager.instance.downloadProgressMap
    if (!DownloadManager.instance.downloadProgressMap[modelId]) {
      return res.status(200).send({ message: 'Download progress not found' })
    } else {
      return res.status(200).send(DownloadManager.instance.downloadProgressMap[modelId])
    }
  })

  app.post(`/${DownloadRoute.downloadFile}`, async (req, res) => {
    const strictSSL = !(req.query.ignoreSSL === 'true')
    const proxy = req.query.proxy?.startsWith('http') ? req.query.proxy : undefined
    const body = JSON.parse(req.body as any)
    const normalizedArgs = body.map((arg: any) => {
      if (typeof arg === 'string' && arg.startsWith('file:')) {
        return join(getJanDataFolderPath(), normalizeFilePath(arg))
      }
      return arg
    })

    const localPath = normalizedArgs[1]
    const array = localPath.split('/')
    const filename = array.pop() ?? ''
    const modelId = array.pop() ?? ''
    console.debug('downloadFile', normalizedArgs, filename, modelId)

    const request = require('request')
    const progress = require('request-progress')

    const rq = request({ url: normalizedArgs[0], strictSSL, proxy })
    progress(rq, {})
      .on('progress', function (state: any) {
        const downloadState: DownloadProperties = {
          ...state,
          modelId,
          filename,
          downloadState: 'downloading',
        }
        console.debug('download onProgress', downloadState)
        DownloadManager.instance.downloadProgressMap[modelId] = downloadState
      })
      .on('error', function (err: Error) {
        console.debug(`download onError ${modelId}`, err)

        const currentDownloadState = DownloadManager.instance.downloadProgressMap[modelId]
        if (currentDownloadState) {
          DownloadManager.instance.downloadProgressMap[modelId] = {
            ...currentDownloadState,
            downloadState: 'error',
          }
        }
      })
      .on('end', function () {
        console.debug(`download onEnd ${modelId}`)

        const currentDownloadState = DownloadManager.instance.downloadProgressMap[modelId]
        if (currentDownloadState) {
          DownloadManager.instance.downloadProgressMap[modelId] = {
            ...currentDownloadState,
            downloadState: 'end',
          }
        }
      })
      .pipe(createWriteStream(normalizedArgs[1]))

    DownloadManager.instance.setRequest(filename, rq)
  })

  app.post(`/${DownloadRoute.abortDownload}`, async (req, res) => {
    const body = JSON.parse(req.body as any)
    const normalizedArgs = body.map((arg: any) => {
      if (typeof arg === 'string' && arg.startsWith('file:')) {
        return join(getJanDataFolderPath(), normalizeFilePath(arg))
      }
      return arg
    })

    const localPath = normalizedArgs[0]
    const fileName = localPath.split('/').pop() ?? ''
    const rq = DownloadManager.instance.networkRequests[fileName]
    DownloadManager.instance.networkRequests[fileName] = undefined
    rq?.abort()
  })
}
