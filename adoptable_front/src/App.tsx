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

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const savedAuthState = localStorage.getItem("authState");
    if (savedAuthState) {
      const { user, token } = JSON.parse(savedAuthState);
      if (user && token) {
        dispatch(loginSuccess({ user, token }));
      }
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" Component={Login} />
        <Route path="/dashboard" Component={Dashboard} />
        <Route path="/" Component={Login} />
        <Route path="/register" Component={Register} />
        <Route path="/card_detail/:id" Component={CardDetail} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/donacions" element={<Donations />} />
      </Routes>
    </Router>
  );
};

export default App;