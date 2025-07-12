import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../backend/config/firebase';

export default function RecordedMass() {
  const [videoURL, setVideoURL] = useState('');
  const [loading, setLoading] = useState(true);

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '3rem 2rem',
    },
    card: {
      width: '100%',
      maxWidth: '1100px',
      backgroundColor: 'rgba(10, 25, 47, 0.65)',
      backdropFilter: 'blur(10px)',
      padding: '2.5rem',
      borderRadius: '20px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      color: '#FFFFFF',
    },
    title: {
      textAlign: 'center',
      marginBottom: '2rem',
      color: '#FFFFFF',
      fontSize: 'clamp(1.7rem, 5vw, 2.7rem)',
      fontWeight: '600',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    },
    videoWrapper: {
      position: 'relative',
      paddingTop: '56.25%',
      height: 0,
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
    },
    iframe: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: '0',
    },
    messageText: {
      textAlign: 'center',
      fontSize: '1.4rem',
      fontWeight: '500',
      padding: '5rem 0',
    },
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const manilaFormatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const formattedDate = manilaFormatter.format(new Date());

        const docRef = doc(db, 'daily_schedules', formattedDate);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.videoURL) {
            setVideoURL(data.videoURL);
          } else {
            console.warn('videoURL field is missing in the document');
          }
        } else {
          console.warn('No document found for today’s date:', formattedDate);
        }
      } catch (error) {
        console.error('Error fetching videoURL:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, []);

  const renderCardContent = () => {
    if (loading) {
      return <p style={styles.messageText}>Loading video...</p>;
    }
    if (!videoURL) {
      return <p style={styles.messageText}>No recorded mass available for today.</p>;
    }
    return (
      <>
        <h2 style={styles.title}>Recorded Mass for Today</h2>
        <div style={styles.videoWrapper}>
          <iframe
            src={videoURL}
            title="Recorded Mass"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={styles.iframe}
          />
        </div>
      </>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {renderCardContent()}
      </div>
    </div>
  );
}