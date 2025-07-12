import React, { useState, useEffect } from 'react';
import './ReflectionForToday.css'; 
import { useNavigate } from 'react-router-dom';
import { db, authUser } from '../../../../../backend/config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function ReflectionForToday() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [yearSection, setYearSection] =useState('');
  const [reflection, setReflection] = useState('');
  const [usedAppToday, setUsedAppToday] = useState(false);
  const [readGospelReflection, setReadGospelReflection] = useState(false);
  const [dailyPrayer, setDailyPrayer] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get the currently logged-in user to associate with the reflection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authUser, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        console.log("User is not signed in.");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please log in to submit a reflection.");
      return;
    }

    if (!title || !date || !reflection) {
      alert("Please fill in Title, Date, and Reflection fields.");
      return;
    }

    try {
      await addDoc(collection(db, 'reflection_content'), {
        title,
        // Convert the string date from the input into a JavaScript Date object,
        // which Firestore will store as a queryable timestamp.
        date: new Date(date), 
        year_section: yearSection || "",
        reflection,
        used_app_today: usedAppToday,
        read_gospel_reflection: readGospelReflection,
        daily_prayer: dailyPrayer,
        isShared,
        uid: currentUser.uid, // ✅ FIX: Save the logged-in user's ID
        name: currentUser.displayName || "Anonymous", // Save user's name for easier display in admin panel
      });
      alert("Reflection submitted successfully!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error adding reflection: ", error);
      alert("Failed to submit reflection. Please try again.");
    }
  };

  return (
    <div className="rft-container bg-gradient-to-br from-rose-50 to-pink-100 min-h-screen flex items-center justify-center p-4">
      <form className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 md:p-10" onSubmit={handleSubmit}>
        <h2 className="text-2xl md:text-3xl font-bold text-center text-rose-600 mb-6">📝 Daily Reflection</h2>

        <div className="mb-4">
          <label htmlFor="rft-title" className="block text-sm font-medium text-gray-700">Title:</label>
          <input
            id="rft-title"
            type="text"
            placeholder='e.g., "God’s Presence in My Daily Life"'
            className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="w-full">
            <label htmlFor="rft-date" className="block text-sm font-medium text-gray-700">📆 Date:</label>
            <input
              id="rft-date"
              type="date"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="w-full">
            <label htmlFor="rft-grade" className="block text-sm font-medium text-gray-700">🔢 Year & Section:</label>
            <input
              id="rft-grade"
              type="text"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm"
              value={yearSection}
              onChange={(e) => setYearSection(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="rft-reflection" className="block text-sm font-medium text-gray-700">✍️ Your Reflection:</label>
          <textarea
            id="rft-reflection"
            rows="5"
            placeholder="Write about how the app helped you spiritually, your realizations, or how it impacted your day..."
            className="mt-1 w-full border border-gray-300 rounded-md p-2 shadow-sm"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-6 space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={usedAppToday} onChange={(e) => setUsedAppToday(e.target.checked)} />
            ✅ I used the app today
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={readGospelReflection} onChange={(e) => setReadGospelReflection(e.target.checked)} />
            ✅ I read the Gospel reflection
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={dailyPrayer} onChange={(e) => setDailyPrayer(e.target.checked)} />
            ✅ I prayed using the daily prayer
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isShared} onChange={(e) => setIsShared(e.target.checked)} />
            ✅ I shared a verse with a friend
          </label>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded" onClick={() => navigate('/dashboard')}>⬅ Back</button>
          <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded">✅ Submit</button>
        </div>
      </form>
    </div>
  );
}

export default ReflectionForToday;