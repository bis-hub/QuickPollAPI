const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const upload = require("../middleware/uploads");

const {
  getStudents,
  getStudent,
  register,
  login,
  searchByBatch,
  searchByCourse,
  updateStudent,
  deleteStudent,
  uploadImage,
  createPoll,
  recordVote,
  getAllPolls,
  getPollById,
  getAllMyPolls,
  updatePoll,
  deletePollById,
} = require("../controllers/student");

router.post("/uploadImage", upload, uploadImage);
router.post("/register", register);
router.post("/login", login);
router.get("/getAllStudents", protect, getStudents);
router.get("/getStudentsByBatch/:batchId", protect, searchByBatch);
router.get("/getStudentsByCourse/:courseId", protect, searchByCourse);
router.put("/updateStudent/:id", protect, updateStudent);
router.delete("/deleteStudent/:id", protect, deleteStudent);

// Poll-related routes
router.post("/createPoll", protect, createPoll);
router.post("/recordVote", protect, recordVote);
router.get("/getAllPolls", protect, getAllPolls);
router.get("/getPollById/:id", protect, getPollById);
router.get("/getAllMyPolls", protect, getAllMyPolls);
router.put("/updatePoll/:id", protect, updatePoll);
router.delete("/deletePollById/:id", protect, deletePollById);

module.exports = router;
