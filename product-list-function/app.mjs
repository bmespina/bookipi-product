import 'dotenv/config';
import { MongoClient, ObjectId } from "mongodb";

const database = process.env.DATABASE;
const conn_string = process.env.MONGODB_CONNECTION_STRING;
const clientDB = new MongoClient(conn_string, {
  maxPoolSize: 50,         // Reduced from 100 for better resource management
  minPoolSize: 5,          // Keep some connections ready
  maxConnecting: 10,       // Reasonable connection establishment during spikes
  maxIdleTimeMS: 60000,    // Close idle connections after 1 minute
  waitQueueTimeoutMS: 5000 // Fail fast if connections aren't available
});

/*
sample product document:
[
  {
    "_id": ObjectId("6510f0c4e1b1c8b4d6f0a1b2"),
    "name": "Smartphone",
    "sku": "Galaxy S24",
    "description": "A high-end smartphone with a sleek design and powerful features.",
    "price": 699.99,
    "category": "mobile",
    "status": "active",
    "stock": 50,
    "provider": "Samsung",
    "imageUrl": "https://example.com/images/galaxy-s24.jpg",
    "promotions": [
      {
        "type": "percentage",
        "value": 10,
        "startDate": "2023-09-01T00:00:00Z",
        "endDate": "2023-09-15T23:59:59Z"
      }
    ],
    "_id": ObjectId("6510f0c4e1b1c8b4d6f0a1b2"),
    "createdAt": "2023-10-01T10:00:00Z",
    "updatedAt": "2023-10-01T10:00:00Z"
  }
]
*/

const collectionUser = clientDB
      .db(database)
      .collection('users');

const collectionProducts = clientDB
      .db(database)
      .collection("products");

export const lambdaHandler = async (event, context) => {
  try {
    const user_collection = await collectionUser.findOne({_id: ObjectId(event.crypto)});
    if (!user_collection) {
      return {StatusCode: 404, body: {message: `User with ID ${event.user_id} not found.`}};
    }
    const product_collection = await queryProducts(event);
    return {StatusCode: 200, body: {message: product_collection}};
  } catch (err) {
    console.log(`General error. Error: ${err.message}`)
    return {StatusCode: 500, body: {message: err.message}};
  }
};

async function queryProducts(event) {
  const product_collection = await collectionUser.find({category: event.status}).toArray();

  console.log(`Product found: ${JSON.stringify(product_collection)}`);
  return product_collection;
};
