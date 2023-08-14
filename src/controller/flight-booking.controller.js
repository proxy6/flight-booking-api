const express = require('express');
const Flights = require('../service/flight-booking.service');
const {getAvailableFlights, confirmFlightAvailability, makePayment, verifyPayment} = require('../utils/validations');
module.exports = {
    GetAvailableFlights: async (req, res) => {
        const { error, value } = getAvailableFlights.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        //convert date to ISO 
        const isoDate = value.date.toISOString().split('T')[0];
        value.date = isoDate;
        const flights = await Flights.GetAvailableFlights(value)
        if (flights) return res.status(201).json({ ...flights });
    },

    ConfirmFlightAvailability: async (req, res) => {
        //check for validations
        const { error, value } = confirmFlightAvailability.validate(req.body);
        if (error) {
            return res.status(400).json(error.details);
        }
        const flight = await Flights.ConfirmFlightAvailability(value)
        if (flight.length  == 0) return res.status(404).json({ data: 'No data found' })
        res.status(201).json({ data: flight })
    },
    MakePayment: async (req, res)=>{
        try{
            //check for validations
            const { error, value } = makePayment.validate(req.body);

            if (error) {
                return res.status(400).json(error.details);
            }
            const payment = await Flights.MakePayment(value)
            if (!payment) return res.status(404).json({ data: 'Payment Failed' })
            res.status(201).json({...payment })
        }catch(error){
            return { status: false, message: 'Payment Failed. Please try again later.', error: error.message };
        }
  
    },

    VerifyPayment: async (req, res)=>{

        //uncomment this block of code is here you host this API online and have a database and paystack callback url
        // const ref = req.query.reference;
        // if(ref){
        //   paymentRef = ref;
        // }
        //
        //check for validations
        const { error, value } = verifyPayment.validate(req.body);

        if (error) {
            return res.status(400).json(error.details);
        }
        let paymentRef = value.paymentRef
        const payment = await Flights.VerifyPayment(paymentRef)
        res.status(201).json({ ...payment })
    }
}