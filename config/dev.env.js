const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

const PORT = '8070'
const HOST = 'localhost'
const API_URL = `http://${HOST}:${8070}`

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  PORT: `"${PORT}"`,
  HOST: `"${HOST}"`,
  API_URL: `"${API_URL}"`
})
