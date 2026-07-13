import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Chat',
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'General',
    trim: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
