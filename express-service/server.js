const express = require('express');
const mongoose = require('mongoose');
const Dealership = require('./models/dealership');

const app = express();
const port = 3030;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dealerships', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Single route to fetch dealers (all or by state)
app.get('/fetchDealers', async (req, res) => {
    try {
      const { state } = req.query;
      let query = {};
  
      if (state) {
        const normalized = state.trim().toLowerCase();
        query = {
          $or: [
            { state: { $regex: `^${normalized}$`, $options: 'i' } },
            { st: { $regex: `^${normalized}$`, $options: 'i' } }
          ]
        };
      }
  
      console.log('MongoDB query:', query); // helpful for debugging
  
      const dealers = await Dealership.find(query).sort({ id: 1 });
      res.json(dealers);
    } catch (err) {
      console.error('Error fetching dealers:', err);
      res.status(500).send('Error fetching dealers');
    }
  });  

// Route to fetch a single dealer by id
app.get('/fetchDealer/:id', async (req, res) => {
    try {
      const dealerId = parseInt(req.params.id, 10);
      const dealer = await Dealership.findOne({ id: dealerId });
  
      if (!dealer) {
        return res.status(404).send({ error: 'Dealer not found' });
      }
  
      res.json(dealer);
    } catch (err) {
      console.error('Error fetching dealer by id:', err);
      res.status(500).send('Error fetching dealer');
    }
  });  

// Start the server
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});
