const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
});

const todoSchema = new Schema({
    title: String,
    done: Boolean,
    userId: ObjectId,
    dueBy: Date,
}, { timestamps: true });
const UserModel = mongoose.model('User', userSchema);//here User is the collection name in the database, userSchema is the schema for the collection, and UserModel is the model name for the collection
const TodoModel = mongoose.model('Todo', todoSchema);//here Todo is the collection name in the database, todoSchema is the schema for the collection, and TodoModel is the model name for the collection

module.exports = { UserModel, TodoModel };

//first require the mongoose module, then create a schema for the collection, then create a model('collection name', schema) for the collection, then export the model. object id is mongoose.Schema.ObjectId.