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

export default {
  ab2a,
  ab2str,
  i2b,
}
