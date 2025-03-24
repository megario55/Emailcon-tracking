import React, { useState, useEffect,useRef } from "react";
import {
  FaFileAlt,
  FaHistory,
  FaUserPlus,
  FaEye,
  FaUser,
  
} from "react-icons/fa";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import apiConfig from "../apiconfig/apiConfig.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SendbulkModal from "./SendbulkModal.jsx";
import GroupfileModal from "./GroupfileModal";
import GroupModalnew from "./GroupModalnew.jsx";
import ListPage from "./ListPage.jsx";
import { FaRegClipboard, FaTimes } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { FaAddressBook } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { MdWavingHand } from "react-icons/md";
import imghome from "../Images/home-sidebar.jpg";
import welcomeimg from "../Images/welcome.png";

const Home = () => {
  const [view, setView] = useState("main");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [showfileGroupModal, setShowfileGroupModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showListPageModal, setShowListPageModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!user) {
      navigate("/signup");
      toast.warning("Signup first to access Homepage");
    } else {
      
      const modalShown = localStorage.getItem("modalShown");
      if (!modalShown) {
        setShowPopup(true); // Show modal on first navigation
        localStorage.setItem("modalShown", "true"); // Mark modal as shown
      }
    }
  }, [user, navigate]);



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("modalShown"); // Reset modalShown for next login
    localStorage.setItem("hasvisit",true);
    navigate("/");
  };

  const closePopup = () => {
    setShowPopup(false); // Close the modal
  };
  const handleMainView = () => {
    setView("main");
  };

  const handleCampaignView = () => {
    setView("campaign");
  };

  const handleContactView = () => {
    setView("contact");
  };
  const handleCreateContactView = () => {
    setView("create-contact");
  };



  const handleCreateCampaign = () => {
    setShowCampaignModal(true);
  };

  const handleviewcontacts = () => {
    setShowListPageModal(true);
  };


  const handleaddfilecontacts = () => {
    setShowfileGroupModal(true);
  };

  const handleCreateButton = () => {
    if (!user || !user.id) {
      toast.error("Please ensure the user is valid");
      return; // Stop further execution if user is invalid
    }
    if (!campaignName) {
      toast.error("Please enter a campaign name");
      return; // Stop further execution
    }
    setIsLoading(true);
  
    if (campaignName && user && user.id) {
      axios
        .post(`${apiConfig.baseURL}/api/stud/campaign`, {
          camname: campaignName,
          userId: user.id,
        })
        .then((response) => {
          localStorage.setItem("campaign", JSON.stringify(response.data.campaign));
          console.log("Campaign created");
          
          setIsLoading(false);
          setShowCampaignModal(false);
          setCampaignName("");
  
          // Check screen width for navigation
          if (window.innerWidth <= 768) {
            navigate("/campaign"); // Mobile
          } else {
            navigate("/editor"); // PC
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Failed to create campaign");
        });
    } else {
      toast.error("Please ensure all fields are filled and user is valid");
    }
  };
  
  const handlecampaignhistory = () => {
    navigate("/campaigntable");
  };

 

  return (
    <>
      <div className="sidebar-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div>
            <h2 className="sidebar-title" onClick={handleMainView}>
              Email<span style={{ color: "#f48c06" }}>Con</span>
            </h2>
            <button
              className="sidebar-button campaign-button"
              onClick={handleCampaignView}
            >
              Campaign
            </button>
            <button
              className="sidebar-button contact-button"
              onClick={handleContactView}
            >
              Contact
            </button>
          </div>
          <div className="side-img">
            <img src={imghome} alt="Home img" className="home-image" />
          </div>
        </div>

        {/* Main Content */}

        <div className="main-content">
          <nav className="navbars">
            <div className="desktop-content">
              <h2 className="sidebar-title" onClick={handleMainView}>
                Email<span style={{ color: "#f48c06" }}>Con</span>
              </h2>
            </div>
            <div className="nav-split">
                <h4>
                  <span
                    style={{
                      transform: "scaleX(-1)",
                      display: "inline-block",
                      color: "gold",
                      marginRight: "5px",
                    }}
                  >
                    <MdWavingHand size={17} />
                  </span>{" "}
                  Hey{" "}
                  <span style={{ color: "#f48c06" }}>
                    {user?.username || "Guest"}
                  </span>
                </h4>
             
              <div className="profile-container" ref={dropdownRef}>
                <button onClick={toggleDropdown} className="profile-button">
                  <FaUserCircle className="profile-icon" />
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button onClick={handleLogout} className="dropdown-item">
                      <span>Logout </span>
                      <span>
                        <FaSignOutAlt color="#f48c06" fontSize="15px" />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
          <div className="maincontent-main">
            {view === "main" && (
              <div className="card-grid">
                <div className="cards" onClick={handleCampaignView}>
                  <FaRegClipboard className="icons campaign-icon" />
                  <span className="card-texts">Campaign</span>
                </div>
                <div className="cards" onClick={handleContactView}>
                  <FaAddressBook className="icons contact-icon" />
                  <span className="card-texts">Contact</span>
                </div>
              </div>
            )}

            {view === "campaign" && (
              <div className="card-grid">
                <div className="cards" onClick={handleCreateCampaign}>
                  <FaFileAlt className="icons campaign-create-icon" />
                  <span className="card-texts">Create Campaign</span>
                </div>
                <div className="cards" onClick={handlecampaignhistory}>
                  <FaHistory className="icons campaign-history-icon" />
                  <span className="card-texts">Campaign History</span>
                </div>
              </div>
            )}

            {view === "contact" && (
              <div className="card-grid">
                <div className="cards" onClick={handleCreateContactView}>
                  <FaUserPlus className="icons contact-create-icon" />
                  <span className="card-texts">Create Contact</span>
                </div>
                <div className="cards" onClick={handleviewcontacts}>
                  <FaEye className="icons contact-view-icon" />
                  <span className="card-texts">View Contact </span>
                </div>
              </div>
            )}
            {view === "create-contact" && (
              <div className="card-grid">
              <div className="cards" onClick={() => {
    setShowNewGroupModal(prev => !prev); // Toggle state
}}>
  <FaUserPlus className="icons contact-create-icon" />
  <span className="card-texts">New Group</span>
</div>
                <div className="cards" onClick={handleaddfilecontacts}>
                  <FaUser className="icons contact-view-icon" />
                  <span className="card-texts">Existing Group</span>
                </div>
              </div>
            )}           
          </div>

          {/* Show group existing modal    */}
          {showfileGroupModal && (
            <GroupfileModal onClose={() => setShowfileGroupModal(false)} />
          )}
          {/* Show new group modal    */}
          {showNewGroupModal && (
            <GroupModalnew onClose={() => setShowNewGroupModal(false)} />
          )}
          {/* show group list */}
          {showListPageModal && (
            <ListPage onClose={() => setShowListPageModal(false)} />
          )}
          {/* welcome popup */}
          {showPopup && (
            <div className="home-overlay overlay">
              <div className="home-modal">
                <div className="confetti-wrapper">
                  {[...Array(30)].map((_, index) => (
                    <div key={index} className="confetti"></div>
                  ))}
                </div>           
                <button className="welcome-close-button" onClick={closePopup}>
                  <FaTimes className="text-red-500 cursor-pointer" />
                </button>
                <img
                  src={welcomeimg}
                  alt="Celebration"
                  className="celebration-icon"
                />
                <h2>Welcome {user.username}!</h2>
                <p>Explore the features and manage your groups efficiently.</p>
                <button className="welcome-button" onClick={closePopup}>
                  Let's go!
                </button>
              </div>
            </div>
          )}

          {/* Modal for Creating Campaign */}
          {showCampaignModal && (
            <div className="campaign-modal-overlay">
              <div className="campaign-modal-content">
                <h3>Create Campaign</h3>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter Campaign Name Max 15 letter"
                  className="modal-input"
                  maxLength={15}
                />
                <button
                  className="modal-create-button"
                  onClick={handleCreateButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loader-create"></span> // Spinner
                  ) : (
                    "Create"
                  )}{" "}
                </button>
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="modal-create-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <SendbulkModal campaignName={campaignName} />

          <ToastContainer
            className="custom-toast"
            position="bottom-center"
            autoClose={2000}
            hideProgressBar={true} // Disable progress bar
            closeOnClick={false}
            closeButton={false}
            pauseOnHover={true}
            draggable={true}
            theme="light" // Optional: Choose theme ('light', 'dark', 'colored')
          />
        </div>
      </div>
      <div className="dwn-menu">
        <div className="mobile-menu">
          <button
            className="sidebar-button campaign-button"
            onClick={handleCampaignView}
          >
            Campaign
          </button>
          <button
            className="sidebar-button contact-button"
            onClick={handleContactView}
          >
            Contact
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;

