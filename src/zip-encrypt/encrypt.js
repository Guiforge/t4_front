function encrypt(files) {
  console.log(files)
  const readStream = new FileReader()

  // eslint-disable-next-line
  readStream.onload = function(chunk) {
    console.log('1', readStream.result)
  }
  readStream.readAsBinaryString(files[0])
}

export default encrypt
