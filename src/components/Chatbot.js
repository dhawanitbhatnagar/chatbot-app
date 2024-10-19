import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css'; // Import the CSS file for styling
import { v4 as uuidv4 } from 'uuid'; // Import UUID for generating session IDs
import boatImg from "../img/Chatbot.gif"
import boatImgClose from "../img/chatbox-close.png"
import uploadicon from "../img/upload-image.png"

const Chatbot = () => {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null); // State for the selected image
    const chatWindowRef = useRef(null); // Ref for scrolling to bottom
    const fileInputRef = useRef(null); // Reference for file input
    const [sessionId, setSessionId] = useState(null); // State for session ID
    const [isChatOpen, setIsChatOpen] = useState(false); // State to toggle chat window

    // Toggle chat visibility
    const toggleChat = () => {
        setIsChatOpen((prev) => !prev);
    };

    // Toggle "show-chatbot" class on body
    useEffect(() => {
        if (isChatOpen) {
            document.body.classList.add('show-chatbot');
        } else {
            document.body.classList.remove('show-chatbot');
        }
    }, [isChatOpen]);

    // Effect to initialize session ID
    useEffect(() => {
        // Check for existing session ID in local storage
        let existingSessionId = localStorage.getItem('sessionId');
        if (!existingSessionId) {
            // If none exists, create a new session ID
            existingSessionId = uuidv4();
            localStorage.setItem('sessionId', existingSessionId);
        }
        setSessionId(existingSessionId); // Set the session ID in state
    }, []);

    // Scroll to the bottom of the chat when a new message is added
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    // Function to handle sending messages
    const sendMessage = async () => {
        if (!userInput.trim() && !selectedImage) return; // Check if there's either user input or an image

        const userMessage = { text: userInput, sender: 'user', image: selectedImage }; // Include the image in the message
        setMessages((prev) => [...prev, userMessage]);
        setUserInput(''); // Clear input after sending
        setSelectedImage(null); // Clear selected image after sending

        try {
            const formData = new FormData();
            if (selectedImage) {
                formData.append('image', selectedImage);
                formData.append('query', userInput);
                formData.append('sessionId', sessionId); // Include session ID for the image query

                const response = await fetch('http://localhost:5000/api/chatbot/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    const botMessage = { text: data.response, sender: 'bot', image: null }; // Bot response
                    setMessages((prev) => [...prev, botMessage]);
                }
            } else {
                // Send text message if no image is selected
                const response = await fetch('http://localhost:5000/api/chatbot/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: userInput, sessionId }), // Include session ID for the text query
                });

                if (response.ok) {
                    const data = await response.json();
                    const botMessage = { text: data.response, sender: 'bot', image: null }; // Bot response
                    setMessages((prev) => [...prev, botMessage]);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = { text: 'Sorry, I could not process your request. Please try again.', sender: 'bot' };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    // Function to handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file); // Set the selected image
            // Reset the input value to allow re-uploading the same file
            e.target.value = null; // Clear the input value
        }
    };

    return (
        <div className="chatbot-container1">
            <button className="chatbot-toggler" onClick={toggleChat}>
                <span className="material-symbols-rounded"><img src={boatImg} alt="image-1"></img></span>
                <span className="material-symbols-outlined"><img src={boatImgClose} alt="image-close"></img></span>
            </button>

            {isChatOpen && (
                <div className="chatbot">            
                    <header>
                        <h2>Chatbot</h2>
                        <span className="close-btn material-symbols-outlined" onClick={toggleChat}>close</span>
                    </header>

                    <div className="chatbox" ref={chatWindowRef}>
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.sender}`}>
                                <p>{message.text} </p>
                                {message.image && (
                                    <img
                                        src={URL.createObjectURL(message.image)}
                                        alt="User Upload"
                                        className="message-image"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="input-area chat-input">
                        <label htmlFor="imageUpload" className="attach-icon"><img src={uploadicon} alt="image-1"></img></label>
                        <div className="">
                        {selectedImage && (
                            <div className="image-preview">
                                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="preview-image" />
                                <button className="remove-image-btn" onClick={() => setSelectedImage(null)}>✕</button>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange} // Handle image selection
                            style={{ display: 'none' }} // Hide the default input
                            id="imageUpload" // For file input ID
                            ref={fileInputRef} // Assign the ref
                        />
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type your message..."
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()} // Allow pressing "Enter" to send
                        />                        
                        </div>
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
