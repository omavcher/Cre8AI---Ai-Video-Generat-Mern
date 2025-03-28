import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/api";
import "./ExportDialog.css";

const ExportDialog = ({ onClose, onDownload, videoId }) => {
  const [adWatched, setAdWatched] = useState(false);
  const [timer, setTimer] = useState(60); // 1 minute timer
  const [downloadEnabled, setDownloadEnabled] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(5); // Default ₹5
  const [userMessage, setUserMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.token) {
        setUserMessage("Please login before using this feature.");
        setTimeout(() => {
          navigate("/login");
        }, 5000);
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/video/userDetails`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.status !== 200) {
          throw new Error("Failed to fetch user details");
        }
      } catch (error) {
        setErrorMessage("Please try again later.");
        console.error("Error fetching user details:", error);
      }
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (!adWatched && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setAdWatched(true);
            setDownloadEnabled(true);
            setPaymentAmount(1); // Reduce to ₹1 after ad is watched
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [adWatched, timer]);

  const handleWatchAd = () => {
    console.log("Ad started...");
    setTimer(60); // Reset timer
    setAdWatched(false);
    setDownloadEnabled(false); // Reset download until ad completes
    setPaymentAmount(5); // Reset to ₹5 until ad is watched
  };

  const handlePayment = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      setUserMessage("Please login before making a payment.");
      setTimeout(() => {
        navigate("/login");
      }, 5000);
      return;
    }

    const options = {
      key: "rzp_test_y6rhmgP580s3Yc", // Replace with your Razorpay key
      amount: paymentAmount * 100, // Amount in paise
      currency: "INR",
      name: "Video Download",
      description: "Download your video",
      handler: async function (response) {
        try {
          const paymentData = {
            paymentId: response.razorpay_payment_id,
            amount: paymentAmount,
            videoId: videoId,
          };
          const res = await axios.post(
            `${BASE_URL}/video/savePayment`,
            paymentData,
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );
          if (res.status === 200) {
            alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
            setDownloadEnabled(true);
            onDownload(); // Trigger download
            onClose(); // Close dialog
          } else {
            setErrorMessage("Payment saved failed. Please try again.");
          }
        } catch (error) {
          setErrorMessage("Error saving payment. Please try again.");
          console.error("Error saving payment:", error);
        }
      },
      theme: { color: "#d84303" },
    };
    const razor = new window.Razorpay(options);
    razor.open();
  };

  const handleDownload = () => {
    if (downloadEnabled) {
      onDownload();
      onClose();
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-box">
        <h2>Download Your Video</h2>
        {userMessage && <p className="message warning">{userMessage}</p>}
        {errorMessage && <p className="message error">{errorMessage}</p>}
        {!userMessage && !errorMessage && (
          <p>
            Watch a 1-minute ad to pay ₹1, or pay ₹{paymentAmount} without watching.
          </p>
        )}

        {/* Ad Placeholder */}
        {!userMessage && !errorMessage && (
          <div className="ad-container">
            {!adWatched && (
              <>
                <div className="ad-placeholder">
                  <p>Simulated Ad Playing... ({timer}s remaining)</p>
                </div>
                <button className="watch-ad-btn" onClick={handleWatchAd}>
                  Watch Ad
                </button>
              </>
            )}
            {adWatched && <p>Ad completed! Pay ₹1 or download now.</p>}
          </div>
        )}

        {/* Pay Button */}
        {!userMessage && !errorMessage && (
          <button className="pay-btn" onClick={handlePayment}>
            Pay ₹{paymentAmount}
          </button>
        )}

        {/* Download Button */}
        <button
          className="download-btn"
          disabled={!downloadEnabled}
          onClick={handleDownload}
        >
          Download
        </button>

        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ExportDialog;