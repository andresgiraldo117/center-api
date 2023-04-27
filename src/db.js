const mongoose = require('mongoose');
const { MONGO_DBA, MONGO_DBA2, DB_USER, DB_PASSWORD, DB_PRUEBA } = require('./config');

// (async() => {
//     try {
//         const db = await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.krmfn.mongodb.net/${MONGO_DBA}?retryWrites=true&w=majority`);
//         //console.log('Db connected to', db.connection.name);
//     } catch (error) {
//         //console.log(error)
//     }
// })();

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.dgatyjh.mongodb.net/${MONGO_DBA}?retryWrites=true&w=majority`)
    .then(db => console.log('Db connected to ', db.connection.name))
    .catch(err => console.error('Failed ', err));

/* mongoose.connect(`mongodb://localhost:27017/${MONGO_DBA}?retryWrites=true&w=majority`)
    .then(db => console.log('Db connected to ', db.connection.name))
    .catch(err => console.error('Failed ', err)); */