const subPath = {
  download: '/D/',
  upload: '/upload',
}

function download() {
  return `${window.location.origin}#${subPath.download}`
}

function upload() {
  return `${process.env.API_URL}${subPath.upload}`
}

export default {
  download,
  subPath,
  upload,
}
