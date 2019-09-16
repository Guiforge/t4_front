/* eslint-disable no-underscore-dangle */

import zipFiles from './zip'
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
  constructor(options) {
    this.keys = new KeysConstruct()
    this._sender = new Sender()
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

  async processFile() {
    const streamZip = await zipFiles(this.files)
    const cipher = encrypt.createCipherFile(
      await this.keys.getKeyFile(),
      this.keys.getIvFile(),
    )
    const sender = await this._sender.send('file')
    streamZip.pipe(cipher).pipe(sender)

    return new Promise((resolve, reject) => {
      sender.once('finish', () => {
        cipher.final()
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

  async launch(files) {
    this.files = files
    await this.processMeta()
    await this.processFile()
  }
}
