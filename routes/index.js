const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')

router.get('/', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec()
        res.render('index', {
            books: books
        })
    } catch (err) {
        console.error(err)
        res.render('index', {
            books: []
        })
    }
})

module.exports = router