/* eslint-disable new-cap */
import getUrl from '../utils/getUrl'
import base64 from './base64'

async function getMeta(id, signNonce) {
  const signNonceB64 = await base64.encode(
    JSON.stringify(new Buffer.from(signNonce)),
  )
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onerror = (err) => {
      reject(`Error: ${err.target.status}`)
    }
    xhr.onload = (ev) => {
      if (ev.target.status === 200) {
        const meta = JSON.parse(ev.target.response).meta
        meta.enc.auth = Buffer.from(meta.enc.auth, 'base64')
        meta.ivMeta = Buffer.from(meta.ivMeta, 'base64')
        meta.authTag = Buffer.from(meta.authTag, 'base64')
        resolve(meta)
      } else {
        reject(ev.target.status)
      }
    }
    xhr.open('GET', getUrl.getMeta(id), true)
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhr.setRequestHeader('signNonce', signNonceB64)
    xhr.send()
  })
}

async function getFileStream(id, signNonce) {
  const signNonceB64 = await base64.encode(
    JSON.stringify(new Buffer.from(signNonce)),
  )
  return fetch(getUrl.getFile(id), { headers: { signNonce: signNonceB64 } })
}

async function download(id, signNonce, fileStream, decipher, progress) {
  const res = await getFileStream(id, signNonce)

  return new Promise((resolve, reject) => {
    if (res.status === 200) {
      let counter = 0
      const reader = res.body.getReader()
      const writer = fileStream.getWriter()
      const pump = () =>
        reader.read().then((res2) => {
          try {
            if (res2.done) {
              const p = decipher.final()
              writer.write(p).then(() => {
                writer.close()
                resolve()
              })
            } else {
              const p = decipher.update(Buffer.from(res2.value))
              writer.write(p).then(pump)
              counter += p.byteLength
              progress(counter)
            }
          } catch (error) {
            reject('File is corrupted')
            writer.abort()
          }
        })
      pump()
    } else {
      reject('To download file')
    }
  })
}

export default {
  getMeta,
  getFileStream,
  download,
}
