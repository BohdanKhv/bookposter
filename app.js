const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const connectDB = require('./config/db')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const authorRouter = require('./routes/author')
const bookRouter = require('./routes/book')


if(process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv')
    dotenv.config({ path: './config/config.env' });
}

// View endine
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)

// Static files
app.use(express.static('public'))

// Body parser
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

// Method override ( for "PUT" "DELETE" requests ) NOTE has to be after body parser
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

// Connect db
connectDB()

// Router
app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)


app.listen(process.env.PORT || 3000)