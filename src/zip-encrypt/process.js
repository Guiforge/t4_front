import zipFiles from '../zip-encrypt/zip'
import KeysConstruct from '../zip-encrypt/keys'
import EncryptConstruct from '../zip-encrypt/encrypt'

export default class processData {
  constructor(files, success, danger) {
    this.files = files
    this.keys = new KeysConstruct()
    this.success = success
    this.danger = danger
  }

  async getEncrypt() {
    const enc = {}
    enc.meta = new Uint16Array(await this.encrypt.encryptMeta())
    enc.file = new Uint16Array(await this.encrypt.encryptFile())
    return enc
  }

  async getData() {
    const data = {}
    data.option = this.option
    const zipfile = await zipFiles(this.files)
    this.encrypt = new EncryptConstruct(
      this.keys,
      { filesName: this.files },
      zipfile,
    )
    data.enc = await this.getEncrypt()
    data.key = new Uint16Array(await this.keys.exportKeySign())
    return data
  }
}
