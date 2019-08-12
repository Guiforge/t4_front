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
    const ivFile = crypto.getRandomValues(new Uint8Array(96 / 8))

    const result = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: ivFile,
      },
      keyFile,
      file,
    )
    return { data: result, ivFile }
  }

  async encryptMeta() {
    const encoder = new TextEncoder()
    const meta = this.raw.meta
    const keyMeta = await this.keys.promiseMetaKey
    const ivMeta = crypto.getRandomValues(new Uint8Array(96 / 8))

    const result = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: ivMeta,
      },
      keyMeta,
      encoder.encode(JSON.stringify(meta)),
    )
    return { data: result, ivMeta }
  }
}
export default encrypt
