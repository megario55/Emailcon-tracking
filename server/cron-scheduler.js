import cron from "node-cron";
import axios from "axios";
import mongoose from "mongoose";
import apiConfig from "../my-app/src/apiconfig/apiConfig.js";
import Camhistory from "./models/Camhistory.js";

const scheduledJobs = new Map(); // Store dynamically created cron jobs

// Function to schedule a new job dynamically
const scheduleEmailJob = (camhistory) => {
    const { _id, scheduledTime } = camhistory;

    // Convert the scheduled time to a cron format
    const scheduleDate = new Date(scheduledTime);
    const cronExpression = `${scheduleDate.getUTCMinutes()} ${scheduleDate.getUTCHours()} * * *`;

    if (scheduledJobs.has(_id)) {
        scheduledJobs.get(_id).stop(); // Stop previous job if rescheduling
        scheduledJobs.delete(_id);
    }

    console.log(`Scheduling job for Campaign ID: ${_id} at ${scheduleDate}`);

    // Schedule the job
    const job = cron.schedule(cronExpression, async () => {
        console.log(`Executing scheduled email for Campaign ID: ${_id} at ${new Date().toLocaleString()}`);
        try {
            await processEmailCampaign(camhistory);
        } catch (error) {
            console.error(`Error executing job for Campaign ID: ${_id}`, error);
        }
    });

    scheduledJobs.set(_id, job);
};

// Function to process emails
const processEmailCampaign = async (camhistory) => {
    let sentEmails = [];
    let failedEmails = [];
    const recipients = camhistory.recipients.split(",").map(email => email.trim());

    for (const email of recipients) {
        try {
            const emailData = {
                recipientEmail: email,
                subject: camhistory.subject,
                aliasName: camhistory.aliasName,
                body: JSON.stringify(camhistory.previewContent),
                bgColor: camhistory.bgColor,
                previewtext: camhistory.previewtext,
                attachments: camhistory.attachments,
                userId: camhistory.user,
                campaignId: camhistory._id,
            };

            await axios.post(`${apiConfig.baseURL}/api/stud/sendbulkEmail`, emailData);
            sentEmails.push(email);
        } catch (error) {
            console.error(`Failed to send email to ${email}:`, error);
            failedEmails.push(email);
        }
    }

    const finalStatus = failedEmails.length > 0 ? "Failed" : "Success";

    await axios.put(`${apiConfig.baseURL}/api/stud/camhistory/${camhistory._id}`, {
        sendcount: sentEmails.length,
        failedcount: failedEmails.length,
        sentEmails,
        failedEmails,
        status: finalStatus,
    });

    console.log(`Emails processed for Campaign ID: ${camhistory._id}`);
};

// Function to initialize all jobs from the database
const initializeScheduledJobs = async () => {
    console.log("Initializing scheduled email jobs...");
    try {
        const camhistories = await Camhistory.find({ status: "Scheduled On" });

        camhistories.forEach(scheduleEmailJob);
    } catch (error) {
        console.error("Error initializing scheduled jobs:", error);
    }
};

// Re-check database every 5 minutes to update job schedules dynamically
cron.schedule("*/5 * * * *", async () => {
    console.log("Refreshing scheduled jobs...");
    await initializeScheduledJobs();
});

// Initial load
initializeScheduledJobs();
