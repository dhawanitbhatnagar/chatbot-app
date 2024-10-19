import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css'; // Ensure to have styles here

const Chatbot2 = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const chatboxRef = useRef(null);
  const chatInputRef = useRef(null);
  const inputInitHeight = 40; // Adjust based on your CSS for the initial input height

  const API_KEY = 'PASTE-YOUR-API-KEY'; // Your API key here
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

  useEffect(() => {
    if (isChatOpen) {
      document.body.classList.add('show-chatbot');
    } else {
      document.body.classList.remove('show-chatbot');
    }
  }, [isChatOpen]);

  const createChatMessage = (message, type) => ({
    text: message,
    type: type,
  });

  const scrollToBottom = () => {
    const chatbox = chatboxRef.current;
    if (chatbox) {
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  };

  const generateResponse = async () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      }),
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const botMessage = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
      setMessages((prevMessages) => [...prevMessages, createChatMessage(botMessage, 'incoming')]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        createChatMessage(error.message, 'incoming'),
      ]);
    } finally {
      scrollToBottom();
    }
  };

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      createChatMessage(userMessage.trim(), 'outgoing'),
    ]);

    setUserMessage('');

    setTimeout(() => {
      setMessages((prevMessages) => [...prevMessages, createChatMessage('Thinking...', 'incoming')]);
      scrollToBottom();
      generateResponse();
    }, 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 800) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setUserMessage(e.target.value);
    chatInputRef.current.style.height = `${inputInitHeight}px`;
    chatInputRef.current.style.height = `${chatInputRef.current.scrollHeight}px`;
  };

  const toggleChatbot = () => {
    setIsChatOpen(!isChatOpen);
  };

  const closeChatbot = () => {
    setIsChatOpen(false);
  };

  // Handle image uploads
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'outgoing', image: reader.result },
      ]);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div>
      <button className="chatbot-toggler" onClick={toggleChatbot}>
        <span className="material-symbols-rounded">
          {isChatOpen ? 'close' : 'mode_comment'}
        </span>
      </button>

      {isChatOpen && (
        <div className="chatbot">
          <header>
            <h2>Chatbot</h2>
            <span className="close-btn material-symbols-outlined" onClick={closeChatbot}>
              close
            </span>
          </header>

          <ul className="chatbox" ref={chatboxRef}>
            {messages.map((message, index) => (
              <li key={index} className={`chat ${message.type}`}>
                {message.image ? (
                  <img src={message.image} alt="User upload" className="chat-image" />
                ) : (
                  <p>{message.text}</p>
                )}
              </li>
            ))}
          </ul>

          <div className="chat-input">
            <textarea
              ref={chatInputRef}
              placeholder="Enter a message..."
              spellCheck="false"
              value={userMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              required
            />
            <span id="send-btn" className="material-symbols-rounded" onClick={handleSendMessage}>
              send
            </span>

            {/* Image Upload */}
            <input
              type="file"
              accept="image/*"
              id="upload-image"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <label htmlFor="upload-image" className="material-symbols-rounded upload-btn">
              upload
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot2;
