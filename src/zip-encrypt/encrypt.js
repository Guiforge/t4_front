import crypto from 'crypto'

function encryptMeta(key, iv, meta) {
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  let encrypted = cipher.update(JSON.stringify(meta), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return { encrypted, auth: cipher.getAuthTag() }
}

function createCipherFile(key, iv) {
  return crypto.createCipheriv('aes-256-gcm', key, iv)
}

function createDecipherFile(key, iv) {
  return crypto.createDecipheriv('aes-256-gcm', key, iv)
}

function decryptMeta(key, iv, meta) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  let decrypt = decipher.update(meta.encrypted, 'hex', 'utf8')
  decipher.setAuthTag(meta.auth)
  decrypt += decipher.final('utf8')
  return JSON.parse(decrypt.toString())
}

export default {
  encryptMeta,
  createCipherFile,
  decryptMeta,
  createDecipherFile,
}
