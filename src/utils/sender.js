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
      xhr.onprogress = this._updateProgress.bind(this)
      xhr.onerror = (err) => {
        reject(`Error: ${err.target.status}`)
      }
      xhr.onload = (ev) => {
        console.log('ev', ev)
        if (ev.target.status === 200) {
          const res = JSON.parse(ev.target.response)
          this._id = res.id
          this._owner = res.owner
          console.log(this)
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
        return this._sendStreamFile()
      default:
        throw Error('Wrong type to send')
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _sendStreamFile() {
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

  sendAuthFile(authTag) {
    console.log(authTag, this)
  }
}
