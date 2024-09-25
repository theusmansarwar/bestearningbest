import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Dashboard.css'; 
import { IoLogOut } from "react-icons/io5";
import Logo from '../Admin/Logo';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase'; 
import { ref, onValue,get } from 'firebase/database';
import { database } from '../firebase'; 

const Dashboard = () => {
  const navigate = useNavigate(); 

  const items = [
    { id: 1, title: 'Profile' },
    { id: 2, title: 'Today Work' },
    { id: 3, title: 'Your Wallet' },
    { id: 4, title: 'My Team' },
    { id: 5, title: 'Invite Team' },
    { id: 6, title: 'Daily Reward' },
    { id: 7, title: 'Contact us' },
  ];
  const data = [
    { id: 1, name: 'Ali Khan', amount: 500000 },
    { id: 2, name: 'Sara Ahmed', amount: 459000 },
    { id: 3, name: 'Usman Tariq', amount: 412250 },
    { id: 4, name: 'Ayesha Malik', amount: 412000 },
    { id: 5, name: 'Ahmed Raza', amount: 407500 },
    { id: 6, name: 'Fatima Syed', amount: 352200 },
    { id: 7, name: 'Bilal Ansari', amount: 331300 },
    { id: 8, name: 'Zainab Qureshi', amount: 302400 },
    { id: 9, name: 'Hassan Abbas', amount: 291100 },
    { id: 10, name: 'Mehwish Jameel', amount: 281800 },
    { id: 11, name: 'Fahad Shah', amount: 261900 },
    { id: 12, name: 'Madiha Farooq', amount: 232500 },
    { id: 13, name: 'Zeeshan Baig', amount: 451350 },
    { id: 14, name: 'Sana Ali', amount: 201450 },
    { id: 15, name: 'Kamran Nawaz', amount: 191600 },
    { id: 16, name: 'Iqra Khalid', amount: 182100 },
    { id: 17, name: 'Junaid Iqbal', amount: 162700 },
    { id: 18, name: 'Rabia Aslam', amount: 111900 },
    { id: 19, name: 'Tariq Mehmood', amount: 422800 },
    { id: 20, name: 'Shazia Anwar', amount: 500950 },
  ];
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const offersRef = ref(database, 'offers');
    const unsubscribe = onValue(offersRef, (snapshot) => {
      const offersData = snapshot.val();
      const offersList = offersData ? Object.entries(offersData).map(([key, value]) => ({ id: key, ...value })) : [];
      setOffers(offersList);
    });

    return () => unsubscribe();
  }, []);

  const handleItemClick = (title) => {
    switch (title) {
      case 'Profile':
        navigate('/profile'); 
        break;
      case 'Today Work':
        navigate('/todaywork'); 
        break;
      case 'Your Wallet':
        navigate('/wallet');
        break;
      case 'My Team':
        navigate('/team');
        break;
      case 'Invite Team':
        navigate('/invite');
        break;
      case 'Daily Reward':
        navigate('/dailybonus');
        break;
      case 'Contact us':
        window.open(`${websiteData.contactlink }`, '_blank', 'noopener,noreferrer');
        break;
      default:
        break;
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const [websiteData, setWebsiteData] = useState({    
     contactlink: ''
  });

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
  return (
    <div className='Dashboard'>
      <IoLogOut className='logout' onClick={handleLogout} />
      <Logo />
      <p className='sub'>Top 100 User Play List</p>
      <div className='Verticle-news'>
        <center>
          <marquee direction="up">
            {data.map((item, index) => (
              <h3 key={index}>
                <span>Name: {item.name}</span> <br />
                <span>Amount: {item.amount}</span>
              </h3>
            ))}
          </marquee>
        </center>
      </div>
      <div className='Horizontal-news'>
        <marquee>
          {offers.length > 0 ? (
            offers.map((offer) => (
              <div key={offer.id} className="offer-item">
                <span>{offer.name}</span>
              </div>
            ))
          ) : (
            <span>No offers available.</span>
          )}
        </marquee>
      </div>
      
      <div className="grid-container">
        {items.map(item => (
          <div 
            key={item.id} 
            className="grid-item" 
            onClick={() => handleItemClick(item.title)} 
          >
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
