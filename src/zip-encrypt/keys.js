import b64 from '../utils/base64'

const encoder = new TextEncoder()

export default class Keys {
  constructor(secret) {
    if (secret) {
      this.secretRaw = secret
    } else {
      this.secretRaw = crypto.getRandomValues(new Uint8Array(96))
    }
    console.log('RAW', this.secretRaw)
    this.promiseDeriveKey = crypto.subtle.importKey(
      'raw',
      this.secretRaw,
      { name: 'HKDF' }, // best for non password
      false,
      ['deriveKey'],
    )
    this.promiseMetaKey = this.promiseDeriveKey.then((deriveKey) => {
      const promiseDeriveKey = crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: encoder.encode('meta'),
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
          salt: encoder.encode('file'),
          info: encoder.encode('file'),
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
          salt: encoder.encode('sign'),
          info: encoder.encode('sign'),
        },
        deriveKey,
        {
          name: 'HMAC',
          hash: 'SHA-256',
        },
        true,
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
      const exp = await crypto.subtle.exportKey('raw', key)
      // eslint-disable-next-line new-cap
      console.log('Export - KEY--', new Uint8Array(exp))
      return key
    } catch (error) {
      throw new Error('Cannot create crypto key')
    }
  }

  async exportKeySign() {
    const key = await this.getKeySign()
    const exp = await crypto.subtle.exportKey('raw', key)
    return new Uint8Array(exp)
  }

  async getSecret() {
    return b64.encode(this.secretRaw)
  }
}
