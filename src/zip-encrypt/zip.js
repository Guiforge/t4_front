import StreamFile from '../utils/fileReaderStream'
// import fileReaderStream from 'filereader-stream'

// const zlib = require('zlib')
// const JSZip = require('jszip')
const archiver = require('archiver')

// async function reader(zip, file) {
//   return new Promise((resolve, reject) => {
//     try {
//       const fileRead = fileReaderStream(file)
//       // eslint-disable-xnext-line
//       zip.file(file.name, fileRead)
//       resolve(file.name)
//     } catch (error) {
//       reject(Error(`Cannot read: ${file.name}`))
//     }
//   })
// }

// export default async function zipFiles(files, output) {
//   function compressFile(file, callback) {
//     const compress = zlib.createGzip()
//     const input = fileReaderStream(file)
//     input.pipe(compress).pipe(output)

//     if (callback) {
//       output.on('end', callback)
//     }
//   }
//   function getNext(callback) {
//     if (files.length) {
//       compressFile(files.shift(), () => {
//         getNext(callback)
//       })
//     } else if (callback) {
//       callback()
//     }
//   }
//   getNext(() => {
//     console.log('File compression ended')
//   })
// }

export default async function zipFiles(files) {
  // return new Promise((resolve, reject) => {
  const archive = archiver('tar', {
    zlib: { level: 9 }, // Sets the compression level.
  })
  // const proms = []

  // All promeses
  files.forEach((file) => {
    const filestream = StreamFile.createReadStreamFile(file)
    // console.log('stream', tptp instanceof stream.Stream, stream.Stream)
    // console.log('stream', tptp instanceof StreamFile.Stream, StreamFile.Stream)

    filestream.once('end', () => {
      console.log('end', file.name)
    })
    archive.append(filestream, { name: file.name })
    // proms.push(reader(zip, file))
  })
  return archive

  //   // Wait ALL
  //   Promise.all(proms)
  //     .then(() => {
  //       // You can use metadata
  //       console.log('TOTO')
  //       resolve(
  //         zip.generateNodeStream(
  //           {
  //             name: 'Zip.zip',
  //             compression: 'DEFLATE',
  //             compressionOptions: {
  //               level: 9,
  //             },
  //           },
  //           updateCallback,
  //         ),
  //       )
  //     })
  //     .catch((err) => {
  //       reject(err)
  //     })
  // })
}
