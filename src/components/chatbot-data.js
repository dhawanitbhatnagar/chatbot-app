// src/ChatBoatData.js
import React, { useEffect, useState } from 'react'; // Import React and necessary hooks
import { Link } from 'react-router-dom';

const ChatBoatData = () => {
  const [data, setData] = useState([]); // State for holding user data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chatbot/unanswer-questions');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        console.log(result)
        setData(result.data); // Set fetched data to state
        
      } catch (error) {
        setError(error.message); // Set error message to state
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchData(); // Call the fetch function
  }, []); // Empty dependency array means this runs once after the initial render

  // Conditional rendering for loading state and error
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mt-5">
      <h2>Unanswered Question</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Question</th>
            <th>Image</th>
    
    <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {data.map((row, index) => ( 
        <tr key={row.id}>
            <td>{index + 1}</td> 
            <td>{row.question}</td> 
            <td>{row.imageUrl ? ( // Check if there's a valid image URL
                    <img 
                    src={row.imageUrl} 
                    alt={`${row.question}'s avatar`} // Change alt text as necessary
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }} // Style for the image
                    />
                ) : (
                    "" // Render nothing if there is no valid image URL
                )}
            </td> 
            <td> <Link to={`/chatboatdata/updates/${row.id}`} className="btn btn-primary">Update</Link></td>
        </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChatBoatData; // Export the component
