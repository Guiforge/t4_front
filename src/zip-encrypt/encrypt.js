class encrypt {
  constructor(keys, meta, file) {
    this.keys = keys
    this.raw = {
      meta,
      file,
    }
  }

  async encryptFile() {
    const file = this.raw.file
    const keyFile = await this.keys.promiseFileKey

    const result = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: crypto.getRandomValues(new Uint8Array(96 / 8)),
      },
      keyFile,
      file,
    )
    return result
  }

  async encryptMeta() {
    const encoder = new TextEncoder()
    const meta = this.raw.meta
    const keyMeta = await this.keys.promiseMetaKey

    const result = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: crypto.getRandomValues(new Uint8Array(96 / 8)),
      },
      keyMeta,
      encoder.encode(JSON.stringify(meta)),
    )
    return result
  }
}
export default encrypt
