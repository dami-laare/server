const mongoose = require('mongoose');


// When called it connects to the mongodb database
const connectDatabase = () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(connection => {
            console.log(`Successfully connected to MongoDB with HOST: ${connection.connection.host}`);
        })
        .catch(error => {
            console.log(error);
        });
};

module.exports = connectDatabase;