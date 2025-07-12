import { useState, useRef } from 'react';
import crosslogo from './../../assets/images/icons/cross.png';
import { TfiEmail } from "react-icons/tfi";
import { CiLock, CiMail } from "react-icons/ci";
import { FaGoogle } from "react-icons/fa";
import { RiAccountCircleLine } from "react-icons/ri";
import { IoEyeOutline, IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { authUser, googleProvider, db } from '../../../backend/config/firebase';
import { setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

function SignInForm() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLgoin, setIsLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLogin(true);

        try {
            const usercredentials = await signInWithEmailAndPassword(authUser, email, password);
            const user = usercredentials.user;

            const userDocRef = doc(db, "users_info", user.uid);
            const userSnapshot = await getDoc(userDocRef);

            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                const role = userData.role;

                localStorage.setItem('userRole', role);

                if (role === "admin") {
                    navigate("/admin-dashboard");
                } else if (role === "client") {
                    await setDoc(userDocRef, {
                        isOnline: true,
                        lastActive: serverTimestamp()
                    }, { merge: true });

                    window.addEventListener('beforeunload', () => {
                        setDoc(userDocRef, {
                            isOnline: false
                        }, { merge: true });
                    });

                    navigate("/dashboard");
                } else {
                    console.warn("Unknown user role:", role);
                }
            } else {
                console.error("No user document found in Firestore!");
            }

        } catch (err) {
            setIsLogin(false);
            setPassword("");
            console.error("Login Error: ", err.message);

            if (emailRef.current) {
                emailRef.current.style.border = "2px solid red";
            }
            if (passwordRef.current) {
                passwordRef.current.style.border = "2px solid red";
            }
        }
    };

    const handleInputChange = (setter, ref) => (e) => {
        setter(e.target.value);
        if (ref.current) {
            emailRef.current.style.border = "none";
            passwordRef.current.style.border = "none";
        }
    };

    const handleLoginWithGoogle = async () => {
        try {
            const userGoogleCredentials = await signInWithPopup(authUser, googleProvider);
            const user = userGoogleCredentials.user;
            const username = user.email.split('@')[0];
            const fullname = username;
            const userRef = doc(db, "users_info", user.uid);
            let userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    email: user.email,
                    username: username,
                    fullname: fullname,
                    municipality: null,
                    parish: null,
                    createdAt: serverTimestamp(),
                    year: null,
                    section: null,
                    role: 'client',
                    isOnline: true,
                    lastActive: serverTimestamp()
                });
            } else {
                await setDoc(userRef, {
                    isOnline: true,
                    lastActive: serverTimestamp()
                }, { merge: true });
            }

            userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            const role = userData.role;

            localStorage.setItem('userRole', role);

            window.addEventListener('beforeunload', () => {
                setDoc(userRef, {
                    isOnline: false
                }, { merge: true });
            });

            if (role === 'admin') {
                navigate('/admin-dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            console.error("Google Sign-In Error: ", err.message);
        }
    };

    const handleResetPassword = () => {
        if (email.trim() !== "") {
            sendPasswordResetEmail(authUser, email)
                .then(() => {
                    navigate("/forget-password/verification-message");
                })
                .catch((err) => {
                    console.error("Reset Password Error: ", err.message);
                });
        } else {
            navigate("/forget-password");
        }
    }

    return (
        <div className='container-login'>
            <form className='formbox-login' onSubmit={handleLogin}>
                <div className='fillbox'>
                    <div className='logo-title-container'>
                        <img src={crosslogo} className='logo-img' alt="logo" />
                        <h2 className='riseup-title'>RiseUp</h2>
                        <p className='riseup-subtitle'>- PATHWAY OF ENLIGHTENMENT -</p>
                    </div>
                    <div className='input-login'>
                        <div className='formgroup-input'>
                            <TfiEmail className='groupicon' />
                            <input
                                className='txt-input'
                                placeholder='Email'
                                type='text'
                                value={email}
                                onChange={handleInputChange(setEmail, emailRef)}
                                ref={emailRef}
                            />
                        </div>
                        <div className='formgroup-input' style={{ position: 'relative' }}>
                            <CiLock className='groupicon' />
                            <input
                                className='txt-input'
                                placeholder='Password'
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={handleInputChange(setPassword, passwordRef)}
                                ref={passwordRef}
                            />
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <IoEyeOff /> : <IoEyeOutline />}
                            </span>
                        </div>
                        <div className='forget-pass'>
                            <a
                                className='forgetpass-link'
                                type='button'
                                onClick={handleResetPassword}
                            >
                                Forgot password?
                            </a>
                        </div>
                        <div className='formbutton'>
                            <button
                                className='btn-input'
                                type='submit'
                                disabled={isLgoin}
                            >
                                {isLgoin ? "Logging in..." : "Login"}
                            </button>
                        </div>
                        <div className='guest-create'>
                            <a
                                className='asguest'
                                type='button'
                                onClick={() => navigate('/dashboard')}
                                title='Sign In as Guest'
                            >
                                <RiAccountCircleLine className='account-guest-icon' />
                            </a>
                            <a
                                className='signwithgoogle'
                                type='button'
                                onClick={handleLoginWithGoogle}
                                title='Sign In with Google'
                            >
                                <FaGoogle className='account-google-icon' />
                            </a>
                            <a
                                className='createacc'
                                onClick={() => navigate('/registration')}
                                title='Create Account'
                            >
                                <CiMail className='create-account-icon' />
                            </a>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default SignInForm;
