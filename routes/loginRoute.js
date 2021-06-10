const loginRoute = require('express').Router()
const express = require('express')
loginRoute.use(express.urlencoded())
const client = require('../client.js')


loginRoute.get('/', (req, res) => {
    client.query(`SELECT * FROM users`)
    .then(data => res.json(data.rows))
})

loginRoute.post('/', (req, res) => {
    const {nickname, email, pw, points} = req.body
    client.query(`INSERT INTO users (nickname, email, pw, points) VALUES('${nickname}', '${email}', '${pw}', '${points}') RETURNING *`)
    .then(data => res.json(data.rows))
})


module.exports = loginRoute