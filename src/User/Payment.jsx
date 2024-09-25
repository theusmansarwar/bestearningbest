import React, { useState, useEffect } from 'react';
import { auth, database } from '../firebase'; // Import Firebase services
import { ref, set,push, get, child } from 'firebase/database';
import './Payment.css'
const Payment = () => {
  const [transactionId, setTransactionId] = useState('');
  const [senderAccountName, setSenderAccountName] = useState('');
  const [username, setUsername] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planName, setPlanName] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(''); // State for selected plan ID
  const [paymentAccountNo, setPaymentAccountNo] = useState('');
  const [paymentAccountHolder, setPaymentAccountHolder] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0'); 
  const year = String(currentDate.getFullYear()).slice(-2); // Get last two digits of the year
  const formattedDate = `${day}/${month}/${year}`;
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userId = currentUser.uid;
        
        try {
         
          const dbRef = ref(database);
          const userSnapshot = await get(child(dbRef, `users/${userId}`));
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            setUsername(userData.username);
            setAccountNumber(userData.accountNumber);
            setSelectedPlanId(userData.selectedPlanId); // Store selectedPlanId
          } else {
            console.log('No user data found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, []); // Run effect only on mount

  useEffect(() => {
    const fetchPlanData = async () => {
      if (selectedPlanId) {
        try {
          // Fetch plan details from Firebase Realtime Database
          const dbRef = ref(database);
          const planSnapshot = await get(child(dbRef, `plans/${selectedPlanId}`));
          
          if (planSnapshot.exists()) {
            const planData = planSnapshot.val();
            setPlanPrice(planData.price);
            setPlanName(planData.name);
          } else {
            console.log('No plan data found');
          }
        } catch (error) {
          console.error('Error fetching plan data:', error);
        }
      }
    };

    fetchPlanData();
  }, [selectedPlanId]); // Run effect when selectedPlanId changes

  useEffect(() => {
    const fetchWebsiteData = async () => {
      if (username) {
        try {
          // Fetch website details from Firebase Realtime Database
          const dbRef = ref(database);
          const websiteSnapshot = await get(child(dbRef, `websites`));
          
          if (websiteSnapshot.exists()) {
            const websiteData = websiteSnapshot.val();
            setPaymentAccountNo(websiteData.paymentAccountNo);
            setPaymentAccountHolder(websiteData.paymentAccountHolder);
            setPaymentMethod(websiteData.paymentMethod);
          } else {
            console.log('No website data found');
          }
        } catch (error) {
          console.error('Error fetching website data:', error);
        }
      }
    };

    fetchWebsiteData();
  }, [username]); // Run effect when username changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
  
    if (currentUser) {
      const userId = currentUser.uid;
  
      try {
        // Reference to the 'payments' node in Firebase
        const paymentRef = ref(database, `payments`);
  
        // Check if the transactionId already exists
        const paymentSnapshot = await get(child(paymentRef, `/`));
  
        if (paymentSnapshot.exists()) {
          const payments = paymentSnapshot.val();
          // Check if transactionId is already used
          const trxExists = Object.values(payments).find(payment => payment.transactionId === transactionId);
          if (trxExists) {
            alert('This Transaction ID has already been submitted. Please use a different Transaction ID.');
            return; // Stop the submission
          }
        }
  
        // Proceed to submit the payment if transactionId is not found
        await push(paymentRef, {
          userId,
          transactionId,
          senderAccountName,
          username,
          planPrice,
          planName,
          paymentMethod,
          paymentDate: formattedDate,
        });
  
        alert('Payment details submitted successfully! Please Wait for 3 to 5 hours to approve your account.');
      } catch (error) {
        console.error('Error submitting payment details:', error);
      }
    }
  };
  
  
  

  return (
    <div className='payment-div'>
   <p className='paymentdetail'>
   You have selected the <b>{planName}</b> plan with a price of <b>RS:{planPrice}</b>.
To activate this plan, please make your payment to the following account:<br/>
Account Type: <b>{paymentMethod}</b><br/>
Account Holder: <b>{paymentAccountHolder}</b><br/>
Account Number: <b>{paymentAccountNo}</b>
   </p>
      <form onSubmit={handleSubmit}>
        <label>
          Transaction ID:
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Sender Account Name:
          <input
            type="text"
            value={senderAccountName}
            onChange={(e) => setSenderAccountName(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Payment;
