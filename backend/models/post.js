const mongoose = require('mongoose');

const postSchema = mongoose.Schema({    //Schema is just a blueprint of the model we are going to work or a so called definition
  title: { type: String, required: true }, //Upper case here for string
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // ref refers to which model this id is going to belong.
});

module.exports = mongoose.model('Post', postSchema); //to turn a definition into model we need to use model fn of mongoose. name of the model to be caps. name of the collection will be plural form of our model name 'posts'

