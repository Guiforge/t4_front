import b64 from '../utils/base64'

const encoder = new TextEncoder()

export default class Keys {
  constructor(secret) {
    if (secret) {
      this.secretRaw = encoder.encode(secret)
      this.promiseDeriveKey = crypto.subtle.importKey(
        'raw',
        this.secretRaw,
        { name: 'PBKDF2' },
        false,
        ['deriveKey'],
      )
    } else {
      this.secretRaw = crypto.getRandomValues(new Uint8Array(96))
      this.promiseDeriveKey = crypto.subtle.importKey(
        'raw',
        this.secretRaw,
        { name: 'HKDF' }, // best for non password
        false,
        ['deriveKey'],
      )
    }
    this.promiseMetaKey = this.promiseDeriveKey.then((deriveKey) => {
      const promiseDeriveKey = crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: crypto.getRandomValues(new Uint8Array(256)),
          info: encoder.encode('meta'),
        },
        deriveKey,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['decrypt', 'encrypt'],
      )
      return promiseDeriveKey
    })

    this.promiseFileKey = this.promiseDeriveKey.then((deriveKey) => {
      const promiseDeriveKey = crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: crypto.getRandomValues(new Uint8Array(256)),
          info: encoder.encode('meta'),
        },
        deriveKey,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['decrypt', 'encrypt'],
      )
      return promiseDeriveKey
    })

    this.promiseSignKey = this.promiseDeriveKey.then((deriveKey) => {
      const promiseDeriveKey = crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: crypto.getRandomValues(new Uint8Array(256)),
          info: encoder.encode('meta'),
        },
        deriveKey,
        {
          name: 'HMAC',
          hash: 'SHA-256',
        },
        false,
        ['sign'],
      )
      return promiseDeriveKey
    })
  }

  async getKeyFile() {
    try {
      const key = await this.promiseFileKey
      return key
    } catch (error) {
      throw new Error('Cannot create crypto key')
    }
  }

  async getKeyMeta() {
    try {
      const key = await this.promiseMetaKey
      return key
    } catch (error) {
      throw new Error('Cannot create crypto key')
    }
  }

  async getKeySign() {
    try {
      const key = await this.promiseSignKey
      return key
    } catch (error) {
      throw new Error('Cannot create crypto key')
    }
  }

  getSecret() {
    return b64.encode(this.secretRaw)
  }
}
