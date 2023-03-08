import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import { MongoClient } from "mongodb";

// dotenv.config();
const app = express();
console.log(process.env.MONGO_URL);

const PORT = 4000;

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);

await client.connect();
console.log("Mongo is connected !!!  ");

app.get("/", function (request, response) {
  response.send("🙋‍♂️,jeeva");
});

app.post("/createroom", express.json(), function (request, response) {
  const { numberOfSeatsAvailable, amenitiesInRoom, pricePerHour, roomId } =
    request.body;
  const result = client.db("B42Mongo").collection("rooms").insertOne({
    numberOfSeatsAvailable: numberOfSeatsAvailable,
    amenitiesInRoom: amenitiesInRoom,
    pricePerHour: pricePerHour,
    roomId: roomId,
  });

  result
    ? response.send({ message: "room created successfully" })
    : response.status(404).send({ message: "not found" });
});

//Room Booking

app.post("/booking", express.json(), async function (request, response) {
  const { name, date, startingTime, endingTime, roomId } = request.body;
  const customerDb = await getCustomerbyRoomId(roomId, date);
  console.log(customerDb);
  if (customerDb) {
    response.send({ message: "Room was already booked" });
  } else {
    const result = client.db("B42Mongo").collection("booked hall").insertOne({
      name: name,
      date: date,
      startingTime: startingTime,
      endingTime: endingTime,
      roomId: roomId,
      status: "booked",
    });
    result
      ? response.send({ message: "Room successfully booked" })
      : response.status(401).send({ message: "error occured" });
  }
});

async function getCustomerbyRoomId(roomId, date) {
  return await client
    .db("B42Mongo")
    .collection("booked hall")
    .findOne({ roomId: roomId, date: date });
}

//Get All rooms
app.get("/bookedrooms", async function (request, response) {
  const result = await client
    .db("B42Mongo")
    .collection("booked hall")
    .find({})
    .toArray();
  response.send(result);
});

//customer with Datas

app.get("/customer", async function (request, response) {
  const result = await client
    .db("B42Mongo")
    .collection("booked hall")
    .find({})
    .toArray();

  response.send(result);
});
app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
