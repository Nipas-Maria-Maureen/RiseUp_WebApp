import React, { useEffect, useState } from "react";

const API_KEY = "09d2ee271e1c98a6e4903030a05cab74";
const BIBLE_ID = "9879dbb7cfe39e4d-01";

const VERSES = [
  "JER.29.11",
  "PSA.23",
  "1COR.4.4-8",
  "PHP.4.13",
  "JHN.3.16",
  "ROM.8.28",
  "ISA.41.10",
  "PSA.46.1",
  "GAL.5.22-23",
  "HEB.11.1",
  "2TI.1.7",
  "1COR.10.13",
  "PRO.22.6",
  "ISA.40.31",
  "JOS.1.9",
  "HEB.12.2",
  "MAT.11.28",
  "ROM.10.9-10",
  "PHP.2.3-4",
  "MAT.5.43-44",
];

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export default function VerseOfTheDay() {
  const [verseContent, setVerseContent] = useState("");
  const [verseReference, setVerseReference] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const verseIndex = getDayOfYear(new Date()) % VERSES.length;
    const verseID = VERSES[verseIndex];

    getResults(verseID)
      .then((data) => {
        if (!data.passages || data.passages.length === 0) {
          throw new Error("No passage found.");
        }
        const passage = data.passages[0];
        setVerseReference(passage.reference);
        setVerseContent(passage.content);
      })
      .catch((err) => {
        setError("Error loading verse: " + err);
      });
  }, []);

  const getResults = (verseID) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.withCredentials = false;

      xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
          try {
            const { data, meta } = JSON.parse(this.responseText);
            if (window._BAPI && meta?.fumsId) {
              window._BAPI.t(meta.fumsId);
            }
            resolve(data);
          } catch (e) {
            reject("Invalid API response.");
          }
        }
      };

      xhr.open(
        "GET",
        `https://api.scripture.api.bible/v1/bibles/${BIBLE_ID}/search?query=${verseID}`
      );

      xhr.setRequestHeader("api-key", API_KEY);
      xhr.onerror = () => reject("Network error.");
      xhr.send();
    });
  };

  return (
    <>
      <style>{`
        .App {
          font-family: 'Georgia', serif;
          max-width: 600px;
          margin: 2rem auto;
          padding: 1.5rem;
          background: #fdf6e3; /* soft parchment-like background */
          border-radius: 10px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.1);
          color: #333;
        }
        .App-header h2 {
          font-size: 2rem;
          font-weight: bold;
          color: #6b4226; /* deep brown */
          text-align: center;
          margin-bottom: 1rem;
          letter-spacing: 1.2px;
          font-variant: small-caps;
          border-bottom: 2px solid #6b4226;
          padding-bottom: 0.3rem;
        }

        .verse-of-the-day h3 {
          font-size: 1.25rem;
          font-style: italic;
          text-align: center;
          color: #a67843;
          margin-bottom: 1rem;
          font-family: 'Palatino Linotype', Palatino, serif;
        }

        .verse-text {
          font-size: 1.1rem;
          line-height: 1.6;
          padding: 0 1rem;
          color: #2f2f2f;
          border-left: 4px solid #a67843;
          background-color: #fff9e6;
          border-radius: 5px;
        }

        .verse-text span.v {
          display: none;
        }

        .verse-text p {
          margin: 0.5rem 0;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .App {
            margin: 1rem;
            padding: 1rem;
          }
          .App-header h2 {
            font-size: 1.5rem;
          }
          .verse-of-the-day h3 {
            font-size: 1rem;
          }
          .verse-text {
            font-size: 1rem;
          }
        }
      `}</style>

      <div className="App">
        <header className="App-header">
          <h2>Verse of the Day</h2>
          {error ? (
            <p>{error}</p>
          ) : (
            <div className="verse-of-the-day">
              <h3>
                <i>{verseReference}</i>
              </h3>
              <div
                className="verse-text"
                dangerouslySetInnerHTML={{ __html: verseContent }}
              />
            </div>
          )}
        </header>
      </div>
    </>
  );
}
