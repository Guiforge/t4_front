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
        resolve(JSON.parse(ev.target.response).id)
      } else {
        reject('Unable to send')
      }
    }
    // console.log(getUrl.upload())
    xhr.open('POST', getUrl.upload(), true)
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    xhr.send(JSON.stringify(data))
  })
}

export default {
  send,
}
