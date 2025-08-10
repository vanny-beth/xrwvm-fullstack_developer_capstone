import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ✅ Import Link for client-side routing
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);

  const dealer_url = "/djangoapp/get_dealers";
  const dealer_url_by_state = "/djangoapp/get_dealers/";

  const filterDealers = async (state) => {
    const res = await fetch(dealer_url_by_state + state, {
      method: "GET"
    });
    const retobj = await res.json();
    if (retobj.status === 200) {
      setDealersList(Array.from(retobj.dealers));
    }
  };

  const get_dealers = async () => {
    const res = await fetch(dealer_url, {
      method: "GET"
    });
    const retobj = await res.json();
    if (retobj.status === 200) {
      const all_dealers = Array.from(retobj.dealers);
      const uniqueStates = [...new Set(all_dealers.map(dealer => dealer.state))];
      setStates(uniqueStates);
      setDealersList(all_dealers);
    }
  };

  useEffect(() => {
    get_dealers();
  }, []);

  const isLoggedIn = sessionStorage.getItem("username") !== null;

  return (
    <div>
      <Header />

      <table className='table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>
              <select name="state" id="state" onChange={(e) => filterDealers(e.target.value)}>
                <option value="" selected disabled hidden>State</option>
                <option value="All">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </th>
            {isLoggedIn && <th>Review Dealer</th>}
          </tr>
        </thead>
        <tbody>
          {dealersList.map(dealer => (
            <tr key={dealer.id}>
              <td>{dealer.id}</td>
              <td>
                <Link to={`/dealer/${dealer.id}`}>{dealer.full_name}</Link> {/* ✅ Link instead of <a> */}
              </td>
              <td>{dealer.city}</td>
              <td>{dealer.address}</td>
              <td>{dealer.zip}</td>
              <td>{dealer.state}</td>
              {isLoggedIn && (
                <td>
                  <Link to={`/postreview/${dealer.id}`}>
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
