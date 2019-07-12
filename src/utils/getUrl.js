const subPath = {
  download: '/D/',
  upload: '/upload',
}

function download() {
  return `${window.location.origin}#${subPath.download}`
}

export default {
  download,
  subPath,
}
