import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../firebase'; // Your Firebase setup file
import { FaEdit } from 'react-icons/fa'; // Import the edit icon from React Icons

const AddPayments = () => {
  const [userlist, setUserlist] = useState([]);
  const [plans, setPlans] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentBalance, setCurrentBalance] = useState('');
  const [pendingBalance, setPendingBalance] = useState('');

  useEffect(() => {
    // Fetch users from Firebase
    const userRef = ref(database, 'users');

    const unsubscribe = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      const usersArray = userData
        ? Object.entries(userData).map(([key, value]) => ({
            id: key,
            ...value
          }))
        : [];
      setUserlist(usersArray);
    });

    return () => unsubscribe(); // Cleanup the subscription
  }, []);

  useEffect(() => {
    // Fetch plan data for each user
    userlist.forEach((user) => {
      if (user.selectedPlanId) {
        const planRef = ref(database, `plans/${user.selectedPlanId}`);

        const unsubscribe = onValue(planRef, (snapshot) => {
          const planData = snapshot.val();
          if (planData) {
            setPlans((prevPlans) => ({
              ...prevPlans,
              [user.id]: planData.name,
            }));
          }
        });

        return () => unsubscribe(); // Cleanup the subscription
      }
    });
  }, [userlist]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setCurrentBalance(user.coins || '');
    setPendingBalance(user.pendingWithdraw || '');
  };

  const handleSave = async () => {
    if (editingUserId) {
      const userRef = ref(database, `users/${editingUserId}`);
      await update(userRef, {
        coins: Number(currentBalance),
        pendingWithdraw: Number(pendingBalance)
      });
      setEditingUserId(null);
      setCurrentBalance('');
      setPendingBalance('');
    }
  };

  const filteredUserlist = userlist.filter(user =>
    user.email.toLowerCase().includes(searchTerm)
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
  
    return `${day}/${month}/${year}`;
  };
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

  return (
    <div className="user-list">
      <h2 className='heading'>Users List</h2>
      <input
        type="text"
        placeholder="Search by email..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-input"
      />
       {editingUserId && (
        <div className="edit-form">
          <h3>Edit User</h3>
          <label>
            Current Balance:
            <input
              type="number"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
            />
          </label>
          <label>
            Pending Balance:
            <input
              type="number"
              value={pendingBalance}
              onChange={(e) => setPendingBalance(e.target.value)}
            />
          </label>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditingUserId(null)}>Cancel</button>
        </div>
      )}
      <div className='register-user-item'>
        <p><b>ID</b></p>
        <p><b>Name</b></p>
        <p><b>Email</b></p>
        <p><b>Plan</b></p>
        <p><b>Rank</b></p>
        <p><b>Current Balance</b></p>
        <p><b>Pending Balance</b></p>
        <p><b>Invites</b></p>
        <p className='edit-icon'><b>Edit</b></p>
      </div>
      {filteredUserlist.length > 0 ? (
  filteredUserlist.map((user, index) => {
    const rank = getRank(user.invites || 0); // Calculate rank for each user
    return (
          <div key={user.id} className="register-user-item">
            <p>{index + 1}</p>
            <p>{user.email}</p>
            <p>{user.username}</p>
            <p>{plans[user.id] ? plans[user.id] : "No plan selected"}</p>
            <p>{rank}</p> 
            <p>{user.coins || 0}</p>
            <p>{user.pendingWithdraw || 0}</p>
            
            <p>{user.invites}</p>
            <p>
              <FaEdit
                style={{ cursor: 'pointer', color: 'blue' }}
                onClick={() => handleEditClick(user)}
              />
            </p>
          </div>
    )})

        
   
      ) : (
        <p>No users available.</p>
      )}
     
    </div>
  );
};

export default AddPayments;
