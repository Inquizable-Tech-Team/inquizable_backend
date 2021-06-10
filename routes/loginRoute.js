const loginRoute = require('express').Router()
const express = require('express')
loginRoute.use(express.urlencoded())
const client = require('../client.js')

loginRoute.get('/', (req, res) => {
    res.json('Api is working!')
})


loginRoute.get('/users', (req, res) => {
    client.query(`SELECT * FROM users`)
    .then(data => res.json(data.rows))
})

loginRoute.post('/users', (req, res) => {
    const {nickname, email, pw, points} = req.body
    client.query(`INSERT INTO users (nickname, email, pw, points) VALUES('${nickname}', '${email}', '${pw}', '${points}') RETURNING *`)
    .then(data => res.json(data.rows))
})

loginRoute.get('/questions', (req, res) => {
    client.query(`SELECT * FROM questions`)
    .then(data => res.json(data.rows))
})

loginRoute.post('/questions', (req, res) => {
    const {type, category, difficulty, question, correct_answer, incorrect_answers, approved, Users_id} = req.body
    client.query(`INSERT INTO questions (type, category, difficulty, question, correct_answer, incorrect_answers, approved, Users_id) VALUES('${type}', '${category}', '${difficulty}', '${question}', '${correct_answer}', '${incorrect_answers}', '${approved}', '${Users_id}') RETURNING *`)
    .then(data => res.json(data.rows))
})

loginRoute.get('/questions/:user', (req, res) => {
    let {user} = req.params
    client.query(`SELECT COUNT(*) FROM questions INNER JOIN users ON users.id=Users_id WHERE questions.approved=1 AND Users_id=${user}`)
    .then(data => res.json(data.rows))
})

module.exports = loginRoute