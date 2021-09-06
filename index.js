//express
const express = require('express')
const db = require('./app/models')

const app = express()
const port = 4000

db.sequelize.sync()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
})
