const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
require("./passPortConfig");
const app = express();
const PORT = 5000;
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
app.use(cors());
app.use(express.json());
require("dotenv").config();
const authenticate = require("./middleware/authenticate");
const upload = multer();
const pdf = require('pdf-parse');

connectDB();
app.use(express.urlencoded({ extended: true }));

// Setup session
app.use(
  session({
    secret: "Gz7@89fs2a9s!x93",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/auth", authRoutes);
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Base Question Schema with common fields
const baseQuestionFields = {
  evaluationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evaluation",
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ["MCQ", "descriptive"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
};

const evaluationResultSchema = new mongoose.Schema(
  {
    evaluation: {
      evaluationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Evaluation",
        required: true,
      },
      studentUSN: {
        type: String,
        required: true,
        trim: true,
      },
      marks: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

const EvaluationResult = mongoose.model(
  "EvaluationResult",
  evaluationResultSchema
);

// Create schema with conditional fields based on questionType
const questionSchema = new mongoose.Schema(
  {
    ...baseQuestionFields,
    // MCQ fields (only required if questionType is MCQ)
    options: {
      type: [
        {
          type: String,
        },
      ],
      required: function () {
        return this.questionType === "MCQ";
      },
    },
    correctAnswer: {
      type: String,
      required: function () {
        return this.questionType === "MCQ";
      },
    },
    sampleAnswer: {
      type: String,
      required: function () {
        return this.questionType === "descriptive";
      },
    },
    keyPoints: {
      type: [
        {
          type: String,
        },
      ],
      required: function () {
        return this.questionType === "descriptive";
      },
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

const submittedAnswerSchema = new mongoose.Schema({
  usn: { type: String, required: true },
  evaluationId: { type: String, required: true },
  answers: [
    {
      questionId: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],
});

const SubmittedAnswer = mongoose.model(
  "SubmittedAnswers",
  submittedAnswerSchema
);

const titleSchema = new mongoose.Schema({
  name: String,
  description: String,
  fileData: Buffer,
  fileType: String,
});
const Title = mongoose.model("Title", titleSchema);

const studentSchema = new mongoose.Schema({
  USN: String,
  Name: String,
});
const Student = mongoose.model("Students", studentSchema);

const groupSchema = new mongoose.Schema({
  groupName: { type: String, required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Students" }],
});
const Group = mongoose.model("Student_Groups", groupSchema);

const locationSchema = new mongoose.Schema({
  name: String,
});
const Location = mongoose.model("Titles", locationSchema);
const evaluationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  scheduleType: {
    type: String,
    enum: ["now", "later"],
    required: true,
  },
  questionTypes: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return (
          v.length > 0 &&
          v.every((type) => ["mcq", "descriptive"].includes(type))
        );
      },
      message: "Invalid question types",
    },
  },
  questionDistribution: {
    easy: {
      type: Number,
      min: 0,
      required: true,
    },
    medium: {
      type: Number,
      min: 0,
      required: true,
    },
    difficult: {
      type: Number,
      min: 0,
      required: true,
    },
  },
  timeLimit: {
    type: Number,
    min: 0,
    required: true,
  },
  finishDateTime: {
    type: Date,
    required: true, // Ensures that a finish date is always provided
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["draft", "active", "completed", "evaluated"],
    default: "draft",
  },
});

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

// Fetch individual student's marks for a specific evaluation
app.get("/api/results/student/:evaluationId/:usn", async (req, res) => {
  try {
    const { evaluationId, usn } = req.params;

    // Fetch the result for the specific student and evaluation
    const result = await EvaluationResult.findOne({
      "evaluation.evaluationId": evaluationId,
      "evaluation.studentUSN": usn,
    });

    if (!result) {
      return res
        .status(404)
        .json({ message: "Result not found for this student" });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching result:", err);
    res.status(500).json({ message: "Error fetching result" });
  }
});

// Fetch all student results and sort by marks in decreasing order
app.get("/api/results/ranking/:evaluationId", async (req, res) => {
  try {
    const { evaluationId } = req.params;

    // Fetch all results for the evaluation and sort them by marks in descending order
    const results = await EvaluationResult.find({
      "evaluation.evaluationId": evaluationId,
    }).sort({ "evaluation.marks": -1 });

    if (!results || results.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this evaluation" });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ message: "Error fetching results" });
  }
});

app.get("/api/evaluations/home", authenticate, async (req, res) => {
  try {
    console.log("Authenticated User:", req.user.username);

    // Find the student based on the authenticated user's USN
    const student = await Student.findOne({ USN: req.user.username });

    if (!student) {
      return res.status(200).json({
        message: "Student not found",
        student: null,
        groups: [],
        evaluations: [],
      });
    }

    // Find all groups the student belongs to
    const groups = await Group.find({ students: student._id });

    // Extract group names
    const groupNames = groups.length
      ? groups.map((group) => group.groupName)
      : [];

    // Find evaluations for all the groups
    const evaluations = await Evaluation.find({ group: { $in: groupNames } });

    // Fetch submitted answers for the student
    const submittedAnswers = await SubmittedAnswer.find({ usn: student.USN });

    console.log(submittedAnswers);
    // Update evaluation status based on submitted answers
    const evaluationsWithStatus = evaluations.map((evaluation) => {
      const hasSubmittedAnswers = submittedAnswers.some(
        (answer) => answer.evaluationId.toString() === evaluation._id.toString()
      );

      return {
        ...evaluation.toObject(),
        status:
          evaluation.status === "evaluated"
            ? "evaluated"
            : hasSubmittedAnswers
            ? "completed"
            : evaluation.status,
      };
    });

    // Return all data, even if some arrays are empty
    res.json({
      student,
      groups,
      evaluations: evaluationsWithStatus,
      message: !groups.length
        ? "No groups found"
        : !evaluations.length
        ? "No evaluations found"
        : null,
    });
  } catch (error) {
    console.error("Error fetching evaluations:", error);
    res.status(500).send("Server error");
  }
});

app.get("/api/questions/:evaluationId", async (req, res) => {
  try {
    // Fetch the evaluation based on the evaluationId
    const evaluation = await Evaluation.findById(req.params.evaluationId);

    // If the evaluation doesn't exist, return a 404 error
    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    // Fetch the questions associated with this evaluation
    const questions = await Question.find({
      evaluationId: req.params.evaluationId,
    });

    // Log for debugging
    console.log(req.params.evaluationId);
    console.log(questions);

    // Return both the timeLimit and the questions in the response
    res.status(200).json({
      timeLimit: evaluation.timeLimit, // Include the timeLimit from the evaluation
      questions: questions, // Return the list of questions
    });
  } catch (err) {
    // Handle any errors and send a 500 error with the message
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/evaluations/:id", authenticate, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id).populate(
      "questions"
    );
    if (!evaluation) {
      return res.status(404).send("Evaluation not found");
    }

    res.json(evaluation);
  } catch (error) {
    res.status(500).send("Server error");
  }
});


app.get("/api/evaluationsStudent/:id", async (req, res) => {
  try {
    // Find all questions related to the evaluation ID
    const questions = await Question.find({ evaluationId: req.params.id });

    if (!questions || questions.length === 0) {
      return res.status(404).send("No questions found for this evaluation");
    }

    res.json({questions, totalQuestions:questions.length});
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


// Get results for a specific evaluation
app.get("/api/evaluations/results/:id", authenticate, async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id).populate(
      "results"
    );
    if (!evaluation) {
      return res.status(404).send("Evaluation results not found");
    }

    res.json(evaluation.results);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Existing routes from the first file
app.post("/api/check-title", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ available: false, message: "Topic is required." });
  }

  try {
    const existingTitle = await Title.findOne({ name });
    if (existingTitle) {
      res.json({
        available: 0,
        message: "This topic is already available with us",
      });
    } else {
      res.json({
        available: 1,
        message: "This topic is new. Proceed to add description",
      });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({
      available: false,
      message: "An error occurred. Please try again.",
    });
  }
});

app.get("/api/titles", async (req, res) => {
  try {
    const { search } = req.query;
    let titles;

    if (search) {
      // If search query is provided, perform a case-insensitive search
      titles = await Title.find({
        name: { $regex: search, $options: "i" },
      });
    } else {
      // If no search query, return all titles
      titles = await Title.find();
    }

    res.json(titles);
  } catch (error) {
    console.error("Error fetching titles:", error);
    res.status(500).json({
      message: "An error occurred while fetching titles",
      error: error.message,
    });
  }
});

app.post("/api/save-description", upload.single("file"), async (req, res) => {
  const { title, description } = req.body;
  const file = req.file;

  if (!title || (!description && !file)) {
    return res.status(400).json({
      message: "Title and either a description or a file are required.",
    });
  }

  try {
    const existingTitle = await Title.findOne({ name: title });
    if (existingTitle) {
      return res.status(400).json({ message: "This title already exists." });
    }

    const dataToSave = { name: title };

    if (description) {
      dataToSave.description = description;
    }

    if (file) {
      dataToSave.fileData = file.buffer;
      dataToSave.fileType = file.mimetype;
    }

    const newTitle = new Title(dataToSave);
    await newTitle.save();

    res.json({ message: "Title saved successfully.", data: newTitle });
  } catch (error) {
    console.error("Error saving title:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred while saving the title." });
  }
});

// Existing student and location search routes
app.get("/students", async (req, res) => {
  try {
    const query = req.query.q;
    let students;
    if (!query || query.trim() === "") {
      students = await Student.find();
    } else {
      students = await Student.find({
        $or: [
          { Name: { $regex: query, $options: "i" } },
          { USN: { $regex: query, $options: "i" } },
        ],
      }).limit(10);
    }

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching students." });
  }
});

app.get("/locations", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.json([]);
  }

  const locations = await Location.find({
    name: { $regex: query, $options: "i" },
  }).limit(10);
  res.json(locations);
});

// Add this to your existing Express routes

// Get all groups

// New group management routes from the second file
app.get("/groups/search", async (req, res) => {
  try {
    const { groupName } = req.query;

    // Ensure that groupName is provided
    if (!groupName) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Search for group by name using regex (no ObjectId involved here)
    const group = await Group.findOne({
      groupName: { $regex: new RegExp(`^${groupName.trim()}$`, "i") },
    }).populate("students");

    // If no group is found, return 404
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Return the group data if found
    res.json(group);
  } catch (error) {
    console.error("Error during group search:", error);
    res
      .status(500)
      .json({ error: "An error occurred while searching for the group" });
  }
});

app.get("/api/groups", async (req, res) => {
  try {
    const { search } = req.query;
    let groups;

    if (search) {
      // If search query is provided, perform a case-insensitive search
      groups = await Group.find({
        groupName: { $regex: search, $options: "i" },
      });
    } else {
      groups = await Group.find();
    }

    res.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({
      message: "An error occurred while fetching groups",
      error: error.message,
    });
  }
});

// Get a specific group by ID with detailed student information
app.get("/groups/:groupId", async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate({
      path: "students",
      select: "Name USN", // Detailed student information
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    console.error("Error fetching group details:", error);
    res.status(500).json({
      message: "An error occurred while fetching group details",
      error: error.message,
    });
  }
});

// Get group statistics
app.get("/groups/stats", async (req, res) => {
  try {
    const stats = await Group.aggregate([
      {
        $lookup: {
          from: "students", // Assuming the collection name is 'students'
          localField: "students",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      {
        $addFields: {
          studentCount: { $size: "$students" },
        },
      },
      {
        $group: {
          _id: null,
          totalGroups: { $sum: 1 },
          totalStudents: { $sum: "$studentCount" },
          averageGroupSize: { $avg: "$studentCount" },
        },
      },
    ]);

    res.json(
      stats[0] || {
        totalGroups: 0,
        totalStudents: 0,
        averageGroupSize: 0,
      }
    );
  } catch (error) {
    console.error("Error fetching group statistics:", error);
    res.status(500).json({
      message: "An error occurred while fetching group statistics",
      error: error.message,
    });
  }
});

app.post("/create-groups", async (req, res) => {
  try {
    const { groupName, students } = req.body;
    // Validate input
    if (!groupName || groupName.trim() === "") {
      return res.status(400).json({ error: "The Group Name is required." });
    }
    if (!Array.isArray(students) || students.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one student must be selected." });
    }

    // Correctly create ObjectId instances
    const studentIds = students.map((id) => new mongoose.Types.ObjectId(id));

    // Check if students exist
    const existingStudents = await Student.find({ _id: { $in: studentIds } });

    if (existingStudents.length !== students.length) {
      return res.status(404).json({ error: "One or more students not found." });
    }

    const existingGroup = await Group.findOne({ groupName: groupName });
    if (existingGroup) {
      return res.status(400).json({ error: "This Group Already Exists." });
    }

    const group = new Group({
      groupName,
      students: studentIds,
    });
    await group.save();
    res.status(201).json({ message: "Group created successfully", group });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the group." });
  }
});

app.delete("/groups/:groupId/students/:studentId", async (req, res) => {
  try {
    const { groupId, studentId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    group.students = group.students.filter((id) => id.toString() !== studentId);

    await group.save();
    await group.populate("students");

    res.json(group);
  } catch (error) {
    console.error("Error removing student from group:", error);
    res
      .status(500)
      .json({ error: "An error occurred while removing the student" });
  }
});

app.put("/groups/:groupId/rename", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newGroupName } = req.body;

    const existingGroup = await Group.findOne({
      groupName: { $regex: new RegExp(`^${newGroupName.trim()}$`, "i") },
    });

    if (existingGroup) {
      return res
        .status(400)
        .json({ error: "A group with this name already exists" });
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { groupName: newGroupName },
      { new: true }
    ).populate("students");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group);
  } catch (error) {
    console.error("Error renaming group:", error);
    res
      .status(500)
      .json({ error: "An error occurred while renaming the group" });
  }
});

app.post("/groups/:groupId/add-students", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { studentIds } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const validStudentIds = await Student.find({
      _id: { $in: studentIds },
    }).select("_id");

    const newStudentIds = validStudentIds
      .filter(
        (student) =>
          !group.students.some(
            (existingId) => existingId.toString() === student._id.toString()
          )
      )
      .map((student) => student._id);

    group.students.push(...newStudentIds);
    await group.save();

    await group.populate("students");

    res.json(group);
  } catch (error) {
    console.error("Error adding students to group:", error);
    res.status(500).json({ error: "An error occurred while adding students" });
  }
});

app.delete("/groups/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findByIdAndDelete(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the group" });
  }
});

