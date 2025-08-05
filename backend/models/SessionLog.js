import mongoose from "mongoose";
const { Schema, models } = mongoose;


const SessionLogScehma = new mongoose.Schema({
    sessionId: String,
    totalEnergyWh: Number,
    totalEmissionsGrams: Number,
    lastUpdated: Date,
});

const SessionLog =
  models.SessionLog || mongoose.model("SessionLog", SessionLogScehma);
export default SessionLog;


