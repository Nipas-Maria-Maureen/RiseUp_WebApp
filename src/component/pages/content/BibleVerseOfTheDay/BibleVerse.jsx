import React, { useEffect, useState } from 'react';

const VerseOfTheDay = () => {
  const [verseReference, setVerseReference] = useState('');
  const [verseText, setVerseText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVerse = async () => {
    try {
      const response = await fetch(
        'https://cors-anywhere.herokuapp.com/https://api.scripture.api.bible/v1/bible/verses-of-the-day?language=en',
        {
          headers: {
            'api-key': 'YOUR_API_KEY_HERE', // Replace with your actual API key
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch verse of the day');
      }

      const data = await response.json();

      if (data && data.data && data.data.length > 0) {
        const verse = data.data[0];
        setVerseReference(verse.reference);
        setVerseText(verse.content);
      } else {
        throw new Error('Verse data not found');
      }
    } catch (err) {
      console.error('Error fetching verse:', err);
      setError('Unable to fetch verse. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerse();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600">Loading verse of the day...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 max-w-xl mx-auto my-6 text-center border border-pink-200">
      <h2 className="text-2xl font-semibold text-pink-600 mb-4">Verse of the Day</h2>
      <p className="text-lg italic text-gray-700 mb-2">"{verseText}"</p>
      <p className="text-sm font-medium text-gray-500">{verseReference}</p>
    </div>
  );
};

export default VerseOfTheDay;
