import React, { useEffect, useState } from 'react';
import { ref, onValue, update, get } from "firebase/database";
import { database } from '../firebase'; // Firebase config

const Withdrawals = () => {
  const [userlist, setUserlist] = useState([]);

  useEffect(() => {
    const paymentRef = ref(database, 'withdraws');
  
    // Listen to changes in the withdraws data in Firebase
    const unsubscribe = onValue(paymentRef, (snapshot) => {
      const paymentData = snapshot.val();
      
      // Combine all users' withdrawals into a single array
      const combinedWithdrawals = paymentData
        ? Object.entries(paymentData).flatMap(([userId, withdrawals]) =>
            Object.entries(withdrawals).map(([withdrawalId, withdrawalData]) => ({
              userId, // Include user ID in the combined withdrawal data
              withdrawalId, // Include the unique withdrawal ID
              ...withdrawalData // Spread the withdrawal details (accountHolder, amount, etc.)
            }))
          )
        : [];
  
      setUserlist(combinedWithdrawals);
    });
  
    return () => unsubscribe();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle missing date
    const dateObj = new Date(dateString);
    return !isNaN(dateObj.getTime()) ? dateObj.toLocaleString() : "Invalid Date"; 
  };

  const handleApproveClick = async (userId, withdrawalId, amount) => {
    if (!userId || !withdrawalId || !amount) {
      console.error("User ID, Payment ID, or Amount is missing.");
      return;
    }

    try {
      // Reference to the specific withdrawal entry in Firebase
      const withdrawalRef = ref(database, `withdraws/${userId}/${withdrawalId}`);
      const userRef = ref(database, `users/${userId}`);

      // Fetch the current withdrawal data
      const withdrawalSnapshot = await get(withdrawalRef);
      const withdrawalData = withdrawalSnapshot.val();

      // Ensure the withdrawal exists and is in a "pending" state
      if (!withdrawalData || withdrawalData.paymentStatus !== 'pending') {
        console.error("No pending withdrawal found.");
        return;
      }

      // Fetch the current user's balance data (approved and pending withdrawals)
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();

      const approvedWithdraw = userData?.approvedWithdraw || 0;
      const pendingWithdraw = userData?.pendingWithdraw || 0;

      // Update payment status to 'approved' and adjust balances
      await update(withdrawalRef, {
        paymentStatus: "approved",
        date: new Date().toISOString() // Optionally update the approval date
      });

      // Update the user's balances
      await update(userRef, {
        approvedWithdraw: approvedWithdraw + amount, // Add to approvedWithdraw
        pendingWithdraw: Math.max(pendingWithdraw - amount, 0) // Subtract from pendingWithdraw
      });

      console.log("Withdrawal approved successfully.");
      
    } catch (error) {
      console.error("Error approving withdrawal: ", error);
    }
  };

  return (
    <div className="user-list">
      <h2 className='heading'>Payments</h2>
      <div className='register-user-item'>
        <p><b>Id</b></p>
        <p><b>Username</b></p>
        <p><b>Payment Method</b></p>
        <p><b>Amount</b></p>
        <p><b>Account Holder</b></p>
        <p><b>AC No</b></p>
        <p><b>Action</b></p>
        <p><b>Date</b></p>
      </div>
      {userlist.length > 0 ? (
        userlist.map((user, index) => (
          <div key={user.withdrawalId} className="register-user-item">
            <p>{index + 1}</p>
            <p>{user.accountHolder}</p>
            <p>{user.paymentMethod}</p>
            <p>{user.amount}</p>
            <p>{user.accountHolder}</p>
            <p>{user.accountNumber}</p>
            
            <button
              className={`approve-btn ${user.paymentStatus === "pending" ? 'pending' : 'approved'}`}
              onClick={() => handleApproveClick(user.userId, user.withdrawalId, user.amount)} 
            >
              {user.paymentStatus === "pending" ? 'Approve' : 'Approved'}
            </button>
            <p>{formatDate(user.date)}</p>
          </div>
        ))
      ) : (
        <p>No payments available.</p>
      )}
    </div>
  );
};

export default Withdrawals;
