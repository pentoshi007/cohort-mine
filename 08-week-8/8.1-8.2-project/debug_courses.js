const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Admin = require('./models/Admin');

dotenv.config();

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const courses = await Course.find({});
        console.log("\n--- ALL COURSES ---");
        courses.forEach(c => {
            console.log(`ID: ${c._id}`);
            console.log(`Title: ${c.title}`);
            console.log(`CreatorID: ${c.creatorId}`);
            console.log("-------------------");
        });

        const admins = await Admin.find({});
        console.log("\n--- ALL ADMINS ---");
        admins.forEach(a => {
            console.log(`ID: ${a._id}`);
            console.log(`Email: ${a.email}`);
            console.log("-------------------");
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
