import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';

const PostReview = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);

  // Proxy-relative URLs
  const dealer_url = `/djangoapp/dealer/${id}`;
  const review_url = `/djangoapp/add_review/`;
  const carmodels_url = `/djangoapp/get_cars/`;

  const postreview = async (e) => {
    e.preventDefault();

    let name = sessionStorage.getItem("firstname") + " " + sessionStorage.getItem("lastname");
    if (name.includes("null")) {
      name = sessionStorage.getItem("username");
    }

    if (!model || review === "" || date === "" || year === "") {
      alert("All details are mandatory");
      return;
    }

    let [make_chosen, ...rest] = model.split(" ");
    let model_chosen = rest.join(" ");

    let jsoninput = {
      name,
      dealership: parseInt(id),
      review,
      purchase: true,
      purchase_date: date,
      car_make: make_chosen,
      car_model: model_chosen,
      car_year: parseInt(year),
    };

    console.log("Submitting review:", jsoninput);

    try {
      const res = await fetch(review_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsoninput),
      });

      const json = await res.json();
      console.log("Response from backend:", json);

      if (json.status === 200) {
        alert("Review submitted!");
        console.log("Redirecting to:", `/dealer/${id}`);
        window.location.href = `/dealer/${id}`;
      } else {
        alert("Error posting review: " + (json.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Check console for details.");
    }
  };

  const get_dealer = async () => {
    try {
      const res = await fetch(dealer_url);
      const retobj = await res.json();
      if (retobj.status === 200 && retobj.dealer?.length > 0) {
        setDealer(retobj.dealer[0]);
      }
    } catch (err) {
      console.error("Error fetching dealer:", err);
    }
  };

  const get_cars = async () => {
    try {
      const res = await fetch(carmodels_url);
      const retobj = await res.json();
      console.log("Fetched car models:", retobj.CarModels);
      setCarmodels(retobj.CarModels || []);
    } catch (err) {
      console.error("Error fetching car models:", err);
    }
  };

  useEffect(() => {
    get_dealer();
    get_cars();
  }, []);

  return (
    <div>
      <Header />
      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>{dealer.full_name}</h1>

        <textarea
          cols="50"
          rows="7"
          placeholder="Write your review here..."
          onChange={(e) => setReview(e.target.value)}
        ></textarea>

        <div className="input_field">
          Purchase Date{" "}
          <input type="date" onChange={(e) => setDate(e.target.value)} />
        </div>

        <p>Loaded {carmodels.length} car models</p>

        <div className="input_field">
          Car Make & Model
          <select onChange={(e) => setModel(e.target.value)} defaultValue="">
            <option value="" disabled hidden>
              Choose Car Make and Model
            </option>
            {carmodels.map((carmodel, idx) => (
              <option
                key={idx}
                value={`${carmodel.CarMake} ${carmodel.CarModel}`}
              >
                {carmodel.CarMake} {carmodel.CarModel}
              </option>
            ))}
          </select>
        </div>

        <div className="input_field">
          Car Year{" "}
          <input
            type="number"
            onChange={(e) => setYear(e.target.value)}
            max={2025}
            min={2010}
          />
        </div>

        <div>
          <button className="postreview" onClick={postreview}>
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;
