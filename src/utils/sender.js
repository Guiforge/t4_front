/* eslint-disable no-underscore-dangle */
import { Writable } from 'readable-stream'
import util from 'util'

import getUrl from '../utils/getUrl'

function _onNothing() {}

export default class Sender {
  constructor(onProgress, onError) {
    this.onProgress = onProgress || _onNothing
    this.onError = onError || _onNothing
  }
  _updateProgress(oEvent) {
    if (oEvent.lengthComputable) {
      const percentComplete = (oEvent.loaded / oEvent.total) * 100
      this.onProgress('Meta', percentComplete)
    } else {
      this.onProgress('Meta: impossible to handle %', 0)
    }
  }
  async _senderMeta(meta) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.onprogress = this._updateProgress

      xhr.onerror = (err) => {
        reject(`Error: ${err.target.status}`)
      }

      xhr.onload = (ev) => {
        if (ev.target.status === 200) {
          this._id = JSON.parse(ev.target.response).id
          resolve(this._id)
        } else {
          reject('Unable to send Meta')
        }
      }
      xhr.open('POST', getUrl.uploadMeta(), true)
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      xhr.send(JSON.stringify(meta))
    })
  }
  async send(type, data) {
    switch (type) {
      case 'meta':
        return this._senderMeta(data)
      case 'file':
        return console.log('file Send')
      // return this._senderMeta(data)
      default:
        throw Error('Wrong type to send')
    }
  }

  // eslint-disable-next-line class-methods-use-this
  sendStreamFile() {
    function Sink(options) {
      Writable.call(this, options)
    }

    util.inherits(Sink, Writable)

    Sink.prototype._write = (chunk, encoding, callback) => {
      console.log('SINK', chunk.length)
      callback()
    }
    return new Sink()
  }
}
