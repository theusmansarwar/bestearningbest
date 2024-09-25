import React, { useEffect, useState } from 'react';
import { auth, database } from '../firebase'; 
import { ref, get, child } from 'firebase/database';

const Invite = () => {
  const [referralLink, setReferralLink] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [domainName, setDomainName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userId = currentUser.uid;
        
        try {
          // Fetch user data from Firebase Realtime Database
          const dbRef = ref(database);
          const userSnapshot = await get(child(dbRef, `users/${userId}`));
          
          if (userSnapshot.exists()) {
            const username = userSnapshot.val().username;
            
            // Fetch domain name from Firebase Realtime Database
            const websiteSnapshot = await get(child(dbRef, `websites`));
            
            if (websiteSnapshot.exists()) {
              const domain = websiteSnapshot.val().domain;
              setDomainName(domain);
              
              // Generate the referral link with the domain name
              const link = `https://${domain}/register?ref=${username}`;
              setReferralLink(link);
            } else {
              console.log('No website data found');
            }
          } else {
            console.log('No user data found');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, []);

  // Function to copy referral link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
      .then(() => {
        setCopySuccess('Referral link copied!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  return (
    <div>
      <b>Invite Friends</b>
      {referralLink && (
        <div>
      
          <p>Your referral link:</p>
          <input type="text" value={referralLink} readOnly />
         
        </div>
      )}
      <button onClick={copyToClipboard} className='create-btn'>Copy Invite Link</button>
      {copySuccess && <p style={{ color: 'green' }}>{copySuccess}</p>}
    </div>
  );
};

export default Invite;
