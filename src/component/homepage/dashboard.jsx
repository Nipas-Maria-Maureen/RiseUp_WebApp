import React, { useRef, useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  writeBatch,
  where,
  addDoc,
  serverTimestamp,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { authUser, db } from "../../../backend/config/firebase";

import crosslogo from "../../assets/images/icons/cross.png";
import { IoMenu } from "react-icons/io5";
import { MdDashboard, MdNotifications, MdVideoLibrary } from "react-icons/md";
import {
  FaUserCircle,
  FaBookOpen,
  FaPray,
  FaPenNib,
  FaBell,
  FaQuoteLeft,
  FaCross,
  FaHandsHelping,
  FaBible,
  FaSignOutAlt,
} from "react-icons/fa";
import { FcAbout } from "react-icons/fc";
import { RiPsychotherapyFill } from "react-icons/ri";

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const coverSidebarRef = useRef(null);
  const notificationPanelRef = useRef(null);
  const coverNotificationsRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [authinfo, setAuthInfo] = useState("");
  const [fullName, setFullName] = useState("");
  const [notifications, setNotifications] = useState([]);

  const iconMap = {
    FaBookOpen: <FaBookOpen />,
    FaPray: <FaPray />,
    FaPenNib: <FaPenNib />,
    FaCross: <FaCross />,
    FaBell: <FaBell />,
    FaQuoteLeft: <FaQuoteLeft />,
    default: <FaBell />,
  };
  const getIcon = (iconName) => iconMap[iconName] || iconMap.default;

  function formatTimeAgo(timestamp) {
    if (!timestamp || !timestamp.toDate) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 10) return "just now";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  }

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, `users_info/${currentUser.uid}/notifications`),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        time: formatTimeAgo(doc.data().timestamp),
      }));
      setNotifications(notifs);
    });

    const checkReminders = async () => {
      const now = new Date();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const userNotificationsCollection = collection(
        db,
        `users_info/${currentUser.uid}/notifications`
      );

      const hasNotifForToday = async (title) => {
        const notifQuery = query(
          userNotificationsCollection,
          where("title", "==", title),
          where("timestamp", ">=", todayStart)
        );
        const notifSnapshot = await getDocs(notifQuery);
        return !notifSnapshot.empty;
      };

      const addNotification = async (notifData) => {
        await addDoc(userNotificationsCollection, {
          ...notifData,
          timestamp: serverTimestamp(),
        });
      };

      if (
        now.getHours() >= 8 &&
        !(await hasNotifForToday("Scripture of the Day"))
      ) {
        await addNotification({
          title: "Scripture of the Day",
          message: "A new scripture is available for your reflection.",
          link: "/dashboard/Scriptures",
          read: false,
          icon: "FaBookOpen",
        });
      }

      if (
        now.getHours() >= 15 &&
        !(await hasNotifForToday("3 O'Clock Prayer"))
      ) {
        await addNotification({
          title: "3 O'Clock Prayer",
          message: "A moment for the Divine Mercy prayer.",
          link: "/dashboard/reflection/prayers",
          read: false,
          icon: "FaPray",
        });
      }

      if (
        now.getHours() >= 20 &&
        !(await hasNotifForToday("Rosary Reminder"))
      ) {
        await addNotification({
          title: "Rosary Reminder",
          message: "Time to pray the Holy Rosary.",
          link: "/dashboard/reflection/rosary",
          read: false,
          icon: "FaCross",
        });
      }

      if (
        now.getHours() >= 21 &&
        !(await hasNotifForToday("Reflection Reminder"))
      ) {
        const reflectionQuery = query(
          collection(db, "reflection_content"),
          where("uid", "==", currentUser.uid),
          where("date", ">=", Timestamp.fromDate(todayStart))
        );
        const reflectionSnapshot = await getDocs(reflectionQuery);
        if (reflectionSnapshot.empty) {
          await addNotification({
            title: "Reflection Reminder",
            message: "Don't forget to write in your journal today.",
            link: "/dashboard/reflection",
            read: false,
            icon: "FaPenNib",
          });
        }
      }
    };

    checkReminders();
    const intervalId = setInterval(checkReminders, 60000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = async (id, link) => {
    if (!currentUser || !id) return;
    const notifRef = doc(db, `users_info/${currentUser.uid}/notifications`, id);
    try {
      await updateDoc(notifRef, { read: true });
      if (link) navigate(link);
      closeNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    const batch = writeBatch(db);
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;
    unreadNotifications.forEach((notif) => {
      const notifRef = doc(
        db,
        `users_info/${currentUser.uid}/notifications`,
        notif.id
      );
      batch.update(notifRef, { read: true });
    });
    try {
      await batch.commit();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!role) navigate("/");
    else if (role !== "client") navigate("/admin-dashboard");
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authUser, async (user) => {
      if (user) {
        setCurrentUser(user);
        setAuthInfo(user.email);
        const docRef = doc(db, "users_info", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFullName(docSnap.data().fullname);
        }
      } else {
        setCurrentUser(null);
        setAuthInfo("");
        setFullName("");
      }
    });
    return () => unsubscribe();
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const toggleNotifications = () => {
    notificationPanelRef.current.classList.toggle("active");
    coverNotificationsRef.current.classList.toggle("visible");
  };
  const closeNotifications = () => {
    notificationPanelRef.current.classList.remove("active");
    coverNotificationsRef.current.classList.remove("visible");
  };
  const togglesidebar = () => {
    sidebarRef.current.classList.toggle("active");
    coverSidebarRef.current.classList.toggle("visible");
  };
  const closeSidebar = () => {
    sidebarRef.current.classList.remove("active");
    coverSidebarRef.current.classList.remove("visible");
  };

  const handleLogout = async () => {
    try {
      if (currentUser) {
        const userDocRef = doc(db, "users_info", currentUser.uid);
        await setDoc(userDocRef, { isOnline: false }, { merge: true });
      }
      await signOut(authUser);
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (err) {
      console.error("Logout Error: ", err.message);
    }
  };

  const handleSidebarClick = (path) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <div className="container-dashboard">
      <style>{`
        .sidebar-container .Sidebar {
          background-color: #0d2a58;
          left: -280px;
          width: 260px;
          transition: left 0.3s ease-in-out;
          color: #fff;
          display: flex;
          flex-direction: column;
        }
        .sidebar-container .Sidebar.active { left: 0; }

        .sidebar-header {
          background-color: transparent;
          flex-shrink: 0;
        }
        .sidebar-header .user-details { gap: 12px; }
        .sidebar-header .pp-icon { font-size: 44px; color: #fff; }
        .sidebar-header .fullname-display { font-size: 1rem; font-weight: 600; color: #fff; }
        .sidebar-header .account-display { font-size: 0.8rem; color: #c0d3f0; word-break: break-all; }

        .menu-sidebar {
          padding: 1rem;
          padding-top: 0;
          flex-grow: 1;
          overflow-y: auto;
          background-color: transparent;
          display: flex;
          flex-direction: column;
        }
        .group-btn-selection {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .btn-selection-input {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 16px;
          border: none;
          background-color: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
          font-size: 1rem;
          color: #e0eafc;
          text-align: left;
          width: 100%;
        }
        .btn-selection-input:hover { background-color: rgba(255, 255, 255, 0.1); color: #fff; }
        .btn-selection-input.active { background-color: #d9534f; color: #fff; font-weight: 600; }
        .btn-selection-input .icon-group { font-size: 22px; width: 24px; text-align: center; }
        
        .logout-wrapper {
            margin-top: auto;
            padding-top: 1rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn-selection-input.logout-btn { color: #ffb8b8; }
        .btn-selection-input.logout-btn:hover { background-color: #c9302c; color: #fff; }

        .notification-badge { position: absolute; top: 0px; right: 0px; background-color: #d9534f; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 1px solid white; }
        .notification-panel { position: fixed; top: 80px; right: 20px; width: 360px; max-height: 450px; background-color: #fff; color: #333; border-radius: 12px; box-shadow: 0 5px 25px rgba(0,0,0,0.2); z-index: 1001; display: flex; flex-direction: column; opacity: 0; visibility: hidden; transform: translateY(-10px); transition: all 0.3s ease; }
        .notification-panel.active { opacity: 1; visibility: visible; transform: translateY(0); }
        .notification-header { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
        .notification-header h3 { margin: 0; font-size: 16px; }
        .mark-all-read-btn { font-size: 12px; color: #007bff; cursor: pointer; background: none; border: none; padding: 4px; }
        .notification-list { list-style: none; overflow-y: auto; padding: 0; margin: 0; }
        .notification-item { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f5f5f5; cursor: pointer; transition: background-color 0.2s; }
        .notification-item:hover { background-color: #f9f9f9; }
        .notification-item.unread { background-color: #eef5ff; }
        .notification-icon-wrapper { color: #fff; background-color: #033074; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .notification-content .title { font-weight: 600; margin: 0 0 2px 0; font-size: 14px; }
        .notification-content .message { margin: 0; font-size: 13px; color: #666; }
        .notification-time { font-size: 11px; color: #999; margin-top: 4px; }
        .no-notifications { text-align: center; padding: 40px 20px; color: #888; }
        .cover-notifications { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: transparent; z-index: 1000; display: none; }
        .cover-notifications.visible { display: block; }
      `}</style>

      <div className="overlay-design">
        <div className="grid-container">
          <nav className="navbar-container">
            <div className="logo-title-container">
              <h2>
                Rise <img src={crosslogo} className="logo-img" alt="logo" /> Up
              </h2>
              <p>- PATHWAY OF ENLIGHTENMENT -</p>
              <div className="btn-group">
                <button className="sidebar-toggle" onClick={togglesidebar}>
                  <IoMenu className="icon" />
                </button>
              </div>
            </div>
            <button className="notification-btn" onClick={toggleNotifications}>
              <MdNotifications className="notif-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="welcome-date-bar">
              <div className="welcome-message">
                {fullName ? `Welcome, ${fullName}` : "Welcome, Guest"}
              </div>
              <div className="current-date">{currentDate}</div>
            </div>
          </nav>
          <div className="content-container">
            <Outlet />
          </div>
        </div>
        <div className="sidebar-container">
          <div className="Sidebar" ref={sidebarRef}>
            <div className="sidebar-header">
              <div className="information-container">
                <div className="user-details">
                  <FaUserCircle className="pp-icon" />

                  <div className="text-info">
                    <p className="fullname-display">
                      <strong>{fullName || "Guest"}</strong>
                    </p>
                    <p className="account-display">
                      {authinfo || "No user logged in"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="menu-sidebar">
              <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
              <div className="group-btn-selection">
                <button
                  className={`btn-selection-input ${
                    location.pathname === "/dashboard" ? "active" : ""
                  }`}
                  onClick={() => handleSidebarClick("/dashboard")}
                >
                  <MdDashboard className="icon-group" /> Dashboard
                </button>
                <button
                  className={`btn-selection-input ${
                    location.pathname.includes("/recorded-mass") ? "active" : ""
                  }`}
                  onClick={() =>
                    handleSidebarClick("/dashboard/recorded-mass/recordedmass")
                  }
                >
                  <MdVideoLibrary className="icon-group" /> Recorded Mass
                </button>
                <button
                  className={`btn-selection-input ${
                    location.pathname === "/dashboard/reflection"
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSidebarClick("/dashboard/reflection")}
                >
                  <FaPenNib className="icon-group" /> Reflection
                </button>
                <button
                  className={`btn-selection-input ${
                    location.pathname.includes("/Scriptures") ? "active" : ""
                  }`}
                  onClick={() => handleSidebarClick("/dashboard/Scriptures")}
                >
                  <FaBible className="icon-group" /> Scripture
                </button>
                <button
                  className={`btn-selection-input ${
                    location.pathname.includes("/center-me") ? "active" : ""
                  }`}
                  onClick={() =>
                    handleSidebarClick("/dashboard/reflection/center-me")
                  }
                >
                  <RiPsychotherapyFill className="icon-group" /> Center Me
                </button>
                <button
                  className={`btn-selection-input ${
                    location.pathname.includes("/Deepening") ? "active" : ""
                  }`}
                  onClick={() => handleSidebarClick("/dashboard/Deepening")}
                >
                  <FaHandsHelping className="icon-group" /> Deepening
                </button>
                <button
                  className={`btn-selection-input ${
                    location.pathname.includes("/prayers") ? "active" : ""
                  }`}
                  onClick={() =>
                    handleSidebarClick("/dashboard/reflection/prayers")
                  }
                >
                  <FaPray className="icon-group" /> Prayers
                </button>
                <button
                  className={`btn-selection-input ${
                    location.pathname.includes("/rosary") ? "active" : ""
                  }`}
                  onClick={() =>
                    handleSidebarClick("/dashboard/reflection/rosary")
                  }
                >
                  <FaCross className="icon-group" /> Rosary
                </button>
                <button
                  className={`btn-selection-input ${
                    location.pathname.includes("/profile") ? "active" : ""
                  }`}
                  onClick={() =>
                    handleSidebarClick("/dashboard/profile")
                  }
                >
                  <FaUserCircle className="icon-group" /> Profile
                </button>
                
                <button
                  className="btn-selection-input logout-btn"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="icon-group" /> Logout
                </button>
              </div>
              <div className="logout-wrapper">
                <button
                  className="btn-selection-input logout-btn"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="icon-group" /> Logout
                </button>
              </div>
            </div>
          </div>
          <div
            className="cover-sidebar"
            ref={coverSidebarRef}
            onClick={closeSidebar}
          ></div>
        </div>
        <div>
          <div className="notification-panel" ref={notificationPanelRef}>
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <ul className="notification-list">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`notification-item ${
                      !notif.read ? "unread" : ""
                    }`}
                    onClick={() => handleMarkAsRead(notif.id, notif.link)}
                  >
                    <div className="notification-icon-wrapper">
                      {getIcon(notif.icon)}
                    </div>
                    <div className="notification-content">
                      <p className="title">{notif.title}</p>
                      <p className="message">{notif.message}</p>
                      <p className="notification-time">{notif.time}</p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="no-notifications">
                  You have no new notifications.
                </p>
              )}
            </ul>
          </div>
          <div
            className="cover-notifications"
            ref={coverNotificationsRef}
            onClick={closeNotifications}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
