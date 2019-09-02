export default function concatUint8(a, b) {
  const c = new Int8Array(a.length + b.length)
  c.set(a)
  c.set(b, a.length)
}
