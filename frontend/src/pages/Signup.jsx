import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Brain, Lock, Mail, User2, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { registerUser, googleAuth } from '../services/authService';
import './Signup.css';

const Signup = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const userData = await registerUser({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Redirect to previous route or dashboard
      const from = location.state?.from || '/create';
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const userData = await googleAuth(response.credential);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      const from = location.state?.from || '/create';
      navigate(from, { replace: true });
    } catch (error) {
      setError('Google login failed');
    }
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
              Join the future of AI-powered content creation
            </p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="form-section">
          <div className="form-container">
            <h2 className="form-title">Create Your Account</h2>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              <div className='google-login'>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                useOneTap
              />
              </div>

              <div className="divider">
                <span>or</span>
              </div>

              <div className="name-group">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className="input-group">
                    <User2 className="input-icon" size={20} />
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Om"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="input-group">
                    <User2 className="input-icon" size={20} />
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Awchar"
                      required
                    />
                  </div>
                </div>
              </div>

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
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-group">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-group">
                  <Lock className="input-icon" size={20} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-button">
                Create Account
              </button>

              <p className="toggle-text">
                Already have an account?{' '}
                <Link
                to='/login'
                  type="button"
                  className="toggle-button"                  
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;