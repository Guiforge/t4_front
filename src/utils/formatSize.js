export default function formatSize(
  bytes,
  decimals,
  sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
) {
  if (bytes === 0) return `0 ${sizes[0]}`
  const k = 1024
  const dm = decimals <= 0 ? 0 : decimals || 2
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const div = k ** i
  return `${parseFloat((bytes / div).toFixed(dm)).toFixed(1)} ${
    sizes[parseInt(i, 10)]
  }`
}
