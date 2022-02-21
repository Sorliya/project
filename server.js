const http = require('http');
const express = require('express');
const bodyParser = require('body-parser')
const fs = require('fs');

const PORT = 3000;
const DATABASE_FILE = "database.json";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var data = JSON.parse(fs.readFileSync(DATABASE_FILE, 'utf8'));

const getDate = () => {
    return new Date().toJSON().slice(0, 10);
}

// handle task 1
app.post('/orders/', function (req, res) {
    const idx = Object.keys(data).length;
    const { title, type, customer } = req.body;
    console.log(`order ${idx} added.`);
    data[idx] = {
        "id": idx,
        "title": title,
        "type": type,
        "customer": customer,
        "date": getDate()
    }
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(data));
    return res.status(200).json({});
})

// handle task 2
app.get('/orders/:id', function (req, res) {
    const { id, } = req.params;
    if (id in data) {
        return res.status(200).send(data[id]);
    }
    return res.status(400).send({ error: 'Invalid index.' });
})

// handle task 3
app.get('/orders/:type/:date', function (req, res) {
    const { type, date } = req.params;
    const dateStr = [date.substring(0, 4), date.substring(4, 6), date.substring(6, 8)].join('-');
    var count = 0;
    var orders = [];
    var related_customers = new Set([]);

    for (const [id, order] of Object.entries(data)) {
        if (order.date === dateStr && order.type === type) {
            count += 1;
            related_customers.add(order.customer);
            orders.push(id);
        }
    }

    return res.status(200).json({
        "type": type,
        "count": count,
        "orders": orders.slice(-10),
        "related_customers": Array.from(related_customers)
    });
})

const server = app.listen(PORT, () => {
    console.log(`Backend is now listening on PORT ${PORT}.`);
})

