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
  const metaDecrypt = JSON.parse(decrypt.toString())
  metaDecrypt.ivFiles = Buffer.from(metaDecrypt.ivFiles.data)
  return metaDecrypt
}

export default {
  encryptMeta,
  createCipherFile,
  decryptMeta,
  createDecipherFile,
}
