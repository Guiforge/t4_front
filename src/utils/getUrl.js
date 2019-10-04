const subPath = {
  download: '/D/',
  upload: '/upload',
  uploadMeta: '/upload/meta',
  getNonce: '/nonce',
  getMeta: '/meta',
  uploadAuthTag: '/upload/authTag',
  getFile: '/download',
  getInfo: '/info',
  deleteFile: '/file/delete',
}

function download() {
  return `${window.location.origin}#${subPath.download}`
}

function root(type) {
  let ret = process.env.API_URL
  switch (type) {
    case 'HOST':
      ret = process.env.HOST
      break
    case 'PORT':
      ret = process.env.PORT
      break
    default:
  }
  return ret
}

function deleteFile(id) {
  return `${process.env.API_URL}${subPath.deleteFile}/${id}`
}

function getInfo(id) {
  return `${process.env.API_URL}${subPath.getInfo}/${id}`
}
function getFile(id) {
  return `${process.env.API_URL}${subPath.getFile}/${id}`
}

function getFileSub(id) {
  return `${subPath.getFile}/${id}`
}

function upload() {
  return `${process.env.API_URL}${subPath.upload}`
}

function uploadMeta() {
  return `${process.env.API_URL}${subPath.uploadMeta}`
}

function uploadAuthTag(id) {
  return `${process.env.API_URL}${subPath.uploadAuthTag}/${id}`
}

function getNonce(id) {
  return `${process.env.API_URL}${subPath.getNonce}/${id}`
}

function getMeta(id) {
  return `${process.env.API_URL}${subPath.getMeta}/${id}`
}

export default {
  deleteFile,
  download,
  subPath,
  upload,
  getNonce,
  getMeta,
  uploadMeta,
  uploadAuthTag,
  getFile,
  getFileSub,
  root,
  getInfo,
}
