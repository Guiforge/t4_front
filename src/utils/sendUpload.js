import getUrl from '../utils/getUrl'

function onProgressItern() {}

async function send(data, onProgress = undefined) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.onprogress = onProgress || onProgressItern

    xhr.onerror = (err) => {
      reject(`Error: ${err.target.status}`)
    }

    xhr.onload = (ev) => {
      if (ev.target.status === 200) {
        resolve(this.responseText)
      } else {
        reject('Unable to send')
      }
    }
    xhr.open('POST', getUrl.upload(), true)
    xhr.send(JSON.stringify(data))
  })
}

export default {
  send,
}
