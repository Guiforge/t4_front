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
  constructor() {
    this.keys = new KeysConstruct()
    this._sender = new Sender()
    // this.data = this.dataCreator()
  }

  async processMeta() {
    /*
    meta: {
      enc: { filesName: this.files, ivFiles: ivFiles } //encrypt data
      ivMeta:
      keyAuth
      options
    }
    */
    const meta = {
      enc: { filesName: this.files, ivFiles: this.keys.getIvFile() },
      ivMeta: this.keys.getIvMeta(),
      keyAuth: await this.keys.getKeyAuth(),
      options: this.options,
    }
    const keyMeta = await this.keys.getKeyMeta()
    const ivMeta = this.keys.getIvMeta()
    meta.enc = encrypt.encryptMeta(keyMeta, ivMeta, meta.enc)
    console.log(encrypt.decryptMeta(keyMeta, ivMeta, meta.enc))
    this._sender.send('meta', meta)
  }

  async processFile() {
    const streamZip = await zipFiles(this.files)
    const cipher = encrypt.createCipherFile(
      await this.keys.getKeyFile(),
      this.keys.getIvFile(),
    )
    const sender = await this._sender.send('file')
    streamZip.pipe(cipher).pipe(sender)
    cipher.final()
    this._sender.sendAuthFile(cipher.getAuthTag())
  }

  async launch(files) {
    this.files = files
    await this.processMeta()
    await this.processFile()
  }
}
