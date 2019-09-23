import streamSaver from 'streamsaver'

const WebStreamsPolyfill = require('web-streams-polyfill/ponyfill')

// Firefox
streamSaver.WritableStream =
  window.WritableStream || WebStreamsPolyfill.WritableStream
streamSaver.mitm = 'http://localhost:8060/node_modules/streamsaver/mitm.html'

export default streamSaver
