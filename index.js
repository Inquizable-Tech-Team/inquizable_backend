const express = require('express')
const app = express()
const port = 3002
const loginRoute = require('./routes/loginRoute')


app.use('/', loginRoute)


app.listen(port, console.log(`Server is listening on port ${port}`));