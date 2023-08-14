const router = require('express').Router()
const flightRouter = require('./flight-booking.router')

router.get('/', (req, res) => {
    res.send('Welcome to Flight Booking Api')
})

router.use('/flights', flightRouter)


module.exports = router