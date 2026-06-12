const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    favoriteGenres: { type: [Number], default: [] },
    language: { type: String, default: 'en' },
    notifications: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    username: { type: String, required: true, trim: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null, index: true, sparse: true },
    picture: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    authProvider: { type: String, enum: ['email', 'google'], default: 'email' },
    profile: { type: profileSchema, default: () => ({}) },
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    email: this.email,
    username: this.username,
    isVerified: this.isVerified,
    picture: this.picture,
    profile: this.profile,
    preferences: this.preferences,
  };
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
