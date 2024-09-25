import React, { useState, useEffect } from 'react';
import { ref, onValue, get, query, orderByChild, equalTo } from 'firebase/database';
import { database, auth } from '../firebase'; 

const Team = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [data, setData] = useState(null);
  const [referralUsers, setReferralUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUser(user.uid);
      } else {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return; 

      try {
        const dbRef = ref(database, `users/${currentUser}`);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
          const userData = snapshot.val();
          setData(userData);
        } else {
          setData(null);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const fetchReferralUsers = async () => {
      if (!data || !data.username) return; 

      try {
        const usersRef = ref(database, 'users');
        const referralQuery = query(
          usersRef,
          orderByChild('referralCode'),
          equalTo(data.username)
        );

        const referralSnapshot = await get(referralQuery);
        if (referralSnapshot.exists()) {
          const referralData = referralSnapshot.val();
          const usersArray = Object.values(referralData);

          // Filter users with completed payments
          const filteredUsers = usersArray.filter(user => user.payment == true);
          setReferralUsers(filteredUsers);
        } else {
          setReferralUsers([]);
        }
      } catch (error) {
        setError(error);
      }
    };

    fetchReferralUsers();
  }, [data]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      <h1>Team</h1>
      {currentUser ? (
        <div>
          <p>Number Of Referrals with Completed Payments: <b>{referralUsers.length}</b></p>
          <ul>
            <div className='referal-item'>
              <p><b>ID</b></p>
              <p><b>Name</b></p>
      
              <p><b>Username</b></p>
              <p><b>Register Date</b></p>
            </div> 

            {referralUsers.length > 0 ? (
              referralUsers.map((user, index) => (
                <div className="referal-item" key={user.id}>
                  <p>{index + 1}</p>
                  <p>{user.name}</p>
  
                  <p>{user.username}</p>
                  <p>{formatDate(user.creationDate)}</p>
                </div>
              ))
            ) : (
              <li>No referral users with completed payments found</li>
            )}
          </ul>
        </div>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
};

export default Team;
