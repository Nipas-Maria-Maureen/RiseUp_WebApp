import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../../backend/config/firebase";

const ManageContent = () => {
  const [contentList, setContentList] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "daily_schedules"));
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setContentList(items);
    };
    fetchData();
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await deleteDoc(doc(db, "daily_schedules", id));
      setContentList(contentList.filter((item) => item.id !== id));
      showToast("Deleted successfully.");
    }
  };

  const handleToggleActive = async (id, current) => {
    const itemRef = doc(db, "daily_schedules", id);
    await updateDoc(itemRef, { active: !current });
    setContentList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active: !current } : item
      )
    );
    showToast(!current ? "Activated successfully." : "Deactivated successfully.");
  };

  const getTypeLabels = (item) => {
    const types = [];
    if (item.videoURL) types.push("Video");
    if (item.deepeningURL) types.push("Deepening");
    if (item.prayerURL1) types.push("Prayer");
    if (item.scripture) types.push("Scripture");
    if (item.bible) types.push("Bible");
    if (item.reflectionURL) types.push("Reflection");
    if (item.rosaryURL) types.push("Rosary");
    if (item.centerMeURL) types.push("Center Me");
    return types;
  };

  const typeColorMap = {
    Video: "#ff9999",
    Deepening: "#ffd699",
    Prayer: "#ccffcc",
    Scripture: "#cce6ff",
    Bible: "#d5b3ff",
    Reflection: "#ffe0b3",
    Rosary: "#b3ffd9",
    "Center Me": "#ffb3b3",
  };

  const filtered = contentList.filter((item) => {
    const types = getTypeLabels(item);
    const typeMatch = selectedType === "All" || types.includes(selectedType);
    const dateMatch = selectedDate === "" || item.date === selectedDate;
    const keywordMatch =
      searchQuery === "" ||
      types.join(" ").toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.includes(searchQuery);
    return typeMatch && dateMatch && keywordMatch;
  });

  const groupedByDate = filtered.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || [];
    acc[item.date].push(item);
    return acc;
  }, {});

  return (
    <div className="mc-container">
      <style>{`
        .mc-container {
          padding: 20px;
          font-family: 'Segoe UI', sans-serif;
          background-color: #fdfdfd;
          max-width: 1200px;
          margin: 0 auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
        }

        .mc-title {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          color: #5a4638;
          text-align: center;
        }

        .mc-toast {
          background: #4BB543;
          color: white;
          padding: 10px 20px;
          border-radius: 5px;
          text-align: center;
          margin-bottom: 1rem;
        }

        .mc-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          justify-content: center;
        }

        .mc-select,
        .mc-input {
          padding: 10px 12px;
          font-size: 16px;
          border-radius: 8px;
          border: 1px solid #ccc;
          flex: 1 1 200px;
          transition: border-color 0.3s;
        }

        .mc-select:focus,
        .mc-input:focus {
          border-color: #4a90e2;
          outline: none;
        }

        .mc-table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          margin-top: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .mc-table th,
        .mc-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          text-align: center;
          font-size: 15px;
        }

        .mc-table th {
          background-color: #4a90e2;
          color: white;
        }

        .mc-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        .mc-tags span {
          background-color: #eee;
          border-radius: 5px;
          padding: 4px 8px;
          margin: 2px;
          display: inline-block;
        }

        .mc-btn {
          padding: 6px 12px;
          font-size: 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin: 2px;
        }

        .mc-delete-btn {
          background-color: #ef476f;
          color: #fff;
        }

        .mc-toggle-btn {
          background-color: #118ab2;
          color: #fff;
        }

        .mc-date-header {
          color: #5a4638;
          background: #f0e6d6;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .mc-table thead {
            display: none;
          }

          .mc-table, .mc-table tbody, .mc-table tr, .mc-table td {
            display: block;
            width: 100%;
          }

          .mc-table tr {
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 10px;
            overflow: hidden;
          }

          .mc-table td {
            padding: 10px 16px;
            text-align: right;
            position: relative;
          }

          .mc-table td::before {
            content: attr(data-label);
            position: absolute;
            left: 16px;
            font-weight: bold;
            text-align: left;
            color: #444;
          }
        }
      `}</style>

      <h2 className="mc-title">📂 Manage Uploaded Content</h2>

      {toast && <div className="mc-toast">{toast}</div>}

      <div className="mc-filters">
        <select
          className="mc-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="All">All Types</option>
          {Object.keys(typeColorMap).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="mc-input"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <input
          type="text"
          className="mc-input"
          placeholder="Search by keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date}>
          <h3 className="mc-date-header">{date}</h3>
          <table className="mc-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="mc-tags" data-label="Type">
                    {getTypeLabels(item).map((type) => (
                      <span
                        key={type}
                        style={{
                          backgroundColor: typeColorMap[type],
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </td>
                  <td data-label="Status">
                    {item.active === false ? "Inactive" : "Active"}
                  </td>
                  <td data-label="Actions">
                    <button
                      className="mc-btn mc-delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                    <button
                      className="mc-btn mc-toggle-btn"
                      onClick={() =>
                        handleToggleActive(item.id, item.active !== false)
                      }
                    >
                      {item.active === false ? "Activate" : "Deactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ManageContent;
