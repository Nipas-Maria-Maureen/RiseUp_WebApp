import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../backend/config/firebase';

export default function Prayers() {
  const [prayerURLs, setPrayerURLs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 2;

  useEffect(() => {
    const fetchPrayers = async () => {
      try {
        const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
        const formattedDate = formatter.format(new Date());
        const docRef = doc(db, 'daily_schedules', formattedDate);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const urls = [data.prayerURL1, data.prayerURL2, data.prayerURL3, data.prayerURL4].filter(Boolean);
          setPrayerURLs(urls);
        } else {
          console.warn("No prayer document for today's date:", formattedDate);
        }
      } catch (error) {
        console.error("Error fetching prayer videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrayers();
  }, []);

  const totalPages = Math.ceil(prayerURLs.length / videosPerPage);
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = prayerURLs.slice(indexOfFirstVideo, indexOfLastVideo);

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const styles = {
    pageContainer: {
      minHeight: 'calc(100vh - 120px)',
      padding: '2rem 1rem',
      color: '#fff',
      fontFamily: "'Segoe UI', sans-serif",
    },
    contentWrapper: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 1rem',
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem',
    },
    title: {
      fontSize: 'clamp(2rem, 5vw, 3rem)',
      fontWeight: 'bold',
      textShadow: '0 2px 8px rgba(0,0,0,0.5)',
    },
    subtitle: {
      fontSize: 'clamp(1rem, 3vw, 1.25rem)',
      color: '#d1d5db',
      marginTop: '0.5rem',
    },
    videoGridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2.5rem',
      marginBottom: '3rem',
    },
    videoCard: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.37)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
    },
    cardHeader: {
      padding: '1rem 1.5rem',
      background: 'rgba(255, 255, 255, 0.08)',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
    },
    videoWrapper: {
      position: 'relative',
      paddingTop: '56.25%',
      background: '#000',
      flexGrow: 1,
    },
    iframe: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1.5rem',
      marginTop: '1rem',
    },
    paginationButton: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: '#fff',
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    buttonDisabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
    pageInfo: {
      fontSize: '1.1rem',
      fontWeight: '500',
    },
    statusMessage: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '50vh',
      fontSize: '1.2rem',
      color: '#d1d5db',
      textAlign: 'center',
    }
  };

  if (loading) {
    return <div style={styles.pageContainer}><p style={styles.statusMessage}>Loading Prayer Videos...</p></div>;
  }

  if (prayerURLs.length === 0) {
    return <div style={styles.pageContainer}><p style={styles.statusMessage}>No Prayer Videos are available for today.</p></div>;
  }

  return (
    <>
      <style>{`
        @media (max-width: 992px) {
          .video-grid-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>

      <div style={styles.pageContainer}>
        <div style={styles.contentWrapper}>
          <div style={styles.header}>
            <h1 style={styles.title}>Prayers</h1>
            <h2 style={styles.subtitle}>Find solace and strength in today daily prayers.</h2>
          </div>
          
          <div className="video-grid-container" style={styles.videoGridContainer}>
            {currentVideos.map((url, index) => {
                const videoNumber = indexOfFirstVideo + index + 1;
                return (
                    <div key={url} style={styles.videoCard} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>Daily Prayer ({videoNumber}/{prayerURLs.length})</h3>
                        </div>
                        <div style={styles.videoWrapper}>
                            <iframe
                                src={`${url}?autoplay=0&rel=0`}
                                title={`Prayer Video ${videoNumber}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={styles.iframe}
                            />
                        </div>
                    </div>
                )
            })}
          </div>

          {totalPages > 1 && (
            <div style={styles.paginationContainer}>
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                style={{...styles.paginationButton, ...(currentPage === 1 ? styles.buttonDisabled : {})}}
                aria-label="Previous Page"
              >
                ←
              </button>
              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                style={{...styles.paginationButton, ...(currentPage === totalPages ? styles.buttonDisabled : {})}}
                aria-label="Next Page"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}