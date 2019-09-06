/* eslint-disable no-underscore-dangle */

import zipFiles from './zip'
import KeysConstruct from './keys'
import encrypt from './encrypt'
import Sender from '../utils/sender'
// import abTools from '../utils/abTools'

// /**
// * A nodejs stream using a worker as source.
// * @see the SourceWrapper in http://nodejs.org/api/stream.html
// * @constructor
// * @param {StreamHelper} helper the helper wrapping the worker
// * @param {Object} options the nodejs stream options
// * @param {Function} updateCb the update callback.
// */
export default class processData {
  constructor(files) {
    this.files = files
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
      keyAuth: this.keys.getKeyAuth(),
      options: this.options,
    }
    const keyMeta = await this.keys.getKeyMeta()
    const ivMeta = await this.keys.getIvMeta()
    meta.enc = encrypt.encryptMeta(keyMeta, ivMeta, meta.enc)
    this._sender.send('meta', meta)
  }

  async processFile() {
    const streamZip = await zipFiles(this.files)
    const cipher = encrypt.createCipherFile()

    streamZip.pipe(cipher).pipe(this._sender.sendStreamFile())
  }

  async launch() {
    await this.processMeta()
    await this.processFile()
  }

  // async getEncrypt() {
  //   const enc = {}
  //   enc.meta = await this.encrypt.encryptMeta()
  //   enc.meta.data = abTools.ab2a(enc.meta.data)

  //   enc.meta.ivMeta = abTools.ab2a(this.encrypt.ivMeta)
  //   enc.file.ivFile = {}
  //   enc.file.ivFile = abTools.ab2a(this.encrypt.ivFile)
  //   return enc
  // }

  // async generateStream() {
  //   const streamZip = await zipFiles(this.files)
  //   function Sink(options) {
  //     Writable.call(this, options)
  //   }

  //   util.inherits(Sink, Writable)

  //   Sink.prototype._write = (chunk, encoding, callback) => {
  //     console.log('SINK', chunk.length)
  //     callback()
  //   }

  //   // const encTest = new EncryptConstruct(this.keys, {})
  //   const a = 'aes-256-gcm'
  //   const key = Buffer.alloc(32) // key should be 32 bytes
  //   const iv = Buffer.alloc(124 * 8) // iv should be 16

  //   const cipher = toto.createCipheriv(a, key, iv)
  //   streamZip.pipe(cipher).pipe(new Sink())
  //   return streamZip
  // }

  // async dataCreator() {
  //   const data = {}
  //   data.option = this.option
  //   const zipfile = await zipFiles(this.files)
  //   this.encrypt = new EncryptConstruct(
  //     this.keys,
  //     { filesName: this.files },
  //     zipfile,
  //   )
  //   data.enc = await this.getEncrypt()
  //   data.key = abTools.ab2a(await this.keys.exportKeySign())
  //   return data
  // }
}
