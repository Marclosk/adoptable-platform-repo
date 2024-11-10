import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./features/auth/login";
import Dashboard from "./pages/dashboard"; // Suponiendo que tienes una página de dashboard

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" Component={Login} />
        <Route path="/dashboard" Component={Dashboard} />
        <Route path="/" Component={Login} />
      </Routes>
    </Router>
  );
};

export default App;
