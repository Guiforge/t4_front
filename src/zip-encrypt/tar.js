/* eslint-disable no-underscore-dangle */
/* eslint-disable security/detect-object-injection */
/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
import { Transform } from 'readable-stream'

import StreamFile from '../utils/fileReaderStream'

const header = require('./header')

function pad(numParm, bytes) {
  let num = numParm
  num = num.toString(8)
  // eslint-disable-next-line no-mixed-operators
  return '000000000000'.substr(num.length + 12 - bytes) + num
}

function nextMultiple(number, quo) {
  return number + (quo - (number % quo))
}

function Tar(progress, onError) {
  this.written = 0
  this.globalSize = 0
  this.recordSize = 512
  this.onError = (err) => {
    onError(err)
    throw err
  }
  this.files = []
  this.names = []
  this._pad = 0
  this.stream = new Transform({
    transform(chunk, encoding, cb) {
      this.push(chunk)
      cb()
    },
  })

  // transform name of file 100 max length in ascii
  this.getName = (nameParam) => {
    const name = Buffer.from(nameParam).toString('ascii')
    const max = 97
    const patt = /\.[0-9a-z]+$/i
    let ext = patt.exec(name) // file extension
    if (!ext) {
      ext = ''
    } else {
      ext = ext[0]
    }

    let pre
    if (ext.length >= max) {
      this.onError(Error(`Wrong Name file${name}`)) // if extension is too long
    } else if (ext.length) {
      pre = name.slice(0, -ext.length)
    } else {
      pre = name
    }

    pre = pre.slice(0, max - ext.length)
    let ret = pre + ext

    // Remove double
    // eslint-disable-next-line arrow-parens
    const find = this.names.find((el) => el.name === ret)
    if (!find) {
      this.names.push({ name: ret, count: 0 })
    } else {
      find.count += 1
      if (find.count > 999) {
        this.onError(Error(`too many similar names:${name}`))
      }
      ret = pre + find.count + ext
    }

    return ret
  }

  this.go = () => {
    this.globalSize = nextMultiple(this.globalSize, this.recordSize)
    if (this.files.length) {
      this.append(this.files.pop()) // each file
    } else {
      this.end()
    }
  }

  this.end = () => {
    this.pushPad(true)
    this.pushPad(true)
    this.stream.end()
  }

  this.file = (file) => {
    this.globalSize += nextMultiple(file.size, this.recordSize) + 512
    this.files.push(file)
  }

  this.append = async (file) => {
    if (!(file instanceof File)) {
      throw Error(
        'Error the file is not File Object: https://developer.mozilla.org/en-US/docs/Web/API/File',
      )
    }
    progress(file.name, undefined)

    const mode = 0o777 & 0xfff
    const mtime = Math.floor(+new Date() / 1000)
    const uid = 0
    const gid = 0

    const data = {
      fileName: this.getName(file.name),
      fileMode: pad(mode, 7),
      uid: pad(uid, 7),
      gid: pad(gid, 7),
      fileSize: pad(file.size, 11),
      mtime: pad(mtime, 11),
      checksum: '        ',
      type: '0',
      ustar: 'ustar  ',
      owner: '',
      group: '',
    }

    let checksum = 0
    Object.keys(data).forEach((key) => {
      let i
      const value = data[key]
      let length

      for (i = 0, length = value.length; i < length; i += 1) {
        checksum += value.charCodeAt(i)
      }
    })
    data.checksum = `${pad(checksum, 6)}\u0000 `
    const headerArr = header.format(data)
    this.push(headerArr)

    this.written += headerArr.length

    this.pushFile(file)
    return this.out
  }

  this.push = (data) => {
    this._pad += data.length
    this.written += data.length
    this._pad = this._pad % this.recordSize
    this.stream.write(data)
    progress(undefined, ((this.written / this.globalSize) * 100).toFixed(2))
  }

  // send padding (fill with zero)
  this.pushPad = (force) => {
    if (!force && !this._pad) {
      return
    }
    const padding = this.recordSize - this._pad
    this.push(Buffer.alloc(padding))
  }

  this.pushFile = (file) => {
    if (file.size) {
      const fileStream = StreamFile.createReadStreamFile(file, undefined, true)
      fileStream.pipe(this.stream)
      // On progress
      fileStream.on('data', (c) => {
        this._pad += c.length
        this.written += c.length
        this._pad = this._pad % this.recordSize
        progress(undefined, ((this.written / this.globalSize) * 100).toFixed(2))
      })

      // when one file is send, send an other
      fileStream.on('fin', () => {
        fileStream.unpipe(this.stream)
        fileStream.push(null)
        this.pushPad()
        this.go()
      })
    } else {
      this.go()
    }
  }
}

export default async function zipFiles(files, progress, onError) {
  const tar = new Tar(progress, onError)

  files.forEach((file) => {
    tar.file(file)
  })
  tar.go()
  return tar.stream
}
