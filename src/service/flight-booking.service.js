require('dotenv').config()
const axios = require("axios");
const _ = require('lodash');
const Paystack = require('../utils/paystack')
const TempDb = require('../utils/temp-datastore');
const RateConvert  = require('../utils/rate-conversion') 
const baseurl = `${process.env.flight_baseurl}/v1`;
let authToken = null;
let tokenExpiration = 0;

module.exports = class Flights {
    static async GetAuthToken(){
        try{
            const formData = new URLSearchParams();
            formData.append('grant_type', 'client_credentials',);
            formData.append('client_secret', `${process.env.flight_secret}`);
            formData.append('client_id', `${process.env.flight_key}`);
        
            const response = await axios.post(`${baseurl}/security/oauth2/token`, formData,{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            authToken = response.data.access_token;
            tokenExpiration = Date.now() + (response.data.expires_in * 1000);
            return authToken
        }catch(error){
          if (error.response && error.response.data) {
            return {status: false, message: "An Error Occured", error: error.response.data};
          } else {
            return error; // Re-throw the original error if no error data is found
          }
        }
    }
    static async GetAvailableFlights(data) {
        const { departureCity, destinationCity, date } = data
        console.log(data)
        //check if token is still valid
        const currentTime = Date.now();
        if (!authToken || tokenExpiration <= currentTime) {
          console.log('called')
            authToken = await Flights.GetAuthToken();
            tokenExpiration = currentTime + (1799 * 1000); // Sets expiration manually if token is newly fetched
        }
        try {
            //call the api and return an array of available flights
            const formData = JSON.stringify({
                "originDestinations": [
                  {
                    "id": "1",
                    "originLocationCode": departureCity,
                    "destinationLocationCode": destinationCity,
                    "departureDateTimeRange": {
                    "date": date
                    }
                  }
                ],
                "travelers": [
                  {
                    "id": "1",
                    "travelerType": "ADULT"
                  }
                ],
                "sources": [
                  "GDS"
                ]
              });

              let config = {
                method: 'post',
                url: `${process.env.flight_baseurl}/v2/shopping/flight-offers`,
                headers: { 
                    'Authorization': `Bearer ${authToken}`, 
                    'Content-Type': 'application/json'
                },
                data : formData
              }

            const response = await axios.request(config);
            if(response.status == axios.HttpStatusCode.Ok){
                if(response.data.meta.count == 0){
                    return {
                        status: false,
                        message: "No Availble Flights Found for the Supplied Inputs"
                    }
                }
                
                return {
                    status: true,
                    message: "Flights Retrieved Successfully",
                    count: response.data.meta.count,
                    data: response.data.data
                }
            } 
            return response.data
        
        } catch (error) {
            if (error.response && error.response.data) {
              return {status: false, message: "An Error Occured", error: error.response.data};
            } else {
              return error; // Re-throw the original error if no error data is found
            }
        }
    }

    static async ConfirmFlightAvailability(formData) {
      const currentTime = Date.now();
      if (!authToken || tokenExpiration <= currentTime) {
        console.log('called')
          authToken = await Flights.GetAuthToken();
          tokenExpiration = currentTime + (1799 * 1000); // Sets expiration manually if token is newly fetched
      }
       
        try {
            //call the api and confirm if the airline is available on that particular 
            // console.log(data)
            // let formData = data
            // const formData =JSON.stringify({
            //     "data": {
            //       "type": "flight-offers-pricing",
            //       "flightOffers": [
            //         {
            //           "type": "flight-offer",
            //           "id": "1",
            //           "source": "GDS",
            //           "itineraries": [
            //                   {
            //                       "segments": [
            //                           {
            //                               "departure": {
            //                                   "iataCode": "JFK",
            //                                   "terminal": "4",
            //                                   "at": "2023-11-01T23:05:00"
            //                               },
            //                               "arrival": {
            //                                   "iataCode": "MAD",
            //                                   "terminal": "1",
            //                                   "at": "2023-11-02T11:10:00"
            //                               },
            //                               "carrierCode": "UX",
            //                               "number": "92",
                               
            //                               "operating": {
            //                                   "carrierCode": "UX"
            //                               },
                                         
            //                               "id": "45"
            //                           }
            //                       ]
            //                   }
            //               ],
            //           "validatingAirlineCodes": [
            //                   "UX"
            //           ],
            //           "travelerPricings": [
            //                   {
            //                       "travelerId": "1",
            //                       "fareOption": "STANDARD",
            //                       "travelerType": "ADULT",
                               
            //                       "fareDetailsBySegment": [
            //                           {
            //                               "segmentId": "45"
            //                           }
            //                       ]
            //                   }
            //               ]
            //         }
            //       ]
            //     }
            //   })
                
            JSON.stringify(formData);
            
              let config = {
                method: 'post',
                url: `${baseurl}/shopping/flight-offers/pricing?forceClass=false`,
                headers: { 
                    'Authorization': `Bearer ${authToken}`, 
                    'Content-Type': 'application/json',
                    'X-HTTP-Method-Override': 'GET'
                },
                data : formData
              }
            const response = await axios.request(config);
            console.log(response.data);
            return response.data.data
        
        } catch (error) {
          if (error.response && error.response.data) {
            return {status: false, message: "An Error Occured", error: error.response.data};
          } else {
            return error; // Re-throw the original error if no error data is found
          }
        }
    } 
    static async MakePayment(data){
        try{
         //save the flight order in a temp datastore and attach a status of reserve to it
         const status = 'reserve'
         const saveFlightOrder = await TempDb.saveData(data, status);
         console.log('saveFlightOrder')
         console.log(saveFlightOrder)
         if(!saveFlightOrder){
          return {status: false, message: "Flight Reservation Failed, Please Try again"}
        }

        //Using Lodash to format through the data that will be sent to paystack
          const paymentDetails = {
            grandTotal: _.get(data, 'flightOffers[0].price.grandTotal'),
            billingCurrency:_.get(data, 'flightOffers[0].price.billingCurrency'),
            travelers: data.travelers.map(traveler => ({
              firstName: traveler.name.firstName,
              lastName: traveler.name.lastName,
              email: _.get(traveler, 'contact.emailAddress'),
              phoneNumber: _.get(traveler, 'contact.phones[0].number'),
            }))
          };

          // attach data and metadata for paystack
          paymentDetails.email = paymentDetails.travelers[0].email,
          paymentDetails.first_name = paymentDetails.travelers[0].firstName,
          paymentDetails.last_name = paymentDetails.travelers[0].lastName,
          paymentDetails.phone =  paymentDetails.travelers[0].phoneNumber
          paymentDetails.metadata = {
            flightOrderUid: saveFlightOrder
        }

        //check the currency and convert to the appropriate naira value
        const baseCurrency = paymentDetails.billingCurrency;
        const convertedCurrency = "NGN";
        const amount = paymentDetails.grandTotal;
        
        const convertedAmount = await RateConvert.convert(baseCurrency, convertedCurrency, amount);
        console.log("convertedAmount")
        console.log(convertedAmount)
        if (convertedAmount != null) {
          paymentDetails.amount = Math.ceil(convertedAmount * 100);
        } else {
            //return the Failed response with the flightOrder Uid in database
            return {status: false, message: "Flight Reservation Payment Failed, Please Try again", data: {uId:saveFlightOrder}, error: `"${convertedCurrency}" Conversion currency not found for the conversion currencies.`}
        }
       
        const paymentLink = await Paystack.makePayment(paymentDetails);
        console.log("paymentLink")
        console.log(paymentLink)
        return { status: true, message: 'Payment Initiated.', data: {uId: saveFlightOrder, paymentLink}}

        }catch(error){
          console.log(error)
          return { status: false, message: 'Payment Failed. Please try again later.', error: error.message };
        }
    } 
    static async VerifyPayment(paymentRef){
        try{
          const paymentStatus = await Paystack.verifyPayment(paymentRef)
          console.log('paymentstats')
          console.log(paymentStatus)
          if(paymentStatus.data.status == true && paymentStatus.data.data.status == 'success'){
          
            //save the payment ref in db and update the status of the flight order in db
            var flightOrderUid = paymentStatus.data.data.metadata.flightOrderUid
            console.log(flightOrderUid)
            let status = 'paid'
            const savePayment = await TempDb.updateData(flightOrderUid, status, paymentRef);
            console.log('saveData')
            console.log(savePayment)
            if(!savePayment) return {status: false, message: "Failure Occured while updating entries.", data:{uId: flightOrderUid}}
                console.log(savePayment)
                 //call the Book Flight Method to Book 
                //  return savePayment
                 const flightOrder = await Flights.BookFlight(savePayment.data)
                 console.log('bookflight')
                 console.log(flightOrder)
                 if(flightOrder){
                  return flightOrder
                 }
            
          }else{
            return {status: false, message: "Payment Pending or Failed", data:{uId: flightOrderUid}}
          }
          
     
        }catch(error){
            console.error('Error:', error.message);
            return error
        }
    }
    static async BookFlight(data) {
      const currentTime = Date.now();
      if (!authToken || tokenExpiration <= currentTime) {
        console.log('called')
          authToken = await Flights.GetAuthToken();
          tokenExpiration = currentTime + (1799 * 1000); // Sets expiration manually if token is newly fetched
      }
        try {
         
          const formData = {
            data:{
              type: "flight-order",
              flightOffers: data.flightOffers,
              travelers: data.travelers,
              remarks: {
                general: [
                  {
                    subType: "GENERAL_MISCELLANEOUS",
                    text: "ONLINE BOOKING FROM INCREIBLE VIAJES"
                  }
                ]
              },
              ticketingAgreement: {
                option: "DELAY_TO_CANCEL",
                delay: "6D"
              },
              contacts: [
                {
                  addresseeName: {
                    firstName: "PABLO",
                    lastName: "RODRIGUEZ"
                  },
                  companyName: "INCREIBLE VIAJES",
                  purpose: "STANDARD",
                  phones: [
                    {
                      deviceType: "LANDLINE",
                      countryCallingCode: "34",
                      number: "480080071"
                    },
                    {
                      deviceType: "MOBILE",
                      countryCallingCode: "33",
                      number: "480080072"
                    }
                  ],
                  emailAddress: "support@increibleviajes.es",
                  address: {
                    lines: [
                      "Calle Prado, 16"
                    ],
                    postalCode: "28014",
                    cityName: "Madrid",
                    countryCode: "ES"
                  }
                }
              ]

            }
          }
          
     
          let config = {
                method: 'post',
                url: `${baseurl}/booking/flight-orders`,
                headers: { 
                    'Authorization': `Bearer ${authToken}`, 
                    'Content-Type': 'application/json'
                },
                data: formData
              }
            const response = await axios.request(config);
            console.log(response.data);
            return response.data
        
        } catch (error) {
          if (error.response && error.response.data) {
            return {status: false, message: "An Error Occured", error: error.response.data};
          } else {
            return error; // Re-throw the original error if no error data is found
          }
        }
    }   
}