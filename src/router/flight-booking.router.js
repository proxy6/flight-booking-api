const { ConfirmFlightAvailability, GetAvailableFlights, MakePayment, VerifyPayment } = require('../controller/flight-booking.controller')

const router = require('express').Router()

router.post('/', GetAvailableFlights)
router.post('/confirm', ConfirmFlightAvailability)
router.post('/payment', MakePayment)
router.post('/verify-payment', VerifyPayment)

module.exports = router