// MongoDB schemas and models for interview data

// Interview Attempt Schema
export const InterviewAttemptSchema = {
  _id: 'ObjectId',
  email: {
    type: 'string',
    required: true,
    lowercase: true,
    trim: true
  },
  count: {
    type: 'number',
    default: 0,
    min: 0,
    max: 3
  },
  attempts: [{
    timestamp: {
      type: 'date',
      default: 'Date.now'
    },
    attemptNumber: {
      type: 'number',
      min: 1,
      max: 3
    },
    duration: {
      type: 'number', // in minutes
      default: null
    },
    completed: {
      type: 'boolean',
      default: false
    }
  }],
  createdAt: {
    type: 'date',
    default: 'Date.now'
  },
  updatedAt: {
    type: 'date',
    default: 'Date.now'
  }
};

// Interview Feedback Schema
export const InterviewFeedbackSchema = {
  _id: 'ObjectId',
  id: {
    type: 'string',
    unique: true,
    required: true
  },
  email: {
    type: 'string',
    required: true,
    lowercase: true,
    trim: true
  },
  candidateName: {
    type: 'string',
    required: true,
    trim: true
  },
  role: {
    type: 'string',
    required: true,
    trim: true
  },
  company: {
    type: 'string',
    trim: true,
    default: null
  },
  phone: {
    type: 'string',
    trim: true,
    default: null
  },
  duration: {
    type: 'number', // in minutes
    default: null
  },
  questions: [{
    question: {
      type: 'string',
      required: true
    },
    answer: {
      type: 'string',
      required: true
    }
  }],
  scores: {
    communication: {
      type: 'number',
      min: 0,
      max: 100,
      default: 0
    },
    technical: {
      type: 'number',
      min: 0,
      max: 100,
      default: 0
    },
    confidence: {
      type: 'number',
      min: 0,
      max: 100,
      default: 0
    },
    overall: {
      type: 'number',
      min: 0,
      max: 100,
      default: 0
    }
  },
  submittedAt: {
    type: 'date',
    default: 'Date.now'
  },
  serverTimestamp: {
    type: 'date',
    default: 'Date.now'
  },
  status: {
    type: 'string',
    enum: ['pending', 'reviewed', 'rejected', 'accepted'],
    default: 'pending'
  },
  reviewerNotes: {
    type: 'string',
    default: null
  }
};

// Index configurations for better performance
export const INDEXES = {
  ATTEMPTS: [
    { email: 1 }, // Unique index on email
    { createdAt: -1 } // For sorting by creation date
  ],
  FEEDBACK: [
    { id: 1 }, // Unique index on feedback ID
    { email: 1 }, // For finding feedback by email
    { submittedAt: -1 }, // For sorting by submission date
    { status: 1 } // For filtering by status
  ]
};
