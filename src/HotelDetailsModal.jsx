// src/HotelDetailsModal.js
import React, {useState, useEffect} from 'react';
import './HotelDetailsModal.css'; // Import the CSS file for styling

const baseUrl = 'https://food-app-be-sequelize-6i8s.onrender.com';

const HotelDetailsModal = ({ show, onClose, hotelDetails }) => {
  // State for multiple dishes
  const [dishes, setDishes] = useState([]);
  const [newDish, setNewDish] = useState({ dishName: '', dishPrice: '' });
  const [loading, setLoading] = useState(false);

  // Handle input change for new dish
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDish({ ...newDish, [name]: value });
  };

  // Add dish to the list (but don't submit yet)
  const handleAddDish = () => {
    if (newDish.dishName && newDish.dishPrice) {
      setDishes([...dishes, newDish]);
      setNewDish({ dishName: '', dishPrice: '' }); // Clear the input fields
    }
  };

  // Submit all dishes
  const handleSubmitDishes = async () => {
    setLoading(true);
    try {
      for (let dish of dishes) {
        const dishData = {
          hotelId: hotelDetails.hotelId,  // Assuming hotelId is part of hotelDetails
          dishName: dish.dishName,
          dishPrice: dish.dishPrice
        };

        const response = await fetch(`${baseUrl}/dish`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(dishData),
        });

        if (!response.ok) {
          console.error('Error adding dish:', response.statusText);
          throw new Error('Failed to add dish');
        }
      }

      // After successful submission, update the hotelSignatureDishes and clear the added dishes
      hotelDetails.hotelSignatureDishes.push(...dishes);
      setDishes([]); // Clear the dishes array
    } catch (error) {
      console.error('Error adding dishes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Hotel Details</h2>
        <button className="close-button" onClick={onClose}>X</button>

        {/* Display Signature Dishes */}
        <h3>Signature Dishes</h3>
        <table className="details-table">
          <thead>
            <tr>
              <th>Dish Name</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {hotelDetails.hotelSignatureDishes.map((dish) => (
              <tr key={dish.hotelSignatureDishId}>
                <td>{dish.dishName}</td>
                <td>{dish.dishPrice}</td>
              </tr>
            ))}
            {dishes.map((dish, index) => (
              <tr key={index}>
                <td>{dish.dishName}</td>
                <td>{dish.dishPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Add New Dish Form */}
        <h4>Add New Signature Dish</h4>
        <div className="add-dish-form">
            <input
                type="text"
                name="dishName"
                placeholder="Dish Name"
                value={newDish.dishName}
                onChange={handleInputChange}
            />
            <input
                type="text"
                name="dishPrice"
                placeholder="Dish Price"
                value={newDish.dishPrice}
                onChange={handleInputChange}
            />
            <button onClick={handleAddDish} disabled={!newDish.dishName || !newDish.dishPrice}>
                Add Another
            </button>
        </div>

        {/* Submit All Dishes Button */}
        <button onClick={handleSubmitDishes} disabled={dishes.length === 0 || loading}>
            {loading ? 'Submitting...' : 'Submit All Dishes'}
        </button>

        {/* Display Timings */}
        {
          hotelDetails?.hotelTimings.length > 0 && 
          <>
            <h3>Operating Timings</h3>
            <table className="details-table">
              <thead>
                <tr>
                  <th>Morning</th>
                  <th>Noon</th>
                  <th>Evening</th>
                  <th>Late Night</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{hotelDetails.hotelTimings[0].morning}</td>
                  <td>{hotelDetails.hotelTimings[0].noon}</td>
                  <td>{hotelDetails.hotelTimings[0].evening}</td>
                  <td>{hotelDetails.hotelTimings[0].lateNight ? 'Yes' : 'No'}</td>
                </tr>
              </tbody>
            </table>
          </>
        }
      </div>
    </div>
  );
};

export default HotelDetailsModal;