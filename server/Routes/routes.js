
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const Product = require("../Models/Product.js");
const User = require("../Models/User.js");
const Order = require("../Models/Order.js");

const helper = require("../.././utils/helper.js");
const relatedProductsFunc = helper.relatedProductsFunc;

const locals = {
    title: "Campus Mart",
    description:
        "an incampus shopping website for school online vendors and students, to buy , sell and deliver items without hassle",
    imageUrl: "/IMG/favicon.png"
};

const ads = [
    {
        title: "cowrywise: invest in the future",
        imageUrl: "/IMG/ADS/cowrywise.jpg"
    },
    {
        title: "Termux: the terminal of the century",
        imageUrl: "/IMG/ADS/termux.jpg"
    },
    {
        title: "Barclays bank",
        imageUrl: "/IMG/ADS/barclays.jpg"
    }
];

router.get("/", async (req, res) => {
    try {
        let categories = await Product.distinct("category");

        const products = await Product.find();
        res.render("pages/index", {
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
        if (categoryName !== "Fashion") {
            categoryName = categoryName.toLowerCase();
        }

        const allProducts = await Product.find({}).exec();
        const relatedProducts = relatedProductsFunc(allProducts, 8);

        categoryName = categoryName.split("%20").join(" ");
        let categoryItems = await Product.find({
            category: categoryName
        });

        let categories = await Product.distinct("category");

        res.render("pages/category", {
            locals,
            categoryName,
            categoryItems,
            relatedProducts,
            categories
        });
    } catch (err) {
        console.log(err);
        res.json(err);
    }
});

router.get("/preview/:id", async (req, res) => {
    try {
        const allProducts = await Product.find({});
        const relatedProducts = relatedProductsFunc(allProducts, 8);
        const categories = await Product.distinct("category");

        console.log("ID:", req.params.id); // Log the ID for debugging

        let currentProduct = await Product.findOne({
            _id: req.params.id
        });

        if (!currentProduct) {
            throw new Error("No product matches that ID"); // Explicit error for debugging
        }

        // ... your existing render code ...
        res.render("pages/preview", {
            locals,
            currentProduct,
            relatedProducts,
            categories
        });
    } catch (err) {
        console.error("Error in preview route:", err); // Log the error for debugging
        res.status(500).send("Internal Server Error"); // Better error handling
    }
});

router.post("/search", async (req, res) => {
    try {
        const searchTerm = req.body.searchTerm.trim() || req.query.searchTerm;
        let regex = new RegExp(searchTerm, "gi");
        const categories = await Product.distinct("category");
        
        const allProducts = await Product.find({});
        const relatedProducts = relatedProductsFunc(allProducts, 18);
        
        const searchResults = await Product.find({
            $or: [
                {
                    description: regex
                },
                {
                    name: regex
                },
                {
                    tags: regex
                },
                {
                    category: regex
                },
                {
                    subCategory: regex
                }
            ]
        });
        if (searchResults.length === 0) {
            console.log(searchTerm, "brought no results ");
            res.render("pages/empty-search", {
                searchTerm,
                categories,
                relatedProducts,
                locals
            });
        } else {
            res.render("pages/search.ejs", {
                searchResults,
                searchTerm,
                categories,
                locals
            });
        }
    } catch (err) {
        console.error(err);
    }
});

router.post("/addCart/:id", async (req, res) => {
    try {
        // Initialize cart session
        if (!req.session.cart) {
            req.session.cart = [];
        }

        const { color, size } = req.body;
        const quantity = 1;
        const productId = req.params.id;

        // Find existing product in cart
        let currentProduct = req.session.cart.find(
            product =>
                product._id === productId &&
                product.color === color &&
                product.size === size
        );

        const productObj = await Product.findOne(
            {
                _id: new ObjectId(productId)
            },
            {
                _id: 1,
                name: 1,
                price: 1
            }
        ).lean();

        //the .lean() is used to convert the mongoose doc into a plain javascript object
        console.log("productObj", productObj);
        productObj.price = Number(productObj.price.replace(/,/g, ""));

        // Add or update product quantity
        if (!currentProduct) {
            req.session.cart.push({
                ...productObj,
                color,
                size,
                quantity
            });
        } else {
            currentProduct.quantity += quantity;
            let currentPrice = Number(currentProduct.price.replace(/,/g, ""));
            currentProduct.price = currentPrice * currentProduct.quantity;
        }

        // Redirect to cart page
        res.redirect("/cart");
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

/**when the cart route is called
 * it should get an array "cart" from the currentuser document
 * the cart includes all the items a customer bought
 * each item object the cart array contains
 * * the id of the item,
 * * the size chosen from the preview form
 * * the color chosen from the preview form
 * * the quantity ordered
 *
 * this cart should be stored in the session
 * until the user tries to checkout
 * then the cart is stored in the orders collection
 * with status corresponding to the payment and delivery stati
 */

router.get("/cart", async (req, res) => {
    const allProducts = await Product.find({});
    const relatedProducts = relatedProductsFunc(allProducts, 8);
    const categories = await Product.distinct("category");

    if (!req.session.cart) {
        req.session.cart = [];
    }

    let cartItems = req.session.cart;

    //console.log("cartItems", cartItems)

    let CART_TOTAL = 0;
    req.session.cart.forEach(item => {
        let price = Number(item.price);
        CART_TOTAL += price;
    });

    CART_TOTAL = CART_TOTAL.toLocaleString();
    res.render("pages/cart", {
        categories,
        locals,
        cartItems,
        CART_TOTAL,
        relatedProducts
    });
});

// router.get("/remove-item/:id", async(req, res)=> {

//   let productId = req.params.id
//   const {
//     color,
//     size
//   } = req.query
//   let currentProduct = req.session.cart.find(
//     (product) =>
//     product._id === productId && product.color === color && product.size === size
//   );
//   if (!currentProduct || !color || !size) {
//     currentProduct = req.session.cart.find(
//       (product) =>
//       product._id === productId
//     );
//   }

//   let index = req.session.cart.indexOf(currentProduct)

//   if (currentProduct.quantity > 1) {
//     currentProduct.quantity -= 1

//     let currentPrice = Number(currentProduct.price.replace(/,/g, ""))
//     req.session.cart[index].price = currentPrice*currentProduct.quantity

//     console.log("Cart item reduced to", currentProduct.quantity)
//   }
//   else {
//     req.session.cart.splice(index, 1)
//     console.log("Cart item deleted successfully")
//   }

//   res.redirect("/cart")

// })
module.exports = router;
