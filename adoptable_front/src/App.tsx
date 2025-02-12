import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./features/auth/login/login";
import Register from "./features/auth/register/register";
import Dashboard from "./pages/dashboard";
import CardDetail from "./pages/card_detail/card_detail";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" Component={Login} />
        <Route path="/dashboard" Component={Dashboard} />
        <Route path="/" Component={Login} />
        <Route path="/register" Component={Register} />
        <Route path="/card_detail/:id" Component={CardDetail} />
      </Routes>
    </Router>
  );
};

export default App;
