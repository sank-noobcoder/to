const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }
});

module.exports = mongoose.model('Task', taskSchema);