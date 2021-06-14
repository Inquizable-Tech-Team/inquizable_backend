const express = require('express')
const app = express()
const helmet = require("helmet");
const port = process.env.PORT || 3002
const users = require('./routes/Users')
const questions = require('./routes/Questions')
const leaderboard = require('./routes/Leaderboard')
const cors = require('cors')
app.use(helmet())
app.use(cors())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
  })

app.use('/', leaderboard)
app.use('/', users)
app.use('/', questions)


app.listen(port, console.log(`Server is listening on port ${port}`))