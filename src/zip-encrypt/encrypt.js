class encrypt {
  constructor(keys, meta, file) {
    this.keys = keys
    this.raw = {
      meta,
      file,
    }
    this.ivFile = crypto.getRandomValues(new Uint8Array(96 / 8))
    this.ivMeta = crypto.getRandomValues(new Uint8Array(96 / 8))
  }

  async encryptFile() {
    const file = this.raw.file
    const keyFile = await this.keys.promiseFileKey

    const result = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: this.ivFile,
      },
      keyFile,
      file,
    )
    return { data: result, ivFile: this.ivFile }
  }

  async encryptMeta() {
    const encoder = new TextEncoder()
    const meta = this.raw.meta
    const keyMeta = await this.keys.promiseMetaKey

    const result = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: this.ivMeta,
      },
      keyMeta,
      encoder.encode(JSON.stringify(meta)),
    )
    return { data: result, ivMeta: this.ivMeta }
  }
}
export default encrypt
