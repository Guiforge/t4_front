const JSZip = require('jszip')

async function reader(zip, file) {
  return new Promise((resolve, reject) => {
    const readStream = new FileReader()

    // eslint-disable-next-line
    readStream.onload = function(chunk) {
      zip.file(file.name, readStream.result)
      resolve(file.name)
    }
    readStream.onerror = () => {
      reject(Error(`Cannot read: ${file.name}`))
    }
    readStream.readAsArrayBuffer(file)
  })
}

export default async function zipFiles(files) {
  return new Promise((resolve, reject) => {
    const zip = new JSZip()
    const proms = []

    // All promeses
    files.forEach((file) => {
      proms.push(reader(zip, file))
    })

    // Wait ALL
    Promise.all(proms)
      .then(() => {
        zip
          .generateAsync({
            name: 'Zip.zip',
            type: 'arraybuffer',
            compression: 'DEFLATE',
            compressionOptions: {
              level: 9,
            },
          })
          .then((zipfile) => {
            resolve(zipfile)
          })
          .catch(() => {
            reject(Error('Cannot Zip'))
          })
      })
      .catch((err) => {
        reject(err)
      })
  })
}
