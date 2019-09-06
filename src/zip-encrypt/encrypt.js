import crypto from 'crypto'

function encryptMeta(key, iv, meta) {
  console.log('key, iv', { key, iv })
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  cipher.update(JSON.stringify(meta), 'utf8', 'hex')
  return cipher.final('hex')
}

function createCipherFile(key, iv) {
  return crypto.createCipheriv('aes-256-gcm', key, iv)
}
export default {
  encryptMeta,
  createCipherFile,
}
