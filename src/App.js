import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateAdminRoute from './Auth/PrivateAdminRoute';
import PrivateuserRoute from './Auth/PrivateuserRoute';
import './App.css';
import RegisterForm from './User/RegisterForm';
import LoginForm from './User/LoginForm';
import Dashboard from './User/Dashboard';
import Dashboard2 from './Admin/Dashboard';
import Profile from './User/Profile';
import Todaywork from './User/Todaywork';
import Wallet from './User/Wallet';
import Invite from './User/Invite';
import Plans from './Admin/Plans';
import { app } from './firebase';
import { ref, onValue, getDatabase } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Payment from './User/Payment';
import Websitedetail from './Admin/Websitedetail';
import Users from './Admin/Users';
import Dailybonus from './Admin/Dailybonus';
import Task from './Admin/Task';
import Payments from './Admin/Payments';
import DailyReward from './User/DailyReward';
import Team from './User/Team';
import Withdraw from './User/Withdraw';
import Withdrawls from './Admin/Withdrawls';
import Offers from './Admin/Offers';
import AddPayments from './Admin/AddPayments';
import ForgotPassword from './User/ForgotPassword';

function App() {
  const [userType, setUserType] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const database = getDatabase(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        const userRef = ref(database, `users/${userId}/type`);
        onValue(userRef, (snapshot) => {
          const type = snapshot.val();
          setUserType(type);
          setLoading(false);
        });
      } else {
        setUserType(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Clean up subscription
  }, [auth, database]);

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a loading spinner
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/" element={<LoginForm />} />
          <Route path="/forget" element={<ForgotPassword />} />

          <Route element={<PrivateuserRoute isUser={userType === 'user'} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/todaywork" element={<Todaywork />} />
            <Route path="/dailybonus" element={<DailyReward />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/invite" element={<Invite />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/team" element={<Team />} />
            <Route path="/withdraw" element={<Withdraw />} />

          </Route>

          <Route element={<PrivateAdminRoute isAdmin={userType === 'admin'} />}>
            <Route path="/AdminDashboard" element={<Dashboard2 />}/>
            <Route path="/plans" element={<Plans />}/>
            <Route path="/websitedetail" element={<Websitedetail/>}/>
            <Route path="/users" element={<Users/>}/>
            <Route path="/dailybonuss" element={<Dailybonus/>}/>
            <Route path="/task" element={<Task/>}/>
            <Route path="/withdrawal" element={<Withdrawls />} />
            <Route path="/paymentslist" element={<Payments/>}/>
            <Route path="/offers" element={<Offers/>}/>
            <Route path="/addpayment" element={<AddPayments/>}/>

          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
