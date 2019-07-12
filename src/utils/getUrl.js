const subPath = {
  download: '/D/',
  upload: '/upload',
}

function getUrlDownload() {
  return window.location.origin + subPath.download
}

export default {
  getUrlDownload,
  subPath,
}
