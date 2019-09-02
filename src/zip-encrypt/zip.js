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
        // You can use metadata
        resolve(
          zip.generateNodeStream({
            name: 'Zip.zip',
            compression: 'DEFLATE',
            compressionOptions: {
              level: 9,
            },
          }),
        )
      })
      .catch((err) => {
        reject(err)
      })
  })
}
