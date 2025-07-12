import React, { useState, useRef } from 'react';
import { IoChevronBack, IoEyeOutline, IoEyeSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { db, authUser } from '../../../backend/config/firebase';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';

function SignUpForm() {
  const navigate = useNavigate();
  const [showpass, setShowPass] = useState(false);
  const [showrepass, setShowRePass] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fname, setFName] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [userType, setUserType] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const emailRef = useRef(null);
  const usernameRef = useRef(null);
  const fullnameRef = useRef(null);
  const passwordRef = useRef(null);
  const rePasswordRef = useRef(null);

  const handleChangeInput = (e, type) => {
    switch (type) {
      case 'email':
        setEmail(e.target.value);
        break;
      case 'username':
        setUsername(e.target.value);
        break;
      case 'password':
        setPassword(e.target.value);
        break;
      case 'fullname':
        setFName(e.target.value);
        break;
      case 'repeatpassword':
        setRePassword(e.target.value);
        rePasswordRef.current.style.border = "none";
        break;
      default:
        break;
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsSigningUp(true);

    if (password === rePassword) {
      try {
        const userCredentials = await createUserWithEmailAndPassword(authUser, email, password);
        const user = userCredentials.user;

        await setDoc(doc(db, "users_info", user.uid), {
          email: email,
          username: username,
          fullname: fname,
          municipality: null,
          parish: null,
          createdAt: new Date(),
          year: null,
          section: userType,
          role: 'client',
          isOnline: true,
          lastActive: serverTimestamp(),
        });

        await sendEmailVerification(user);
        await signOut(authUser);

        alert("✔ Account created! A verification email has been sent. Please check your inbox or spam folder to verify your email before logging in.");
        navigate("/");

      } catch (err) {
        console.error("❌ Error Sign Up Process: ", err.message);
        setIsSigningUp(false);
        setPassword("");
        setRePassword("");
      }
    } else {
      setIsSigningUp(false);
      console.error("❌ Passwords do not match");
      setRePassword("");
      rePasswordRef.current.style.border = "2px solid red";
    }
  };

  return (
    <div className='container-register'>
      <div className='formbox-register'>
        <div className='fillbox'>
          <div className='registration-tab'>
            <h2>ACCOUNT REGISTRATION</h2>
            <IoChevronBack className='btn-back' onClick={() => navigate('/')} />
          </div>
          <form className='input-register' onSubmit={handleSignUp}>
            <div className='formgroup-input'>
              <input
                className='txt-input'
                placeholder='Email'
                type='text'
                value={email}
                onChange={(e) => handleChangeInput(e, 'email')}
                ref={emailRef}
                required
              />
            </div>
            <div className='formgroup-input'>
              <input
                className='txt-input'
                placeholder='Full Name'
                type='text'
                value={fname}
                onChange={(e) => handleChangeInput(e, 'fullname')}
                ref={fullnameRef}
                required
              />
            </div>
            <div className='formgroup-input'>
              <select
                className='txt-input'
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                required
              >
                <option value="">Select Type</option>
                <option value="IT-3A">IT-3A</option>
                <option value="IT-3B">IT-3B</option>
                <option value="IT-3C">IT-3C</option>
                <option value="CS3A">CS3A</option>
                <option value="CPE3A">CPE3A</option>
                <option value="CPE3B">CPE3B</option>
              </select>
            </div>
            <div className='formgroup-input'>
              <input
                className='txt-input'
                placeholder='Username'
                type='text'
                value={username}
                onChange={(e) => handleChangeInput(e, 'username')}
                ref={usernameRef}
                required
              />
            </div>
            <div className='formgroup-input'>
              <input
                className='txt-input'
                placeholder='Password'
                type={showpass ? 'text' : 'password'}
                value={password}
                onChange={(e) => handleChangeInput(e, 'password')}
                ref={passwordRef}
                required
              />
              <button
                type='button'
                className='toggle-password'
                onClick={() => setShowPass(!showpass)}
              >
                {showpass ? <IoEyeSharp /> : <IoEyeOutline />}
              </button>
            </div>
            <div className='formgroup-input'>
              <input
                className='txt-input'
                placeholder='Repeat Password'
                type={showrepass ? 'text' : 'password'}
                value={rePassword}
                onChange={(e) => handleChangeInput(e, 'repeatpassword')}
                ref={rePasswordRef}
                required
              />
              <button
                type='button'
                className='toggle-password'
                onClick={() => setShowRePass(!showrepass)}
              >
                {showrepass ? <IoEyeSharp /> : <IoEyeOutline />}
              </button>
            </div>
            <div className='checkboxgroup'>
              <input className='cb-confirm' type='checkbox' required />
              <label>I have agreed to the Terms and Conditions</label>
            </div>
            <div className='formbutton'>
              <button
                className='btn-input'
                type='submit'
                disabled={isSigningUp}
              >
                {isSigningUp ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
