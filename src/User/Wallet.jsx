import React, { useState, useEffect } from 'react';
import { database, auth } from '../firebase';
import { ref, get } from 'firebase/database';
import './Wallet.css';
import { useNavigate } from 'react-router-dom'; 

const Wallet = () => {
  const navigate = useNavigate(); 
  const [currentBalance, setCurrentBalance] = useState(0);
  const [eBalance, setEBalance] = useState(0);
  const [pendingWithdraw, setPendingWithdraw] = useState(0);
  const [approvedWithdraw, setApprovedWithdraw] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [userId, setUserId] = useState(null);

  const showAlert = () => {
    alert("Withdraw on Rank 10 only!!");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        try {
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            setCurrentBalance(userData.coins || 0);
            setEBalance(userData.ecoins || 0);
            setPendingWithdraw(userData.pendingWithdraw || 0);
            setApprovedWithdraw(userData.approvedWithdraw || 0);
          } else {
            console.log('No user data found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    const fetchWithdrawals = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const withdrawRef = ref(database, `withdraws/${user.uid}/`);
          const snapshot = await get(withdrawRef);
    
          if (snapshot.exists()) {
            const withdrawalsData = snapshot.val();
            
            const withdrawalsList = Object.keys(withdrawalsData).map((key) => ({
              id: key, // Use the unique Firebase key as ID
              accountHolder: withdrawalsData[key].accountHolder,
              accountNumber: withdrawalsData[key].accountNumber,
              amount: withdrawalsData[key].amount,
              date: withdrawalsData[key].date,
              paymentMethod: withdrawalsData[key].paymentMethod,
              paymentStatus: withdrawalsData[key].paymentStatus,
            }));
            
            // Set the list of withdrawals in the state
            setWithdrawals(withdrawalsList);
            console.log(withdrawalsList);
          } else {
            console.log('No withdrawal data found');
          }
        } catch (error) {
          console.error('Error fetching withdrawal data:', error);
        }
      }
    };
    

    fetchUserData();
    fetchWithdrawals();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"; // Handle missing date
    const dateObj = new Date(dateString);
    return !isNaN(dateObj.getTime()) ? dateObj.toLocaleString() : "Invalid Date"; 
  };

  return (
    <div className='wallet'>
      <div className="wallet-item">
        <span className="wallet-label">Current Balance:</span>
        <span className="wallet-value">{currentBalance}rs</span>
      </div>
      <div className="wallet-button">
      <button className='wallet-buttons' onClick={() => navigate('/withdraw')}>
  Withdraw current balance
</button>
        <button className='wallet-buttons' onClick={showAlert}>Withdraw in Best wallet: {eBalance}rs</button>
      </div>
      <div className="wallet-item">
        <span className="wallet-label">Pending Withdraw:</span>
        <span className="wallet-value">{pendingWithdraw}rs</span>
      </div>
      <div className="wallet-item">
        <span className="wallet-label">Approved Withdraw:</span>
        <span className="wallet-value">{approvedWithdraw}rs</span>
      </div>
      <h2 className='history-heading'>History</h2>
      <div className='table'>
        <div className='table-row'>
          <h4 className='th'>Withdraw Amount</h4>
          <h4 className='th'>Withdraw Status</h4>
          <h4 className='th'>Date & Time</h4>
        </div>

        {withdrawals.map((withdrawal, index) => (
          <div className='table-row' key={index}>
            <div className='td'>{withdrawal.amount}rs</div>
            <div className='td'>{withdrawal.paymentStatus}</div>
            <div className='td'>{formatDate(withdrawal.date)}</div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Wallet;
