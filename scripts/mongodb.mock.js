const mongoose = require('mongoose');

mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
    useCreateIndex: true,
    (err) => {
        if (err) {
            console.error(`Failed to setup mock mongodb with error ${err}`);
            process.exit(1);
        }
    }
});