// Logout route
app.post("/logout", (req, res) => {
  try {
    // Clear the JWT token cookie
    res.clearCookie("token"); // This will clear the 'token' cookie

    // Optionally, if you're using a blacklist system for invalidating tokens:
    // const blacklistedTokens = await TokenBlacklist.create({ token: req.cookies.token });

    res.json({ message: "Successfully logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "An error occurred while logging out" });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { USN, Name } = req.body;

    // Validate input
    if (!USN || !Name) {
      return res.status(400).json({ message: "USN and Name are required" });
    }

    // Check if student with same USN or Email already exists
    const existingStudent = await Student.findOne({
      $or: [{ USN }],
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "A student with this USN already exists",
      });
    }

    // Create new student
    const newStudent = new Student({ USN, Name });
    await newStudent.save();

    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error creating student:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the student" });
  }
});

// Update student details
app.put("/api/students/:usn", async (req, res) => {
  try {
    const { usn } = req.params;
    const { Name } = req.body;

    // Validate input
    if (!Name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Find and update the student
    const student = await Student.findOneAndUpdate(
      { USN: usn },
      { Name },
      {
        new: true, // Return the updated document
        runValidators: true, // Run mongoose validation
      }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the student" });
  }
});

// Delete a student
app.delete("/api/students/:usn", async (req, res) => {
  try {
    const { usn } = req.params;

    // Find and delete the student
    const student = await Student.findOneAndDelete({ USN: usn });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Remove student from any groups they might be part of
    await Group.updateMany(
      { students: student._id },
      { $pull: { students: student._id } }
    );

    res.json({
      message: "Student deleted successfully",
      deletedStudent: student,
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the student" });
  }
});

// Bulk upload students via CSV
app.post("/api/students/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

    // Validate file type (only accept CSV)
    if (
      fileType !== "text/csv" &&
      fileType !== "application/vnd.ms-excel" &&
      fileType !==
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return res.status(400).json({
        message: "Invalid file type. Please upload a CSV or Excel file",
      });
    }

    // Use a library like csv-parse or xlsx to parse the file
    const csv = require("csv-parse");
    const parsedData = await new Promise((resolve, reject) => {
      csv(fileBuffer, { columns: true }, (err, records) => {
        if (err) reject(err);
        resolve(records);
      });
    });

    // Validate and prepare student data
    const studentsToInsert = [];
    const errors = [];

    for (const record of parsedData) {
      // Validate each record
      if (!record.USN || !record.Name) {
        errors.push(`Invalid record: ${JSON.stringify(record)}`);
        continue;
      }

      // Check for duplicates before inserting
      const existingStudent = await Student.findOne({
        $or: [{ USN: record.USN }],
      });

      if (existingStudent) {
        errors.push(`Duplicate student: ${record.USN}`);
        continue;
      }

      studentsToInsert.push(record);
    }

    // Bulk insert students
    const insertedStudents = await Student.insertMany(studentsToInsert);

    res.json({
      message: "Students uploaded successfully",
      insertedCount: insertedStudents.length,
      totalRecords: parsedData.length,
      errors,
    });
  } catch (error) {
    console.error("Error uploading students:", error);
    res
      .status(500)
      .json({ message: "An error occurred while uploading students" });
  }
});
// Add create evaluation route
app.post("/api/create-evaluation", async (req, res) => {
  try {
    const {
      title,
      topic,
      group,
      scheduleType,
      questionTypes,
      questionDistribution,
      timeLimit,
      finishDateTime,
    } = req.body;

    // Validate input
    if (!title || !topic || !group) {
      return res.status(400).json({
        success: false,
        message: "Title, topic, and group are required",
      });
    }

    // Verify topic exists and get its data
    const existingTopic = await Title.findOne({ name: topic });
    if (!existingTopic) {
      return res.status(400).json({
        success: false,
        message: "Selected topic does not exist",
      });
    }

    // Extract content from either description or file
    let topicContent = '';
    
    if (existingTopic.description) {
      // If plain text description exists, use it directly
      topicContent = existingTopic.description;
    } else if (existingTopic.fileData) {
      // Handle file data based on file type
      try {
        if (existingTopic.fileType === 'application/pdf') {
          // Parse PDF content
          const pdfData = await pdf(existingTopic.fileData);
          topicContent = pdfData.text;
        } else if (existingTopic.fileType === 'text/plain') {
          // Convert Buffer to string for text files
          topicContent = existingTopic.fileData.toString('utf-8');
        } else {
          throw new Error('Unsupported file type');
        }
      } catch (error) {
        console.error('Error processing file:', error);
        return res.status(500).json({
          success: false,
          message: "Failed to process topic content file",
          error: error.message
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "No content found for the selected topic"
      });
    }

    // Verify group exists
    const existingGroup = await Group.findOne({ groupName: group });
    if (!existingGroup) {
      return res.status(400).json({
        success: false,
        message: "Selected group does not exist",
      });
    }

    // Validate question types
    if (!questionTypes || questionTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one question type must be selected",
      });
    }

    // Validate question distribution
    const totalQuestions =
      questionDistribution.easy +
      questionDistribution.medium +
      questionDistribution.difficult;

    if (totalQuestions === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one question must be added",
      });
    }

    // Validate time limit
    if (timeLimit < 0) {
      return res.status(400).json({
        success: false,
        message: "Time limit must be a non-negative number",
      });
    }

    // Validate finishDateTime
    if (!finishDateTime) {
      return res.status(400).json({
        success: false,
        message: "Finish date and time is required",
      });
    }

    // Create new evaluation
    const newEvaluation = new Evaluation({
      title,
      topic,
      group,
      scheduleType,
      questionTypes,
      questionDistribution,
      timeLimit,
      finishDateTime,
      status: scheduleType === "now" ? "active" : "draft",
    });

    // Save evaluation
    const savedEvaluation = await newEvaluation.save();

    // If scheduled for "now", generate questions immediately
    if (scheduleType === "now") {
      console.log("[INFO] 'Schedule now' selected, generating questions...");

      // Generate Questions
      let generatedQuestions;
      try {
        console.log("[INFO] Generating questions...");
        if (savedEvaluation.questionTypes.includes("MCQ")) {
          generatedQuestions = await generateMCQQuestions(
            topicContent,  // Use the extracted content instead of title description
            savedEvaluation.topic,
            totalQuestions,
          );
        } else {
          generatedQuestions = await generateDescriptiveQuestions(
            topicContent,
            savedEvaluation.topic, 
            totalQuestions,
          );
        }

        if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
          throw new Error("No questions generated or generation failed.");
        }

        // Save Generated Questions
        console.log("[INFO] Saving generated questions...");
        const questionPromises = generatedQuestions.map((q) => {
          const question = new Question({
            evaluationId: savedEvaluation._id,
            ...q,
          });
          return question.save().catch((err) => {
            console.error("[ERROR] Failed to save question:", err.message);
          });
        });

        await Promise.all(questionPromises);
        console.log("[INFO] Questions generated and saved successfully.");
      } catch (err) {
        console.error("[ERROR] Question generation failed:", err.message);
        return res.status(500).json({
          success: false,
          message: "Question generation failed.",
          error: { message: err.message },
        });
      }
    }

    // Return the created evaluation
    res.status(201).json({
      success: true,
      message: "Evaluation created successfully",
      evaluation: savedEvaluation,
    });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the evaluation",
      error: error.message,
    });
  }
});

