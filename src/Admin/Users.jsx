import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database'; // Added 'update' to modify data
import { database } from '../firebase';  // Your Firebase setup file
import { FaEdit } from 'react-icons/fa';  // Import edit icon from React Icons
import './Users.css';

const Users = () => {
  const [userData, setUserData] = useState(null);
  const [userlist, setUserlist] = useState([]);
  const [plans, setPlans] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');  // To manage the selected role in the dropdown

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

  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setSelectedUser(user);  // Set selected user for editing
    setSelectedRole(user.type || 'user');  // Default to 'User' if no role is set
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleUpdate = () => {
    // Update the user's role in Firebase
    if (selectedUser) {
      const userRef = ref(database, `users/${selectedUser.id}`);
      update(userRef, { type: selectedRole })
        .then(() => {
          alert('User role updated successfully!');
          setEditingUserId(null); // Close editing view
          setSelectedUser(null); // Clear selected user
        })
        .catch((error) => {
          console.error('Error updating role:', error);
        });
    }
  };

  const filteredUsers = userlist.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
  // const rank = getRank(userData.invites || 0);
  return (
    <div className="user-list">
      <h2 className="heading">Users List</h2>

      {/* Search Input */}
      <div className="search-input">
        <input
          type="text"
          placeholder="Search by email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {selectedUser && (
        <div className="edit-section">
          <h3>Edit User Role</h3>
          <p>
            <b>{selectedUser.name}</b> ({selectedUser.email})
          </p>
          <label>
            Role:
            <select
              value={selectedRole}
              onChange={handleRoleChange}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="block">Block</option>
            </select>
          </label>
          <button onClick={handleUpdate}>Update Role</button>
        </div>
      )}

      {/* User List */}
      <div className="register-user-item">
        <p><b>ID</b></p>
        <p><b>Name</b></p>
        <p><b>Email</b></p>
        <p><b>Phone No</b></p>
        <p><b>Username</b></p>
        <p><b>Rank</b></p>
        <p><b>Plan</b></p>
        <p><b>Payment</b></p>
        <p><b>Invites</b></p>
        <p><b>Register Date</b></p>
        <p><b>Edit</b></p>
      </div>
      {filteredUsers.length > 0 ? (
  filteredUsers.map((user, index) => {
    const rank = getRank(user.invites || 0); // Calculate rank for each user
    return (
      <div key={user.id} className="register-user-item">
        <p>{index + 1}</p>
        <p>{user.name}</p>
        <p>{user.email}</p>
        <p>{user.phone}</p>
        <p>{user.username}</p>
        <p>{rank}</p> 
        <p>{plans[user.id] ? plans[user.id] : 'No plan selected'}</p>
        <p>
          <span
            style={{
              color: user.payment ? 'green' : 'red',
              fontWeight: 'bold',
            }}
          >
            {user.payment ? 'True' : 'False'}
          </span>
        </p>
        <p>{user.invites}</p>
        <p>{formatDate(user.creationDate)}</p>
        <p>
          <FaEdit
            style={{ cursor: 'pointer', color: 'blue' }}
            onClick={() => handleEditClick(user)}
          />
        </p>
      </div>
    );
  })
) : (
  <p>No users available.</p>
)}


      {/* Role Update Section */}
     
    </div>
  );
};

export default Users;
