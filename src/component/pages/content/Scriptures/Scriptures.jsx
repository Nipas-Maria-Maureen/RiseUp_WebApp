import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../../backend/config/firebase";

const Scriptures = () => {
  // 👇 Get today's date in yyyy-mm-dd format
  const today = new Date().toISOString().split("T")[0];

  const [scriptureData, setScriptureData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScripture = async () => {
      try {
        console.log("Fetching scripture for:", today);
        const docRef = doc(db, "daily_schedules", today);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Fetched data:", data);
          setScriptureData(data);
        } else {
          console.warn("No document found for:", today);
          setScriptureData(null);
        }
      } catch (error) {
        console.error("Error fetching scripture:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScripture();
  }, [today]);

  if (loading) return <p style={styles.loading}>Loading...</p>;
  if (!scriptureData) return <p style={styles.error}>No data found for {today}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📖 Scripture of the Day</h2>
      <p><strong>Scripture:</strong> {scriptureData.scripture || "N/A"}</p>
      <p><strong>Verse:</strong> {scriptureData.verse || "N/A"}</p>
      <p><strong>Bible Version:</strong> {scriptureData.bible || "N/A"}</p>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#fffaf2",
    padding: "20px",
    maxWidth: "600px",
    margin: "20px auto",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "Arial",
    color: "#5a4638"
  },
  title: {
    textAlign: "center",
    color: "#8b5e3c",
    marginBottom: "15px"
  },
  loading: {
    textAlign: "center",
    color: "#999"
  },
  error: {
    textAlign: "center",
    color: "#c00"
  }
};

export default Scriptures;
