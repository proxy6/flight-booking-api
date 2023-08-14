const makePaymentMockData = {
    "flightOffers": [
                {
                    "type": "flight-offer",
                    "id": "1",
                    "source": "GDS",
                    "instantTicketingRequired": false,
                    "nonHomogeneous": false,
                    "paymentCardRequired": false,
                    "lastTicketingDate": "2023-08-13",
                    "itineraries": [
                        {
                            "segments": [
                                {
                                    "departure": {
                                        "iataCode": "JFK",
                                        "terminal": "4",
                                        "at": "2023-11-01T23:05:00"
                                    },
                                    "arrival": {
                                        "iataCode": "MAD",
                                        "terminal": "1",
                                        "at": "2023-11-02T11:10:00"
                                    },
                                    "carrierCode": "UX",
                                    "number": "92",
                                    "aircraft": {
                                        "code": "788"
                                    },
                                    "operating": {
                                        "carrierCode": "UX"
                                    },
                                    "duration": "PT7H5M",
                                    "id": "45",
                                    "numberOfStops": 0
                                }
                            ]
                        }
                    ],
                    "price": {
                        "currency": "EUR",
                        "total": "289.41",
                        "base": "78.00",
                        "fees": [
                            {
                                "amount": "0.00",
                                "type": "SUPPLIER"
                            },
                            {
                                "amount": "0.00",
                                "type": "TICKETING"
                            },
                            {
                                "amount": "0.00",
                                "type": "FORM_OF_PAYMENT"
                            }
                        ],
                        "grandTotal": "289.41",
                        "billingCurrency": "EUR"
                    },
                    "pricingOptions": {
                        "fareType": [
                            "PUBLISHED"
                        ],
                        "includedCheckedBagsOnly": false
                    },
                    "validatingAirlineCodes": [
                        "UX"
                    ],
                    "travelerPricings": [
                        {
                            "travelerId": "1",
                            "fareOption": "STANDARD",
                            "travelerType": "ADULT",
                            "price": {
                                "currency": "EUR",
                                "total": "289.41",
                                "base": "78.00",
                                "taxes": [
                                    {
                                        "amount": "182.87",
                                        "code": "YQ"
                                    },
                                    {
                                        "amount": "5.12",
                                        "code": "AY"
                                    },
                                    {
                                        "amount": "19.30",
                                        "code": "US"
                                    },
                                    {
                                        "amount": "4.12",
                                        "code": "XF"
                                    }
                                ],
                                "refundableTaxes": "5.12"
                            },
                            "fareDetailsBySegment": [
                                {
                                    "segmentId": "45",
                                    "cabin": "ECONOMY",
                                    "fareBasis": "ZLYO7L",
                                    "brandedFare": "LITE",
                                    "class": "Z",
                                    "includedCheckedBags": {
                                        "quantity": 0
                                    }
                                }
                            ]
                        }
                    ]
                }
    ],
    "travelers": [
      {
        "id": "1",
        "dateOfBirth": "1982-01-16",
        "name": {
          "firstName": "JORGE",
          "lastName": "GONZALES"
        },
        "gender": "MALE",
        "contact": {
          "emailAddress": "jorge.gonzales833@telefonica.es",
          "phones": [
            {
              "deviceType": "MOBILE",
              "countryCallingCode": "34",
              "number": "480080076"
            }
          ]
        },
        "documents": [
          {
            "documentType": "PASSPORT",
            "birthPlace": "Madrid",
            "issuanceLocation": "Madrid",
            "issuanceDate": "2015-04-14",
            "number": "00000000",
            "expiryDate": "2025-04-14",
            "issuanceCountry": "ES",
            "validityCountry": "ES",
            "nationality": "ES",
            "holder": true
          }
        ]
      }
    ]
}

const makePaymentMockResponse = {
    "status": true,
    "message": "Payment Initiated.",
    "data": {
        "uId": "mock-db-uid",
        "paymentLink": "https://mock-payment.com"
    }
}
const mockRejectedResponse = {
    status: false,
    message: 'Payment Failed. Please try again later.',
    error: 'Conversion failed'
  }
  const mockVerifyPaymentResponse = {
    data: {
        type: "flight-order",
        id: "eJzTd9cPCTU3MbMAAAruAig%3D",
        queuingOfficeId: "NCE4D31SB",
        associatedRecords: [{reference: "TU7468"}],
        flightOffers: [{type: "flight-offer"}],
        travelers: [{type: "flight-offer"}]
    }
}

const mockBookedResponse = {
        type: "flight-order",
        id: "eJzTd9cPCTU3MbMAAAruAig%3D",
        queuingOfficeId: "NCE4D31SB",
        associatedRecords: [{reference: "TU7468"}],
        flightOffers: [{type: "flight-offer"}],
        travelers: [{type: "flight-offer"}]
}
module.exports = {
    makePaymentMockData,
    makePaymentMockResponse,
    mockRejectedResponse,
    mockVerifyPaymentResponse,
    mockBookedResponse
}