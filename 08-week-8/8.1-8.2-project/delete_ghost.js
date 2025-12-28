const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');

dotenv.config();

async function deleteGhostCourse() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const courseId = "692c078f3af24e30684e80dc"; // ID of "New Course"
        const result = await Course.findByIdAndDelete(courseId);

        if (result) {
            console.log(`✅ Successfully deleted course: ${result.title}`);
        } else {
            console.log("❌ Course not found (maybe already deleted)");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

deleteGhostCourse();
