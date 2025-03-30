import { useState , useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Brain, Lock, Mail, User2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import {  googleAuth } from '../services/authService';
import './Login.css';
import axios from 'axios';
import { BASE_URL } from '../config/api';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
    });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
  
    try {
      const response = await axios.post(`${BASE_URL}/users/login`, formData, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
  
      const from = location.state?.from || '/create';
      navigate(from, { replace: true });
  
    } catch (error) {
      console.error('Login error:', error);
  
      if (error.response?.data?.message === 'Password not set for this user') {
        setError('Please sign in using Google....');
  
      } else {
        setError(error.response?.data?.message || 'Login failed');
      }
    }
  };
  
  
  const handleGoogleSuccess = async (response) => {
    try {
      const userData = await googleAuth(response.credential);
      console.log('Google login successful:', userData); // Debug log
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      const from = location.state?.from || '/create';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Google login error:', error); // Debug log
      setError('Google login failed');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="brand-section">
          <div className="brand-content">
            <div className="brand-logo">
              <Brain size={48} />
            </div>
            <h1 className="brand-title">Cre8AI</h1>
            <p className="brand-description">
              Unleash your creativity with AI-powered content creation
            </p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="form-section">
          <div className="form-container">
            <h2 className="form-title">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              <div className="google-login">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google login failed')}
                  useOneTap
                />
              </div>

              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-group">
                    <User2 className="input-icon" size={20} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-group">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-group">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
        
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={!formData.email || !formData.password} // Disable if fields are empty
              >
                Sign In
              </button>

              <p className="toggle-text">
                Don't have an account?{' '}
                <Link to="/signup" className="toggle-button">
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;