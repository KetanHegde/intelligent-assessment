import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Navbar from "./components/Navbar";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home color={"#1347bd"}/>} />
        <Route path="/input_topic_and_text" element={<Home/>}/>
      </Routes>
    </Router>
  );
}

export default App;
