import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css'; // Import the CSS file for styling
import { v4 as uuidv4 } from 'uuid'; // Import UUID for generating session IDs
import boatImg from "../img/Chatbot.gif";
import boatImgClose from "../img/chatbox-close.png";
import uploadicon from "../img/upload-image.png";
import sendIcon from "../img/sendIcon.png";

const Chatbot = () => {
    const [userInput, setUserInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null); // State for the selected file
    const [fileType, setFileType] = useState(null); // State to track the type of file
    const chatWindowRef = useRef(null); // Ref for scrolling to bottom
    const fileInputRef = useRef(null); // Define the ref for file input
    const [sessionId, setSessionId] = useState(null); // State for session ID
    const [isChatOpen, setIsChatOpen] = useState(false); // State to toggle chat window
    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false); // State for attachment menu

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
        let existingSessionId = localStorage.getItem('sessionId');
        if (!existingSessionId) {
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
        if (!userInput.trim() && !selectedFile) return; // Check if there's either user input or a file

        const userMessage = { text: userInput, sender: 'user', file: selectedFile }; // Include the file in the message
        setMessages((prev) => [...prev, userMessage]);
        setUserInput(''); // Clear input after sending
        setSelectedFile(null); // Clear selected file after sending

        try {
            const formData = new FormData();
            if (selectedFile) {
                formData.append('file', selectedFile);
                formData.append('query', userInput);
                formData.append('sessionId', sessionId); // Include session ID for the query

                const response = await fetch('http://localhost:5000/api/chatbot/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    const botMessage = { text: data.response, sender: 'bot', file: null }; // Bot response
                    setMessages((prev) => [...prev, botMessage]);
                }
            } else {
                // Send text message if no file is selected
                const response = await fetch('http://localhost:5000/api/chatbot/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: userInput, sessionId }), // Include session ID for the text query
                });

                if (response.ok) {
                    const data = await response.json();
                    const botMessage = { text: data.response, sender: 'bot', file: null }; // Bot response
                    setMessages((prev) => [...prev, botMessage]);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = { text: 'Sorry, I could not process your request. Please try again.', sender: 'bot' };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    // Function to handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // Set the selected file
            e.target.value = null; // Clear the input value
        }
        setIsAttachmentMenuOpen(false); // Close the attachment menu after selection
    };

    // Function to open attachment menu
    const openAttachmentMenu = () => {
        setIsAttachmentMenuOpen(!isAttachmentMenuOpen);
    };

    // Function to set accepted file types based on selection
    const setFileAcceptType = (type) => {
        switch (type) {
            case 'image':
                return 'image/png,image/jpeg,image/webp,image/heic,image/heif';
            case 'video':
                return 'video/mp4,video/mpeg,video/mov,video/avi,video/x-flv,video/mpg,video/webm,video/wmv,video/3gpp';
            case 'document':
                return 'application/pdf,application/x-javascript,text/javascript,application/x-python,text/x-python,text/plain,text/html,text/css,text/md,text/csv,text/xml,text/rtf';
            case 'audio':
                return 'audio/wav,audio/mp3,audio/aiff,audio/aac,audio/ogg,audio/flac';
            default:
                return '';
        }
    };

    // Check if both text and file are present to add a specific class
    const getMessageClass = (message) => {
        let messageClass = 'message';
        if (message.sender === 'user') {
            if (message.text && message.file) {
                messageClass += ' user-with-file-and-text'; // Add a class when both text and file are present
            } else {
                messageClass += ' user';
            }
        } else {
            messageClass += ' bot';
        }
        return messageClass;
    };

    // Function to render the file preview based on the file type
    const renderFilePreview = (file) => {
        const fileURL = URL.createObjectURL(file);
        if (file.type.startsWith('image/')) {
            return <img src={fileURL} alt="Preview" className="preview-image" />;
        } else if (file.type.startsWith('video/')) {
            return (
                <video src={fileURL} controls className="preview-video">
                    Your browser does not support the video tag.
                </video>
            );
        } else if (file.type.startsWith('audio/')) {
            return (
                <audio src={fileURL} controls className="preview-audio">
                    Your browser does not support the audio tag.
                </audio>
            );
        } else if (file.type.startsWith('application/')) {
            return (
                <a href={fileURL} download className="preview-document">
                    Download Document
                </a>
            );
        }
        return null; // Fallback if no file type matched
    };

    return (
        <div className="chatbot-container1">
            <button className="chatbot-toggler" onClick={toggleChat}>
                <span className="material-symbols-rounded"><img src={boatImg} alt="image-1" width={80} height={80}></img></span>
                <span className="material-symbols-outlined"><img src={boatImgClose} alt="image-close" width={80} height={80}></img></span>
            </button>

            {isChatOpen && (
                <div className="chatbot">            
                    <header>
                        <h2>FRED</h2>
                        <span className="close-btn material-symbols-outlined" onClick={toggleChat}>close</span>
                    </header>

                    <div className="chatbox" ref={chatWindowRef}>
                        <div className='message bot'>
                            <p>Hi there 👋<br/>How can I help you today?</p>
                        </div>
                        {messages.map((message, index) => (
                            <div key={index} className={getMessageClass(message)}>                                
                                <p>{message.text}</p>
                                {message.file && (
                                    <div className="file-preview">
                                        {renderFilePreview(message.file)}
                                    </div>
                                )}
                            </div>
                        ))} 
                    </div>

                    <div className="input-area chat-input">
                        <div className="attach-icon" onClick={openAttachmentMenu}>
                            <img src={uploadicon} alt="image-1" width={20} height={20}></img>
                        </div>
                        {isAttachmentMenuOpen && (
                            <div className="attachment-menu">
                                <button onClick={() => { setFileType('image'); fileInputRef.current.accept = setFileAcceptType('image'); fileInputRef.current.click(); }}>Image</button>
                                <button onClick={() => { setFileType('video'); fileInputRef.current.accept = setFileAcceptType('video'); fileInputRef.current.click(); }}>Video</button>
                                <button onClick={() => { setFileType('document'); fileInputRef.current.accept = setFileAcceptType('document'); fileInputRef.current.click(); }}>Document</button>
                                <button onClick={() => { setFileType('audio'); fileInputRef.current.accept = setFileAcceptType('audio'); fileInputRef.current.click(); }}>Audio</button>
                            </div>
                        )}
                        <div className="">
                            {selectedFile && (
                                <div className="preview-card">
                                    <span>{selectedFile.name}</span>
                                    <div className="file-preview">
                                        {renderFilePreview(selectedFile)} {/* Render the preview of the selected file */}
                                    </div>
                                    <button className="remove-file-btn cross" onClick={() => setSelectedFile(null)}>✕</button>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="" // This will be dynamically set based on file type selection
                                onChange={handleFileChange} // Handle file selection
                                style={{ display: 'none' }} // Hide the default input
                                id="fileUpload" // For file input ID
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
                        <button onClick={sendMessage} className='sendBtn'>
                            <img src={sendIcon} alt="send" width={20} height={20}></img>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;