const mongoose = require("mongoose");

const pollOptionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true,
    trim: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [pollOptionSchema], // Using the pollOptionSchema as a sub-document
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Student", // Make sure you have a "Student" model
  //   required: true,
  // },
});

module.exports = mongoose.model("Poll", pollSchema);

// const mongoose = require("mongoose");

// const pollOptionSchema = new mongoose.Schema({
//   question: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   optionText: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   votes: [
//     {
//       type: Number,
//       default: 0,
//     },
//   ],
// });

// const pollSchema = new mongoose.Schema({
//   question: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   optionText: [
//     {
//       type: String,
//       required: true,
//       trim: true,
//     },
//   ],
//   votes: [
//     {
//       type: Number,
//       default: 0,
//     },
//   ],
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Student",
//     required: true,
//   },
// });

// module.exports = mongoose.model("Poll", pollSchema);
