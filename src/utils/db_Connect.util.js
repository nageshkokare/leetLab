import mongoose from 'mongoose';

const connectDB = async function () {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("database connected successfully");
    } catch (error) {
        console.log("failed to connect the database", error);
        process.exit(1);
    }
}

export default connectDB;










