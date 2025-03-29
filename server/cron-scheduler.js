import cron from "node-cron";
import axios from "axios";
import apiConfig from "../my-app/src/apiconfig/apiConfig.js";
import Camhistory from "./models/Camhistory.js";
import mongoose from "mongoose";
import { Command } from "commander";

const program = new Command();
program
  .option("-s, --schedule", "Run the email scheduler")
  .parse(process.argv);

const SCHEDULE_INTERVAL = "* * * * *"; // Runs every minute

console.log("Cron job initialized for sending scheduled emails.");

if (program.schedule) {
  cron.schedule(SCHEDULE_INTERVAL, async () => {
      try {
          const nowUTC = new Date();
          nowUTC.setSeconds(0, 0);
          const nextMinute = new Date(nowUTC);
          nextMinute.setMinutes(nextMinute.getMinutes() + 1);

          console.log("Checking for scheduled emails at:", new Date().toLocaleString());

          const camhistories = await Camhistory.find({
              status: "Scheduled On",
              scheduledTime: { $gte: nowUTC.toISOString(), $lt: nextMinute.toISOString() },
          }).lean();

          if (camhistories.length === 0) {
              console.log("No scheduled emails found.");
              return;
          }

          await Promise.all(camhistories.map(processEmailCampaign));
      } catch (error) {
          console.error("Error in scheduled email job:", error);
      }
  });
} else {
  console.log("Use --schedule flag to run the email scheduler.");
}
/**
 * Processes an email campaign based on conditions.
 */
async function processEmailCampaign(camhistory) {
    const sentEmails = [];
    const failedEmails = [];
    const groupId = camhistory.groupId?.trim() || "";
        // Update initial status to "Pending"

    await updateCampaignStatus(camhistory._id, "Pending");

    if (!groupId || groupId.toLowerCase() === "no group") {
        await sendEmailsDirectly(camhistory, sentEmails, failedEmails);
    } else if (groupId.toLowerCase() === "no id") {
        await sendEmailsFromExcel(camhistory, sentEmails, failedEmails);
    } else if (mongoose.Types.ObjectId.isValid(groupId)) {
        await sendEmailsFromGroup(camhistory, groupId, sentEmails, failedEmails);
    }
        // Final update after processing
    const finalStatus = failedEmails.length > 0 ? "Failed" : "Success";
    await updateCampaignStatus(camhistory._id, finalStatus, sentEmails, failedEmails);
}
/**
 * Sends emails to individual recipients.
 */
async function sendEmailsDirectly(camhistory, sentEmails, failedEmails) {
    const recipients = camhistory.recipients.split(",").map(email => email.trim());

    await Promise.all(recipients.map(async email => {
        try {
            const personalizedContent = personalizeContent(camhistory.previewContent, { Email: email });
            const emailData = prepareEmailData(camhistory, email, personalizedContent);
            await sendEmailRequest(emailData);
            sentEmails.push(email);
        } catch (error) {
            console.error(`Failed to send email to ${email}:`, error);
            failedEmails.push(email);
        }
    }));

    await updateProgress(camhistory._id, sentEmails, failedEmails, recipients.length);
}

/**
 * Sends emails using data from an Excel sheet.
 */
async function sendEmailsFromExcel(camhistory, sentEmails, failedEmails) {
    await Promise.all(camhistory.exceldata.map(async student => {
        try {
            const personalizedContent = personalizeContent(camhistory.previewContent, student);
            const emailData = prepareEmailData(camhistory, student.Email, personalizedContent);
            await sendEmailRequest(emailData);
            sentEmails.push(student.Email);
        } catch (error) {
            console.error(`Failed to send email to ${student.Email}:`, error);
            failedEmails.push(student.Email);
        }
    }));

    await updateProgress(camhistory._id, sentEmails, failedEmails, camhistory.exceldata.length);
}
/**
 * Sends emails using group data.
 */
async function sendEmailsFromGroup(camhistory, groupId, sentEmails, failedEmails) {
    try {
        const { data: students } = await axios.get(`${apiConfig.baseURL}/api/stud/groups/${groupId}/students`);

        await Promise.all(students.map(async student => {
            try {
                const personalizedContent = personalizeContent(camhistory.previewContent, student);
                const emailData = prepareEmailData(camhistory, student.Email, personalizedContent);
                await sendEmailRequest(emailData);
                sentEmails.push(student.Email);
            } catch (error) {
                console.error(`Failed to send email to ${student.Email}:`, error);
                failedEmails.push(student.Email);
            }
        }));

        await updateProgress(camhistory._id, sentEmails, failedEmails, students.length);
    } catch (error) {
        console.error("Failed to fetch group data:", error);
    }
}
/**
 * Replaces placeholders in email content with actual values.
 */
function personalizeContent(contentArray, data) {
    return contentArray.map(item => {
        if (!item.content) return item;
        let updatedContent = item.content;
        Object.entries(data).forEach(([key, value]) => {
            updatedContent = updatedContent.replace(new RegExp(`\{?${key}\}?`, "gi"), value || "");
        });
        return { ...item, content: updatedContent };
    });
}
/**
 * Prepares the email data object for sending.
 */


function prepareEmailData(camhistory, recipientEmail, bodyContent) {
    return {
        recipientEmail,
        subject: camhistory.subject,
        aliasName: camhistory.aliasName,
        body: JSON.stringify(bodyContent),
        bgColor: camhistory.bgColor,
        previewtext: camhistory.previewtext,
        attachments: camhistory.attachments,
        userId: camhistory.user,
        groupId: camhistory.groupname,
        campaignId: camhistory._id,
    };
}

async function sendEmailRequest(emailData) {
    try {
        await axios.post(`${apiConfig.baseURL}/api/stud/sendbulkEmail`, emailData);
    } catch (error) {
        throw new Error(`Email send request failed: ${error.message}`);
    }
}
/**
 * Updates the campaign's status and progress in the database.
 */
async function updateProgress(campaignId, sentEmails, failedEmails, totalEmails) {
    const progress = Math.round((sentEmails.length / totalEmails) * 100);
    await axios.put(`${apiConfig.baseURL}/api/stud/camhistory/${campaignId}`, {
        sendcount: sentEmails.length,
        failedcount: failedEmails.length,
        sentEmails,
        failedEmails,
        status: "In Progress",
        progress,
    });
    console.log(`Progress updated: ${progress}%`);
}

async function updateCampaignStatus(campaignId, status, sentEmails = [], failedEmails = []) {
    await axios.put(`${apiConfig.baseURL}/api/stud/camhistory/${campaignId}`, {
        sendcount: sentEmails.length,
        failedcount: failedEmails.length,
        sentEmails,
        failedEmails,
        status,
    });
    console.log(`Campaign ${campaignId} status updated to: ${status}`);
}
