const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../Models/Product.js");
const User = require("../Models/User.js");
const Order = require("../Models/Order.js");
const Search = require("../Models/Search.js");
const Review = require("../Models/Review.js");

const { relatedProductsFunc } = require("../Utils/helper.js");

const locals = {
  title: "Campus Mart",
  description:
    "an incampus shopping website for school online vendors and students, to buy , sell and deliver items without hassle",
  imageUrl: "/IMG/favicon.png"
};

const ads = [
  {
    title: "cowrywise: invest in the future",
    imageUrl: "https://via.placeholder.com/300"
  },
  {
    title: "Termux: the terminal of the century",
    imageUrl: "https://via.placeholder.com/300"
  },
  {
    title: "Barclays bank",
    imageUrl: "https://via.placeholder.com/300"
  }
];

router.get("/", async (req, res) => {
  try {
    const products = await Product.find(
      {},
      {
        _id: 1,
        productImage: 1,
        name: 1,
        category: 1,
        price: 1,
        currency: 1
      }
    );
    const categories = await Product.distinct("category");

    res.render("Pages/index", {
      locals,
      ads,
      categories,
      products
    });
  } catch (err) {
    console.error(err);
  }
});
router.get("/category/:category", async (req, res) => {
  try {
    let categoryName = req.params.category;
    categoryName = categoryName.split("%20").join(" ");

    const allProducts = await Product.find({});
    const relatedProducts = relatedProductsFunc(allProducts, 8);
    const categories = await Product.distinct("category");

    let regex = new RegExp(categoryName, "gi");

    let categoryItems = await Product.find({
      category: regex
    });

    res.render("Pages/category", {
      locals,
      categoryName,
      categoryItems,
      relatedProducts,
      categories
    });
  } catch (err) {
    console.error(err);
    res.json(err);
  }
});

router.get("/preview/:id", async (req, res) => {
  try {
    const allProducts = await Product.find({});
    const relatedProducts = relatedProductsFunc(allProducts, 8);
    const categories = await Product.distinct("category");

    let currentProduct = await Product.findOne({
      _id: req.params.id
    });

    if (!currentProduct) {
      throw new Error("No product matches that ID"); // Explicit error for debugging
    }

    res.render("Pages/preview", {
      locals,
      currentProduct,
      relatedProducts,
      categories
    });
  } catch (err) {
    console.error("Error in preview route:", err);
    res.status(500).send("Internal Server Error");
    // res.status(500).render("Pages/500");
  }
});

