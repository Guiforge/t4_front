/*
 * tar-js
 * MIT (c) 2011 T. Jameson Little
 */

const headerFormat = [
  {
    field: 'fileName',
    length: 100,
  },
  {
    field: 'fileMode',
    length: 8,
  },
  {
    field: 'uid',
    length: 8,
  },
  {
    field: 'gid',
    length: 8,
  },
  {
    field: 'fileSize',
    length: 12,
  },
  {
    field: 'mtime',
    length: 12,
  },
  {
    field: 'checksum',
    length: 8,
  },
  {
    field: 'type',
    length: 1,
  },
  {
    field: 'linkName',
    length: 100,
  },
  {
    field: 'ustar',
    length: 8,
  },
  {
    field: 'owner',
    length: 32,
  },
  {
    field: 'group',
    length: 32,
  },
  {
    field: 'majorNumber',
    length: 8,
  },
  {
    field: 'minorNumber',
    length: 8,
  },
  {
    field: 'filenamePrefix',
    length: 155,
  },
  {
    field: 'padding',
    length: 12,
  },
]

function formatHeader(data, cb) {
  const buffer = Buffer.alloc(512)
  let offset = 0

  headerFormat.forEach((value) => {
    const str = data[value.field] || ''
    let i
    let length

    for (i = 0, length = str.length; i < length; i += 1) {
      // eslint-disable-next-line security/detect-object-injection
      buffer[offset] = str.charCodeAt(i)
      offset += 1
    }

    offset += value.length - i // space it out with nulls
  })

  if (typeof cb === 'function') {
    return cb(buffer, offset)
  }
  return buffer
}

module.exports.structure = headerFormat
module.exports.format = formatHeader
