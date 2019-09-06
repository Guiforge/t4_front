/* eslint-disable no-underscore-dangle */
import crypto from 'crypto'

async function _KeyCreate(secret, info, keylen) {
  console.log('create-key', { secret, info, keylen })
  return new Promise((resolve, reject) => {
    const salt = crypto
      .createHash('sha512')
      .update(info)
      .digest('hex')
    crypto.pbkdf2(secret, salt, 100000, keylen, 'sha512', (err, derivedKey) => {
      if (err) {
        reject(err)
      }
      resolve(derivedKey)
    })
  })
}

export default class KeysConstructor {
  constructor(pass) {
    this._secretRaw = pass || crypto.randomBytes(96)
    this._KeyDeriveProm = _KeyCreate(this._secretRaw, 'KeyDerive', 512)
    this._IvMeta = crypto.randomBytes(128)
    this._IvFile = crypto.randomBytes(128)
  }
  getIvMeta() {
    return this._IvMeta
  }
  getIvFile() {
    return this._IvFile
  }
  async getKeyAuth() {
    const derivedKey = await this._KeyDeriveProm
    if (this._keyAuth) {
      return this._keyAuth
    }
    this._KeyAuth = crypto
      .createHmac('sha512', 'password')
      .update(derivedKey)
      .digest()
    return this._keyAuth
  }
  async getKeyFile() {
    const derivedKey = await this._KeyDeriveProm
    if (this._keyFileProm) {
      return this._keyFileProm
    }
    this._keyFileProm = _KeyCreate(derivedKey, 'KeyFile', 32)
    return this._keyFileProm
  }
  async getKeyMeta() {
    const derivedKey = await this._KeyDeriveProm
    if (this._keyMetaProm) {
      return this._keyMetaProm
    }
    this._keyMetaProm = _KeyCreate(derivedKey, 'KeyMeta', 32)
    return this._keyMetaProm
  }
  getSecret() {
    return this._secretRaw
  }
}

// export default class Keys {
//   constructor(secret) {
//     if (secret) {
//       this.secretRaw = secret
//     } else {
//       this.secretRaw = crypto.getRandomValues(new Uint8Array(96))
//     }
//     console.log('RAW', this.secretRaw)
//     this.promiseDeriveKey = crypto.subtle.importKey(
//       'raw',
//       this.secretRaw,
//       { name: 'HKDF' }, // best for non password
//       false,
//       ['deriveKey'],
//     )
//     this.promiseMetaKey = this.promiseDeriveKey.then((deriveKey) => {
//       const promiseDeriveKey = crypto.subtle.deriveKey(
//         {
//           name: 'HKDF',
//           hash: 'SHA-256',
//           salt: encoder.encode('meta'),
//           info: encoder.encode('meta'),
//         },
//         deriveKey,
//         {
//           name: 'AES-GCM',
//           length: 256,
//         },
//         false,
//         ['decrypt', 'encrypt'],
//       )
//       return promiseDeriveKey
//     })

//     this.promiseFileKey = this.promiseDeriveKey.then((deriveKey) => {
//       const promiseDeriveKey = crypto.subtle.deriveKey(
//         {
//           name: 'HKDF',
//           hash: 'SHA-256',
//           salt: encoder.encode('file'),
//           info: encoder.encode('file'),
//         },
//         deriveKey,
//         {
//           name: 'AES-GCM',
//           length: 256,
//         },
//         false,
//         ['decrypt', 'encrypt'],
//       )
//       return promiseDeriveKey
//     })

//     this.promiseSignKey = this.promiseDeriveKey.then((deriveKey) => {
//       const promiseDeriveKey = crypto.subtle.deriveKey(
//         {
//           name: 'HKDF',
//           hash: 'SHA-256',
//           salt: encoder.encode('sign'),
//           info: encoder.encode('sign'),
//         },
//         deriveKey,
//         {
//           name: 'HMAC',
//           hash: 'SHA-256',
//         },
//         true,
//         ['sign'],
//       )
//       return promiseDeriveKey
//     })
//   }

//   async getKeyFile() {
//     try {
//       const key = await this.promiseFileKey
//       return key
//     } catch (error) {
//       throw new Error('Cannot create crypto key')
//     }
//   }

//   async getKeyMeta() {
//     try {
//       const key = await this.promiseMetaKey
//       return key
//     } catch (error) {
//       throw new Error('Cannot create crypto key')
//     }
//   }

//   async getKeySign() {
//     try {
//       const key = await this.promiseSignKey
//       const exp = await crypto.subtle.exportKey('raw', key)
//       // eslint-disable-next-line new-cap
//       console.log('Export - KEY--', new Uint8Array(exp))
//       return key
//     } catch (error) {
//       throw new Error('Cannot create crypto key')
//     }
//   }

//   async exportKeySign() {
//     const key = await this.getKeySign()
//     const exp = await crypto.subtle.exportKey('raw', key)
//     return new Uint8Array(exp)
//   }

//   async getSecret() {
//     return b64.encode(this.secretRaw)
//   }
// }
