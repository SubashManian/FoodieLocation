import logo from './logo.svg';
import './App.css';
import HotelList from './HotelList';
import HotelLocationList from './HotelLocationList';
import { BrowserRouter, Routes, Route } from "react-router-dom";
 
const App = () => {
  return (
     <>
        <Routes>
           <Route path="/" element={<HotelLocationList />} />
           {/* <Route path="/verified" element={<HotelLocationList />} /> */}
        </Routes>
     </>
  );
};

export default App;
