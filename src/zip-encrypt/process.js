import zipFiles from '../zip-encrypt/zip'
import KeysConstruct from '../zip-encrypt/keys'
import EncryptConstruct from '../zip-encrypt/encrypt'

export default class processData {
  constructor(files) {
    this.files = files
    this.keys = new KeysConstruct()
    this.data = this.dataCreator()
  }

  async getEncrypt() {
    const enc = {}
    enc.meta = await this.encrypt.encryptMeta()
    enc.file = await this.encrypt.encryptFile()
    enc.meta.data = Array.from(new Uint8Array(enc.meta.data))
    enc.file.data = Array.from(new Uint8Array(enc.file.data))
    enc.meta.ivMeta = Array.from(new Uint8Array(enc.meta.ivMeta))
    enc.file.ivFile = Array.from(new Uint8Array(enc.file.ivFile))
    return enc
  }

  async dataCreator() {
    const data = {}
    data.option = this.option
    const zipfile = await zipFiles(this.files)
    this.encrypt = new EncryptConstruct(
      this.keys,
      { filesName: this.files },
      zipfile,
    )
    data.enc = await this.getEncrypt()
    data.key = Array.from(new Uint8Array(await this.keys.exportKeySign()))
    return data
  }
}
