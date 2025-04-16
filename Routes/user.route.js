const express = require('express');
const userModel = require('../Models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRouter = express.Router();

userRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
  try {
    let user = await userModel.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
    console.error(error);
  }
})

userRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
})

userRouter.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = userRouter