// Evaluation Fetch Route with Time Check
app.get("/api/evaluations", async (req, res) => {
  console.log(
    `[INFO] [${new Date().toISOString()}] - Incoming request to /api/evaluations`
  );

  try {
    // Fetch all evaluations
    const evaluations = await Evaluation.find().lean();

    console.log(`[SUCCESS] Fetched ${evaluations.length} evaluations.`);
    if (evaluations.length > 0) {
      console.log(`[DEBUG] Sample Evaluation:`, evaluations[0]);

      // Check if the finishTime has passed for any active evaluation
      const currentTime = new Date().getTime();
      for (const evaluation of evaluations) {
        // Check if the evaluation status is 'active' and finishTime has passed
        if (
          evaluation.status === "active" &&
          currentTime >= new Date(evaluation.finishTime).getTime()
        ) {
          // Update the status to 'completed'
          await Evaluation.findByIdAndUpdate(evaluation._id, {
            status: "completed",
          });
          console.log(
            `[INFO] Updated evaluation ${evaluation._id} status to 'completed'`
          );
        }
      }
    } else {
      console.log(`[INFO] No evaluations found.`);
    }

    // Send structured success response
    return res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (error) {
    console.error(`[ERROR] Failed to fetch evaluations:`, error.message);

    // Send structured error response
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching evaluations.",
      error: {
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    });
  }
});

