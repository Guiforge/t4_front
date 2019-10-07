/* eslint-disable no-underscore-dangle */
import zlib from 'zlib'
import zipFiles from './tar'
import KeysConstruct from './keys'
import encrypt from './encrypt'
import Sender from '../utils/sender'

// /**
// * A nodejs stream using a worker as source.
// * @see the SourceWrapper in http://nodejs.org/api/stream.html
// * @constructor
// * @param {StreamHelper} helper the helper wrapping the worker
// * @param {Object} options the nodejs stream options
// * @param {Function} updateCb the update callback.
// */
export default class processData {
  constructor(options, onProgress) {
    this.onProgress = onProgress
    this.keys = new KeysConstruct()
    this._sender = new Sender(undefined, this.onProgress)
    this.opt = {
      days: 1,
      down: 1,
    }
    if (options) {
      this.opt.days = options.days
      this.opt.down = options.down
    }
    // this.data = this.dataCreator()
  }

  getIdFile() {
    return this._sender._id
  }

  async processMeta() {
    /*
    meta: {
      enc: {enc: } { filesName: this.files, ivFiles: ivFiles } //encrypt data
      ivMeta:
      keyAuth
      options
    }
    */
    const meta = {
      enc: { filesName: this.files, ivFiles: this.keys.getIvFile() },
      ivMeta: this.keys.getIvMeta(),
      keyAuth: await this.keys.getKeyAuth(),
      days: this.opt.days,
      down: this.opt.down,
    }
    const keyMeta = await this.keys.getKeyMeta()
    const ivMeta = this.keys.getIvMeta()
    meta.enc = encrypt.encryptMeta(keyMeta, ivMeta, meta.enc)
    await this._sender.send('meta', meta)
  }

  async processFile(progress, onError) {
    const streamZip = await zipFiles(this.files, progress, onError)
    const cipher = encrypt.createCipherFile(
      await this.keys.getKeyFile(),
      this.keys.getIvFile(),
    )
    const sender = await this._sender.send('file')
    const gzip = zlib.createGzip()
    streamZip
      .pipe(gzip)
      .pipe(cipher)
      .pipe(sender)

    return new Promise((resolve, reject) => {
      sender.once('finish', () => {
        this._sender
          .send('auth', cipher.getAuthTag())
          .then(() => {
            resolve()
          })
          .catch(() => {
            reject()
          })
      })
    })
  }

  getError() {
    return this._sender.error
  }

  async launch(files, owner, onError) {
    this.files = files
    this._sender.owner = owner
    await this.processMeta()
    await this.processFile(this.onProgress, onError)
  }
}
