const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')


// @desc   Get all authors
// @route  GET author/
router.get('/', async (req, res) => {

    let searchOptions = {}
    if(req.query != null && req.query.name !== '' ) {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }

    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index', { 
            authors: authors, 
            searchOptions: req.query 
        })
    } catch (err) {
        res.render('authors', {
            errorMessage: err
        })
    }
})

// @desc   New author route
// @route  GET author/new
router.get('/new', async (req, res) => {
    res.render('authors/new', { author: new Author() })
})

// @desc   Create author route
// @route  POST author/
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        const newAuthor = await author.save()
        res.redirect(`authors/${ newAuthor.id }`)
    } catch (err) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }
})

// @desc   Get author
// @route  GET author/:id
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).limit(6).exec()
        res.render('authors/show', {
            author,
            books
        })
    } catch (err) {
        console.error(err)
        res.redirect('/')
    }
})

// @desc   GET edit form for author
// @route  GET author/:id/edit
router.get('/:id/edit', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {
            author: author
        })
    } catch (err) {
        req.redirect('/authors')
    }
})

// @desc   Edit author
// @route  PUT author/:id
router.put('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${ author.id }`)
    } catch (err) {
        if(author == null) {
            res.render('/')
        } else {
            res.render('authors/edit', {
                author: author,
                errorMessage: err
            })
        }
    }
})

// @desc   Delete author
// @route  DELETE author/:id
router.delete('/:id', async (req, res) => {
    let author;
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect(`/authors`)
    } catch (err) {
        if(author == null) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})

module.exports = router