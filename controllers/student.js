const asyncHandler = require("../middleware/async");
const Student = require("../models/student");
const Poll = require("../models/poll");

const path = require("path");
const fs = require("fs");

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private

exports.getStudents = asyncHandler(async (req, res, next) => {
  const students = await Student.find({});
  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

// @desc    Get single student
// @route   GET /api/v1/students/:id
// @access  Private

exports.getStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res
      .status(404)
      .json({ message: "Student not found with id of ${req.params.id}" });
  } else {
    res.status(200).json({
      success: true,
      data: student,
    });
  }
});

// @desc    Create new student
// @route   POST /api/v1/students
// @access  Public

exports.register = asyncHandler(async (req, res, next) => {
  const student = await Student.findOne({ username: req.body.username });
  console.log(req.body);
  if (student) {
    return res.status(400).send({ message: "Student already exists" });
  }

  const batch = await Batch.findOne({ _id: req.body.batch });
  // if (!batch) {
  //   return res.status(400).send({ message: "Invalid Batch" });
  // }
  await Student.create(req.body);

  res.status(200).json({
    success: true,
    message: "Student created successfully",
  });
});

// @desc   Login student
// @route  POST /api/v1/students/login
// @access Public

exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .send({ message: "Please provide an username and password" });
  }

  //Check for Student
  const student = await Student.findOne({ username: username }).select(
    "+password"
  );

  if (!Student) {
    return res.status(400).send({ message: "Invalid Credentials" });
    // return next(new ErrorResponse('Invalid credentials', 401));
  }

  //Check if password matches
  const isMatch = await student.matchPassword(password);

  if (!isMatch) {
    return res.status(400).send({ message: "Invalid Credentials" });
  }

  sendTokenResponse(student, 200, res);
});

//=========================== Searching ===========================

// @desc    Search student by batch
// @route   GET /api/v1/students/search/:batchId
// @access  Private

// exports.searchByBatch = asyncHandler(async (req, res, next) => {
//   // const students = await Student.find({ batch: req.params.batchId });
//   // if (!students) {
//   //   return res.status(404).send({ message: "No students found" });
//   // }
//   // res.status(200).json({
//   //   success: true,
//   //   count: students.length,
//   //   data: students,
//   // });

//   const batchId = req.params.batchId;
//   Student.find({ batch: batchId })
//     .populate("batch", "-__v")
//     .populate("course", "-__v")
//     .then((student) => {
//       res.status(201).json({
//         success: true,
//         message: "List of students by batch",
//         data: student,
//       });
//     })
//     .catch((err) => {
//       res.status(500).json({
//         success: false,
//         message: err,
//       });
//     });
// });

// // @desc    Search student by course
// // @route   GET /api/v1/students/search/:courseId
// // @access  Private

// exports.searchByCourse = asyncHandler(async (req, res, next) => {
//   const courseId = req.params.courseId;

//   Student.find({
//     course: {
//       $elemMatch: {
//         $eq: { _id: courseId },
//       },
//     },
//   })
//     .select("-password -__v")
//     .populate("batch", "-__v")
//     .populate("course", "-__v")
//     .then((student) => {
//       res.status(201).json({
//         success: true,
//         message: "List of students by course",
//         data: student,
//       });
//     })
//     .catch((err) => {
//       res.status(500).json({
//         success: false,
//         message: err,
//       });
//     });
// });

// @desc    Update student
// @route   PUT /api/v1/students/:id
// @access  Private

exports.updateStudent = asyncHandler(async (req, res, next) => {
  const user = req.body;
  const student = await Student.findByIdAndUpdate(req.params.id, user, {
    new: true,
    runValidators: true,
  });

  if (!student) {
    return res.status(404).send({ message: "Student not found" });
  }

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: student,
  });
});

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
// @access  Private

