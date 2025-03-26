import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import apiConfig from "../apiconfig/apiConfig";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./ReadReport.css";

const ReadReport = () => {
  const { userId, campaignId } = useParams();
  const [openCount, setOpenCount] = useState(0);
  const [urlCount, setUrlCount] = useState(0);
  const [campaigns, setCampaigns] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showClickModal, setShowClickModal] = useState(false);
  const [showdelModal, setShowdelModal] = useState(false);
  const [showfailModal, setShowfailModal] = useState(false);
  const [emailData, setEmailData] = useState([]);
  const [emailClickData, setEmailClickData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(
          `${apiConfig.baseURL}/api/stud/getcamhistory/${campaignId}`
        );
        console.log("Campaigns", res.data);
        setCampaigns(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCampaigns();
  }, [campaignId]);

  useEffect(() => {
    const fetchEmailCount = () => {
      axios
        .get(
          `${apiConfig.baseURL}/api/stud/get-email-open-count?userId=${userId}&campaignId=${campaignId}`
        )
        .then((response) => {
          setOpenCount(response.data.count);
        })
        .catch((error) => console.error("Error fetching open count", error));
    };

    fetchEmailCount();
    const interval = setInterval(fetchEmailCount, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [userId, campaignId]);
  
  useEffect(() => { 
    if (!userId || !campaignId) return; // Prevent API calls with missing values
  
    const fetchurlCount = () => {
      axios
        .get(`${apiConfig.baseURL}/api/stud/get-click?userId=${userId}&campaignId=${campaignId}`)
        .then((response) => {
          setUrlCount(response.data.count);
        })
        .catch((error) => console.error("Error fetching click count", error));
    };
  
    fetchurlCount();
    const interval = setInterval(fetchurlCount, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval); // Cleanup on unmount
  }, [userId, campaignId]);
  
  const fetchEmailDetails = async () => {
    try {
      const res = await axios.get(
        `${apiConfig.baseURL}/api/stud/get-email-open-count?userId=${userId}&campaignId=${campaignId}`
      );
      console.log("Email details", res.data);
      if (res.data && res.data.emails) {
        setEmailData(res.data.emails);
      } else {
        setEmailData([]); // Ensure empty array if no data
      }

      setShowModal(true);
    } catch (err) {
      console.error("Error fetching email details", err);
      setEmailData([]); // Prevent errors
    }
  };
  
  const fetchEmailClickDetails = async () => {
    try {
      const res = await axios.get(
        `${apiConfig.baseURL}/api/stud/get-click?userId=${userId}&campaignId=${campaignId}`
      );
      console.log("Email details", res.data);
      if (res.data && res.data.emails) {
        setEmailClickData(res.data.emails);
      } else {
        setEmailClickData([]); // Ensure empty array if no data
      }
      setShowClickModal(true);
    } catch (err) {
      console.error("Error fetching email details", err);
      setEmailClickData([]); // Prevent errors
    }
  };

  const handleEditor = (userId, campaignId) => {
    navigate(`/read-editor/${userId}/${campaignId}`);
  };
  const handleBackCampaign = () => {
    navigate("/campaigntable");
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleCloseClickModal = () => {
    setShowClickModal(false);
  };
  const handleopendelmodal = () => {
    setShowdelModal(true);
  };
  const handleClosedelModal = () => {
    setShowdelModal(false);
  };
  const handleopenfailmodal = () => {
    setShowfailModal(true);
  };
  const handleClosefailModal = () => {
    setShowfailModal(false);
  };
  // Calculate Read Rate Percentage
  const readRate =
    campaigns.sendcount > 0
      ? ((openCount / campaigns.totalcount) * 100).toFixed(2)
      : "0.00";
  const clickRate =
      campaigns.sendcount > 0
        ? ((urlCount / campaigns.totalcount) * 100).toFixed(2)
        : "0.00";
  const deliveredRate =
    campaigns.sendcount > 0
      ? ((campaigns.sendcount / campaigns.totalcount) * 100).toFixed(2)
      : "0.00";
  const failedRate =
    campaigns.sendcount > 0
      ? ((campaigns.failedcount / campaigns.totalcount) * 100).toFixed(2)
      : "0.00";

  return (
    <>
      <nav className="nav-content">
        <div>
          <p className="Report-heading">
            <span style={{ color: "#f48c06" }}>{campaigns.campaignname}</span>{" "}
            Campaign Report
          </p>
        </div>
        <div>
          <button onClick={handleBackCampaign} className="report-nav-btn">
            <span className="admin-nav-icons">
              <FaArrowLeft />
            </span>
            <span className="nav-names">Back</span>
          </button>
        </div>
      </nav>
      <div>
        <div className="Report-heading-2">
          <p className="Report-heading-head">Email Template</p>
          <p>{campaigns.senddate}</p>
          <hr />
        </div>

        <div className="reports-content">
          <div onClick={fetchEmailDetails}>
            <p className="headings-report">Read Rate</p>
            <p className="report-counts">{readRate} %</p>
            <p className="report-view">{openCount} Opened mail</p>
          </div>
          <div onClick={fetchEmailClickDetails}>
            <p className="headings-report">Click Rate</p>
            <p className="report-counts">{clickRate} %</p>
            <p className="report-view">{urlCount} Clicked mail</p>
          </div>
          <div onClick={handleopendelmodal}>
            <p className="headings-report">Delivered Rate</p>
            <p className="report-counts">{deliveredRate} %</p>
            <p className="report-view">{campaigns.sendcount} Delivered</p>
          </div>
          <div onClick={handleopenfailmodal}>
            <p className="headings-report">Failed Rate</p>
            <p className="report-counts">{failedRate} %</p>
            <p className="report-view">{campaigns.failedcount} Failed</p>
          </div>
        </div>
      </div>
      {/* Modal for Delevered Details */}
      {showdelModal && (
        <div className="modal-overlay-read" onClick={handleClosedelModal}>
          <div
            className="modal-content-read"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-heading-read">Delivered Rate</h2>
            <table className="email-table-read">
              <thead>
                <tr>
                  <th>Mail ID-{campaigns.sendcount}</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.sentEmails && campaigns.sentEmails.length > 0 ? (
                  campaigns.sentEmails.map((email, index) => (
                    <tr key={index}>
                      <td>{email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No Data Available</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button className="target-modal-read" onClick={handleClosedelModal}>
              Close
            </button>
            <button className="close-modal-read" onClick={handleClosedelModal}>
              x
            </button>
          </div>
        </div>
      )}
      {/* Modal for Failed Details */}
      {showfailModal && (
        <div className="modal-overlay-read" onClick={handleClosefailModal}>
          <div
            className="modal-content-read"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-heading-read">Failed Rate</h2>
            <table className="email-table-read">
              <thead>
                <tr>
                  <th>Mail ID-{campaigns.failedcount}</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.failedEmails && campaigns.failedEmails.length > 0 ? (
                  campaigns.failedEmails.map((email, index) => (
                    <tr key={index}>
                      <td>{email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No Data Available</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              className="target-modal-read"
              onClick={handleClosefailModal}
            >
              Close
            </button>
            <button className="close-modal-read" onClick={handleClosefailModal}>
              x
            </button>
          </div>
        </div>
      )}
      {/* Modal for Email Details */}
      {showModal && (
        <div className="modal-overlay-read" onClick={handleCloseModal}>
          <div
            className="modal-content-read"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-heading-read">Read Rate</h2>
            <table className="email-table-read">
              <thead>
                <tr>
                  <th>Mail ID</th>
                  <th>Opened Time</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(emailData) && emailData.length > 0 ? (
                  emailData.map((email, index) => (
                    <tr key={index}>
                      <td>{email.emailId}</td>
                      <td>{new Date(email.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No Data Available</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              className="target-modal-read"
              onClick={() => handleEditor(userId, campaignId)}
            >
              Retarget
            </button>
            <button className="close-modal-read" onClick={handleCloseModal}>
              x
            </button>
          </div>
        </div>
      )}

      {/* Modal for Click Details */}
      {showClickModal && (
        <div className="modal-overlay-read" onClick={handleCloseClickModal}>
          <div
            className="modal-content-read"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-heading-read">Click Rate</h2>
            <table className="email-table-read">
              <thead>
                <tr>
                  <th>Mail ID</th>
                  <th>Clicked Time</th>
                </tr>
              </thead>

              <tbody>
                {Array.isArray(emailClickData) && emailClickData.length > 0 ? (
                  emailClickData.map((email, index) => (
                    <tr key={index}>
                      <td>{email.emailId}</td>
                      <td>{new Date(email.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No Data Available</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              className="target-modal-read"
              onClick={() => handleEditor(userId, campaignId)}
            >
              Retarget
            </button>
            <button className="close-modal-read" onClick={handleCloseClickModal}>
              x
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ReadReport;
