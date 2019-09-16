/* eslint-disable new-cap */

import getUrl from '../utils/getUrl'
import base64 from './base64'
// import abTools from './abTools'

export default async function getMeta(id, signNonce) {
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
        resolve(JSON.parse(ev.target.response).meta)
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
