const express = require("express");
const app = express();
const cors = require("cors");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.POST || 4321;

// middle wear
app.use(cors());
app.use(express.json());


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

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jrqljyn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
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
      const token = await jwt.sign(user, process.env.JWT_SECRET, {
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

    app.patch("/user/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
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

    app.patch("/user/:id", async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: item.name,
          email: item.email,
          photoUrl: photoUrl,
          gender: item.gender,
          address: item.address,
          birthdate: item.birthdate,
          role: item.role,
        },
      };

      const result = await userCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/user/:id", verifyToken, verifyAdmin, async (req, res) => {
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
    })


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
          name: item.name,
          price: parseFloat(item.price),
          category: item.category,
          serve_time: item.serve_time,
          recipe: item.recipe,
          image: item.image,
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
        query.email = email
      } else {
        query.admin = admin;
      }
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });

    app.delete("/cart/:id", async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = cartCollection.deleteOne(query);
      res.send(result);
    });

    //final order
    app.post("/order", async(req, res) => {
      const orderItem = req.body;
      const result = await orderCollection.insertOne(orderItem);
      res.send(result);
    });

    app.get("/order", async(req, res) => {
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
    })

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