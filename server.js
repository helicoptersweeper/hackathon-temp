const express = require('express')
const res = require('express/lib/response')
const app = express()

let lat=0
let lon=0

const API_KEY = 'bbf6602987ba045f06b64a1e8d428b1f'

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get('/', (req, res) => {
    res.render("index")
})

app.post('/weather', (req, res) =>{
    const cityname = req.body.cityname
    console.log(cityname)
    const geoURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityname}&appid=${API_KEY}`

    const getCoords = async () => {
        try {
            const response = await fetch(geoURL)
            const data = await response.json()
            lat = data[0].lat
            lon = data[0].lon
            console.log(lat)
            console.log(lon)
            
        } catch (error) {
            console.error(error)
            res.send("weather", { weather: null })
        }
        

    }
    getCoords()

    const weaURL = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}`

    const getWeather = async () => {
        try {
            const response = await fetch(geoURL)
            const data = await response.json()
            
            res.send(`${data.current[0].weather}`)
            
        } catch (error) {
            console.error(error)
            res.send("weather", { weather: null })
        }
        

    }
    getWeather()

})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})