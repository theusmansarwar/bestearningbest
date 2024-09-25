import React, { useEffect, useState } from 'react';
import { auth, database } from '../firebase'; // Import Firebase services
import { ref, get, child } from 'firebase/database';
import './Profile.css'; // Import the CSS file
import { IoMdCamera } from "react-icons/io";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      // Get the currently authenticated user
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userId = currentUser.uid;

        try {
          // Fetch user data from Firebase Realtime Database
          const dbRef = ref(database);
          const snapshot = await get(child(dbRef, `users/${userId}`));

          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            console.log('No user data found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Display loading state while fetching data
  }

  if (!userData) {
    return <p>No user data available</p>; // Display a message if no user data is found
  }
  const getRank = (invites) => {
    if (invites <= 0 ) return 'Rank 0';
    if (invites >= 1 && invites <= 10) return 'Rank 1';
    if (invites >= 11 && invites <= 25) return 'Rank 2';
    if (invites >= 26 && invites <= 50) return 'Rank 3';
    if (invites >= 51 && invites <= 90) return 'Rank 4';
    if (invites >= 91 && invites <= 140) return 'Rank 5';
    if (invites >= 141 && invites <= 180) return 'Rank 6';
    if (invites >= 181 && invites <= 220) return 'Rank 7';
    if (invites >= 221 && invites <= 260) return 'Rank 8';
    if (invites >= 261 && invites <= 300) return 'Rank 9';
    return 'Unranked';
  };
  const rank = getRank(userData.invites || 0);
  return (
    <div className="profile-card">
      <div className="profile-image">
        <img src="/images.jpg" alt="Profile" />
      </div>
      <IoMdCamera className='camera-icon'/>
      <div className="profile-info">
        <div className="profile-item">
          <span className="profile-label">Name:</span>
          <span className="profile-value">{userData.name || 'N/A'}</span>
        </div>
        <div className="profile-item">
          <span className="profile-label">Email:</span>
          <span className="profile-value">{auth.currentUser?.email || 'N/A'}</span>
        </div>
        <div className="profile-item">
          <span className="profile-label">Rank:</span>
          <span className="profile-value">{rank}</span>
        </div>
        <div className="profile-item">
          <span className="profile-label">Username:</span>
          <span className="profile-value">{userData.username || 'N/A'}</span>
        </div>
        <div className="profile-item">
          <span className="profile-label">Phone Number:</span>
          <span className="profile-value">{userData.phone || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
