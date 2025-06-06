const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ userId: user._id });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or invalid data' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ userId: user._id });
});


module.exports = router;