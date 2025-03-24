import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import apiConfig from "../apiconfig/apiConfig";

const ReadReport = () => {
  const { userId, campaignId } = useParams();
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    const fetchEmailCount = () => {
      axios
        .get(`${apiConfig.baseURL}/api/stud/get-email-open-count?userId=${userId}&campaignId=${campaignId}`)
        .then((response) => {
          setOpenCount(response.data.count);
        })
        .catch((error) => console.error("Error fetching open count", error));
    };
  
    fetchEmailCount();
  
    const interval = setInterval(fetchEmailCount, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [userId, campaignId]);
    return <div>Emails Opened: {openCount}</div>;
};

export default ReadReport;
