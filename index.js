const express = require("express");
const app = express();
const cors = require("cors");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoute");
const categoryRoutes = require("./routes/categoryRoute");
const reviewRoutes = require("./routes/reviewRoute");
const bannerRoutes = require("./routes/bannerRoute");
const productRoutes = require("./routes/productRoute");
const cartRoutes = require("./routes/cartRoute");
const orderRoutes = require("./routes/orderRoute");
const offerRoutes = require("./routes/offerRoute");

const port = process.env.POST || 4321;
const {
  createPayment,
  executePayment,
  queryPayment,
  searchTransaction,
  refundTransaction,
} = require("bkash-payment");

// middle wear
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://shop-sphere-client-zeta.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

const bkashConfig = {
  base_url: "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
  username: "01770618567",
  password: "D7DaC<*E*eG",
  app_key: "0vWQuCRGiUX7EPVjQDr0EUAYtc",
  app_secret: "jcUNPBgbcqEDedNKdvE4G1cAK7D3hCjmJccNPZZBq96QIxxwAMEx",
};

connectDB();

// Routes
app.use("/user", userRoutes);
app.use("/category", categoryRoutes);
app.use("/review", reviewRoutes);
app.use("/banner", bannerRoutes);
app.use("/product", productRoutes);
app.use("/cart", cartRoutes);
app.use("/order", orderRoutes);
app.use("/offer", offerRoutes);

// jwt api
app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = await jwt.sign(user, process.env.SECRET_TOKEN, {
    expiresIn: "1h",
  });
  res.send({ token });
});

// bkash payment integration
app.post("/bkash-checkout", async (req, res) => {
  try {
    const { amount, callbackURL, orderID, reference } = req.body;
    const paymentDetails = {
      amount: amount || 10,
      callbackURL: callbackURL,
      orderID: orderID,
      reference: reference || "1",
    };
    const result = await createPayment(bkashConfig, paymentDetails);
    res.status(200).send(result?.bkashURL);
  } catch (e) {
    console.log(e);
  }
});

app.get("/bkash-callback", async (req, res) => {
  try {
    const { status, paymentID } = req.query;
    let result;
    let response = {
      statusCode: "4000",
      statusMessage: "Payment Failed",
    };
    if (status === "success")
      result = await executePayment(bkashConfig, paymentID);

    if (result?.transactionStatus === "Completed") {
      // payment success
      // insert result in your db
    }
    if (result)
      response = {
        statusCode: result?.statusCode,
        statusMessage: result?.statusMessage,
      };
    // You may use here WebSocket, server-sent events, or other methods to notify your client
    res.redirect("http://localhost:5173");
  } catch (e) {
    console.log(e);
  }
});
// Add this route under admin middleware
app.post("/bkash-refund", async (req, res) => {
  try {
    const { paymentID, trxID, amount } = req.body;
    const refundDetails = {
      paymentID,
      trxID,
      amount,
    };
    const result = await refundTransaction(bkashConfig, refundDetails);
    res.send(result);
  } catch (e) {
    console.log(e);
  }
});

app.get("/bkash-search", async (req, res) => {
  try {
    const { trxID } = req.query;
    const result = await searchTransaction(bkashConfig, trxID);
    res.send(result);
  } catch (e) {
    console.log(e);
  }
});

app.get("/bkash-query", async (req, res) => {
  try {
    const { paymentID } = req.query;
    const result = await queryPayment(bkashConfig, paymentID);
    res.send(result);
  } catch (e) {
    console.log(e);
  }
});

app.get("/", (req, res) => {
  res.send("Shop sphere is running");
});

app.listen(port, () => {
  console.log(`Shop sphere is running on port: ${port}`);
});
