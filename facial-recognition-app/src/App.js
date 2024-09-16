import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [uploadResultMessage, setUploadResultMessage] = useState('Please upload an image to authenticate');
  const [isAuth, setAuth] = useState(false);

  async function sendImage(e) {
    e.preventDefault();

    if (!image) {
      setUploadResultMessage('Please select an image first.');
      return;
    }

    const visitorImageName = uuidv4();
    const uploadUrl = `https://y44hxcxcti.execute-api.us-east-1.amazonaws.com/dev/leachrista-visitor-storage/${visitorImageName}.jpeg`;

    try {
      console.log('Uploading image to:', uploadUrl);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg'
        },
        body: image
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
      }

      console.log('Image uploaded successfully:', uploadResponse);

      const authResponse = await authenticate(visitorImageName);
      console.log('Authentication response:', authResponse);

      if (authResponse.Message === 'Success') {
        setAuth(true);
        setUploadResultMessage(`Hi ${authResponse.firstName} ${authResponse.lastName}, welcome home. Have a lovely day`);
      } else {
        setAuth(false);
        setUploadResultMessage('Authentication failed. This person is not an inhabitant of this house. please ring the bell');
      }
    } catch (error) {
      setAuth(false);
      setUploadResultMessage('There was an error during the operation. Please try again later.');
      console.error('Error during the operation:', error);
    }
  }

  async function authenticate(visitorImageName) {
    const requestUrl = `https://y44hxcxcti.execute-api.us-east-1.amazonaws.com/dev/employee?` + new URLSearchParams({
      objectKey: `${visitorImageName}.jpeg`
    });

    console.log('Authenticating with URL:', requestUrl);

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to authenticate: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Authentication error:', error);
      return { Message: 'Failure' }; // Return a failure message if there's an error
    }
  }

  const imageSrc = image 
    ? URL.createObjectURL(image) 
    : require('./visitors/placeholder.jpg');

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-green-500">
      <div className="text-center p-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Leas Gesichtserekennungssystem</h2>
        <form onSubmit={sendImage} className="mb-4">
          <input 
            type="file" 
            name="image" 
            onChange={e => setImage(e.target.files[0])} 
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Authenticate
          </button>
        </form>
        <div className={`p-4 rounded ${isAuth ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {uploadResultMessage}
        </div>
        <div className="relative mt-4 flex justify-center items-center">
          <div className="house">
            <div className="roof"></div>
            <div className="frame p-4">
              <img 
                src={imageSrc} 
                alt="Visitor" 
                className="border border-gray-300 w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
