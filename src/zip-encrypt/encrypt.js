/* eslint-disable no-underscore-dangle */
import { Transform } from 'readable-stream'
// import concatUint8 from '../utils/concatUint8'

// const SIZE_CHUNK = 128 * 100

class encrypt {
  constructor(keys, meta) {
    // this._start_enc_file = false
    this.keys = keys
    this.meta = meta
    this.ivFile = crypto.getRandomValues(new Uint8Array(96 / 8))
    this.ivMeta = crypto.getRandomValues(new Uint8Array(96 / 8))
  }

  // _chunkNorm(chunk, islast) {
  //   let ret = this._buff_current.slice(0, SIZE_CHUNK)
  //   if (ret < SIZE_CHUNK) {
  //     ret = concatUint8.concatUint8(
  //       ret,
  //       chunk.slice(0, SIZE_CHUNK - ret.length),
  //     )
  //   }
  //   if (islast) {
  //     pad()
  //   }
  // }

  async CreateEncryptStream() {
    const keyFile = await this.keys.promiseFileKey
    console.log('NOTHING', keyFile)

    const transformer = new Transform({
      async dump(cb) {
        const buffer = Buffer.concat(this._buffers).toString('binary')
        const packetBuffer = buffer.substring(0, this._targetSize)
        // eslint-disable-next-line security/detect-new-buffer
        this._buffers = [new Buffer(buffer.substring(this._targetSize))]
        this._inputSize = this._buffers[0].length

        if (this._inputSize >= this._targetSize) {
          console.log('CHUNK', packetBuffer)
          console.log('   SIZE', packetBuffer.length)
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

          this.push(packetBuffer)
          if (cb) {
            cb()
          }
        }
      },

      transform(chunk, encoding, cb) {
        this._buffers.push(chunk)
        this._inputSize += chunk.length

        console.log('CHUNK', chunk)
        console.log('   SIZE', chunk.length)
        if (this._inputSize >= this._targetSize) {
          this._dump(cb)
        } else {
          cb()
        }
      },

      flush() {
        this._dump()
      },
    })
    transformer._buffers = []
    transformer._inputSize = 0
    transformer._targetSize = 1024 * 38

    return transformer
  }

  async encryptMeta() {
    const encoder = new TextEncoder()
    const keyMeta = await this.keys.promiseMetaKey

    const result = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: this.ivMeta,
      },
      keyMeta,
      encoder.encode(JSON.stringify(this.meta)),
    )
    return { data: result, ivMeta: this.ivMeta, ivFile: this.ivFile }
  }
}
export default encrypt
