const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const connectDB = require('./config/db');
const indexRouter = require('./routes/index')

if(process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv')
    dotenv.config({ path: './config/config.env' });
}

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

// Connect db
connectDB()

// Router
app.use('/', indexRouter)

app.listen(process.env.PORT || 3000)