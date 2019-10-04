/* eslint-disable no-underscore-dangle */
import io from 'socket.io-client'
import { Writable } from 'readable-stream'
import util from 'util'

// import getUrl from '../utils/getUrl'

function _onNothing() {}
const MAX_ATTEMPT = 5

export default class Sender {
  constructor(owner, onProgress) {
    this.onProgress = onProgress || _onNothing
    this.error = false
    this.owner = owner
    this._rejectCurrent = undefined
  }
  _initlistener() {
    this._socketClient.on('error', (error) => {
      this.error = error || 'error'
      if (this._rejectCurrent) {
        this._rejectCurrent()
      }
    })
    this._socketClient.on('connect_error', () => {
      this.error = 'connect to server error'
      if (this._attempt === MAX_ATTEMPT) {
        if (this._rejectCurrent) {
          this._rejectCurrent()
        }
      }
    })
    this._socketClient.on('reconnect_attempt', (attempt) => {
      this._attempt = attempt
    })
  }
  _updateProgress(oEvent) {
    if (oEvent.lengthComputable) {
      const percentComplete = (oEvent.loaded / oEvent.total) * 100
      this.onProgress('Meta', percentComplete)
    } else {
      this.onProgress('Meta: impossible to handle', 0)
    }
  }

  async _senderMeta(meta) {
    // eslint-disable-next-line no-param-reassign
    meta.owner = this.owner
    return new Promise((resolve, reject) => {
      this._rejectCurrent = reject
      this._socketClient = io(`${process.env.API_URL}`, {
        reconnection: true,
        reconnectionDelay: 200,
        reconnectionDelayMax: 500,
        reconnectionAttempts: MAX_ATTEMPT,
      })
      this._initlistener()
      this._socketClient.emit('meta', meta)
      this._socketClient.once('error', reject)
      this._socketClient.once('meta', (ret) => {
        this._id = ret.id
        this._socketClient.removeEventListener('error', reject)
        this._rejectCurrent = undefined
        resolve()
      })
    })
  }

  async send(type, data) {
    if (this.error && type !== 'meta') {
      throw Error(this.error)
    }
    switch (type) {
      case 'meta':
        this._attempt = 0
        this.error = undefined
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
      this._socketClient.emit('chunk', chunk)
      callback()
    }
    return new Sink()
  }

  async _sendAuthFile(authTag) {
    return new Promise((resolve, reject) => {
      this._rejectCurrent = reject
      this._socketClient.emit('authTag', authTag)
      this._socketClient.once('error', reject)

      this._socketClient.once('authTag', () => {
        this._socketClient.removeEventListener('error', reject)
        this._rejectCurrent = undefined
        resolve()
      })
    })
  }
}