exports.deleteStudent = asyncHandler(async (req, res, next) => {
  console.log(req.params.id);
  Student.findByIdAndDelete(req.params.id)
    .then((student) => {
      if (student != null) {
        var imagePath = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          student.image
        );

        fs.unlink(imagePath, (err) => {
          if (err) {
            console.log(err);
          }
          res.status(200).json({
            success: true,
            message: "Student deleted successfully",
          });
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Student not found",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    });
});

// @desc Upload Single Image
// @route POST /api/v1/auth/upload
// @access Private

exports.uploadImage = asyncHandler(async (req, res, next) => {
  // // check for the file size and send an error message
  // if (req.file.size > process.env.MAX_FILE_UPLOAD) {
  //   return res.status(400).send({
  //     message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
  //   });
  // }

  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

// Get token from model , create cookie and send response
const sendTokenResponse = (Student, statusCode, res) => {
  const token = Student.getSignedJwtToken();

  const options = {
    //Cookie will expire in 30 days
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Cookie security is false .if you want https then use this code. do not use in development time
  if (process.env.NODE_ENV === "proc") {
    options.secure = true;
  }
  //we have created a cookie with a token

  res
    .status(statusCode)
    .cookie("token", token, options) // key , value ,options
    .json({
      success: true,
      token,
    });
};

// Controller function to create a new poll
exports.createPoll = asyncHandler(async (req, res, next) => {
  try {
    // Extract poll data from the request body
    const { question, options } = req.body;

    // Create a new poll instance
    const poll = new Poll({
      question,
      options: options.map((option) => ({ optionText: option })),
    });

    // Save the poll to the database
    await poll.save();

    res.status(201).json({ message: "Poll created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating poll" });
  }
});

// Controller function to record a vote for a poll option
exports.recordVote = asyncHandler(async (req, res, next) => {
  try {
    const { pollId, optionIndex } = req.body;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    poll.options[optionIndex].votes++;
    await poll.save();

    res.json({ message: "Vote recorded" });
  } catch (error) {
    res.status(500).json({ message: "Error recording vote" });
  }
});

// Controller function to get all polls
exports.getAllPolls = asyncHandler(async (req, res, next) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: "Error fetching polls" });
  }
});

// @desc    Get poll by ID
// @route   GET /api/v1/polls/:id
// @access  Private

exports.getPollById = asyncHandler(async (req, res, next) => {
  const pollId = req.params.id;
  const poll = await Poll.findById(pollId);

  if (!poll) {
    return res.status(404).json({ message: "Poll not found" });
  }

  res.status(200).json({
    success: true,
    data: poll,
  });
});

// @desc    Get all polls created by the currently logged in student
// @route   GET /api/v1/mypolls
// @access  Private

exports.getAllMyPolls = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id; // Assuming you have a logged in user available in req.user
  const polls = await Poll.find({ createdBy: studentId });

  res.status(200).json({
    success: true,
    count: polls.length,
    data: polls,
  });
});

// @desc    Update poll by ID
// @route   PUT /api/v1/polls/:id
// @access  Private

exports.updatePoll = asyncHandler(async (req, res, next) => {
  const pollId = req.params.id;
  const { question, options } = req.body;

  const updatedPoll = await Poll.findByIdAndUpdate(
    pollId,
    { question, options: options.map((option) => ({ optionText: option })) },
    { new: true, runValidators: true }
  );

  if (!updatedPoll) {
    return res.status(404).json({ message: "Poll not found" });
  }

  res.status(200).json({
    success: true,
    message: "Poll updated successfully",
    data: updatedPoll,
  });
});

// @desc    Delete poll by ID
// @route   DELETE /api/v1/polls/:id
// @access  Private

exports.deletePollById = asyncHandler(async (req, res, next) => {
  const pollId = req.params.id;

  const deletedPoll = await Poll.findByIdAndDelete(pollId);

  if (!deletedPoll) {
    return res.status(404).json({ message: "Poll not found" });
  }

  res.status(200).json({
    success: true,
    message: "Poll deleted successfully",
  });
});
