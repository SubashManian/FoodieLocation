import React, { useState, useEffect } from 'react';
import './HotelList.css';
import HotelDetailsModal from './HotelDetailsModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const baseUrl = 'https://food-app-be-sequelize-6i8s.onrender.com';

const HotelLocationList = () => {

  const category = [
    {'Name': 'NonVeg', 'ID': 'NonVeg'},
    {'Name': 'Veg', 'ID': 'Veg'},
    {'Name': 'Beverage', 'ID': 'Beverage'},
    {'Name': 'Cafe', 'ID': 'Cafe'},
    {'Name': 'Snacks', 'ID': 'Snacks'},
    {'Name': 'Fast Food', 'ID': 'Fast Food'},
    {'Name': 'Deserts', 'ID': 'Deserts'},
    {'Name': 'RestoBar', 'ID': 'RestoBar'},
  ];

  const [hotels, setHotels] = useState([]);
  const [modalSelectedHotel, setModalSelectedHotel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingHotelId, setEditingHotelId] = useState(null); // Track which hotel is being edited
  const [editedHotel, setEditedHotel] = useState(null); // Track the edited hotel data
  const [loadingHotelIds, setLoadingHotelIds] = useState([]);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedHotels, setSelectedHotels] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [mergeData, setMergeData] = useState([]);
  const [originalHotel, setOriginalHotel] = useState(null);

  const handleRadioChange = (hotelId) => {
    setOriginalHotel(hotelId);
  };

  // Fetch hotels data from the API
  const fetchHotels = async () => {
    try {
      setLoading(true); // Start loading
      const url = !showVerifiedOnly ? `${baseUrl}/getVerifiedHotels` : `${baseUrl}/getVerifiedHotels/true`
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHotels(data);
      setError(null); 
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const searchHotels = async (name) => {
    try {
      setLoading(true); // Start loading
      const response = await fetch(`${baseUrl}/searchhotels/${name}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setHotels(data);
      setError(null); 
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [showVerifiedOnly]);

  // Handle checkbox change for filtering
  const handleCheckboxChange = (e) => {
    setShowVerifiedOnly(e.target.checked);
  };

  // Fetch count data from the API
  const fetchCount = async (userMobileNumber) => {
    try {
      setLoading(true); // Start loading
      let url = userMobileNumber === '' ? `${baseUrl}/count` : `${baseUrl}/count/${userMobileNumber}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setError(null); // Clear any previous errors
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Handle approve action
  const handleApprove = async (hotelId, valid) => {
    setLoadingHotelIds((prev) => [...prev, hotelId]);
    try {
      const response = await fetch(`${baseUrl}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: hotelId,
          verified: true,
          valid: valid,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve the hotel');
      }
      console.log(`Hotel with ID ${hotelId} approved.`);
      alert(`Hotel with ID ${hotelId} approved.`);
      // Optionally, refetch hotels or update the local state
      fetchHotels();
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingHotelIds((prev) => prev.filter((id) => id !== hotelId)); // Remove hotel ID from loading list
    }
  };

  useEffect(() => {
    fetchCount('');
    fetchHotels();
  }, []);

  const handleSearchChange = (event) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      setSearchTerm('');
      fetchCount('');
      fetchHotels();
    } else {
      if (searchValue?.trim()?.length > 4) {
        searchHotels(searchValue?.trim());
      }
    }
  };

  // Function to filter hotels by userMobileNumber and vlogPostDate
  const filterHotels = (searchValue, date) => {  
    const filtered = hotels.filter((hotel) => {
      const matchesSearch = hotel.userMobileNumber.includes(searchValue);
      const matchesDate = date ? new Date(hotel.createdDate).toDateString() === date.toDateString() : true;

      return matchesSearch && matchesDate;
    });

    setHotels(filtered);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalSelectedHotel(null);
  };

  const handleHotelSelect = (hotel) => {
    // Mock fetching details for selected hotel
    console.log("Entered Modal");
    
    setModalSelectedHotel(hotel);
    setShowModal(true);
  };

  const handleEditClick = (hotel) => {
    setEditingHotelId(hotel.hotelId);
    setEditedHotel({ ...hotel }); // Copy the hotel data to be edited
  };

  const handleSaveClick = async () => {
    // Update the hotel with editedHotel data
    const updatedHotels = hotels.map((hotel) =>
      hotel.hotelId === editingHotelId ? editedHotel : hotel
    );
    setLoadingHotelIds((prev) => [...prev, editingHotelId]);
    try {
      const response = await fetch(`${baseUrl}/updateHotel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editedHotel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update the hotel details');
      }
      console.log(`Hotel with ID ${editingHotelId} updated.`);
      // alert(`Hotel with ID ${editingHotelId} updated.`);
      setHotels(updatedHotels);
      setEditingHotelId(null);
      setEditedHotel(null);
      // Optionally, refetch hotels or update the local state
      fetchHotels();
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
      setHotels(hotels);
      setEditingHotelId(null);
      setEditedHotel(null);
    } finally {
      setLoadingHotelIds((prev) => prev.filter((id) => id !== editingHotelId)); // Remove hotel ID from loading list
    }
  };

  const handleCancelClick = () => {
    setEditingHotelId(null);
    setEditedHotel(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedHotel((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Checkbox Change
  const handleDuplicateCheckChange = (hotelId) => {
    setSelectedHotels((prevSelectedHotels) => {
        if (prevSelectedHotels.includes(hotelId)) {
            return prevSelectedHotels.filter(id => id !== hotelId);
        } else {
            return [...prevSelectedHotels, hotelId];
        }
    });
  };

  // Handle Check All Toggle
  const handleCheckAll = (e) => {
    const isChecked = e.target.checked;
    setIsAllChecked(isChecked);
    if (isChecked) {
        setSelectedHotels(hotels.map(hotel => hotel.hotelId));
    } else {
        setSelectedHotels([]);
    }
  };

  const updateHotelVideos = async (videoList) => {
    if (videoList?.length > 0) {
      try {
        const promises = videoList.map((item) => 
          fetch(`${baseUrl}/createhotelvideo`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
          })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to merge the hotel video for item ${item.hotelId}`);
            }
            console.log("Hotel video merged for hotelId:", item.hotelId);
            return response;
          })
        );
    
        await Promise.all(promises);
        const confirmDelete = window.confirm("All hotel videos merged successfully, do you want to delete the duplicate records?");

        if (confirmDelete) {
          handleDuplicateDelete();
        }
      } catch (error) {
        console.log(error);
        alert(`Error: ${error.message}`);
      } finally {
        // Optionally perform cleanup tasks here
        // Example: clear loading states
        // setLoadingHotelIds([]); 
      }
    }
  }

  const handleDuplicateDelete = async () => {
    if (selectedHotels?.length > 0) {
      try {
        const promises = selectedHotels.map((item) => {
          if (item != originalHotel) {
            return (
              fetch(`${baseUrl}/deletehotel/${item}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Failed to delete the hotel for item ${item}`);
                }
                console.log("Hotel Deleted for hotelId:", item);
                return response;
              })
            );
          } else {
            console.log('Original Data');
          }
        });
    
        await Promise.all(promises);
        setSelectedHotels([]);
        setOriginalHotel(null);
        searchHotels(searchTerm);
        alert("Record deleted successfully.");
      } catch (error) {
        console.log(error);
        alert(`Error: ${error.message}`);
      } finally {
        // Optionally perform cleanup tasks here
        // Example: clear loading states
        // setLoadingHotelIds([]); 
      }
    }
  }

  // Handle Merge Button Click
  const handleMergeClick = () => {
    if (originalHotel != null && originalHotel != undefined) {
      const selectedHotelData = hotels.filter(hotel => selectedHotels.includes(hotel.hotelId))
        .map(hotel => {
          return ({
            hotelVlogVideoLink: hotel.hotelVlogVideoLink,
            vlogVideoViewCount: hotel.vlogVideoViewCount,
            vlogPostDate: hotel.vlogPostDate,
            videoId: hotel.videoId,
            videoType: hotel.videoType,
            verified: hotel.verified,
            hotelId: originalHotel
          });
        });

      if (!selectedHotelData.some(video => !video.verified)) {
        updateHotelVideos(selectedHotelData);
      } else {
        alert(`One of the hotel is not verified`);
      }
      
    } else {
      alert(`Please select the original hotel`);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  const isHotelLoading = (hotelId) => loadingHotelIds.includes(hotelId);

  const isURL = (str) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol (optional)
      "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR IP (v4) address
      "(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*" + // port and path (optional)
      "(\\?[;&a-zA-Z\\d%_.~+=-]*)?" + // query string (optional)
      "(\\#[-a-zA-Z\\d_]*)?$", // fragment locator (optional)
      "i"
    );

    return !!pattern.test(str);
  };

  // Compute counts
  const totalData = hotels.length;
  const verifiedData = hotels.filter((hotel) => hotel.verified).length;
  const validData = hotels.filter((hotel) => hotel.valid).length;

  return (
    <div className="hotel-list-container">
      <h1>Hotel List</h1>

      {/* Search and Date Filter */}
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        {/* <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="yyyy-MM-dd"
          isClearable
          placeholderText="Filter by Date"
          className="date-picker"
        /> */}

        <label>
          <input
            type="checkbox"
            checked={showVerifiedOnly}
            onChange={handleCheckboxChange}
          />
          show location data
        </label>

        <div className="stats">
          <span>Total Data: {totalData}</span>
          <span className="approved-count">Verified Data: {verifiedData}</span>
          {/* <span className="approved-count">Valid Data: {validData}</span> */}
        </div>

        {/* Merge Button */}
        {selectedHotels.length > 1 && (
          <button className="merge-button" onClick={handleMergeClick}>
            Merge
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="hotel-table">
          <thead>
            <tr>
              {searchTerm && (
                <th>
                  <input
                    type="checkbox"
                    checked={isAllChecked}
                    onChange={handleCheckAll}
                  />
                  Check All
                </th>
              )}
              {searchTerm && (
                <th>Original</th>
              )}
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Map Location</th>
              <th>Vlog Video</th>
              <th>Thumbnail</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Category</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((hotel) => (
              <tr key={hotel.hotelId}>
                
                {searchTerm && (
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedHotels.includes(hotel.hotelId)}
                      onChange={() => handleDuplicateCheckChange(hotel.hotelId)}
                    />
                  </td>
                )}
                {searchTerm && (
                  <td>
                    <input
                      type="radio"
                      name="hotelSelection"
                      checked={originalHotel === hotel.hotelId}
                      onChange={() => handleRadioChange(hotel.hotelId)}
                    />
                  </td>
                )}
                <td onClick={() => {
                  if (editingHotelId != hotel.hotelId) {
                    handleHotelSelect(hotel);
                  }
                }}>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelName"
                      value={editedHotel.hotelName}
                      onChange={handleInputChange}
                    />
                  ) : (
                    hotel.hotelName
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelAddress"
                      value={editedHotel.hotelAddress}
                      onChange={handleInputChange}
                    />
                  )
                  : (
                    hotel.hotelAddress
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelCity"
                      value={editedHotel.hotelCity}
                      onChange={handleInputChange}
                    />
                  ) : (
                    hotel.hotelCity
                  )}
                </td>
                <td className="mapLink-Cell">
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelMapLocationLink"
                      value={editedHotel.hotelMapLocationLink}
                      onChange={handleInputChange}
                    />
                  ) : isURL(hotel.hotelMapLocationLink?.trim()) ? (
                    <a
                      href={hotel.hotelMapLocationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on Map
                    </a>
                  ) : (
                    hotel.hotelMapLocationLink
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="text"
                      name="hotelVlogVideoLink"
                      value={editedHotel.hotelVlogVideoLink}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <a
                      href={hotel.hotelVlogVideoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch Video
                    </a>
                  )}
                </td>
                <td>
                  {hotel.videoId ? (
                    hotel.videoType.includes('Youtube') ? (
                      <img
                        src={`https://img.youtube.com/vi/${hotel.videoId}/maxresdefault.jpg`}
                        alt="YouTube Thumbnail"
                        className="thumbnail"
                        onError={(e) => {
                          // Fallback to a lower resolution if maxresdefault.jpg is not available
                          e.target.onerror = null; 
                          e.target.src = `https://img.youtube.com/vi/${hotel.videoId}/hqdefault.jpg`;
                        }}
                        width="160"
                        height="90"
                      />
                    ) : (
                      "Instagram Video"
                    )
                  ) : (
                    "No Video"
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="number"
                      name="latitude"
                      value={editedHotel.latitude}
                      onChange={handleInputChange}
                    />
                  ) : (
                    hotel.latitude
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <input
                      type="number"
                      name="longitude"
                      value={editedHotel.longitude}
                      onChange={handleInputChange}
                    />
                  ) : (
                    hotel.longitude
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <select
                      name="hotelCategory"
                      value={editedHotel.hotelCategory}
                      onChange={handleInputChange}
                    >
                      {category.map((cat) => (
                        <option key={cat.ID} value={cat.ID}>
                          {cat.Name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    hotel.hotelCategory
                  )}
                </td>
                <td>
                  {editingHotelId === hotel.hotelId ? (
                    <>
                      <button
                        className="save-button"
                        onClick={handleSaveClick}
                      >
                        Save
                      </button>
                      <button
                        className="cancel-button"
                        onClick={handleCancelClick}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(hotel)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for showing hotel details */}
      <HotelDetailsModal
        show={showModal}
        onClose={handleCloseModal}
        hotelDetails={modalSelectedHotel}
      />
    </div>
  );
};

export default HotelLocationList;