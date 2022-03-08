const connectDatabase = require('./config/connectDatabase');
const app = require('./app');


// Handling uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`ERROR: ${err.stack}`)
    console.log('Server shutting down due to uncaught exception')
    process.exit(1)
})

// Setting up env file
require('dotenv').config({path: 'server/config/config.env'});

// Connect to database
connectDatabase()


const server = app.listen(process.env.PORT || 4000, () => {
    console.log(`Server started on PORT: ${process.env.PORT || 4000}`)
})

app.get('/', (req, res) => {
    res.send('Hello nigga!!!')
})

// Handling unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`ERROR: ${err.message}`);
    console.log(`Shutting down server due to unhandled rejection`)
    server.close(() => {
        process.exit(1);
    })
})