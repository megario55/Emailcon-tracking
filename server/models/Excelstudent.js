import mongoose from "mongoose";

const ExcelstudentSchema = new mongoose.Schema({
    Fname: {
        type: String,

    },
    Lname: {
        type: String,

    },
    Email: {
        type: String,
    },
    
    // Allow additional dynamic fields
    additionalFields: {
        type: Map,
        of: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

}, {
    strict: false,versioKey:false});

const ExcelStudent= mongoose.model('ExcelStudent', ExcelstudentSchema);
export default ExcelStudent;

