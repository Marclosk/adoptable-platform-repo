import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./features/auth/login/login";
import Register from "./features/auth/register/register";
import Dashboard from "./pages/dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" Component={Login} />
        <Route path="/dashboard" Component={Dashboard} />
        <Route path="/" Component={Login} />
        <Route path="/register" Component={Register} />
      </Routes>
    </Router>
  );
};

export default App;
