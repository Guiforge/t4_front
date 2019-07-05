function encode(str) {
  return window.btoa(unescape(encodeURIComponent(str)))
}

function decode(str) {
  return decodeURIComponent(escape(window.atob(str)))
}

export default {
  encode,
  decode,
}
