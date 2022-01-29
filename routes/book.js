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

// @desc   Get edit form for book
// @route  GET books/:id/edit
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        const authors = await Author.find()
        res.render('books/edit', {
            book,
            authors
        })
    } catch (err) {
        console.error(err)
        res.redirect('/books')
    }
})

// @desc   Get single book
// @route  GET books/:id
router.get('/:id', async (req, res) => {
    try {
        const book = await Book
                            .findById(req.params.id)
                            .populate('author')
                            .exec()
        res.render('books/show', {
            book
        })
    } catch (err) {
        console.error(err)
        res.redirect('/books')
    }
})


// @desc   Edit book
// @route  PUT books/:id
router.put('/:id', async (req, res) => {
    let book;
    let authors;
    try {
        authors = await Author.find({})
        book = await Book.findById(req.params.id)

        // remove book from the old author
        const prevAuthor = await Author.findByIdAndUpdate(
            book.author,
            { $pull: { books: { $in: [book] } } },
        );
        await prevAuthor.save();

        // Update book 
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description

        if(req.body.cover != null && req.body.cover !== "") {
            saveCover(book, req.body.cover)
        }
        await book.save()

        // add the book to the author
        const newAuthor = await Author.findById({_id: book.author})
        newAuthor.books.push(book);
        await newAuthor.save();
        

        res.redirect(`/books/${book.id}`)
    } catch (err) {
        if (book != null) {
            console.error(err)
            res.render('books/edit', {
                book: book,
                authors: authors,
                errorMessage: err
            })
        } else {
            console.error(err)
            res.redirect('/')
        }
    }
})

// @desc   Delete book
// @route  DELETE books/:id
router.delete('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (err) {
        if(book != null) {
            console.error(err)
            res.render(`books/show`, {
                book: book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/books')
        }
    }
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

        // add the book to the author
        const author = await Author.findById({_id: newBook.author})
        author.books.push(newBook);
        await author.save();

        res.redirect(`books/${newBook.id}`)
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
        res.render('books/new', {
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