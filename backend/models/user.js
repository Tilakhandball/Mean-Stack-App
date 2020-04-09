const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // This is used as plugin to work with schemas inorder to validate the unique values for email field and it is a third party

const userSchema = mongoose.Schema({    // Schema is just a blueprint of the model we are going to work or a so called definition
  email: { type: String, required: true, unique: true }, // Upper case here for string && unique is not for validating email field unlike required(checking unique address) instead it is for internal optimization purpose from mongoose perspective.
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema); // to turn a definition into model we need to use model fn of mongoose. name of the model to be caps. name of the collection will be plural form of our model name 'posts'

