const subPath = {
  download: '/D/',
  upload: '/upload',
  getNonce: '/nonce',
  getMeta: '/meta',
}

function download() {
  return `${window.location.origin}#${subPath.download}`
}

function upload() {
  return `${process.env.API_URL}${subPath.upload}`
}

function getNonce(id) {
  return `${process.env.API_URL}${subPath.getNonce}/${id}`
}

function getMeta(id) {
  return `${process.env.API_URL}${subPath.getMeta}/${id}`
}

export default {
  download,
  subPath,
  upload,
  getNonce,
  getMeta,
}
