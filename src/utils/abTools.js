function ab2a(buffer) {
  return Array.from(new Uint8Array(buffer))
}

function ab2str(buf) {
  console.log(String.fromCharCode.apply(null, new Uint8Array(buf)))
  return String.fromCharCode.apply(null, new Uint8Array(buf))
}

export default {
  ab2a,
  ab2str,
}
