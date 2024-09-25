import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, onValue } from 'firebase/database'; // Your Firebase setup file
import { useNavigate } from 'react-router-dom'; // For programmatic navigation
import { app } from '../firebase';
import Logo from '../Admin/Logo';
const LoginForm = () => {
  const auth = getAuth(app);
  const database = getDatabase(app);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [userType, setUserType] = useState('');
  const [payment, setPayment] = useState(false); // Add state for payment

  const navigate = useNavigate(); // For redirecting after login

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEmailVerificationError('');
    setMessage('');
  
    try {
      const { user } = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      if (user && !user.emailVerified) {
        setEmailVerificationError('Email not verified. Please verify your email.');
        alert('Email not verified. Please verify your email.');
        setLoading(false);
        return;
      } else {
        alert('Login successful!');
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            const userId = user.uid;
            const userRef = ref(database, `users/${userId}`);
            
            onValue(userRef, (snapshot) => {
              const userData = snapshot.val();
              const userType = userData.type;
              const payment = userData.payment;
  
              switch (userType) {
                case 'admin':
                  navigate('/AdminDashboard');
                  break;
                case 'user':
                  if (payment) {
                    navigate('/dashboard');
                  } else {
                    navigate('/payment');
                  }
                  break;
                default:
                  navigate('/dashboard');
              }
            });
          }
        });
        // Clean up subscription
        return () => authUnsubscribe();
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="Register">
        <Logo/>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {emailVerificationError && <p style={{ color: 'red' }}>{emailVerificationError}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter Email"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter Password"
        />
      <p className="Forgetpassword" onClick={() => navigate('/forget')}>Forget Your Password?</p>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
