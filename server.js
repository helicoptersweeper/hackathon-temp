const {
    initializeApp
} = require('firebase/app')
const {
    getFirestore,
    collection,
    addDoc
} = require('firebase/firestore')

const express = require('express')
const app = express()

const API_KEY = 'bbf6602987ba045f06b64a1e8d428b1f'

const firebaseConfig = {
    apiKey: "AIzaSyD0ODZxE3q9UmCDGIvCLNIXbGqCjFFv_lE",
    authDomain: "weather-app-6e36e.firebaseapp.com",
    projectId: "weather-app-6e36e",
    storageBucket: "weather-app-6e36e.firebasestorage.app",
    messagingSenderId: "98556691216",
    appId: "1:98556691216:web:496dcb84e11e28126c5b95",
    measurementId: "G-CWP3J054FT"
}

const fbApp = initializeApp(firebaseConfig);
const db = getFirestore(app);

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
    res.render("index", {
        weather: null,
        error: null
    })
})

// Bug fixes:
// - Made the whole handler async so we can properly await each step
// - Removed global lat/lon, now they're local to each request
// - getCoords and getWeather merged into one clean try/catch flow
// - Fixed getWeather fetching geoURL instead of weaURL
// - Switched from One Call API 3.0 (paid) to data/2.5/weather (free)
// - Fixed res.send("view", data) -> res.render("view", data)
// - Removed the bad `const res = require('express/lib/response')` line
app.post('/weather', async (req, res) => {
    const cityname = req.body.cityname

    try {
        // Get coordinates for the city
        const geoURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityname}&appid=${API_KEY}`
        const geoResponse = await fetch(geoURL)
        const geoData = await geoResponse.json()

        if (!geoData || geoData.length === 0) {
            return res.render("index", {
                weather: null,
                error: "City not found. Please try again."
            })
        }

        const lat = geoData[0].lat
        const lon = geoData[0].lon

        // Fetch the actual weather
        const weaURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        const weaResponse = await fetch(weaURL)
        const weaData = await weaResponse.json()

        const weather = {
            city: cityname,
            description: weaData.weather[0].description,
            temp: Math.round(weaData.main.temp),
            feels_like: Math.round(weaData.main.feels_like),
            humidity: weaData.main.humidity,
            wind: weaData.wind.speed
        }

        res.render("index", {
            weather,
            error: null
        })

        await addDoc(collection(db, "test"), {
            city: weather.city,
            temp: weather.temp
        });
        console.log("Success!");

    } catch (error) {
        console.error(error)
        res.render("index", {
            weather: null,
            error: "Something went wrong. Please try again."
        })
    }
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})