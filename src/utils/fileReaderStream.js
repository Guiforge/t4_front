import { Readable } from 'readable-stream'

import util from 'util'

const chunkSize = 1024 * 1024

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

function createReadStreamFile(file, optionsParam, noEnd) {
  function internRead(size) {
    const chunkSizeTmp = size || chunkSize
    // when done, push null and exit loop
    if (this.offset >= this.file.size) {
      this.emit('fin')
      if (noEnd) {
        return null
      }
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
