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




// router.post("/search", async (req, res) => {
//   let { searchTerm } = req.body
// 
//   let regex = new RegExp(searchTerm, gi)
//   const searchResults = product.find({
//     $or: [
//       { name: regex },
//       { description: regex },
//       { tags: regex }
//     ]
//   },
//     {
//       name: 1,
//       price: 1,
//       previewCount: -1
//     })
// 
// const newSearch = new Search({
//   searchTerm, 
//   searchResults
// })
// 
// })
const  Review = new mongoose.model("Review", reviewSchema);
module.exports = Review;
