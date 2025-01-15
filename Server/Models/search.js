const mongoose = require('mongoose')
const searchSchema = new mongoose({
  searchTerm: String,
  searchResults: [{
    // _id: {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: products
    },
    matchPoint: {
      type: String,
      enum: ["tags", "name", "description"]
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
})
const Search = new mongoose.model("Search", searchSchema);
module.exports = Search;
