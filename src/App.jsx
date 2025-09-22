// src/App.jsx
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ShopAllPage from "./components/ShopAll";
import HomePage from "./components/HomePage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopAllPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
