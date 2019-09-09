/* eslint-disable no-underscore-dangle */
import io from 'socket.io-client'
import { Writable } from 'readable-stream'
import util from 'util'

// import getUrl from '../utils/getUrl'

function _onNothing() {}

export default class Sender {
  constructor(onProgress, onError) {
    this.onProgress = onProgress || _onNothing
    this.onError = onError || _onNothing
    this.error = false
  }

  _initlistener() {
    this._socketClient.on('error', (error) => {
      console.log('error socket', error)
      this.onError(error)
      this.error = error || 'error'
    })
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
      this._socketClient = io.connect(`${process.env.API_URL}`)
      this._socketClient.emit('meta', meta)
      this._socketClient.once('error', reject)
      this._socketClient.once('meta', (ret) => {
        this._owner = ret.owner
        this._id = ret.id
        this._socketClient.removeEventListener('error', reject)
        resolve()
      })

      // const xhr = new XMLHttpRequest()
      // xhr.onprogress = this._updateProgress.bind(this)
      // xhr.onerror = (err) => {
      //   reject(`Error: ${err.target.status}`)
      // }
      // xhr.onload = (ev) => {
      //   if (ev.target.status === 200) {
      //     const res = JSON.parse(ev.target.response)
      //     this._id = res.id
      //     this._owner = res.owner
      //     resolve({ id: this._id, owner: this._owner })
      //   } else {
      //     reject('Unable to send Meta')
      //   }
      // }
      // xhr.open('POST', getUrl.uploadMeta(), true)
      // xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
      // xhr.send(JSON.stringify(meta))
    })
  }

  async send(type, data) {
    if (this.error) {
      throw Error(this.error)
    }
    switch (type) {
      case 'meta':
        return this._senderMeta(data)
      case 'file':
        return this._sendStreamFile()
      case 'auth':
        await this._sendAuthFile(data)
        this._socketClient.close()
        return 'Ok'
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
      this._socketClient.emit('chunk', chunk)
      callback()
    }
    return new Sink()
  }

  async _sendAuthFile(authTag) {
    return new Promise((resolve, reject) => {
      this._socketClient.emit('authTag', authTag)
      this._socketClient.once('error', reject)

      this._socketClient.once('authTag', () => {
        this._socketClient.removeEventListener('error', reject)
        console.log('sendAuthfile OK !!')
        resolve()
      })
    })

    // return new Promise((resolve, reject) => {
    //   const xhr = new XMLHttpRequest()
    //   xhr.onprogress = this._updateProgress.bind(this)
    //   xhr.onerror = (err) => {
    //     reject(`Error: ${err.target.status}`)
    //   }
    //   xhr.onload = (ev) => {
    //     if (ev.target.status === 200) {
    //       resolve('OK')
    //     } else {
    //       reject('Unable to send Meta')
    //     }
    //   }
    //   xhr.open('PUT', getUrl.uploadAuthTag(this._id), true)
    //   xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    //   xhr.send(JSON.stringify({ authTag, owner: this._owner }))
    // })
  }
}
