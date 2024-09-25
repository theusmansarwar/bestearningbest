import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set,update ,push} from 'firebase/database'; // Assuming Firebase is initialized
import { getAuth } from 'firebase/auth'; // For authentication

const Withdraw = () => {
  const [accountHolder, setAccountHolder] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');
  const [userBalance, setUserBalance] = useState(0);
  const [pendingWithdraw, setPendingWithdraw] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const db = getDatabase();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  useEffect(() => {
    if (currentUser) {
      const userRef = ref(db, `users/${currentUser.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserBalance(userData.coins || 0); // Fetch coins
          setPendingWithdraw(userData.pendingWithdraw || 0); // Fetch pendingWithdraw
        }
      }).catch((error) => {
        console.error('Error fetching user data:', error);
      });
    }
  }, [currentUser, db]);
  

  const handleSubmit = (e) => {
    e.preventDefault();

    if (amount < 100) {
      setError('Minimum withdrawal amount is 100.');
      return;
    }

    if (userBalance < amount) {
      setError('Insufficient balance for withdrawal.');
      return;
    }

   
    const withdrawRef = ref(db, `withdraws/${currentUser.uid}`);
    const newWithdrawRef = push(withdrawRef);
    const withdrawData = {
      accountHolder,
      accountNumber,
      amount,
      paymentMethod,
      paymentStatus: "pending",
      username: currentUser.displayName, 
      userId: currentUser.uid,
      date: new Date().toISOString(),
    };


    const updatedUserData = {
      coins: userBalance - amount, 
      pendingWithdraw: pendingWithdraw + amount,
    };

  
     
    set(newWithdrawRef, withdrawData) // Use push() to add a new record
    .then(() => {
      const userRef = ref(db, `users/${currentUser.uid}`);
      return update(userRef, updatedUserData); // Update user data without overwriting
    })
    .then(() => {
      setSuccess('Withdrawal request submitted successfully.');
      setError('');
      // Update local states
      setUserBalance((prev) => prev - amount);
      setPendingWithdraw((prev) => prev + amount);
    })
    .catch((error) => {
      setError('Error submitting the withdrawal request: ' + error.message);
    });
};
  return (
    <div className='wallet'>
      <h2>Withdraw</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Account Holder Name</label>
          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Account Number</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
            min="100"
          />
        </div>
        <div>
          <label>Payment Method</label><br/>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="JazzCash">JazzCash</option>
            <option value="EasyPaisa">EasyPaisa</option>
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Withdraw;
