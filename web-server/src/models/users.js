const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'] },
  password: { type: String, required: true, minlength: [6, 'Password must be at least 6 characters long'] },
  address: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
});

module.exports = mongoose.model('User', userSchema);