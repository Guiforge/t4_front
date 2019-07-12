// import axios from 'axios'

// eslint-disable-next-line import/prefer-default-export
export default function send(socket, data) {
  console.log(data.enc)

  // axios
  //   .post('/user', data)
  //   .then((response) => {
  //     console.log(response)
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //   })
  socket.emit('data', data)
}
