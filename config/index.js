var config

if (process.env.NODE_ENV === 'production') {
  config = require('./prod-copy')
} else {
  config = require('./dev')
}
config.isGuestMode = true

module.exports = config