// Background job to update evaluation status (you'd typically use a task scheduler like node-cron)
const checkEvaluationStatus = async () => {
  try {
    const now = new Date();

    // Find active evaluations that have passed their finishTime
    const expiredEvaluations = await Evaluation.find({
      status: "active",
      finishTime: { $lt: now }, // Checking if the finishTime is in the past
    });

    for (const evaluation of expiredEvaluations) {
      evaluation.status = "completed"; // Change the status to 'completed'
      await evaluation.save();
    }
  } catch (error) {
    console.error("Error checking evaluation status:", error);
  }
};

// Run status check every 5 minutes
setInterval(checkEvaluationStatus, 5 * 60 * 1000);

// Function to generate MCQ questions
async function generateMCQQuestions(description, topic, numQuestions) {
  const prompt = `Generate ${numQuestions} multiple choice questions about ${topic}. 
    Context: ${description}
    For each question, provide:
    1. The question text
    2. Four options (A, B, C, D)
    3. The correct answer
    4. Difficulty level (easy/medium/hard)
    Format the response as a plain JSON array of objects with:
    {
      "question": "question text",
      "questionType": "MCQ",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "correct option",
      "difficulty": "difficulty level"
    }`;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const rawResponse = await result.response.text();
  console.log("Raw MCQ Response:", rawResponse);
  let cleanedResponse = rawResponse.replace(/```(?:json)?/g, "").trim();
  return JSON.parse(cleanedResponse);
}

async function generateDescriptiveQuestions(
  description,
  topic,
  numQuestions
) {
  const prompt = `Generate ${numQuestions} descriptive questions about ${topic}. 
    Context: ${description}
    For each question, provide:
    1. The question text
    2. Sample Answer Text
    3. Key points that should be covered in the answer (3-5 points)
    4. Difficulty level (easy/medium/hard)
    Format the response as a plain JSON array of objects with:
    {
      "question": "question text",
      "questionType": "descriptive",
      "sampleAnswer":"sample answer text",
      "keyPoints": ["key point 1", "key point 2", "key point 3"],
      "difficulty": "difficulty level"
    }`;
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const rawResponse = await result.response.text();
  console.log("Raw Descriptive Response:", rawResponse);
  let cleanedResponse = rawResponse.replace(/```(?:json)?/g, "").trim();
  return JSON.parse(cleanedResponse);
}

