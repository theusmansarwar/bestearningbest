import React, { useState, useEffect } from 'react';
import { database} from '../firebase'; // Import your Firebase config
import { ref, get } from 'firebase/database';


const Logo = () => {

  const [websiteData, setWebsiteData] = useState({
    logoUrl: ''
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
    <div className='tasks-list'>
    
              {websiteData.logoUrl && <img src={websiteData.logoUrl }  className='logo'alt="Website Logo" />}
        </div>    
  );
};

export default Logo;
