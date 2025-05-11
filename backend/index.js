const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://chpongphanu:f1AIwH3r3cu14hae@cluster0.of7qqhr.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
  lastLogin: { type: Date, default: null }
});

const User = mongoose.model('User', userSchema);

const newUser = new User({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'securePassword123'
});

newUser.save()
  .then(user => {
    console.log('✅ User saved:', user);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error saving user:', err);
    mongoose.disconnect();
  });
