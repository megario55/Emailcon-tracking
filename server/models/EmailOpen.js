import mongoose from "mongoose";
// Email open schema
const emailOpenSchema = new mongoose.Schema({
  emailId: String, // The email recipient
  userId: { type: String, required: true },
  campaignId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }, // Opened timestamp
  ipAddress: String, // IP Address of the opener
  userAgent: String, // Device info
});

const EmailOpen = mongoose.model("EmailOpen", emailOpenSchema);
export default EmailOpen;