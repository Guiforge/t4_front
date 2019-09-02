/* eslint-disable no-underscore-dangle */
import { Transform, Writable } from 'readable-stream'
import util from 'util'

import zipFiles from '../zip-encrypt/zip'
import KeysConstruct from '../zip-encrypt/keys'
import EncryptConstruct from '../zip-encrypt/encrypt'
import abTools from '../utils/abTools'
// import { type } from 'os'

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
    // this.data = this.dataCreator()
  }

  // enc.file.data = abTools.ab2a(enc.file.data)
  // enc.file = await this.encrypt.encryptFile()

  async getEncrypt() {
    const enc = {}
    enc.meta = await this.encrypt.encryptMeta()
    enc.meta.data = abTools.ab2a(enc.meta.data)

    enc.meta.ivMeta = abTools.ab2a(this.encrypt.ivMeta)
    enc.file.ivFile = {}
    enc.file.ivFile = abTools.ab2a(this.encrypt.ivFile)
    return enc
  }

  async generateStream() {
    const streamZip = await zipFiles(this.files)

    // CreateEncryptStream
    const toto = new Transform({
      async transform(chunk, encoding, done) {
        this._buffers.push(chunk)
        this._inputSize += chunk.length

        console.log('CHUNK', chunk.length)
        console.log('input size', toto._inputSize)
        console.log('++++++++\n\n')
        if (this._inputSize >= this._targetSize) {
          console.log('CALL DUMP', toto._inputSize)
          await this.dump(done)
          // done()
        } else {
          done()
        }
      },
      flush() {
        console.log('FLUSH')
        while (this._inputSize) {
          this.dump()
        }
        console.log('END')
        console.log('BUFFER', this._buffers)
        console.log('INPUT', this._inputSize)
      },
    })

    // eslint-disable-next-line arrow-parens
    toto.dump = (done) => {
      console.log('DUMP')
      console.log('input size', toto._inputSize)

      const buffer = Buffer.concat(toto._buffers).toString('binary')
      const packetBuffer = buffer.substring(0, toto._targetSize)
      console.log('packetBuffer', packetBuffer.length)
      // eslint-disable-next-line security/detect-new-buffer
      toto._buffers = [new Buffer(buffer.substring(toto._targetSize))]
      toto._inputSize = toto._buffers[0].length

      // keyFile
      // const real_chunk = this._chunkNorm(chunk, islast)
      // const result = await crypto.subtle.encrypt(
      //   {
      //     name: 'AES-GCM',
      //     iv: this.ivFile,
      //   },
      //   keyFile,
      //   chunk,
      // )
      // done()
      if (!toto.push(packetBuffer)) {
        toto.on('drain', () => {
          if (done) {
            done()
          }
        })
      } else if (done) {
        done()
      }
    }

    toto._buffers = []
    toto._inputSize = 0
    // toto._targetSize = 128
    toto._targetSize = 128 * 1024

    function Sink(options) {
      Writable.call(this, options)
    }

    util.inherits(Sink, Writable)

    Sink.prototype._write = (chunk, encoding, callback) => {
      console.log('SINK', chunk.length)
      callback()
    }

    streamZip.pipe(toto).pipe(new Sink())
    return streamZip
  }

  async dataCreator() {
    const data = {}
    data.option = this.option
    const zipfile = await zipFiles(this.files)
    this.encrypt = new EncryptConstruct(
      this.keys,
      { filesName: this.files },
      zipfile,
    )
    data.enc = await this.getEncrypt()
    data.key = abTools.ab2a(await this.keys.exportKeySign())
    return data
  }
}
