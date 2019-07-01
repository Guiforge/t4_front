// import { saveAs } from 'file-saver'

const JSZip = require('jszip')

async function reader(zip, file) {
  return new Promise((resolve, reject) => {
    const readStream = new FileReader()

    // eslint-disable-next-line
    readStream.onload = function(chunk) {
      console.log('ret', readStream.result)
      zip.file(file.name, readStream.result)
      resolve(true)
    }
    readStream.onerror = (error) => {
      reject(error)
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
      .then((res) => {
        console.log('success', res)
        resolve('success', zip)
      })
      .catch((err) => {
        reject(err)
      })
  })
}
