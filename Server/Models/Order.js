const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Products"
            },
            vendorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            size: {
                type: String,
                default: "default"
            },
            color: {
                type: String,
                default: "default"
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    subTotal: Number,
    tax: Number,
    shippingCost: Number,
    totalCost: Number,
    deliveryStatus: {
        type: String,
        default: "pending",
        enum: ["pending", "en route", "delivered", "delayed", "cancelled"]
    },
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipcode: String
    },
    paymentMethod: String,
    paymentStatus: {
        type: String,
        default: "pending",
        enum: ["failed", "pending", "cancelled", "paid"]
    },
    paymentDate: {
        type: Date
    },
    deliveryDate: Date,
    orderDate: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const Order = new mongoose.model("Order", OrderSchema);
module.exports = Order;
