const cookieParser = require('cookie-parser')
const cors = require('cors');
const errorMiddleware = require('./middlewares/errors')
const express = require('express');
const user = require('./routes/users')
const misc = require('./routes/misc')
const payments = require('./routes/payments')


const app = express();


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())


app.use('/api/v1', user);
app.use('/api/v1', misc);
app.use('/api/v1', payments)

app.use(errorMiddleware)
module.exports = app