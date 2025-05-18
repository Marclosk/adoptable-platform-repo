// src/App.tsx

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "./features/auth/authSlice";

import Login from "./features/auth/login/login";
import Register from "./features/auth/register/register";
import Dashboard from "./pages/dashboard";
import CardDetail from "./pages/card_detail/card_detail";
import Profile from "./pages/profile/profile";
import Donations from "./pages/donations/donations";
import ContactPage from "./pages/contact/contact";
import AddAnimal from "./pages/animal/add_animal";
import AnimalRequests from "./pages/protectora/animal_requests";  
import ProtectoraDashboard from "./pages/boards/protectora_dashboard";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const saved = localStorage.getItem("authState");
    if (saved) {
      const { user, token } = JSON.parse(saved);
      if (user && token) {
        dispatch(loginSuccess({ user, token }));
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/card_detail/:id" element={<CardDetail />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/donacions" element={<Donations />} />
        <Route path="/contacte" element={<ContactPage />} />
        <Route path="/add-animal" element={<AddAnimal />} />
        <Route path="/animals/:id/requests" element={<AnimalRequests />}/>
        <Route path="/protectora/dashboard" element={<ProtectoraDashboard />}/>

      </Routes>
    </Router>
  );
};

export default App;
