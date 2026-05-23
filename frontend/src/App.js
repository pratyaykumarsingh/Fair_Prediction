import React, { useState } from "react";

const API_URL = "https://fair-prediction-backend.onrender.com";

function App() {
  const [formData, setFormData] = useState({
    airline: "",
    source: "",
    destination: "",
    stops: 0,
    day: 1,
    month: 1,
    hour: 0,
    minute: 0,
    arrival_hour: 0,
    arrival_minute: 0
  });

  const [fare, setFare] = useState(null);
  const [error, setError] = useState(null);

  // List of airlines for dropdown
  const airlines = [
    "IndiGo",
    "Air India",
    "SpiceJet",
    "Vistara",
    "GoAir",
    "Air Asia",
    "Trujet",
    "Jet Airways",
    "Jet Airways Business",
    "Vistara Premium economy",
    "Multiple carriers",
    "Multiple carriers Premium economy"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "stops" ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.predicted_fare !== undefined) {
        setFare(result.predicted_fare);
        setError(null);
      } else {
        setError(result.error || "Prediction failed");
        setFare(null);
      }
    } catch (err) {
      setError("Backend not reachable");
      setFare(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-green-300 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-2">✈ Aerolytics</h1>
        <p className="text-center text-gray-600 mb-6">
          Plan your trip with ease – Get an estimated ticket price instantly!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Airline Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Airline</label>
            <select
              name="airline"
              value={formData.airline}
              onChange={handleChange}
              className="block w-full border rounded-lg p-2 bg-gray-50"
              required
            >
              <option value="">Select Airline</option>
              {airlines.map((airline, index) => (
                <option key={index} value={airline}>
                  {airline}
                </option>
              ))}
            </select>
          </div>

          {/* Source */}
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="Source City"
            className="block w-full border rounded-lg p-2 bg-gray-50"
            required
          />

          {/* Destination */}
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Destination City"
            className="block w-full border rounded-lg p-2 bg-gray-50"
            required
          />

          {/* Stops */}
          <input
            type="number"
            name="stops"
            value={formData.stops}
            onChange={handleChange}
            placeholder="Number of Stops"
            className="block w-full border rounded-lg p-2 bg-gray-50"
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Predict Fare
          </button>
        </form>

        {fare && <p className="mt-4 text-center text-green-600 font-bold">Predicted Fare: ₹{fare}</p>}
        {error && <p className="mt-4 text-center text-red-600 font-bold">{error}</p>}
      </div>
    </div>
  );
}

export default App;
