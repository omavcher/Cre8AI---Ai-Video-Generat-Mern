import React, { useState, useEffect } from 'react';
import { Play, ArrowRight, Star, Coins, Youtube, Instagram, Twitter, Linkedin, Check, GithubIcon } from 'lucide-react';
import './Home.css';
import axios from "axios";
import { BASE_URL } from "../config/api";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [showVideo, setShowVideo] = useState(false); // Added video state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      

      try {
        const res = await axios.get(`${BASE_URL}/video/userDetails`, {
          headers: { Authorization: `Bearer ${storedUser.token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();

    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [navigate]);

  const testimonials = [
    {
      name: "Ananya Sharma",
      role: "Content Creator",
      avatar: "https://imgs.search.brave.com/XvEH7p005pdpK4Lld4MALDyPMlpo5mNSMprRfE0Eq1Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1waG90/by95b3VuZy1pbmRp/YW4tYnVzaW5lc3Nt/LXNlbGVjdGl2ZS1m/b2N1cy1zaGFsbG93/LWRlcHRoLWZpZWxk/LWZvbGxvdy1mb2N1/cy1ibHVyXzY4NTcy/NS04Mi5qcGc_c2Vt/dD1haXNfaHlicmlk",
      rating: 5,
      text: "Cre8AI has transformed my content workflow. I can now create high-quality videos in no time!"
    },
    {
      name: "Rohan Verma",
      role: "YouTuber",
      avatar: "https://imgs.search.brave.com/AihrU4NMDbbg36mjrSy8uPSC97Lmdb3xSoicSQR3xc0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAyMi8w/My8xMS8wNi8xNC9p/bmRpYW4tbWFuLTcw/NjEyNzhfNjQwLmpw/Zw",
      rating: 4.9,
      text: "The AI-generated videos are engaging and professional. My subscriber count has doubled!"
    },
    {
      name: "Priya Iyer",
      role: "Social Media Manager",
      avatar: "https://imgs.search.brave.com/tTQGVch6Xe4AP5Qb_HyBMoS19e-YI6nP3RcQ8gEeaqM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzEwLzIwLzc0LzIx/LzM2MF9GXzEwMjA3/NDIxOTNfU1MxU01X/TTB2SHZnMVdydHlQ/TzFMdFdmOVJHamNm/VmMuanBn",
      rating: 4.7,
      text: "Managing multiple platforms has never been easier. The AI delivers consistently high-quality content!"
    }
  ];

  const plans = [
    {
      name: "Free Plan",
      price: "₹0",
      tokens: 10,
      features: ["Basic AI Generation", "720p Video Quality", "Watermark on Videos"],
      buttonText: "Start for Free",
      amount: 0,
    },
    {
      name: "Starter Plan",
      price: "₹399",
      tokens: 100,
      features: ["Full HD Video", "No Watermark", "Basic Effects & Music"],
      buttonText: "Buy for ₹399",
      amount: 399,
    },
    {
      name: "Pro Plan",
      price: "₹1599",
      tokens: 500,
      features: ["4K Video Quality", "No Watermark", "Advanced AI Effects", "Priority Support"],
      buttonText: "Buy for ₹1599",
      amount: 1599,
      featured: true,
    },
  ];

  const handlePayment = async (amount, planName) => {
    if (!user) {
      setTimeout(() => navigate("/login"), 5000);
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Payment service is not available. Please try again later.");
      return;
    }

    const options = {
      key: "rzp_test_y6rhmgP580s3Yc",
      amount: amount * 100,
      currency: "INR",
      name: "Cre8AI",
      description: `Purchase ${planName}`,
      handler: async (response) => {
        try {
          const paymentData = {
            paymentId: response.razorpay_payment_id,
            amount,
            plan: planName,
            tokens: plans.find((p) => p.name === planName).tokens,
          };

          const storedUser = JSON.parse(localStorage.getItem("user"));
          await axios.post(`${BASE_URL}/video/savePayment`, paymentData, {
            headers: { Authorization: `Bearer ${storedUser.token}` },
          });
          alert("Payment successful! Tokens have been added to your account.");
          
          const res = await axios.get(`${BASE_URL}/video/userDetails`, {
            headers: { Authorization: `Bearer ${storedUser.token}` },
          });
          setUser(res.data);
        } catch (error) {
          console.error("Error saving payment:", error);
          alert("Payment successful, but there was an error updating your account. Please contact support.");
        }
      },
      prefill: {
        name: user?.name || "User Name",
        email: user?.email || "user@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#fd642c",
      },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section-homex3">
        <div className="hero-content-homex3">
          <div className="hero-text-homex3">
            <h1>Turn Your Ideas into <span className="highlight-homex3">AI-Generated Content</span> in Seconds!</h1>
            <p>Transform your stories into engaging videos with AI. Just enter your idea, choose a platform, and let AI do the rest.</p>
            <div className="cta-buttons-homex3">
              <Link to='/create' className="primary-button-homex3">
                Get Started for Free <ArrowRight className="icon" />
              </Link>
              <button 
                className="secondary-button-homex3"
                onClick={() => setShowVideo(!showVideo)}
              >
                Watch Demo <Play className="icon" />
              </button>
            </div>
          </div>
          <div className="hero-image">
            {showVideo ? (
              <div className="video-container">
                <video
                  style={{ width: "100%", height: "100%", borderRadius: "10px" }}
                  className="demo-video"
                  src="/demo.mp4" // Adjust this path based on your actual video file name and location
                  autoPlay
                  controls
                />
                <button 
                  className="close-video"
                  onClick={() => setShowVideo(false)}
                >
                  ×
                </button>
              </div>
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80" 
                alt="AI Content Creation"
              />
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>How It Works</h2>
        <div className="features-grid">
          {[
            { step: '01', title: 'Enter an Idea/Story', description: 'AI expands it into a full script' },
            { step: '02', title: 'Select Platform & Duration', description: 'YouTube, Instagram, TikTok, etc.' },
            { step: '03', title: 'AI Generates Everything', description: 'Text, Images, Video, Voiceover, Captions' },
            { step: '04', title: 'Download & Share', description: 'Get your AI-powered video instantly' }
          ].map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-step">{feature.step}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <h2>Choose Your Plan</h2>
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.featured ? 'featured' : ''}`}>
              <h3>{plan.name}</h3>
              <div className="price">
                <Coins className="coin-icon" />
                <span>{plan.price}</span>
              </div>
              <div className="tokens">{plan.tokens} Tokens</div>
              <ul>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <Check size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.amount > 0 ? (
                <button
                  className="primary-button-homex3"
                  onClick={() => handlePayment(plan.amount, plan.name)}
                >
                  {plan.buttonText}
                </button>
              ) : (
                <button className="primary-button-homex3">
                  {plan.buttonText}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section-homex3">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid-homex3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonials-card-homex3">
              <img src={testimonial.avatar} alt={testimonial.name} className="avatar-temal-home" />
              <div className="sstars-homex3">
                {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                  <Star key={i} className="star-icon-homex3" />
                ))}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/terms">Terms</a></li>
              <li><a href="/privacy">Privacy</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="https://www.linkedin.com/in/omawchar/"><Linkedin className="social-icon" /></a>
              <a href="https://x.com/omawchar07"><Twitter className="social-icon" /></a>
              <a href="https://www.instagram.com/omawchar07/"><Instagram className="social-icon" /></a>
              <a href="https://github.com/omavcher"><GithubIcon className="social-icon" /></a>
            </div>
          </div>
          <div className="footer-section">
            <h3>Newsletter</h3>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button className="primary-button-homex3">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Cre8AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
