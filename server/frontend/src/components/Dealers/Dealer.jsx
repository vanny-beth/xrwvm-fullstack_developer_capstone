import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";

const Dealer = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "https://vanessayucab-3030.theiadockernext-0-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai";

  useEffect(() => {
    const getDealerById = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/fetchDealer/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setDealer(data);
      } catch (err) {
        console.error("Error fetching dealer:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getDealerById();
  }, [id]);

  useEffect(() => {
    const getReviewsByDealer = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/fetchReviews/dealer/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    getReviewsByDealer();
  }, [id]);

  if (loading) return <p>Loading dealer info...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!dealer) return <p>No dealer found with ID {id}</p>;

  return (
    <div style={{ margin: "20px" }}>
      <h1>Dealer Details</h1>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr><td>ID</td><td>{dealer.id}</td></tr>
          <tr><td>Full Name</td><td>{dealer.full_name}</td></tr>
          <tr><td>City</td><td>{dealer.city}</td></tr>
          <tr><td>State</td><td>{dealer.state}</td></tr>
          <tr><td>Address</td><td>{dealer.address}</td></tr>
          <tr><td>Zip</td><td>{dealer.zip}</td></tr>
        </tbody>
      </table>

      <h2 style={{ marginTop: "30px" }}>Reviews</h2>
      {reviews.length === 0 ? (
        <p>No reviews found for this dealer.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Review</th>
              <th>Purchase</th>
              <th>Car</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.review}</td>
                <td>{r.purchase ? "Yes" : "No"}</td>
                <td>{`${r.car_make} ${r.car_model} ${r.car_year}`}</td>
                <td>{r.purchase_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: "20px" }}>
        <a href={`/postreview/${id}`} style={{ textDecoration: "none", color: "blue" }}>
          ➕ Post a Review
        </a>
      </div>
    </div>
  );
};

export default Dealer;
