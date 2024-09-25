import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'; // Firebase functions for password reset
import { app } from '../firebase'; // Firebase app configuration
import Logo from '../Admin/Logo';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Error resetting password:', error.message);
      setError('Failed to send password reset email. Please check if the email is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className="Register">
      <Logo />
      <h1>Forgot Password</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          required
          placeholder="Enter your registered email"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
