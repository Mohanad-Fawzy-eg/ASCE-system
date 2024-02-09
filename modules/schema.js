const mongoose = require("mongoose");

//! Enum ====================

const roleSchema = new mongoose.Schema({
    type: String,
    enum: ["Board", "Staff", "Participant"],
});

const rankSchema = new mongoose.Schema({
    type: String,
    enum: ["Head", "Vice Head"],
});

const committeeSchema = new mongoose.Schema({
    type: String,
    enum: [
        "Human resources",
        "Media and marketing",
        "Mentor",
        "Public relations",
        "Organization",
    ],
});

// const role = Object.freeze({
//     Board: { type: String, default: "Board" },
//     Staff: { type: String, default: "Staff" },
//     Participant: { type: String, default: "Participant" },
// });

// const rank = Object.freeze({
//     head: { type: String, default: "Head" },
//     vice_Head: { type: String, default: "Vice Head" },
// });

// const committe = Object.freeze({
//     human_resources: { type: String, default: "Human resources" },
//     media_and_marketing: { type: String, default: "Media and marketing" },
//     mentor: { type: String, default: "Mentor" },
//     public_relation: { type: String, default: "Public relations" },
//     organization: { type: String, default: "Organization" },
// });

//! =======================

//^ Board =================

const bordSessions = new mongoose.Schema({
    attendance: { type: Boolean, default: 0 },
    arrival_time: { type: String, default: "10:00 am" },
    date: { type: String, default: "3/2/2024" },
    commitment: { type: Number, default: 0 },
    flex: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    proplem_solving: { type: Number, default: 0 },
    leadership: { type: Number, default: 0 },
    team_follow_up: { type: Number, default: 0 },
    staff_development: { type: Number, default: 0 },
    attitude: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    sum: { type: Number },
    notes: { type: String },
    message: { type: String },
});

const staffSessions = new mongoose.Schema({
    attendance: { type: Boolean, default: 0 },
    arrival_time: { type: String, default: "10:00 am" },
    date: { type: String, default: "3/2/2024" },
    commitment: { type: Number, default: 0 },
    flex: { type: Number, default: 0 },
    task: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    applying: { type: Number, default: 0 },
    self_development: { type: Number, default: 0 },
    attitude: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    sum: { type: Number },
    notes: { type: String },
    message: { type: String },
});

const boardScore = new mongoose.Schema({
    sessions: [bordSessions],
    warnings: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
});

//^ =======================

//? Staff =================

const staffScore = new mongoose.Schema({
    sessions: [staffSessions],
    warnings: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
});

//? =======================

//! Participants ==========

const partSession = new mongoose.Schema({
    attendance: { type: Boolean, default: 0 },
    arrival_time: { type: String, default: "10:00 am" },
    date: { type: String, default: "3/2/2024" },
    commitment: { type: Number, default: 0 },
    attitude: { type: Number, default: 0 },
    flex: { type: Number, default: 0 },
    active: { type: Number, default: 0 },
    self_development: { type: Number, default: 0 },
    applying: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    sum: { type: Number },
    notes: { type: String },
    message: { type: String },
});

const partScore = new mongoose.Schema({
    sessions: [partSession],
    warnings: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
});

//! =======================

const generalShcema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true },
    phone: { type: String },
    role: { type: String },
    rank: { type: String },
    committee: { type: String },
    team: { type: String },
    title: { type: String },
    image: { type: String, default: "/uploads/default.jpg" },
    boardScore: { type: boardScore },
    staffScore: { type: staffScore },
    partScore: { type: partScore },
});

module.exports = mongoose.model("general", generalShcema);
