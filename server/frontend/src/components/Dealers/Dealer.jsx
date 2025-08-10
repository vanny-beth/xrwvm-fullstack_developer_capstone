import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";

const Dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  const get_dealers = async () => {
    try {
      const res = await fetch("http://localhost:3030/fetchDealers");
      const data = await res.json();
      setDealers(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching dealers:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    get_dealers();
  }, []);

  return (
    <div style={{ margin: "20px" }}>
      <h1>All Dealers</h1>
      {loading ? (
        <p>Loading dealers...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>City</th>
              <th>State</th>
              <th>Address</th>
              <th>Zip</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((dealer) => (
              <tr key={dealer.id}>
                <td>{dealer.id}</td>
                <td>{dealer.full_name}</td>
                <td>{dealer.city}</td>
                <td>{dealer.state}</td>
                <td>{dealer.address}</td>
                <td>{dealer.zip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dealers;
