// eslint-disable-next-line import/prefer-default-export
export class Sender {
  constructor(keys, encrypt, option) {
    this.keys = keys
    this.encrypt = encrypt
    this.option = option
  }

  async send() {
    return new Promise((resolve, reject) => {
      const data = {}
      data.option = this.option
      this.encrypt
        .encryptMeta()
        .then((meta) => {
          data.meta = meta
          this.encrypt
            .encryptFile()
            .then((file) => {
              data.file = file
              this.keys
                .getKeySign()
                .then((keySign) => {
                  data.keySign = keySign
                  console.log(data)
                  resolve()
                })
                .catch((err) => {
                  reject(err)
                })
            })
            .catch((err) => {
              reject(err)
            })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
}
