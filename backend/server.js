const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb://localhost:27017/evaluation_db';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));


const titleSchema = new mongoose.Schema({ name: String });
const Title = mongoose.model('Title', titleSchema);


app.post('/api/check-title', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ available: false, message: 'Title is required.' });
  }

  try {
    const existingTitle = await Title.findOne({ name });
    if (existingTitle) {
      res.json({ available: false, message: 'The title is already taken.' });
    } else {
      res.json({ available: true, message: 'The title is available.' });
    }
  } catch (error) {
    console.error('Error querying the database:', error);
    res.status(500).json({ available: false, message: 'An error occurred. Please try again.' });
  }
});


app.post('/api/add-title', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  try {
    const newTitle = new Title({ name });
    await newTitle.save();
    res.status(201).json({ message: 'Title added successfully.' });
  } catch (error) {
    console.error('Error adding the title:', error);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

