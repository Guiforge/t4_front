import getUrl from '../utils/getUrl'
// import Keys from '../zip-encrypt/keys'
// import b64 from '../utils/base64'

// eslint-disable-next-line import/prefer-default-export
async function getNonce(id) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.onerror = (err) => {
      reject(`Error: ${err.target.status}`)
    }

    xhr.onload = (ev) => {
      if (ev.target.status === 200) {
        resolve(JSON.parse(ev.target.response).nonce)
      } else {
        reject(ev.target.status)
      }
    }
    xhr.open('GET', getUrl.getNonce(id), true)
    xhr.send()
  })
}

export default {
  getNonce,
}

// export default class Download {
//   constructor(id, secretKey) {
//     this.id = id
//     this.nonce = getNonce(id)
//     // new Uint8Array(toto.split(','))
//     // b64
//     b64.decode(secretKey).then(keyStr => {
//         const keysArray = keyStr.split(',')

//     })
//     this.keys = new Keys(secretKey)
//   }
// }
