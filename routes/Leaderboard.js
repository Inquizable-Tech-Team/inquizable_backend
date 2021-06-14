const leaderboard = require('express').Router()
const express = require('express')
leaderboard.use(express.urlencoded({ extended: false }))
const client = require('../client.js')

leaderboard.get('/users/points', (req, res) => {
    client.query('SELECT nickname, points FROM users ORDER BY points DESC')
    .then(data => res.json(data.rows))
    .catch(err => res.json(err))
})

leaderboard.get('/users/contributions', (req, res) => {
    client.query('SELECT nickname, COUNT(*) AS contributions FROM questions INNER JOIN users ON users.id=Users_id WHERE questions.approved=1 GROUP BY nickname ORDER BY contributions DESC')
    .then(data => res.json(data.rows))
    .catch(err => res.json(err))
})

leaderboard.get('/users/percentage', (req, res) => {
    client.query('SELECT nickname, round(CAST( float8 (10000*correct/answered)/100 as numeric), 1) as percentage FROM users WHERE answered>29 ORDER BY percentage DESC')
    .then(data => res.json(data.rows))
    .catch(err => res.json(err))
})

module.exports = leaderboard