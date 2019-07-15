import axios from 'axios'
// eslint-disable-next-line import/prefer-default-export
export default async function send(data) {
  const rep = await axios.post('/upload', data)
  return rep.id
}
