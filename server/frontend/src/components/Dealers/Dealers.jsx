import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("All");

  const dealer_url = "/djangoapp/get_dealers";

  const get_dealers = async () => {
    const res = await fetch(dealer_url);
    const data = await res.json();
    console.log("Dealers API response:", data);
    if (data.status === 200) {
      const all_dealers = Array.from(data.dealers);
      const uniqueStates = [...new Set(all_dealers.map(d => d.state))];
      setStates(uniqueStates);
      setDealersList(all_dealers);
    }
  };

  const filterDealers = async (state) => {
    setSelectedState(state);
    if (state === "All") {
      get_dealers();
      return;
    }
    const res = await fetch(`${dealer_url}/${state}`);
    const data = await res.json();
    if (data.status === 200) {
      setDealersList(Array.from(data.dealers));
    }
  };

  useEffect(() => {
    get_dealers();
  }, []);

  const isLoggedIn = sessionStorage.getItem("username") !== null;

  return (
    <div className="dealer-page">
      <Header />

      <div className="dealer-header">
        <h1>Dealerships</h1>
        <select
          value={selectedState}
          onChange={e => filterDealers(e.target.value)}
        >
          <option value="" disabled hidden>State</option>
          <option value="All">All States</option>
          {states.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <h2 style={{ margin: "20px 0", color: "#003366" }}>
        Showing dealers in: {selectedState}
      </h2>

      <table className='table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>State</th>
            {isLoggedIn && <th>Review Dealer</th>}
          </tr>
        </thead>
        <tbody>
          {dealersList.map(d => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td><Link to={`/dealer/${d.id}`}>{d.full_name}</Link></td>
              <td>{d.city}</td>
              <td>{d.address}</td>
              <td>{d.zip}</td>
              <td>{d.state}</td>
              {isLoggedIn && (
                <td>
                  <Link to={`/postreview/${d.id}`}>
                    <img src={review_icon} className="review_icon" alt="Post Review" />
                  </Link>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dealers;
