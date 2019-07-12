// import axios from 'axios'

// eslint-disable-next-line import/prefer-default-export
export default function send(socket, data) {
  console.log(data)
  socket.emit('data', data)
}
