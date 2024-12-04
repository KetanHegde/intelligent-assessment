import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './components/Home';
import Navbar from "./components/Navbar";
import TitleAndText from "./components/TitleAndText";
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home color={"#1347bd"}/>} />
        <Route path="/input_topic_and_text" element={<TitleAndText/>}/>
        <Route path="/add-title" element={<TitleAndText/>}/>
      </Routes>
    </Router>
  );
}

export default App;
