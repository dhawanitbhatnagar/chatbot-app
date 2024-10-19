import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Chatbot from './components/Chatbot';
// import Chatbot2 from './components/chatbot2';
import ChatBoatData from './components/chatbot-data';

const App = () => {
    return (
        <Router>
            <div>
                <nav>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/chatbot">Chatbot</Link></li>
                        <li><Link to="/chatboatdata">ChatBoatData</Link></li>
                        {/* Uncomment this if you want to use Chatbot2 */}
                        {/* <li><Link to="/chatbot2">Chatbot2</Link></li> */}
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<h1>Welcome to the Chatbot App</h1>} />
                    <Route path="/chatbot" element={<Chatbot />} />
                    <Route path="/chatboatdata" element={<ChatBoatData />} />
                    {/* Uncomment this if you want to use Chatbot2 */}
                    {/* <Route path="/chatbot2" element={<Chatbot2 />} /> */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;
