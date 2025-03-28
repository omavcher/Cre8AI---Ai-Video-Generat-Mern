import React from "react";
import "../styles/Privacy.css";

const Privacy = () => {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>
      <div className="privacy-content">
        <h3>1. Information Collection</h3>
        <p>We collect only the information you provide, such as email and phone number, for contact purposes.</p>
        <h3>2. Use of Information</h3>
        <p>Your information is used solely to respond to inquiries and will not be shared with third parties.</p>
        <h3>3. Security</h3>
        <p>We take reasonable measures to protect your data, but no method is 100% secure.</p>
        <p><em>Last Updated: March 27, 2025</em></p>
      </div>
    </div>
  );
};

export default Privacy;