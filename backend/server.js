const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer();

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/evaluation_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

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
  Email: String,
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
          { Email: { $regex: query, $options: "i" } },
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

app.post("/groups", async (req, res) => {
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

// New group management routes from the second file
app.get("/groups/search", async (req, res) => {
  try {
    const { groupName } = req.query;
    if (!groupName) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const group = await Group.findOne({
      groupName: { $regex: new RegExp(`^${groupName.trim()}$`, "i") },
    }).populate("students");

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while searching for the group" });
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

// Add these routes to the existing Express application

// Create a new student
app.post("/api/students", async (req, res) => {
  try {
    const { USN, Name, Email } = req.body;

    // Validate input
    if (!USN || !Name || !Email) {
      return res
        .status(400)
        .json({ message: "USN, Name, and Email are required" });
    }

    // Check if student with same USN or Email already exists
    const existingStudent = await Student.findOne({
      $or: [{ USN }, { Email }],
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "A student with this USN or Email already exists",
      });
    }

    // Create new student
    const newStudent = new Student({ USN, Name, Email });
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
    const { Name, Email } = req.body;

    // Validate input
    if (!Name || !Email) {
      return res.status(400).json({ message: "Name and Email are required" });
    }

    // Find and update the student
    const student = await Student.findOneAndUpdate(
      { USN: usn },
      { Name, Email },
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
      if (!record.USN || !record.Name || !record.Email) {
        errors.push(`Invalid record: ${JSON.stringify(record)}`);
        continue;
      }

      // Check for duplicates before inserting
      const existingStudent = await Student.findOne({
        $or: [{ USN: record.USN }, { Email: record.Email }],
      });

      if (existingStudent) {
        errors.push(`Duplicate student: ${record.USN} or ${record.Email}`);
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
