const users = require('express').Router()
const client = require('../client.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const verifyToken = require('./verifyToken');
const express = require('express')
users.use(express.json({ strict: false }))
users.use(express.urlencoded({ extended: true }))


users.get('/users', (req, res) => {
    client.query(`SELECT id, nickname, email, points, answered, correct FROM users`)
        .then(data => {
            res.set("Content-Range", data.rows.length)
            res.json(data.rows)
        })
        .catch(err => res.json(err))
})
users.get('/users/count', (req, res) => {
    client.query('SELECT COUNT(*) FROM users')
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})

users.get('/users/answered', (req, res) => {
    client.query('SELECT SUM(answered) FROM users')
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})

users.get('/users/correct', (req, res) => {
    client.query('SELECT SUM(correct) FROM users')
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})

users.post('/users/login', async (req, res) => {
    const { email, pw } = req.body
    if (!pw || !email) return res.json('pw and email is required')
    const user = await client.query("SELECT * FROM users WHERE email=$1", [email])
    if (!user.rows[0]) return res.json('Email does not exists')
    const comparePassword = await bcrypt.compare(pw, user.rows[0].pw)
    if (!comparePassword) return res.status(400).send('Wrong password')
    const token = jwt.sign({ user }, process.env.SECRET, { expiresIn: '1h' })
    res.header('auth-token', token)
    res.json(token)
})

users.post('/users/thisuser', verifyToken, (req, res) => {
    res.json(req.user.user.rows[0])
})

users.get('/users/:id', (req, res) => {
    const { id } = req.params
    const query = 'SELECT id, nickname, email, points, answered, correct, admin FROM users WHERE id=$1'
    const values = [id]
    client.query(query, values)
        .then(data => res.json(data.rows[0]))
        .catch(err => res.json(err))
})

users.put('/users/:id/pw', async (req, res) => {
    const { id } = req.params
    const { pw, newPw, email } = req.body
    if (!pw || !newPw || !email) return res.json('Old / New Password and Email is required')
    const user = await client.query("SELECT * FROM users WHERE email=$1", [email])
    if (!user.rows[0]) return res.json('Email does not exists')
    const comparePassword = await bcrypt.compare(pw, user.rows[0].pw)
    if (!comparePassword) return res.status(400).send('Wrong password')
    else {
        const query = 'UPDATE users SET pw=$2 WHERE id=$1 RETURNING id, nickname, email, points, answered, correct'
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(newPw, salt)
        const values = [id, hashPassword]
        client.query(query, values)
            .then(data => res.json(data.rows))
            .catch(err => res.json(err))
    }
})

users.post('/users/register', async (req, res) => {
    const { nickname, email, pw, points } = req.body
    if (!nickname || !email || !pw || !points) return res.json('Nickname, Email, Password and Points are required')
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(pw, salt)
    const query = 'INSERT INTO users (nickname, email, pw, points) VALUES($1, $2, $3, $4) RETURNING id, nickname, email'
    const values = [nickname, email, hashPassword, points]
    await client.query("SELECT email FROM users WHERE email=$1", [email]).then(data => {
        if (data.rows.length > 0) return res.json('Email already exists')
        else client.query(query, values)
            .then(data => res.json(data.rows))
            .catch(err => res.json(err))
    })
})

users.put('/users/:id/points', (req, res) => {
    const { points, answered, correct } = req.body
    if (!points || !answered || !correct) return res.json('Points, answered and correct are required')
    const { id } = req.params
    const query = 'UPDATE users SET points=$2, answered=$3, correct=$4 WHERE id=$1 RETURNING points, answered, correct'
    const values = [id, points, answered, correct]
    client.query(query, values)
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})

users.put('/users/:id/name', (req, res) => {
    const { nickname } = req.body
    if (!nickname) return res.json('Nickname is required')
    const { id } = req.params
    const query = 'UPDATE users SET nickname=$2 WHERE id=$1 RETURNING nickname'
    const values = [id, nickname]
    client.query(query, values)
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})

users.put('/users/:id/email', (req, res) => {
    const { email } = req.body
    if (!email) return res.json('Email is required')
    const { id } = req.params
    const query = 'UPDATE users SET email=$2 WHERE id=$1 RETURNING email'
    const values = [id, email]
    client.query(query, values)
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})

users.put('/users/:id', (req, res) => {
    const { nickname, email, points, answered, correct } = req.body
    if (!nickname || !email || !points || !answered || !correct) return res.json('Nickname, Email, Points, answered and correct are required')
    const { id } = req.params
    const query = 'UPDATE users SET nickname=$2, email=$3, points=$4, answered=$5, correct=$6 WHERE id=$1 RETURNING id, nickname, email, points, answered, correct'
    const values = [id, nickname, email, points, answered, correct]
    client.query(query, values)
        .then(data => res.json(data.rows[0]))
        .catch(err => res.json(err))
})

module.exports = users