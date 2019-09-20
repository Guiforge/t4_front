/* eslint-disable new-cap */
import http from 'http'
import getUrl from '../utils/getUrl'
import base64 from './base64'
// import abTools from './abTools'

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

async function getFile(id, signNonce) {
  const signNonceB64 = await base64.encode(
    JSON.stringify(new Buffer.from(signNonce)),
  )

  console.log('toto', { id, signNonce, signNonceB64, tot: getUrl.getFile(id) })

  const options = {
    host: getUrl.root(),
    path: getUrl.getFileSub(id),
  }
  http
    .get(options, (response) => {
      // called when a data chunk is received.
      response.on('data', (chunk) => {
        console.log('data', chunk)
      })

      // called when the complete response is received.
      response.on('end', () => {
        console.log('end')
      })
    })
    .on('error', (error) => {
      console.log(`Error: ${error.message}`)
    })
  // http.get(getUrl.getFile(id), {
  //   headers: { signNonce: signNonceB64 },
  // })
  // http
  //   .get(
  //     getUrl.getFile(id),
  //     {
  //       headers: { signNonce: signNonceB64 },
  //     },
  //     (res) => {
  //       const { statusCode } = res
  //       let error
  //       if (statusCode !== 200) {
  //         throw Error('err')
  //       }
  //       if (error) {
  //         console.error(error.message)
  //         // Consume response data to free up memory
  //         res.resume()
  //         return
  //       }

  //       res.on('data', (chunk) => {
  //         console.log('data', chunk)
  //       })
  //       res.on('end', () => {
  //         try {
  //           console.log('end!!')
  //         } catch (e) {
  //           console.error(e.message)
  //         }
  //       })
  //     },
  //   )
  //   .on('error', (e) => {
  //     console.error(`Got error: ${e.message}`)
  //   })

  // return new Promise((resolve, reject) => {
  //   const xhr = new XMLHttpRequest()
  //   xhr.onerror = (err) => {
  //     reject(`Error: ${err.target.status}`)
  //   }
  //   xhr.onload = (ev) => {
  //     if (ev.target.status === 200) {
  //       const meta = JSON.parse(ev.target.response).meta
  //       meta.enc.auth = Buffer.from(meta.enc.auth, 'base64')
  //       meta.ivMeta = Buffer.from(meta.ivMeta, 'base64')
  //       resolve(meta)
  //     } else {
  //       reject(ev.target.status)
  //     }
  //   }
  //   xhr.open('GET', getUrl.getMeta(id), true)
  //   xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
  //   xhr.setRequestHeader('signNonce', signNonceB64)
  //   xhr.send()
  // })
}

export default {
  getMeta,
  getFile,
}
