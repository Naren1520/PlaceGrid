import mongoose from 'mongoose';

// User Schema (for Students, Companies, and Coordinators)
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String },
    role: { type: String, enum: ['student', 'company', 'coordinator'], required: true },
    companyId: { type: String },
    companyName: { type: String },
    
    // Student specific fields
    skills: [String],
    resume: { type: String },
    githubUsername: { type: String },
    githubUrl: { type: String },
    phone: { type: String },
    university: { type: String },
    graduationYear: { type: Number },
    appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    
    // Company specific fields
    jobsPosted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    
    // Coordinator specific fields
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Job Schema
const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    companyId: { type: String, required: true },
    requiredSkills: [String],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    isOpen: { type: Boolean, default: true },
    deadline: { type: Date },
  },
  { timestamps: true }
);

// Application Schema
const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'shortlisted', 'rejected', 'placed'], default: 'pending' },
    matchScore: { type: Number, default: 0 },
    studentSkills: [String],
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Coordinator Settings Schema
const coordinatorSettingsSchema = new mongoose.Schema(
  {
    isFrozen: { type: Boolean, default: false },
    frozenAt: { type: Date },
    frozenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
  },
  { timestamps: true }
);

// Create or reuse models
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);
export const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export const CoordinatorSettings = mongoose.models.CoordinatorSettings || mongoose.model('CoordinatorSettings', coordinatorSettingsSchema);
