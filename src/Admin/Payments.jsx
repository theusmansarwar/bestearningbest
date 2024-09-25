import React, { useEffect, useState } from 'react';
import { ref, onValue, update, get, set } from "firebase/database";
import { database } from '../firebase'; // Firebase config
import './Payments.css'; // Styles for the button

const Payments = () => {
  const [userlist, setUserlist] = useState([]);
  const [userStatus, setUserStatus] = useState({});

  useEffect(() => {
    const paymentRef = ref(database, 'payments');

    const unsubscribe = onValue(paymentRef, (snapshot) => {
      const paymentData = snapshot.val();
      const usersArray = paymentData
        ? Object.entries(paymentData).map(([key, value]) => ({
            id: key,
            ...value
          }))
        : [];
      setUserlist(usersArray);

      // Fetch user statuses
      fetchUserStatuses(usersArray);
    });

    return () => unsubscribe(); 
  }, []);

  const fetchUserStatuses = (payments) => {
    const userIds = payments.map(payment => payment.userId);

    userIds.forEach(userId => {
      const userRef = ref(database, `users/${userId}`);
      
      onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        
        const paymentStatus = userData?.payment;
        const referralCode = userData?.referralCode;
        setUserStatus(prevStatus => ({
          ...prevStatus,
          [userId]: {
            payment: paymentStatus,
            referralCode: referralCode,
          }
        }));
      });
    });
  };

  const handleApproveClick = async (userId, paymentId, planPrice) => {
    if (!userId || !paymentId || !planPrice) {
      console.error("User ID, Payment ID, or Plan Price is missing.");
      return;
    }

    try {
     
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      if (!userData) {
        console.error("User data not found.");
        return;
      }

      const { referralCode } = userData;

      await update(userRef, { payment: true });

      if (referralCode) {
        const usernamesRef = ref(database, 'users');
        const usersSnapshot = await get(usernamesRef);

        let referredUserId = null;
        usersSnapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          if (userData.username === referralCode) {
            referredUserId = userSnapshot.key;
          }
        });

        if (referredUserId) {
       
          const referredUserCoinsRef = ref(database, `users/${referredUserId}/coins`);
          const inviteUsersRef = ref(database, `users/${referredUserId}/invites`);
   
          const coinsSnapshot = await get(referredUserCoinsRef);
          const currentCoins = coinsSnapshot.val() || 0;
          const inviteSnapshot = await get(inviteUsersRef);
          const currentInvites = inviteSnapshot.val() || 0;
          
          const commission = planPrice * 0.23;
          
          // Update the coins value by adding the calculated commission
          await set(referredUserCoinsRef, currentCoins + commission); 
          await set(inviteUsersRef, currentInvites + 1);// Use set instead of update to directly modify the value of coins
        } else {
          console.error("No user found with the matching referral code.");
        }
        
      }
    } catch (error) {
      console.error("Error processing payment approval: ", error);
    }
  };

  return (
    <div className="user-list">
      <h2 className='heading'>Payments</h2>
      <div className='register-user-item'>
        <p><b>ID</b></p>
        <p><b>Plan</b></p>
        <p><b>Payment Method</b></p>
        <p><b>Price</b></p>
        <p><b>Sender</b></p>
        <p><b>TRX ID</b></p>
        <p><b>Action</b></p>
        <p><b>Date</b></p>
      </div>
      {userlist.length > 0 ? (
        userlist.map((user, index) => (
          <div key={user.id} className="register-user-item">
            <p>{index + 1}</p>
            <p>{user.planName}</p>
            <p>{user.paymentMethod}</p>
            <p>{user.planPrice}</p>
            <p>{user.senderAccountName}</p>
            <p>{user.transactionId}</p>
            
            <button
              className={`approve-btn ${userStatus[user.userId]?.payment==true ? 'approved' : 'pending'}`}
              onClick={() => handleApproveClick(user.userId, user.id, user.planPrice)} 
            >
              {userStatus[user.userId]?.payment==true ? 'Approved' : 'Pending'}
            </button>
            
            <p>{user.paymentDate}</p>
          </div>
        ))
      ) : (
        <p>No payments available.</p>
      )}
    </div>
  );
};

export default Payments;
