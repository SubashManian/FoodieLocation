// src/HotelDetailsModal.js
import React from 'react';
import './HotelDetailsModal.css'; // Import the CSS file for styling

const HotelDetailsModal = ({ show, onClose, hotelDetails }) => {
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
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {hotelDetails.hotelSignatureDishes.map((dish) => (
              <tr key={dish.hotelSignatureDishId}>
                <td>{dish.dishName}</td>
                <td>{dish.dishPrice}</td>
                <td>{dish.dishCategory}</td>
              </tr>
            ))}
          </tbody>
        </table>

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