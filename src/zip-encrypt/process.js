import zipFiles from '../zip-encrypt/zip'
import KeysConstruct from '../zip-encrypt/keys'
import EncryptConstruct from '../zip-encrypt/encrypt'
import abTools from '../utils/abTools'

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
    // Don't Change Type
    enc.meta.data = abTools.ab2a(enc.meta.data)
    enc.file.data = abTools.ab2a(enc.file.data)

    enc.meta.ivMeta = abTools.ab2a(enc.meta.ivMeta)
    enc.file.ivFile = abTools.ab2a(enc.file.ivFile)
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
    data.key = abTools.ab2a(await this.keys.exportKeySign())
    return data
  }
}
