import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Desktop from "./pages/Desktop";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chatbot from "./pages/Chatbot";
import Rights from "./pages/Rights";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/desktop" element={<Desktop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="*" element={<Desktop />} />
        <Route path="/rights" element={<Rights />} /> 
      </Routes>
      
    </Router>

  );
}

export default App;
