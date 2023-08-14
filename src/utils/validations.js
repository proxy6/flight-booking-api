const Joi = require('joi');
const getAvailableFlights = Joi.object({
    departureCity: Joi.string().required(),
    destinationCity: Joi.string().required(),
    date: Joi.date().iso().required(),
  });

const segmentSchema = Joi.object({
    departure: Joi.object({
        iataCode: Joi.string().required(),
        terminal: Joi.string(),
        at: Joi.string().isoDate().required()
    }).required(),
    arrival: Joi.object({
        iataCode: Joi.string().required(),
        terminal: Joi.string(),
        at: Joi.string().isoDate().required()
    }).required(),
    carrierCode: Joi.string().required(),
    number: Joi.string().required(),
    aircraft: Joi.object({
        code: Joi.string()
    }),
    operating: Joi.object({
        carrierCode: Joi.string().required()
    }),
    duration: Joi.string(),
    numberOfStops: Joi.number(),
    id: Joi.string().required()
});

const itinerarySchema = Joi.object({
    segments: Joi.array().items(segmentSchema).required()
});

const travelerPricingSchema = Joi.object({
    travelerId: Joi.string().required(),
    fareOption: Joi.string().required(),
    travelerType: Joi.string().required(),
    fareDetailsBySegment: Joi.array().items(Joi.object({
        segmentId: Joi.string().required()
    })).required()
});

const flightOfferSchema = Joi.object({
    type: Joi.string().valid('flight-offer').required(),
    id: Joi.string().required(),
    source: Joi.string().required(),
    itineraries: Joi.array().items(itinerarySchema).required(),
    validatingAirlineCodes: Joi.array().items(Joi.string().required()).required(),
    travelerPricings: Joi.array().items(travelerPricingSchema).required()
});
const priceSchema = Joi.object({
    currency: Joi.string().required(),
    total: Joi.string().required(),
    base: Joi.string().required(),
    fees: Joi.array().items(
      Joi.object({
        amount: Joi.string().required(),
        type: Joi.string().valid('SUPPLIER', 'TICKETING', 'FORM_OF_PAYMENT').required(),
      })
    ),
    taxes: Joi.array().items(
        Joi.object({
          amount: Joi.string(),
          code: Joi.string()
        })
      ),
    
    grandTotal: Joi.string(),
    billingCurrency: Joi.string(),
    refundableTaxes: Joi.string()
  });

  const travelerPricing = Joi.object({
    travelerId: Joi.string().required(),
    fareOption: Joi.string().required(),
    travelerType: Joi.string().required(),
    price: priceSchema.required(),
    fareDetailsBySegment: Joi.array().items(
      Joi.object({
        segmentId: Joi.string().required(),
        cabin: Joi.string().required(),
        fareBasis: Joi.string().required(),
        brandedFare: Joi.string().required(),
        class: Joi.string().required(),
        includedCheckedBags: Joi.object({
          quantity: Joi.number().integer().required(),
        }).required(),
      })
    ),
  });
  

const confirmFlightAvailability = Joi.object({
    data: Joi.object({
    type: Joi.string().valid('flight-offers-pricing').required(),
    flightOffers: Joi.array().items(flightOfferSchema).required()
}).required(),
});

const makePaymentOffers = Joi.object({
    type: Joi.string().required(),
    id: Joi.string().required(),
    source: Joi.string().required(),
    instantTicketingRequired: Joi.boolean(),
    nonHomogeneous: Joi.boolean(),
    paymentCardRequired: Joi.boolean(),
    lastTicketingDate: Joi.string().isoDate(),
    itineraries: Joi.array().items(
      Joi.object({
        segments: Joi.array().items(segmentSchema).required(),
      })
    ),
    price: priceSchema.required(),
    pricingOptions: Joi.object({
        fareType: Joi.array().items(Joi.string().valid('PUBLISHED')).required(),
        includedCheckedBagsOnly: Joi.boolean().required(),
      }).required(),
      validatingAirlineCodes: Joi.array().items(Joi.string()).required(),
      travelerPricings: Joi.array().items(travelerPricing).required(),
    });
    
    const travelerSchema = Joi.object({
        id: Joi.string().required(),
        dateOfBirth: Joi.string().isoDate().required(),
        name: Joi.object({
          firstName: Joi.string().required(),
          lastName: Joi.string().required(),
        }).required(),
        gender: Joi.string().valid('MALE', 'FEMALE').required(),
        contact: Joi.object({
          emailAddress: Joi.string().email().required(),
          phones: Joi.array().items(
            Joi.object({
              deviceType: Joi.string().required(),
              countryCallingCode: Joi.string().required(),
              number: Joi.string().required(),
            })
          ).required(),
        }).required(),
        documents: Joi.array().items(
            Joi.object({
              documentType: Joi.string().required(),
              birthPlace: Joi.string(),
              issuanceLocation: Joi.string(),
              issuanceDate: Joi.string().isoDate(),
              number: Joi.string().required(),
              expiryDate: Joi.string().isoDate(),
              issuanceCountry: Joi.string(),
              validityCountry: Joi.string(),
              nationality: Joi.string(),
              holder: Joi.boolean(),
            })
          ).required(),
        });
    
    const makePayment = Joi.object({
        flightOffers: Joi.array().items(makePaymentOffers).required(),
        travelers: Joi.array().items(travelerSchema).required(),
    });
    const verifyPayment = Joi.object({
        paymentRef: Joi.string().required()
    })


module.exports = {
    confirmFlightAvailability,
    getAvailableFlights,
    makePayment,
    verifyPayment
}

