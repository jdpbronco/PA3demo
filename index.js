const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());

let connection = null;

async function query(sql, params) {
    if (null === connection) {
        console.log("Here");
        connection = await mysql.createConnection({
            host: "student-databases.cvode4s4cwrc.us-west-2.rds.amazonaws.com",
            user: "JOSHPULSIPHER",
            password: "k0XVG8esgUnfKocy8UgDsYeMEh4hAwbAOnV",
            database: 'JOSHPULSIPHER'
        });
    }
    return new Promise((resolve, reject) => {
        connection.execute(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

app.post("/api/sensor", async (req, res) => {
    console.log(req.body);

    const { sensorReading, temperature } = req.body;

    if (
        !Number.isInteger(sensorReading) ||
        sensorReading < 0 ||
        sensorReading > 1023
    ) {
        return res.status(400).json({ error: "Invalid sensor reading" });
    }

    if (
        typeof temperature !== "number" ||
        !Number.isFinite(temperature) ||
        temperature < -50 ||
        temperature > 150
    ) {
        return res.status(400).json({ error: "Invalid temperature" });
    }

    try {
        await query("INSERT INTO arduino_data (sensor_reading, temperature) VALUES (?, ?)", 
            [sensorReading, temperature]);
         
        res.json({
            message: "Sensor data received"
    });
    } catch (error) {
        console.error("Error inserting sensor data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
   
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
