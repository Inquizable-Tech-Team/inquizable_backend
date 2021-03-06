const questions = require('express').Router()
const client = require('../client.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const verifyToken = require('./verifyToken');
const express = require('express')
questions.use(express.json( {strict: false} )) 
questions.use(express.urlencoded({ extended: true }))


questions.get('/questions/count', (req, res) => {
    client.query('SELECT COUNT(*) FROM questions')
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})

questions.get('/questions/community', (req, res) => {
    client.query('SELECT * FROM questions WHERE approved=1 ORDER BY RANDOM() LIMIT 10')
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})

questions.get('/questions', (req, res) => {
    client.query('SELECT * FROM questions')
        .then(data => {
            res.set("Content-Range", data.rows.length)
            res.json(data.rows)
        })
        .catch(err => res.json(err))
})

questions.post('/questions', (req, res) => {
    const { type, category, difficulty, question, correct_answer, incorrect_answers, approved, Users_id } = req.body
    if (!type || !category || !difficulty || !question || !correct_answer || !incorrect_answers || !approved || !Users_id) return res.json('Not all required Fields are filled out')
    const query = 'INSERT INTO questions (type, category, difficulty, question, correct_answer, incorrect_answers, approved, Users_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *'
    const values = [type, category, difficulty, question, correct_answer, incorrect_answers, approved, Users_id]
    client.query(query, values)
        .then(data => res.json(data.rows[0]))
        .catch(err => res.json(err))
})

questions.get('/questions/submitted/:user', (req, res) => {
    const { user } = req.params
    const query = 'SELECT COUNT(*) FROM questions INNER JOIN users ON users.id=Users_id WHERE questions.approved=1 AND Users_id=$1'
    const values = [user]
    client.query(query, values)
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})


questions.get('/questions/:id', (req, res) => {
    client.query('SELECT * FROM questions WHERE id=$1', [req.params.id])
        .then(data => res.json(data.rows[0]))
        .catch(err => res.json(err))
})

questions.put('/questions/:id/confirm', (req, res) => {
    const values = [req.params.id, req.body.approved]
    if (!req.body.approved) return res.json('Field approved is required')
    client.query('UPDATE questions SET approved=$2 WHERE id=$1 RETURNING *', values)
        .then(data => res.json(data.rows))
        .catch(err => res.json(err))
})

questions.put('/questions/:id', (req, res) => {
    const { type, category, difficulty, question, correct_answer, incorrect_answers, approved, users_id } = req.body
    const { id } = req.params
    /* if (!type || !category || !difficulty || !question || !correct_answer || !incorrect_answers || !approved || !users_id) return res.json('Not all required Fields are filled out') */
    const query = 'UPDATE questions SET type=$2, category=$3, difficulty=$4, question=$5, correct_answer=$6, incorrect_answers=$7, approved=$8, Users_id=$9 WHERE id=$1 RETURNING *'
    const values = [id, type, category, difficulty, question, correct_answer, incorrect_answers, approved, users_id]
    client.query(query, values)
        .then(data => res.json(data.rows[0]))
        .catch(err => res.json(err))
})

questions.delete('/questions/:id', (req, res) => {
    client.query('DELETE FROM questions WHERE id=$1', [req.params.id])
        .then(data => res.json('Element has been removed'))
        .catch(err => res.json(err))
})


module.exports = questions