router.post("/search", async (req, res) => {
  try {
    const allProducts = await Product.find({});
    const relatedProducts = relatedProductsFunc(allProducts, 18);
    const categories = await Product.distinct("category");

    const symbols = /[</>&;//]/gi
    const searchTerm = req.body.searchTerm.replace(symbols, " ").trim() || req.query.searchTerm;
    let regex = new RegExp(searchTerm, "gi");

    const searchResults = await Product.find({
      $or: [
        { description: regex },
        { name: regex },
        { tags: regex },
        { category: regex },
        { subCategory: regex }
      ]
    }, {
      name: 1,
      price: 1,
      previewCount: -1
    });

    const newSearch = new Search({
      searchTerm,
      searchResults
    })

    await newSearch.save().then(() => {
      console.log("search data saved")
    })
    // const searchResults = await Product.find({
    //     $text: {
    //         $search: searchTerm
    //     },
    //     score: { $meta: "textScore" }
    // })
    //     .sort({ score: { $meta: "textScore" } })
    //     .lean();

    if (searchResults.length === 0) {
      console.log(searchTerm, "brought no results ");
      res.render("Pages/empty-search", {
        searchTerm,
        categories,
        relatedProducts,
        locals
      });
    } else {
      res.render("Pages/search.ejs", {
        searchResults,
        searchTerm,
        categories,
        locals
      });
    }
  } catch (err) {
    console.error("Error in search route:", err);
    res.status(500).send("Internal Server Error");
    // res.status(500).render("Pages/500");
  }
});

router.get("/cart", async (req, res) => {
  try {
    const allProducts = await Product.find({});
    const relatedProducts = relatedProductsFunc(allProducts, 18);
    const categories = await Product.distinct("category");

    if (!req.session.cart) {
      req.session.cart = new Array();
    }

    //  let CART_TOTAL = 0;
    let cart = req.session.cart;
    const CART_TOTAL = cart.reduce(
      (acc, item) => acc + Number(item.price),
      0
    );
    console.log("CART_TOTAL", CART_TOTAL);
    //res.json({ CART_TOTAL, cart: req.session.cart });
    let isCartEmpty;
    if (req.session.cart.length === 0) {
      isCartEmpty = true;
    } else {
      isCartEmpty = false;
    }
    res.render("Pages/cart", {
      categories,
      locals,
      isCartEmpty,
      cartItems: req.session.cart,
      CART_TOTAL: CART_TOTAL.toLocaleString(),
      relatedProducts
    });
  } catch (err) {
    console.error(err);
  }
});

router.post("/add-cart/:id", async (req, res) => {
  try {
    if (!req.body) throw new Error(`req.body cannot be empty`);
    console.log("req.session.cart:", req.session.cart);
    if (!req.session.cart) {
      req.session.cart = new Array();
    }

    const customerId = req.session.userId;
    if (!customerId || !req.session) {
      res.redirect("/auth/login");
      throw new Error(`Customer Id not Available`);
    }

    const currentProduct = await Product.findOne(
      { _id: req.params.id },
      { name: 1, price: 1, amountInStock: 1, vendorId: 1 }
    ).lean();
    if (!currentProduct)
      throw new Error(`product with ID: ${req.params.id} not found`);

    let currentPrice = currentProduct.price; //.replaceAll(",", "");
    const { color = "default", size = "default", quantity = 1 } = req.body;

    function getPrice(obj1, obj2) {
      return Number(obj1.price * obj2.quantity);
    }
    const singleItem = {
      productId: currentProduct._id,
      color,
      size,
      quantity,
      ...currentProduct
    };

    console.log("singleItem:", singleItem);

    const cartItems = req.session.cart;
    //check if the singleItem already exists

    const itemIndex = cartItems.findIndex(
      item =>
        item.name === singleItem.name &&
        item.color === singleItem.color &&
        item.vendorId === singleItem.vendorId
    );
    if (itemIndex < 0) {
      req.session.cart.push(singleItem);
    } else {
      req.session.cart[itemIndex].quantity += singleItem.quantity;
      req.session.cart[itemIndex].price = getPrice(
        currentProduct,
        req.session.cart[itemIndex]
      );
    }

    req.session.save(err => {
      if (err) {
        throw new Error("Error encountered while savung session");
      }
    });
    res.redirect("/cart");
    //console.log("req.session.cart:", req.session.cart);
  } catch (err) {
    console.error(err);
  }
});

router.get("/remove-item/:id", async (req, res) => {
  try {
    const { color = "default", size = "default", quantity = 1 } = req.query;

    const currentProduct = req.session.cart.find(
      product => product.productId === req.params.id
      //&& product.color === color &&
      //product.size === size
    );
    if (!currentProduct)
      throw new Error(`product with ID: ${req.params.id} not found`);

    let currentPrice = currentProduct.price;
    const itemIndex = req.session.cart.indexOf(currentProduct);

    if (itemIndex >= 0) {
      const basePrice =
        req.session.cart[itemIndex].price /
        req.session.cart[itemIndex].quantity;
      console.log("basePrice", basePrice);

      req.session.cart[itemIndex].quantity -= 1;
      req.session.cart[itemIndex].price -= basePrice;

      if (req.session.cart[itemIndex].quantity < 1) {
        req.session.cart.splice(itemIndex, 1);
      }
    }

    req.session.save(err => {
      if (err) {
        throw new Error("Error encountered while savung session");
      }
    });
    res.redirect("/cart");
    //console.log("req.session.cart:", req.session.cart);
  } catch (err) {
    console.error(err);
  }
});
router.get("/*", async (req, res) => {
  try {
    //res.render("Pages/404")
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
});

router.post("/place-order", async (req, res) => {
  try {
    let cart = req.session.cart;
    const CART_TOTAL = cart.reduce(
      (acc, item) => acc + Number(item.price),
      0
    );

    const tax = CART_TOTAL * 0.02;
    const shippingCost = CART_TOTAL * 0.01;
    const totalCost = CART_TOTAL + shippingCost + tax;

    const newOrder = new Order({
      customerId: req.session.userId,
      items: req.session.cart,
      subTotal: CART_TOTAL,
      tax,
      shippingCost,
      totalCost
    });
    // console.log(newOrder.items);
    newOrder
      .save()
      .then(data => {
        console.log({
          message: "new Order added successfully",
          data
        });
        res.redirect("/");
      })
      .catch(err => {
        res.status(500).json({
          message: "error encountered while placing order",
          advice: " please try again later"
        });
        throw new Error(err);
      });

    req.session.cart = [];
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
