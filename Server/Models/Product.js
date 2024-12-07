const mongoose = require("mongoose");
const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    productImage: String,
    productGallery: [String], //URLs or files
    tags: [String],
    price: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        default: "NGN"
    },
    category: {
        type: String,
        enum: [
            "General",
            "electronics",
            "Fashion",
            "health and wellness",
            "home and kitchen",
            "sports and outdoors",
            "books",
            "travel and leisure",
            "office supplies",
            "automotive"
        ],
        default: "General",
        required: true
    },
    subCategory: String,
    tags: [String],
    amountInStock: {
        type: Number,
        default: 0
    },
    amountSold: {
        type: Number,
        default: 0
    },
    rating: [
        {
            type: Number,
            default: 0
        }
    ],
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            author: mongoose.Schema.Types.ObjectId,
            ref: "User",
            type: String,
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],
    variations: [
        {
            sizes: String,
            color: String,
            price: Number,
            stock: Number
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Product = new mongoose.model("Product", ProductSchema);
module.exports = Product;
