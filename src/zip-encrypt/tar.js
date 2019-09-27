/* eslint-disable no-underscore-dangle */
/* eslint-disable security/detect-object-injection */
/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
import { Transform } from 'readable-stream'

import StreamFile from '../utils/fileReaderStream'

const header = require('./header')

function pad(numParm, bytes, base) {
  let num = numParm
  num = num.toString(base || 8)
  // eslint-disable-next-line no-mixed-operators
  return '000000000000'.substr(num.length + 12 - bytes) + num
}

function Tar() {
  this.written = 0
  this.recordSize = 512
  this.files = []
  this.names = []
  this._pad = 0
  this.stream = new Transform({
    transform(chunk, encoding, cb) {
      this.push(chunk)

      cb()
    },
  })

  this.getName = (name) => {
    const max = 97
    const patt = /\.[0-9a-z]+$/i
    let ext = patt.exec(name)
    if (!ext) {
      ext = ''
    } else {
      ext = ext[0]
    }

    let pre
    if (ext.length >= max) {
      throw Error(`Wrong Name file${name}`)
    } else if (ext.length) {
      pre = name.slice(0, -ext.length)
    } else {
      pre = name
    }

    pre = pre.slice(0, max - ext.length)
    let ret = pre + ext

    // eslint-disable-next-line arrow-parens
    const find = this.names.find((el) => el.name === ret)
    if (!find) {
      this.names.push({ name: ret, count: 0 })
    } else {
      find.count += 1
      if (find.count > 999) {
        throw Error(`too many similar names:${name}`)
      }
      ret = pre + find.count + ext
    }
    console.log('NAME:', ret)
    return ret
  }

  this.go = () => {
    console.log('GO', this)
    if (this.files.length) {
      this.append(this.files.pop())
      // this.pad()
    } else {
      this.end()
    }
  }

  this.end = () => {
    console.log('end')
    this.pad(true)
    this.pad(true)
    this.stream.end()
  }

  this.file = (file) => {
    this.files.push(file)
  }

  this.append = async (file, opts, callback) => {
    if (!(file instanceof File)) {
      throw Error(
        'Error the file is not File Object: https://developer.mozilla.org/en-US/docs/Web/API/File',
      )
    }
    console.log('append:', file.name)
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    opts = opts || {}

    const mode = opts.mode || 0o777 & 0xfff
    const mtime = opts.mtime || Math.floor(+new Date() / 1000)
    const uid = opts.uid || 0
    const gid = opts.gid || 0

    const data = {
      fileName: this.getName(file.name),
      fileMode: pad(mode, 7),
      uid: pad(uid, 7),
      gid: pad(gid, 7),
      fileSize: pad(file.size, 11),
      mtime: pad(mtime, 11),
      checksum: '        ',
      type: '0', // just a file
      ustar: 'ustar  ',
      owner: opts.owner || '',
      group: opts.group || '',
    }

    // calculate the checksum
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

    if (typeof callback === 'function') {
      callback(this.out)
    }

    return this.out
  }

  this.push = (data) => {
    console.log('data', data.length)
    this._pad += data.length
    this.written += data.length
    this._pad = this._pad % this.recordSize
    this.stream.write(data)
  }

  this.pad = () => {
    const padding = this.recordSize - this._pad
    console.log('pad', { _pad: this._pad, padding, w: this.written })
    this.push(Buffer.alloc(padding))
  }

  this.pushFile = (file) => {
    const fileStream = StreamFile.createReadStreamFile(file, undefined, true)
    fileStream.pipe(this.stream)

    fileStream.on('data', (c) => {
      this._pad += c.length
      this.written += c.length
      this._pad = this._pad % this.recordSize
    })

    fileStream.on('fin', () => {
      console.log('FIN:', file.name, this.files)
      fileStream.unpipe(this.stream)
      fileStream.push(null)
      this.pad()
      this.go()
    })
  }
}

export default async function zipFiles(files) {
  const tar = new Tar()

  files.forEach((file) => {
    tar.file(file)
  })
  tar.go()
  return tar.stream
}

// import fileReaderStream from 'filereader-stream'

// const zlib = require('zlib')
// const JSZip = require('jszip')
// const archiver = require('archiver')

// async function reader(zip, file) {
//   return new Promise((resolve, reject) => {
//     try {
//       const fileRead = StreamFile.createReadStreamFile(file)
//       fileRead.once('end', () => {
//         console.log('END', file.name)
//       })
//       // eslint-disable-xnext-line
//       zip.file(file.name, fileRead)
//       resolve(file.name)
//     } catch (error) {
//       console.log(error)
//       reject(Error(`Cannot read: ${file.name}`))
//     }
//   })
// }

// export default async function zipFiles(files) {
//   return new Promise((resolve, reject) => {
//     const zip = new JSZip()
//     let proms = []
//     files.forEach((file) => {
//       proms += reader(zip, file)
//     })

//     Promise.all(proms)
//       .then(() => {
//         // You can use metadata
//         console.log('TOTO')
//         resolve(
//           zip.generateNodeStream({
//             name: 'Zip.zip',
//             compression: 'DEFLATE',
//             compressionOptions: {
//               level: 9,
//             },
//           }),
//         )
//       })
//       .catch((err) => {
//         reject(err)
//       })
//   })
// }

// export default async function zipFiles(files) {
//   // return new Promise((resolve, reject) => {
//   const archive = archiver('tar', {
//     zlib: { level: 9 }, // Sets the compression level.
//   })
//   // const proms = []

//   // All promeses
//   files.forEach((file) => {
//     const filestream = StreamFile.createReadStreamFile(file)
//     filestream.on('data', () => {
//       console.log(file.name, 'read data')
//     })
//     // console.log('stream', tptp instanceof stream.Stream, stream.Stream)
//     // console.log('stream', tptp instanceof StreamFile.Stream, StreamFile.Stream)

//     filestream.once('end', () => {
//       console.log('end', file.name)
//     })
//     archive.append(filestream, { name: file.name })
//     // proms.push(reader(zip, file))
//   })
//   return archive

//   //   // Wait ALL
//   //   Promise.all(proms)
//   //     .then(() => {
//   //       // You can use metadata
//   //       console.log('TOTO')
//   //       resolve(
//   //         zip.generateNodeStream(
//   //           {
//   //             name: 'Zip.zip',
//   //             compression: 'DEFLATE',
//   //             compressionOptions: {
//   //               level: 9,
//   //             },
//   //           },
//   //           updateCallback,
//   //         ),
//   //       )
//   //     })
//   //     .catch((err) => {
//   //       reject(err)
//   //     })
//   // })
// }
