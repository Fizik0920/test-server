const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB ulanishi muvaffaqiyatli"))
    .catch(err => console.log("MongoDB xatosi: ", err));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    user_type: String
});
const User = mongoose.model("User", UserSchema);

const QuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correct: String
});
const Question = mongoose.model("Question", QuestionSchema);

app.post("/register", async (req, res) => {
    const { username, password, user_type } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, user_type });
    await newUser.save();
    res.json({ message: "Foydalanuvchi ro'yxatga olindi" });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Login yoki parol noto'g'ri" });
    }
    const token = jwt.sign({ userId: user._id, user_type: user.user_type }, process.env.JWT_SECRET);
    res.json({ token });
});

app.get("/questions", async (req, res) => {
    const questions = await Question.find();
    res.json(questions);
});

app.post("/questions", async (req, res) => {
    const { question, options, correct } = req.body;
    const newQuestion = new Question({ question, options, correct });
    await newQuestion.save();
    res.json({ message: "Savol qo'shildi" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server ${PORT} portida ishga tushdi`));
