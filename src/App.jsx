import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import TourPage from "./pages/TourPage";
import TourDetail from "./pages/TourDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tour" element={<TourPage />} />
        <Route path="/tour/:tourId" element={<TourDetail />} />
        <Route path="/tours" element={<TourPage />} />
        <Route path="/tours/:tourId" element={<TourDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
