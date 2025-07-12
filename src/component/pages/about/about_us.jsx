import React from 'react';
import './about_riseup.css';
import { useNavigate } from 'react-router-dom';

function About_Riseup() {
  const navigate = useNavigate();

  return (
    <div className="abt_container">
      <div className="abt_wrapper">
        <h2 className="abt_title">🌅 About RiseUp</h2>
        <p className="abt_intro">
          RiseUp is a faith-based platform dedicated to bringing daily inspiration,
          spiritual growth, and a sense of community to people around the world.
          Our mission is to uplift and empower believers through scripture, prayer,
          and teachings rooted in truth and hope.
        </p>

        <div className="abt_section">
          <h3 className="abt_subtitle">🌍 Our Vision</h3>
          <p>
            We envision a world where people can access faith-driven content anytime,
            anywhere. RiseUp seeks to light the way for individuals in need of encouragement,
            helping them deepen their relationship with God.
          </p>
        </div>

        <div className="abt_section">
          <h3 className="abt_subtitle">🤝 Our Community</h3>
          <p>
            Our community is made up of believers from all walks of life who come together to share
            stories, pray for one another, and grow spiritually. We believe in lifting each other
            up through love, kindness, and compassion.
          </p>
        </div>

        <div className="abt_section">
          <h3 className="abt_subtitle">📖 What We Offer</h3>
          <ul className="abt_list">
            <li>Daily scriptures and devotionals</li>
            <li>Inspirational quotes and stories</li>
            <li>Prayer requests and support</li>
            <li>Interactive tools for spiritual development</li>
          </ul>
        </div>

        <div className="abt_buttons">
          <button className="abt_btn" onClick={() => navigate('/about-us')}>About Us</button>
          <button className="abt_btn" onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>
          <button className="abt_btn" onClick={() => navigate('/terms-conditions')}>Terms & Conditions</button>
        </div>
      </div>
    </div>
  );
}

export default About_Riseup;
