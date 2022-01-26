const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// @desc   Get all books
// @route  GET books/
router.get('/', async (req, res) => {

    let query = Book.find()
    if(req.query.title != null && req.query.title !== '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore !== '') {
        query = query.lte('publishDate', req.query.publishedBefore) // lte()  => before or at the date (before what dete, date)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter !== '') {
        query = query.gte('publishDate', req.query.publishedAfter) // lte()  => after or at the date (after what dete, date)
    }

    try {

        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query 
        })

    } catch (err) {
        console.error(err)
        res.redirect('books')
    }

})

// @desc   Get new book
// @route  GET books/new
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book(), null)
})

// @desc   Create new book
// @route  POST books/
router.post('/', async (req, res) => {

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })
    saveCover(book, req.body.cover)

    try {

        const newBook = await book.save()
        // res.redirect(`books/new/${newBook.id}`)
        res.redirect('books')

    } catch (err) {
        renderNewPage(res, book, err)
    }
})

async function renderNewPage (res, book, err) {
    try {
        const authors = await Author.find()
        const params = {
            authors: authors,
            book: book
        }
        if(err != null) params.errorMessage = err
        res.render('books/new', params)
    } catch (err) {
        res.render('books', {
            errorMessage: err
        })
    }
}

function saveCover (book, coverEncoded) {
    if ( coverEncoded == null ) return
    const cover = JSON.parse(coverEncoded)
    if ( cover != null && imageMimeTypes.includes(cover.type) ) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router