const encode = new TextEncoder()

export default class Keys {
  constructor(secret) {
    if (secret) {
      const secretRaw = encode.encode(secret)
      this.promiseDeriveKey = crypto.subtle.importKey(
        'raw',
        secretRaw,
        { name: 'PBKDF2' },
        false,
        ['deriveKey'],
      )
    } else {
      const secretRaw = crypto.getRandomValues(new Uint8Array(96))
      this.promiseDeriveKey = crypto.subtle.importKey(
        'raw',
        secretRaw,
        { name: 'HKDF' }, // best for non password
        false,
        ['deriveKey'],
      )
    }
    this.promiseMetaKey = this.promiseDeriveKey.then((deriveKey) => {
      crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: crypto.getRandomValues(new Uint8Array(256)),
          info: encode.encode('meta'),
        },
        deriveKey,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['decrypt', 'encrypt'],
      )
    })

    this.promiseFileKey = this.promiseDeriveKey.then((deriveKey) => {
      crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: crypto.getRandomValues(new Uint8Array(256)),
          info: encode.encode('meta'),
        },
        deriveKey,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['decrypt', 'encrypt'],
      )
    })

    this.promiseSignKey = this.promiseDeriveKey.then((deriveKey) => {
      crypto.subtle.deriveKey(
        {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: crypto.getRandomValues(new Uint8Array(256)),
          info: encode.encode('meta'),
        },
        deriveKey,
        {
          name: 'HMAC',
          hash: 'SHA-256',
        },
        false,
        ['sign'],
      )
    })
  }
}
