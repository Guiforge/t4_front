/* eslint-disable no-underscore-dangle */
import cryptoBro from 'crypto'

async function myPbkdf2(secret, salt, keylen) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    secret,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  )
  try {
    const ret = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: Buffer.from(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      keylen,
    )
    return Buffer.from(ret)
  } catch (error) {
    throw error
  }
}

async function _KeyCreate(secret, info, keylen) {
  const salt = cryptoBro
    .createHash('sha512')
    .update(info)
    .digest('hex')
  return myPbkdf2(secret, salt, keylen)
}

export default class KeysConstructor {
  constructor(pass) {
    this._secretRaw = pass || cryptoBro.randomBytes(96)
    this._KeyDeriveProm = _KeyCreate(
      Buffer.from(this._secretRaw),
      'KeyDerive',
      512,
    ).then(this._initKey.bind(this))

    this._IvMeta = cryptoBro.randomBytes(128)
    this._IvFile = cryptoBro.randomBytes(128)
  }

  _initKey(deriveKey) {
    this._KeyFileProm = _KeyCreate(deriveKey, 'KeyFile', 32 * 8)
    this._KeyMetaProm = _KeyCreate(deriveKey, 'KeyMeta', 32 * 8)
    this._KeyAuth = cryptoBro
      .createHmac('sha512', 'password')
      .update(deriveKey)
      .digest()
  }

  getIvMeta() {
    return this._IvMeta
  }

  getIvFile() {
    return this._IvFile
  }

  async getKeyAuth() {
    if (!this._KeyAuth) {
      await this._KeyDeriveProm
    }
    return this._KeyAuth
  }

  async getKeyFile() {
    if (!this._KeyFileProm) {
      await this._KeyDeriveProm
    }
    return this._KeyFileProm
  }

  async getKeyMeta() {
    if (!this._KeyMetaProm) {
      await this._KeyDeriveProm
    }
    return this._KeyMetaProm
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
