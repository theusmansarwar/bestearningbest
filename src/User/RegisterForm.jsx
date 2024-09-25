import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { ref, set, get, child } from "firebase/database";
import { auth, database } from '../firebase';  // Your Firebase setup file
import { useNavigate, useLocation } from 'react-router-dom';
import './Form.css';
import { onValue } from 'firebase/database';
import Logo from '../Admin/Logo';
const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();  // Access the current URL location
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    selectedPlanId: ''  // Add selectedPlanId to formData
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);  // Track the selected plan

  // Extract referral code from URL if available
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const referralCodeFromURL = searchParams.get('ref');
    if (referralCodeFromURL) {
      setFormData(prevState => ({
        ...prevState,
        referralCode: referralCodeFromURL
      }));
    }
  }, [location.search]);

  // Input validation
  const validateInput = () => {
    const { name, email, username, phone, password, confirmPassword, referralCode, selectedPlanId } = formData;

    if (!name) return "Name is required";
    if (!email.includes("@")) return "Email must include '@'";
    if (/\s/.test(username)) return "Username should not contain spaces";
    if (!/^\+923\d{9}$/.test(phone)) return "Phone number must start with +923 and contain 12 digits";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password)) {
      return "Password must be 8 characters long, and include uppercase, lowercase, special character, and number";
    }
    if (!referralCode) return "Referral code is required to register";
    if (!selectedPlanId) return "Please select a plan";
    return null;
  };

  // Check if username is available
  const checkUsernameAvailability = async (username) => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `usernames/${username}`));
    return snapshot.exists();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationError = validateInput();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      // Check if the username already exists
      const usernameExists = await checkUsernameAvailability(formData.username);
      if (usernameExists) {
        setError('Username is already taken');
        setLoading(false);
        return;
      }

      // Create user in Firebase Authentication
      const { email, password, username, phone } = formData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Get the current timestamp (creation date)
      const creationDate = new Date().toISOString();

      // Save user data in Realtime Database, including creation date, referral code, phone number (with the '+'), and selected plan ID
      await set(ref(database, `users/${userId}`), {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        phone: phone,  
        referralCode: formData.referralCode,
        creationDate: creationDate,
        selectedPlanId: formData.selectedPlanId ,
        password:formData.password,
        payment:false ,
        type:'user',
        coins: 0,
        ecoins: 0,
        invites:0,
        pendingWithdraw:0,
        approvedWithdraw:0,
        firstwithdraw: false
      });

 
      await set(ref(database, `usernames/${username}`), true);

      await sendEmailVerification(userCredential.user);
      setMessage('Registration successful! Please verify your email.');
      navigate('/'); 
      
    } catch (error) {
      setError(error.message);
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

  const handlePlanClick = (plan) => {
    setFormData(prevState => ({
      ...prevState,
      selectedPlanId: plan.id 
    }));
    setSelectedPlan(plan.id); 
  };

  useEffect(() => {
    const plansRef = ref(database, 'plans');
    const unsubscribe = onValue(plansRef, (snapshot) => {
      const plansData = snapshot.val();
      const plansList = plansData ? Object.entries(plansData).map(([key, value]) => ({
        id: key,
        ...value
      })) : [];
      setPlans(plansList);
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <div className="Register">
      <Logo/>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Name" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email"/>
        <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Username"/>
        <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+923XXXXXXXXX"/>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Password"/>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm Password" />
        <p><b>Select a plan</b></p>
        <div className="plan-list">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <div
                key={plan.id}
                className={`register-plans-item ${selectedPlan === plan.id ? 'selected' : ''}`}  // Add class based on selection
                onClick={() => handlePlanClick(plan)}
              >
                <p>Name: {plan.name}</p>
                <p>Price: {plan.price}</p>
              </div>
            ))
          ) : (
            <p>No plans available.</p>
          )}
        </div>
        <button type="submit" disabled={loading}>Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
