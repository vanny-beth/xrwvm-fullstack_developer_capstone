import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";

const Dealer = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDealerById = async () => {
    try {
      const res = await fetch(`/djangoapp/get_dealer/${id}`);
      const data = await res.json();
      if (data.status === 200) {
        setDealer(data.dealer);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dealer:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    getDealerById();
  }, [id]);

  if (loading) return <p>Loading dealer info...</p>;
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
    </div>
  );
};

export default Dealer;
