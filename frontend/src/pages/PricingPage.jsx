import React, { useEffect, useState } from "react";
import { Shield, Zap, Rocket, Crown, Check } from "lucide-react";
import "./PricingPage.css"; // Assuming this is in the same directory
import axios from "axios";
import { BASE_URL } from "../config/api"; // Adjust path as per your project structure
import { useNavigate } from "react-router-dom";

const PricingPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        alert("Please login before use. Redirecting to login in 5 seconds...");
        setTimeout(() => navigate("/login"), 5000);
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/video/userDetails`, {
          headers: { Authorization: `Bearer ${storedUser.token}` },
        });
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
        alert("Please try again later.");
      }
    };

    fetchUserDetails();

    // Load Razorpay script dynamically
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [navigate]);

  const plans = [
    {
      icon: <Shield className="plan-icon" />,
      name: "Free Plan",
      price: "₹0",
      tokens: 10,
      features: ["Basic AI Video Generation", "Limited Customization", "Watermark on Videos"],
      buttonText: "Start for Free",
      className: "free",
      amount: 0,
    },
    {
      icon: <Zap className="plan-icon" />,
      name: "Starter Plan",
      price: "₹399",
      tokens: 100,
      features: ["Full HD Video", "No Watermark", "Basic Effects & Music"],
      buttonText: "Buy for ₹399",
      className: "starter",
      amount: 399,
    },
    {
      icon: <Rocket className="plan-icon" />,
      name: "Pro Plan",
      price: "₹1599",
      tokens: 500,
      features: ["Access to Advanced AI Effects", "Faster Video Processing", "Priority Support"],
      buttonText: "Buy for ₹1599",
      className: "pro",
      amount: 1599,
    },
    {
      icon: <Crown className="plan-icon" />,
      name: "Ultimate Plan",
      price: "₹2799",
      tokens: 1000,
      features: ["Unlimited AI Effects & Premium Voices", "Priority Support", "Custom Branding"],
      buttonText: "Buy for ₹2799",
      className: "ultimate",
      amount: 2799,
    },
  ];

  const faqs = [
    {
      question: "How do I buy tokens?",
      answer: "Choose a plan and click 'Buy Now'. Pay securely using Razorpay.",
    },
    {
      question: "Do my tokens expire?",
      answer: "No, your tokens never expire! Use them anytime.",
    },
    {
      question: "What happens when I run out of tokens?",
      answer: "You can buy more tokens anytime by upgrading your plan.",
    },
  ];

  const handlePayment = async (amount, planName) => {
    if (!user) {
      alert("Please login to proceed with payment. Redirecting to login in 5 seconds...");
      setTimeout(() => navigate("/login"), 5000);
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      alert("Payment service is not available. Please try again later.");
      return;
    }

    const options = {
      key: "rzp_test_y6rhmgP580s3Yc", // Replace with your Razorpay key
      amount: amount * 100, // Convert to paise (Razorpay expects amount in smallest unit)
      currency: "INR",
      name: "AI Video Generator",
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
        } catch (error) {
          console.error("Error saving payment:", error);
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
    <div className="pricing-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>AI Video Generator - Create Videos from Text!</h1>
          <p>Choose a plan and start generating AI-powered videos today.</p>
          <button className="cta-button">Get Started for Free</button>
        </div>
      </section>

      <section className="pricing-section">
        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div key={index} className={`pricing-card ${plan.className}`}>
              <div className="card-header">
                {plan.icon}
                <h3>{plan.name}</h3>
                <div className="price">{plan.price}</div>
                <div className="tokens">{plan.tokens} Tokens</div>
              </div>
              <div className="features">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="feature">
                    <Check size={18} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              {plan.amount > 0 ? (
                <button
                  className="buy-button"
                  onClick={() => handlePayment(plan.amount, plan.name)}
                >
                  {plan.buttonText}
                </button>
              ) : (
                <button className="buy-button">{plan.buttonText}</button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PricingPage;