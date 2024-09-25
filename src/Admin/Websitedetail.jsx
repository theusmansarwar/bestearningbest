import React, { useState, useEffect } from 'react';
import { database, storage } from '../firebase'; // Import your Firebase config
import { ref, set, get } from 'firebase/database';
import { uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage';

const Websitedetail = () => {
  const [editing, setEditing] = useState(false);
  const [websiteData, setWebsiteData] = useState({
    domain: '',
    name: '',
    paymentMethod: '',
    paymentAccountNo: '',
    paymentAccountHolder: '',
    logoUrl: '',
    contactlink:''

  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const websiteRef = ref(database, 'websites');
        const snapshot = await get(websiteRef);
        if (snapshot.exists()) {
          setWebsiteData(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching website data:", error);
      }
    };

    fetchWebsiteData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWebsiteData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let logoUrl = websiteData.logoUrl;

      if (selectedFile) {
        // Create a storage reference
        const fileRef = storageRef(storage, `logos/${selectedFile.name}`);
        // Upload file
        await uploadBytes(fileRef, selectedFile);
        // Get download URL
        logoUrl = await getDownloadURL(fileRef);
      }

      // Update database
      const websiteRef = ref(database, 'websites');
      await set(websiteRef, {
        ...websiteData,
        logoUrl
      });
      setEditing(false);
    } catch (error) {
      console.error("Error updating website data:", error);
    }
  };

  return (
    <div className='tasks-list'>
      {editing ? (
        <form onSubmit={handleSubmit}>
       
          <label>
            Website Domain:
            <input
              type="text"
              name="domain"
              value={websiteData.domain}
              onChange={handleInputChange}
            />
            <br/>
          </label>
          <label>
            Website Name:
            <input
              type="text"
              name="name"
              value={websiteData.name}
              onChange={handleInputChange}
            />   
            <br/>
          </label>
          <label>
            Payment Method Name:
            <input
              type="text"
              name="paymentMethod"
              value={websiteData.paymentMethod}
              onChange={handleInputChange}
            />   
            <br/>
          </label>
          <label>
            Payment Account No:
            <input
              type="text"
              name="paymentAccountNo"
              value={websiteData.paymentAccountNo}
              onChange={handleInputChange}
            />   
            <br/>
          </label>
          <label>
            Payment Account Holder:
            <input
              type="text"
              name="paymentAccountHolder"
              value={websiteData.paymentAccountHolder}
              onChange={handleInputChange}
            />   
            <br/>
          </label>
          <label>
            Contact Link <small>Whatsapp Group Link</small>:
            <input
              type="text"
              name="contactlink"
              value={websiteData.contactlink}
              onChange={handleInputChange}
            />   
            <br/>
          </label>
          <label>
            Website Logo:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />   
            <br/>
            {websiteData.logoUrl && <img className='logo' src={websiteData.logoUrl} alt="Website-Logo" />}
          </label>
          <br/>
          <button type="submit" className='submit-btn'>Save</button>
          <button type="button" className='cancel-btn' onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : (
        <div>
              {websiteData.logoUrl && <img src={websiteData.logoUrl }  className='logo'alt="Website Logo" />}
              <div className="website-item">
          <p>Website Domain: <b>{websiteData.domain}</b></p></div>
          <div className="website-item">
          <p>Website Name:<b> {websiteData.name}</b></p></div>
          <div className="website-item">
          <p>Payment Method Name: <b>{websiteData.paymentMethod}</b></p></div>
          <div className="website-item">
          <p>Payment Account No:<b> {websiteData.paymentAccountNo}</b></p></div>
          <div className="website-item">
          <p>Payment Account Holder: <b>{websiteData.paymentAccountHolder}</b></p></div>
          <div className="website-item">
          <p>Contact Link: <b>{websiteData.contactlink}</b></p></div>
        
          <button onClick={() => setEditing(true)} className='create-btn'>Edit</button>
        </div>
      )}
    </div>
  );
};

export default Websitedetail;
