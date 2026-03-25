import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://swatimatre:swati123@cluster0.ek22mec.mongodb.net/food-del').then(()=>console.log("DB Connected"));
}