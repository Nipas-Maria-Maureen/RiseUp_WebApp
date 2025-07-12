import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { db, storage, authUser } from '../../../../backend/config/firebase';
import { useNavigate } from 'react-router-dom';
import './profile_user.css';

function Profile_User() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    municipality: '',
    parish: ''
  });
  const [uid, setUid] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('/default_profile_icon.png');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authUser, async (user) => {
      if (user) {
        const uid = user.uid;
        setUid(uid);
        await fetchUser(uid);
        await fetchProfilePicture(uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUser = async (uid) => {
    const docSnap = await getDoc(doc(db, 'users_info', uid));
    if (docSnap.exists()) {
      const data = docSnap.data();
      setProfile({
        name: data.fullname || '',
        email: data.email || '',
        municipality: data.municipality || '',
        parish: data.parish || ''
      });
    }
  };

  const fetchProfilePicture = async (uid) => {
    try {
      const imageRef = ref(storage, `profile_pics/${uid}`);
      const url = await getDownloadURL(imageRef);
      setPreview(url);
    } catch {
      setPreview('/default_profile_icon.png');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file && uid) {
      setImage(file);
      const storageRef = ref(storage, `profile_pics/${uid}`);
      await uploadBytes(storageRef, file);
      await fetchProfilePicture(uid);
    }
  };

  return (
    <div className="profile_container">
      <div className="profile_card landscape">
        <div className="profile_left">
          <div className="profile_image-container">
            <img src={preview} alt="Profile" className="profile_image" />
            <label className="edit_button">
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              ✏️
            </label>
          </div>
        </div>

        <div className="profile_right">
          <div className="profile_info">
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Municipality:</strong> {profile.municipality}</p>
            <p><strong>Parish:</strong> {profile.parish}</p>
          </div>

          <h4 className="profile_about-title">ABOUT</h4>
          <div className="profile_links">
            <button onClick={() => navigate('/about-us')}>
              <span>ℹ️</span> About Us
            </button>
            <button onClick={() => navigate('/privacy-policy')}>
              <span>👤</span> Privacy Policy
            </button>
            <button onClick={() => navigate('/terms-conditions')}>
              <span>📄</span> Terms and Conditions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile_User;
