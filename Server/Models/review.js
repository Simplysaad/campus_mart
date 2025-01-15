const reviewSchema = {
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: products
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: users
  },
  rating: Number,
  review: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}

const  Review = new mongoose.model("Review", reviewSchema);
module.exports = Review;
