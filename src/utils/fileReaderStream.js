import { Readable, Stream } from 'readable-stream'
import realStream from 'stream'

import util from 'util'

const u2 = require('../../node_modules/compress-commons/lib/util')
const u = require('archiver-utils')

const chunkSize = 1024 * 1024

function isStream(source) {
  return source instanceof realStream.Stream || source instanceof Stream
}

u.isStream = isStream
u2.isStream = isStream

function ReadStreamFile(file, options) {
  Readable.call(this, options)
  this.file = file
  this.fileReader = new FileReader(file)
  this.offset = 0

  this.fileReader.onerror = (err) => {
    this.destroy(err)
  }
}

util.inherits(ReadStreamFile, Readable)

function createReadStreamFile(file, optionsParam) {
  function internRead(size) {
    const chunkSizeTmp = size || chunkSize
    // when done, push null and exit loop
    if (this.offset >= this.file.size) {
      return this.push(null)
    }
    this.fileReader.onloadend = (event) => {
      let data = event.target.result
      if (data instanceof ArrayBuffer) {
        data = Buffer.from(new Uint8Array(event.target.result))
        console.log('C', data.byteLength)
      }
      this.push(data)
    }
    const end = this.offset + chunkSizeTmp
    const slice = this.file.slice(this.offset, end)
    this.fileReader.readAsArrayBuffer(slice)
    this.offset = end
    return null
  }
  // eslint-disable-next-line no-underscore-dangle
  ReadStreamFile.prototype._read = internRead
  const fileStream = new ReadStreamFile(file, optionsParam)
  return fileStream
}

export default {
  createReadStreamFile,
  ReadStreamFile,
}
