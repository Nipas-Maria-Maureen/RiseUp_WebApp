import React, { useState } from "react";
import { storage, db } from "../../../../../backend/config/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { 
    doc, 
    setDoc, 
    getDocs, 
    collection, 
    query, 
    where, 
    addDoc, 
    serverTimestamp 
} from "firebase/firestore";

const ManageUpload = () => {
  const [date, setDate] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [deepeningFile, setDeepeningFile] = useState(null);
  const [centerMeFile, setCenterMeFile] = useState(null);
  const [prayerFiles, setPrayerFiles] = useState(Array(4).fill(null));
  const [sevenPrayersFiles, setSevenPrayersFiles] = useState(Array(7).fill(null));
  const [scripture, setScripture] = useState("");
  const [verse, setVerse] = useState("");
  const [bible, setBible] = useState("");
  
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const deleteFolderContents = async (folderPath) => {
    try {
      const folderRef = ref(storage, folderPath);
      const { items } = await listAll(folderRef);
      if (items.length > 0) {
        await Promise.all(items.map((item) => deleteObject(item)));
        console.log(`Cleaned up folder: ${folderPath}`);
      }
    } catch (error) {
      console.warn("Could not clean up folder (it may not exist):", error);
    }
  };
  
  const handleFileArrayChange = (e, index, files, setFiles) => {
    const newFiles = [...files];
    newFiles[index] = e.target.files[0];
    setFiles(newFiles);
  };

  const handleUpload = async () => {
    if (
      !date || !scripture || !verse || !bible ||
      !videoFile || !deepeningFile || !centerMeFile ||
      prayerFiles.some(file => !file) ||
      sevenPrayersFiles.some(file => !file)
    ) {
      setMessage("❌ Error: Please fill in all fields and select all required video files.");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setMessage("Starting upload process...");

    const folderPath = `${date}`;
    await deleteFolderContents(folderPath);

    try {
      const uploadAndGetURL = async (file, path, progressWeight) => {
        const fileRef = ref(storage, `${path}/${file.name}`);
        const task = uploadBytesResumable(fileRef, file);
        return new Promise((resolve, reject) => {
          task.on(
            "state_changed",
            (snapshot) => {
              const currentProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * progressWeight;
              setProgress(prev => prev + currentProgress - (prev % progressWeight));
            },
            reject,
            async () => {
              const downloadURL = await getDownloadURL(task.snapshot.ref);
              setProgress(prev => prev + progressWeight);
              resolve(downloadURL);
            }
          );
        });
      };
      
      const totalFiles = 3 + prayerFiles.length + sevenPrayersFiles.length;
      const progressPerFile = 100 / totalFiles;

      setMessage("Uploading videos...");
      const videoURL = await uploadAndGetURL(videoFile, folderPath, progressPerFile);
      const deepeningURL = await uploadAndGetURL(deepeningFile, folderPath, progressPerFile);
      const centerMeURL = await uploadAndGetURL(centerMeFile, folderPath, progressPerFile);

      const prayerURLs = await Promise.all(
          prayerFiles.map(file => uploadAndGetURL(file, folderPath, progressPerFile))
      );
      
      const sevenPrayerURLs = await Promise.all(
          sevenPrayersFiles.map(file => uploadAndGetURL(file, folderPath, progressPerFile))
      );

      setMessage("Saving content data...");
      await setDoc(doc(db, "daily_schedules", date), {
        videoURL,
        deepeningURL,
        centerMeURL,
        scripture,
        verse,
        bible,
        date,
        prayerURL1: prayerURLs[0],
        prayerURL2: prayerURLs[1],
        prayerURL3: prayerURLs[2],
        prayerURL4: prayerURLs[3],
        rosaryVideos: {
          rosary1: sevenPrayerURLs[0],
          rosary2: sevenPrayerURLs[1],
          rosary3: sevenPrayerURLs[2],
          rosary4: sevenPrayerURLs[3],
          rosary5: sevenPrayerURLs[4],
          rosary6: sevenPrayerURLs[5],
          rosary7: sevenPrayerURLs[6],
        },
        active: true,
      });
      
      setMessage("Sending notifications to users...");
      const usersQuery = query(collection(db, 'users_info'), where('role', '==', 'client'));
      const querySnapshot = await getDocs(usersQuery);

      const notificationPromises = [];
      querySnapshot.forEach(userDoc => {
        const userId = userDoc.id;
        const userNotificationsCollection = collection(db, `users_info/${userId}/notifications`);
        
        const notificationPromise = addDoc(userNotificationsCollection, {
          title: "New Daily Content",
          message: `Fresh spiritual content for ${date} is now available.`,
          link: "/dashboard",
          timestamp: serverTimestamp(),
          read: false,
          icon: "FaBell"
        });
        notificationPromises.push(notificationPromise);
      });

      await Promise.all(notificationPromises);

      setMessage("✅ Upload and notifications sent successfully!");
      setIsUploading(false);
      
      setDate("");
      setScripture("");
      setVerse("");
      setBible("");
      setVideoFile(null);
      setDeepeningFile(null);
      setCenterMeFile(null);
      setPrayerFiles(Array(4).fill(null));
      setSevenPrayersFiles(Array(7).fill(null));
      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');


    } catch (error) {
      console.error("Upload process failed:", error);
      setMessage(`❌ Upload failed: ${error.message}`);
      setIsUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>📤 Upload Daily Content</h2>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={styles.input} />
        <input type="text" placeholder="Scripture (e.g., John 3:16)" value={scripture} onChange={(e) => setScripture(e.target.value)} style={styles.input} />
        <input type="text" placeholder="Verse Title (e.g., For God So Loved the World)" value={verse} onChange={(e) => setVerse(e.target.value)} style={styles.input} />
        <input type="text" placeholder="Bible Text" value={bible} onChange={(e) => setBible(e.target.value)} style={styles.input} />

        <label style={styles.label}>Main Video (Recorded Mass):</label>
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} style={styles.input} />

        <label style={styles.label}>Deepening Video:</label>
        <input type="file" accept="video/*" onChange={(e) => setDeepeningFile(e.target.files[0])} style={styles.input} />

        <label style={styles.label}>Center Me Video:</label>
        <input type="file" accept="video/*" onChange={(e) => setCenterMeFile(e.target.files[0])} style={styles.input} />

        <label style={styles.label}>Prayer Videos (1–4):</label>
        {prayerFiles.map((_, i) => (
          <input key={`prayer-${i}`} type="file" accept="video/*" 
            onChange={(e) => handleFileArrayChange(e, i, prayerFiles, setPrayerFiles)} 
            style={styles.input} 
          />
        ))}

        <label style={styles.label}>Rosary (7 Sorrows) Videos:</label>
        {sevenPrayersFiles.map((_, i) => (
          <input key={`rosary-${i}`} type="file" accept="video/*" 
            onChange={(e) => handleFileArrayChange(e, i, sevenPrayersFiles, setSevenPrayersFiles)} 
            style={styles.input} 
          />
        ))}

        <button onClick={handleUpload} disabled={isUploading} style={isUploading ? {...styles.button, ...styles.buttonDisabled} : styles.button}>
          {isUploading ? `Uploading (${Math.round(progress)}%)...` : "Upload All Content"}
        </button>

        {isUploading && (
          <div style={{marginTop: '15px'}}>
            <progress value={progress} max="100" style={styles.progress} />
          </div>
        )}

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#f8f9fa",
    padding: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    padding: "25px",
    width: "100%",
    maxWidth: "600px",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#5a4638",
    fontFamily: "'Segoe UI', sans-serif",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "6px",
    marginTop: "12px",
    display: "block",
    color: "#5a4638",
    fontSize: "0.9rem",
  },
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#8b5e3c",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1.1rem",
    marginTop: "20px",
    transition: "background-color 0.3s, transform 0.2s",
  },
  buttonDisabled: {
    backgroundColor: '#c5a790',
    cursor: 'not-allowed',
  },
  progress: {
    width: "100%",
    height: "10px",
    marginTop: "10px",
    borderRadius: "5px",
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
    padding: "10px",
    backgroundColor: '#e9ecef',
    borderRadius: '8px',
  },
};

export default ManageUpload;