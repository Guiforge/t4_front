async function encode(str) {
  return new Promise((resolve) => {
    resolve(window.btoa(unescape(encodeURIComponent(str))))
  })
}

async function decode(str) {
  return new Promise((resolve) => {
    resolve(decodeURIComponent(escape(window.atob(str))))
  })
}

export default {
  encode,
  decode,
}
