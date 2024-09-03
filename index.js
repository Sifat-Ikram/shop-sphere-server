const express = require("express");
const app = express();
const cors = require("cors");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.POST || 4321;
const {
  createPayment,
  executePayment,
  queryPayment,
  searchTransaction,
  refundTransaction,
} = require("bkash-payment");

// middle wear
app.use(cors());
app.use(express.json());

const bkashConfig = {
  base_url: "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
  username: "01770618567",
  password: "D7DaC<*E*eG",
  app_key: "0vWQuCRGiUX7EPVjQDr0EUAYtc",
  app_secret: "jcUNPBgbcqEDedNKdvE4G1cAK7D3hCjmJccNPZZBq96QIxxwAMEx",
};

const verifyToken = (req, res, next) => {
  // console.log("inside middleware", req.headers.authorization);
  if (!req.headers.authorization) {
    return res.status(401).send({ message: "Access forbidden" });
  }
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, process.env.SECRET_TOKEN, (error, decoded) => {
    if (error) {
      return res.status(401).send({ message: "Access forbidden" });
    }
    req.decoded = decoded;
    next();
  });
};

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrqljyn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("uniShop").collection("products");
    const categoryCollection = client.db("uniShop").collection("categories");
    const userCollection = client.db("uniShop").collection("user");
    const reviewCollection = client.db("uniShop").collection("review");
    const cartCollection = client.db("uniShop").collection("cart");
    const orderCollection = client.db("uniShop").collection("order");
    const offerCollection = client.db("uniShop").collection("offer");

    // middleware again

    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "Access forbidden" });
      }
      next();
    };

    // jwt api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = await jwt.sign(user, process.env.SECRET_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // user api
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/user", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.get("/user/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "Access Unauthorized" });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    app.patch("/user/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // category api
    app.get("/category", async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    // review api
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const reviewItem = req.body;
      const result = await reviewCollection.insertOne(reviewItem);
      res.send(result);
    });

    // Route to handle liking a review
    app.post("/review/:id/like", async (req, res) => {
      const { id } = req.params;

      try {
        const review = await reviewCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!review)
          return res.status(404).json({ message: "Review not found" });

        const updatedReview = await reviewCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { likes: 1 } },
          { returnOriginal: false }
        );

        res.status(200).json(updatedReview.value);
      } catch (error) {
        res.status(500).json({ message: "Error liking review" });
      }
    });

    app.post("/review/:id/dislike", async (req, res) => {
      const { id } = req.params;

      try {
        const review = await reviewCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!review)
          return res.status(404).json({ message: "Review not found" });

        const updatedReview = await reviewCollection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $inc: { dislikes: 1 } },
          { returnOriginal: false }
        );

        res.status(200).json(updatedReview.value);
      } catch (error) {
        res.status(500).json({ message: "Error disliking review" });
      }
    });

    app.post('/review/:id/replies', async (req, res) => {
      const { id } = req.params;
      const { replyText, replyUser } = req.body;
    
      try {
        const updatedReview = await reviewCollection.updateOne(
          { _id: new ObjectId(id) },
          { $push: { replies: { replyText, replyUser, createdAt: new Date() } } }
        );
    
        if (updatedReview.modifiedCount === 0) {
          return res.status(404).json({ message: 'Review not found' });
        }
    
        const review = await reviewCollection.findOne({ _id: new ObjectId(id) });
        res.status(200).json(review);
      } catch (error) {
        res.status(500).json({ message: 'Error adding reply' });
      }
    });

    // product api
    app.get("/product", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    app.post("/product", async (req, res) => {
      const productItem = req.body;
      const result = await productCollection.insertOne(productItem);
      res.send(result);
    });

    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    app.patch("/product/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          image: item.image,
          name: item.name,
          type: item.type,
          category: item.category,
          price: item.price,
          rating: item.rating,
          brand: item.brand,
          details: item.details,
        },
      };

      const result = await productCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // cart api
    app.get("/cart", async (req, res) => {
      const email = req.query.email;
      const admin = req.query.admin;
      let query = {};
      if (email) {
        query.email = email;
      } else {
        query.admin = admin;
      }
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = cartCollection.deleteOne(query);
      res.send(result);
    });

    //final order
    app.post("/order", async (req, res) => {
      const orderItem = req.body;
      const result = await orderCollection.insertOne(orderItem);
      res.send(result);
    });

    app.get("/order", async (req, res) => {
      const email = req.query.email;
      const admin = req.query.admin;
      let query = {};
      if (email) {
        query.email = email;
      } else {
        query.admin = admin;
      }
      const result = await orderCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/order", verifyAdmin, async (req, res) => {
      const result = await orderCollection.find().toArray();
      res.send(result);
    });

    app.patch("/order/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          status: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
          deliveryDate: updatedOrder.deliveryDate,
        },
      };

      const result = await orderCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = orderCollection.deleteOne(query);
      res.send(result);
    });

    // special offers
    app.get("/offer", async (req, res) => {
      const result = await offerCollection.find().toArray();
      res.send(result);
    });

    //bkash payment integration
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

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Shop sphere is running");
});

app.listen(port, () => {
  console.log(`Shop sphere is running on port: ${port}`);
});
