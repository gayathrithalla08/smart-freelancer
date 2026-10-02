const db = require("./db");

const clients = db.prepare("SELECT * FROM clients").all();

console.log(clients);