app.post("/api/submit-answers", async (req, res) => {
  try {
    const { usn, evaluationId, answers } = req.body;

    // Save the submitted answers
    const submittedAnswer = new SubmittedAnswer({
      usn,
      evaluationId,
      answers,
    });

    await submittedAnswer.save();
    res.status(201).json({ message: "Answers submitted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// app.put("/api/evaluations/:id/status", async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   // Validate Evaluation ID
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid evaluation ID.",
//     });
//   }

//   // Validate Status
//   const validStatuses = ["draft", "active", "completed", "evaluated"];
//   if (!status || !validStatuses.includes(status)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid status value. Allowed values are 'draft', 'active', 'completed', 'evaluated'.",
//     });
//   }

//   try {
//     // Fetch the evaluation by ID
//     const evaluation = await Evaluation.findById(id);

//     if (!evaluation) {
//       return res.status(404).json({
//         success: false,
//         message: "Evaluation not found.",
//       });
//     }

//     // Handle transition from 'completed' to 'evaluated'
//     if (evaluation.status === "completed" && status === "evaluated") {
//       console.log("[INFO] Transitioning from 'completed' to 'evaluated'...");

//       // Fetch all submissions for the evaluation
//       const submissions = await SubmittedAnswer.find({ evaluationId: id });
//       if (!submissions || submissions.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "No submissions found for this evaluation.",
//         });
//       }

//       // Evaluate submissions using Gemini API
//       const evaluationResults = [];
//       for (const submission of submissions) {
//         const studentUSN = submission.usn;
//         const answers = submission.answers;

//         try {
//           console.log(`[INFO] Evaluating submission for student USN: ${studentUSN}`);
//           const responses = await Promise.all(
//             answers.map(async (answer) => {
//               const question = await Question.findById(answer.questionId);
//               if (!question) {
//                 throw new Error("Question not found.");
//               }

//               const geminiResponse = await genAI.evaluateAnswer({
//                 question: question.question,
//                 correctAnswer: question.correctAnswer || question.keyPoints.join(", "),
//                 studentAnswer: answer.answer,
//               });

//               return {
//                 questionId: answer.questionId,
//                 marks: geminiResponse.marks || 0, // Assuming the API returns marks
//               };
//             })
//           );

//           const totalMarks = responses.reduce((sum, r) => sum + r.marks, 0);
//           evaluationResults.push({ evaluationId: id, studentUSN, marks: totalMarks });

//         } catch (err) {
//           console.error(`[ERROR] Evaluation failed for USN: ${studentUSN}`, err.message);
//         }
//       }

//       // Save evaluation results
//       for (const result of evaluationResults) {
//         await new EvaluationResult(result).save();
//       }
//     }

//     // Update the evaluation status
//     const updatedEvaluation = await Evaluation.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!updatedEvaluation) {
//       throw new Error("Failed to update the evaluation status.");
//     }

//     console.log("[INFO] Evaluation status updated successfully.");
//     return res.status(200).json({
//       success: true,
//       data: updatedEvaluation,
//     });
//   } catch (error) {
//     console.error("[ERROR] Failed to update evaluation status:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while updating the status.",
//       error: {
//         message: error.message,
//         ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
//       },
//     });
//   }
// });

// Start the server

const evaluateSubmittedAnswers = async (evaluationId) => {
  try {
    // Fetch evaluation details
    const evaluation = await Evaluation.findById(evaluationId);
    if (!evaluation) {
      throw new Error(`Evaluation with ID ${evaluationId} not found.`);
    }

    // Check if results already exist for this evaluation
    const existingResults = await EvaluationResult.find({ 
      'evaluation.evaluationId': evaluationId 
    });
    if (existingResults.length > 0) {
      console.log("Results already exist for this evaluation.");
      return {
        success: true,
        message: "Results already evaluated.",
        results: existingResults
      };
    }

    // Fetch all submitted answers for the evaluation
    const submissions = await SubmittedAnswer.find({ evaluationId });
    if (submissions.length === 0) {
      throw new Error("No submissions found for this evaluation.");
    }

    const evaluationResults = [];

    for (const submission of submissions) {
      let totalMarks = 0;

      for (const answer of submission.answers) {
        const question = await Question.findById(answer.questionId);
        if (!question) {
          console.error(`Question with ID ${answer.questionId} not found.`);
          continue;
        }

        let marksAwarded = 0;
        if (question.questionType === "MCQ") {
          // Evaluate MCQ
          marksAwarded = question.correctAnswer === answer.answer ? 1 : 0;
        } else if (question.questionType === "descriptive") {
          const prompt = `
            Evaluate the following descriptive answer 
            with conditions as follow
            1.evaluate very very very strictly, 
            2. dont give marks for random words, 
            3. check sentence formation, how they are related to the context of the question, 
            4. if user has typed or pasted the question award 0 marks, 
            5. if the user has written answer out of context award 0 for that answer:

            Here is the input for you to evaluate
            Question: ${question.question}
            Sample Answer: ${question.sampleAnswer}
            Key Points: ${question.keyPoints.join(", ")}
            Student Answer: ${answer.answer}
            Provide:
            1. Marks awarded (out of 5)
            2. Feedback explaining key points missed or errors in the answer.
            Format the response as JSON:
            {
              "marksAwarded": number,
              "feedback": "feedback text"
            }
          `;
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          try {
            const result = await model.generateContent(prompt);
            const rawResponse = await result.response.text();
            const { marksAwarded: aiMarks } = JSON.parse(
              rawResponse.replace(/```(?:json)?/g, "").trim()
            );
            marksAwarded = aiMarks || 0;
          } catch (error) {
            console.error(
              `Error evaluating descriptive question ${question._id}:`,
              error.message
            );
          }
        }

        totalMarks += marksAwarded;
      }

      evaluationResults.push({
        evaluationId,
        studentUSN: submission.usn,
        marks: totalMarks,
      });
    }

    // Save results in bulk to avoid duplicate saves
    if (evaluationResults.length > 0) {
      await EvaluationResult.insertMany(
        evaluationResults.map(result => ({ evaluation: result }))
      );
    }

    console.log("Evaluation process completed successfully.");
    return {
      success: true,
      message: "Evaluation completed.",
      results: evaluationResults,
    };
  } catch (error) {
    console.error("Error during evaluation:", error.message);
    return { success: false, message: error.message };
  }
};

app.put("/api/evaluations/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate Evaluation ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid evaluation ID.",
    });
  }

  // Validate Status
  const validStatuses = ["draft", "active", "completed", "evaluated"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid status value. Allowed values are 'draft', 'active', 'completed', 'evaluated'.",
    });
  }

  try {
    // Fetch the evaluation by ID
    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Evaluation not found.",
      });
    }

    // Handle transition from 'draft' to 'active'
    if (evaluation.status === "draft" && status === "active") {
      console.log("[INFO] Transitioning from 'draft' to 'active'...");
      
      // Find the associated title
      const title = await Title.findOne({ name: evaluation.topic });
      if (!title) {
        return res.status(404).json({
          success: false,
          message: "Associated title not found.",
        });
      }

      // Extract content from either description or file
      let topicContent = '';
      
      if (title.description) {
        // If plain text description exists, use it directly
        topicContent = title.description;
        console.log("[INFO] Using text description for question generation");
      } else if (title.fileData) {
        // Handle file data based on file type
        try {
          if (title.fileType === 'application/pdf') {
            // Parse PDF content
            console.log("[INFO] Processing PDF file for content extraction");
            const pdfData = await pdf(title.fileData);
            topicContent = pdfData.text;
          } else if (title.fileType === 'text/plain') {
            // Convert Buffer to string for text files
            console.log("[INFO] Processing text file for content extraction");
            topicContent = title.fileData.toString('utf-8');
          } else {
            throw new Error('Unsupported file type');
          }
          console.log("[INFO] File content extracted successfully");
        } catch (error) {
          console.error('[ERROR] File processing failed:', error);
          return res.status(500).json({
            success: false,
            message: "Failed to process topic content file",
            error: error.message
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: "No content found for the selected topic"
        });
      }

      // Generate Questions
      let generatedQuestions;
      try {
        console.log("[INFO] Generating questions...");
        if (evaluation.questionType === "MCQ") {
          generatedQuestions = await generateMCQQuestions(topicContent, evaluation.topic);
        } else {
          generatedQuestions = await generateDescriptiveQuestions(topicContent, evaluation.topic);
        }

        if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
          throw new Error("No questions generated or generation failed.");
        }
      } catch (err) {
        console.error("[ERROR] Question generation failed:", err.message);
        return res.status(500).json({
          success: false,
          message: "Question generation failed.",
          error: { message: err.message },
        });
      }

      // Save Generated Questions
      console.log("[INFO] Saving generated questions...");
      const questionPromises = generatedQuestions.map((q) => {
        const question = new Question({
          evaluationId: evaluation._id,
          ...q,
        });
        return question.save().catch((err) => {
          console.error("[ERROR] Failed to save question:", err.message);
        });
      });

      await Promise.all(questionPromises);
    }

    // Handle transition from 'completed' to 'evaluated'
    if (evaluation.status === "completed" && status === "evaluated") {
      console.log("[INFO] Transitioning from 'completed' to 'evaluated'...");

      // Call the evaluation function
      const evaluationResult = await evaluateSubmittedAnswers(id);

      if (!evaluationResult.success) {
        console.error(
          "[ERROR] Evaluation process failed:",
          evaluationResult.message
        );
        return res.status(500).json({
          success: false,
          message: "Evaluation process failed.",
          error: evaluationResult.message,
        });
      }

      console.log("[INFO] Evaluation completed successfully.");
    }

    // Update the evaluation status
    console.log("[INFO] Updating evaluation status...");
    const updatedEvaluation = await Evaluation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedEvaluation) {
      throw new Error("Failed to update the evaluation status.");
    }

    console.log("[INFO] Evaluation status updated successfully.");
    return res.status(200).json({
      success: true,
      data: updatedEvaluation,
    });
  } catch (error) {
    console.error("[ERROR] Failed to update evaluation status:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the status.",
      error: {
        message: error.message,
        ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
      },
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
