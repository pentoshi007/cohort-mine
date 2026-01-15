import { Model, Schema, model } from "mongoose";

export interface IUser {
  email: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// This line creates a Mongoose model with TypeScript type safety:
//
// 1. `model<IUser>("User", userSchema)` - The FUNCTION call:
//    - `model()` is a mongoose function that creates a model
//    - `<IUser>` is a TypeScript generic parameter telling the function what shape documents will have
//    - `"User"` is the collection name in MongoDB (will be pluralized to "users")
//    - `userSchema` is the schema definition we created above
//
// 2. `: Model<IUser>` - The TYPE annotation:
//    - `Model` is a TypeScript interface/type from mongoose
//    - `<IUser>` is a generic parameter specifying the document type
//    - This tells TypeScript "UserModel is a Model that works with IUser documents"
//
// 3. Why `<IUser>` appears twice?
//    - First `<IUser>` (in function): tells the function what type of documents to expect
//    - Second `<IUser>` (in type): tells TypeScript what type the variable holds
//    - They ensure type consistency between the model creation and usage
//
// Result: UserModel is now a typed model that provides autocomplete and type checking
// when you do operations like UserModel.find(), UserModel.create(), etc.
export const UserModel: Model<IUser> = model<IUser>("User", userSchema);

// Difference between Model and model:
// - `Model` (capital M) is a TypeScript TYPE/INTERFACE from mongoose
//   It represents the type of a Mongoose model (used for type annotations)
// - `model` (lowercase m) is a FUNCTION from mongoose
//   It creates an actual Mongoose model instance from a schema
//
// Example:
// const UserModel: Model<IUser> = model<IUser>("User", userSchema);
//                  ^^^^^          ^^^^^
//                  TYPE           FUNCTION
