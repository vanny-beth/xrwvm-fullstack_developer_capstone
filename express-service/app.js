// Load dependencies
const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3030;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Load JSON data
const reviews_data = JSON.parse(fs.readFileSync("../server/database/data/reviews.json", "utf8"));
const dealerships_data = JSON.parse(fs.readFileSync("../server/database/data/dealerships.json", "utf8"));

// Import models
const Reviews = require("./models/review");
const Dealerships = require("./models/dealership");


// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/dealerships", {
  // You can remove these deprecated options
})

.then(() => {
  console.log("Connected to MongoDB");

  // Preload JSON data into DB
  Reviews.deleteMany({})
    .then(() => Reviews.insertMany(reviews_data['reviews']))
    .catch(err => console.error("Error loading reviews:", err));

  Dealerships.deleteMany({})
    .then(() => Dealerships.insertMany(dealerships_data['dealerships']))
    .catch(err => console.error("Error loading dealerships:", err));
})
.catch(err => console.error("Mongo connection error:", err));

// Routes
app.get("/", (req, res) => res.send("Welcome to the Mongoose API"));

app.get("/fetchReviews", async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: "Error fetching documents" });
  }
});

app.get("/fetchReviews/dealer/:id", async (req, res) => {
    try {
      const dealerId = parseInt(req.params.id); // 👈 Cast to number
      const documents = await Reviews.find({ dealership: dealerId });
      res.json(documents);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Error fetching documents" });
    }
  });
    
app.get("/fetchDealers", async (req, res) => {
  try {
    const dealers = await Dealerships.find();
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching dealers" });
  }
});

app.get("/fetchDealers/:state", async (req, res) => {
  try {
    const dealers = await Dealerships.find({ state: req.params.state });
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching dealers by state" });
  }
});

app.get("/api/dealers", async (req, res) => {
  try {
    const dealers = await Dealerships.find();
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching dealers" });
  }
});

app.get("/fetchDealer/:id", async (req, res) => {
  try {
    const dealer = await Dealerships.findOne({ id: parseInt(req.params.id) });
    res.json(dealer);
  } catch (error) {
    res.status(500).json({ error: "Error fetching dealer by id" });
  }
});

app.post("/insert_review", async (req, res) => {
    try {
      const data = req.body;
      const documents = await Reviews.find().sort({ id: -1 });
      const new_id = documents.length ? documents[0].id + 1 : 1;
  
      const review = new Reviews({
        id: new_id,
        name: data.name,
        dealership: data.dealership,
        review: data.review,
        purchase: data.purchase,
        purchase_date: data.purchase_date,
        car_make: data.car_make,
        car_model: data.car_model,
        car_year: data.car_year
      });
  
      const savedReview = await review.save();
      res.json({ status: 200, review: savedReview });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 500, error: "Error inserting review" });
    }
  });  

// Start server
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
