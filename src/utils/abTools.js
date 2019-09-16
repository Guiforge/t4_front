function ab2a(buffer) {
  return Array.from(new Uint8Array(buffer))
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

function i2b(num) {
  const b = new ArrayBuffer(4)
  new DataView(b).setUint32(0, num)
  return Buffer.from(new Uint8Array(b))
}

// eslint-disable-next-line no-underscore-dangle
function b642b(base64) {
  const binary = window.atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i += 1) {
    // eslint-disable-next-line security/detect-object-injection
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export default {
  ab2a,
  ab2str,
  i2b,
  b642b,
}
