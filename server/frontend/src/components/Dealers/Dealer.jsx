import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const Dealer = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Proxy-relative URLs
  const dealer_url = `/djangoapp/dealer/${id}`;
  const reviews_url = `/djangoapp/reviews/dealer/${id}`;

  useEffect(() => {
    const fetchDealer = async () => {
      try {
        const res = await fetch(dealer_url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (data.status === 200 && data.dealer?.length > 0) {
          setDealer(data.dealer[0]);
        } else {
          throw new Error("Dealer not found");
        }
      } catch (err) {
        console.error("Error fetching dealer:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(reviews_url);
        const data = await res.json();
        if (data.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchDealer();
    fetchReviews();
  }, [id]);

  if (loading) return <p>Loading dealer info...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!dealer) return <p>No dealer found with ID {id}</p>;

  return (
    <div className="dealer-page">
      <Header />

      <div className="dealer-header">
        <h1>Dealer Details</h1>
      </div>

      <div className="dealer-details-card">
        <ul>
          <li><strong>ID:</strong> {dealer.id}</li>
          <li><strong>Full Name:</strong> {dealer.full_name}</li>
          <li><strong>City:</strong> {dealer.city}</li>
          <li><strong>State:</strong> {dealer.state}</li>
          <li><strong>Address:</strong> {dealer.address}</li>
          <li><strong>Zip:</strong> {dealer.zip}</li>
        </ul>
      </div>

      <div className="reviews-section">
        <h2>Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews found for this dealer.</p>
        ) : (
          <div className="review-cards">
            {reviews.map((r, idx) => (
              <div className="review-card" key={r._id || idx}>
                <p className="review-text">{r.review}</p>
                <p className="review-meta">
                  <strong>{r.name}</strong> — {r.purchase ? "Purchased" : "Not Purchased"}  
                  <br />
                  {r.car_make} {r.car_model} ({r.car_year}) on {r.purchase_date}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <a href={`/postreview/${id}`} className="post-review-button">
          ➕ Post a Review
        </a>
      </div>
    </div>
  );
};

export default Dealer;
