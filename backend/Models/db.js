const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_URL;

mongoose.connect(mongo_url)
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.log('mongo connection failed',err);
    })