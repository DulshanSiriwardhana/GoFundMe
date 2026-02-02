import mongoose from "mongoose";

const FundSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true, index: true },
    projectName: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    imageUri: { type: String, default: "" },
    creator: { type: String, required: true, index: true },
    category: { type: String, default: "Community", index: true },
    goal: { type: String, required: true },
    deadline: { type: Number, required: true },
    totalRaised: { type: String, default: "0" },
    goalReached: { type: Boolean, default: false },
    contributorCount: { type: Number, default: 0 },
    requestCount: { type: Number, default: 0 },
    requests: [{
        purpose: String,
        amount: String,
        completed: Boolean,
        approvals: Number,
        id: Number
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const Fund = mongoose.model("Fund", FundSchema);
