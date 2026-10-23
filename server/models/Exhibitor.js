import mongoose from "mongoose";

// Exhibitor ki products ki list. Alag collection nahi, profile ke andar hi rehti hain
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name must be at most 100 characters"]
    },
    description: {
      type: String,
      trim: true,
      default: ""
    }
  },
  { _id: false }
);

const exhibitorSchema = new mongoose.Schema(
  {
    // Kis user ka profile hai. unique:true ki wajah se ek user ka sirf ek profile ban sakta hai
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [150, "Company name must be at most 150 characters"]
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true
    },
    // Logo ka URL path, jaise /uploads/logos/abc.png
    logo: {
      type: String,
      default: ""
    },
    products: {
      type: [productSchema],
      default: []
    },
    // Admin approve ya reject karta hai. Exhibitor khud ise nahi badal sakta
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

// Public list approvalStatus aur category se filter hoti hai
exhibitorSchema.index({ approvalStatus: 1, category: 1 });

const Exhibitor = mongoose.model("Exhibitor", exhibitorSchema);

export default Exhibitor;