import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../backend/config/firebase';

export default function Rosary() {
  const [rosaryURLs, setRosaryURLs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [dayTitle, setDayTitle] = useState('');
  const videosPerPage = 2;

  useEffect(() => {
    const fetchRosary = async () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Manila',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        const formattedDate = formatter.format(now);
        const day = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Manila' });

        const dayTitles = {
          Sunday: 'Glorious Mysteries',
          Monday: 'Joyful Mysteries',
          Tuesday: 'Sorrowful Mysteries',
          Wednesday: 'Glorious Mysteries',
          Thursday: 'Luminous Mysteries',
          Friday: 'Sorrowful Mysteries',
          Saturday: 'Joyful Mysteries'
        };
        setDayTitle(`${day} – ${dayTitles[day]}`);

        const docRef = doc(db, 'daily_schedules', formattedDate);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const rosary = data.rosaryVideos || {};
          const urls = Object.entries(rosary).filter(([_, val]) => val && typeof val === 'string');
          setRosaryURLs(urls);
        } else {
          console.warn("No rosary document for today's date:", formattedDate);
        }
      } catch (error) {
        console.error("Error fetching rosary videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRosary();
  }, []);

  const totalPages = Math.ceil(rosaryURLs.length / videosPerPage);
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = rosaryURLs.slice(indexOfFirstVideo, indexOfLastVideo);

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

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
      marginBottom: '1rem',
      fontSize: 'clamp(1.7rem, 5vw, 2.7rem)',
      fontWeight: '600',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    },
    subtitle: {
      textAlign: 'center',
      fontSize: '1.25rem',
      marginBottom: '2rem',
      color: '#d1d5db',
    },
    videoWrapper: {
      position: 'relative',
      paddingTop: '56.25%',
      backgroundColor: '#000',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      marginBottom: '2rem',
    },
    iframe: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 0,
    },
    messageText: {
      textAlign: 'center',
      fontSize: '1.4rem',
      fontWeight: '500',
      padding: '5rem 0',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    paginationButton: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '44px',
      height: '44px',
      fontSize: '1.3rem',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    disabledButton: {
      opacity: 0.4,
      cursor: 'not-allowed',
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p style={styles.messageText}>Loading Rosary videos...</p>;
    }
    if (rosaryURLs.length === 0) {
      return <p style={styles.messageText}>No Rosary videos available for today.</p>;
    }

    return (
      <>
        <h2 style={styles.title}>The Holy Rosary</h2>
        <h3 style={styles.subtitle}>{dayTitle}</h3>
        {currentVideos.map(([label, url], index) => (
          <div key={label} style={styles.videoWrapper}>
            <iframe
              src={`${url}?autoplay=0&rel=0`}
              title={`Rosary Video: ${label}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={styles.iframe}
            />
          </div>
        ))}

        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              style={{ ...styles.paginationButton, ...(currentPage === 1 ? styles.disabledButton : {}) }}
              aria-label="Previous"
            >
              ←
            </button>
            <span style={{ fontWeight: '500' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              style={{ ...styles.paginationButton, ...(currentPage === totalPages ? styles.disabledButton : {}) }}
              aria-label="Next"
            >
              →
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {renderContent()}
      </div>
    </div>
  );
}
