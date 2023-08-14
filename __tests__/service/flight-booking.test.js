const Flights = require('../../src/service/flight-booking.service');
const axios = require('axios');
const MockDate = require('mockdate');
const RateConvert = require('../../src/utils/rate-conversion')
const DB = require('../../src/utils/temp-datastore')
const Paystack = require('../../src/utils/paystack')
const {makePaymentMockData, makePaymentMockResponse,
  mockRejectedResponse, mockBookedResponse, mockVerifyPaymentResponse} = require('../../__mocks__/mock-data')


jest.mock('axios', () => ({
  create: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  request: jest.fn(),
  HttpStatusCode: jest.fn()
}));


// Mocking dotenv config and setting environment variables
jest.mock('dotenv', () => ({ config: jest.fn() }));
process.env.flight_baseurl = 'mock_baseurl';
process.env.flight_secret = 'mock_secret';
process.env.flight_key = 'mock_key';

describe('Flights', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('GetAuthToken', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should fetch and return an authentication token', async () => {
      // Mocking axios.post to return a mock response
      axios.post.mockResolvedValue({
        data: {
          access_token: 'mock_token',
          expires_in: 3600, // 1 hour in seconds
        },
      });

      const authToken = await Flights.GetAuthToken();
      console.log(authToken)
      expect(authToken).toBe('mock_token');
    });

    it('should return an error message on API error', async () => {
      // Mocking axios.post to simulate an error
      axios.post.mockRejectedValue({
        response: {
          data: 'Mock API error',
        },
      });

      const result = await Flights.GetAuthToken();
      console.log(result)
      expect(result).toEqual({
        status: false,
        message: 'An Error Occured',
        error: 'Mock API error',
      });
    });
  });

  describe('GetAvailableFlights', () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock function calls after each test
    });

    it('should fetch and return available flights', async () => {
      
      // Mocking GetAuthToken method to return a mock token
      Flights.GetAuthToken = jest.fn(() => 'mock_token');
      const mockResponse = {
        status: 200,
        data: {
          meta: { count: 2 },
          data: [{ flightInfo: 'mock_flight_1' }, { flightInfo: 'mock_flight_2' }],
        },
      };

      axios.request.mockResolvedValue(mockResponse); // Mock axios response

      const searchData = {
        departureCity: 'JFK',
        destinationCity: 'MAD',
        date: '2023-08-15',
      };

      const result = await Flights.GetAvailableFlights(searchData);

      console.log('this is a console')
      console.log(result)

      expect(result).toEqual({
        meta: { count: 2 },
        data: [{ flightInfo: 'mock_flight_1' }, { flightInfo: 'mock_flight_2' }],
      });
    });

    it('should handle no available flights', async () => {
      // Mocking GetAuthToken method to return a mock token
      Flights.GetAuthToken = jest.fn(() => 'mock_token');
      const mockResponse = {
        status: 200,
        data: {
          meta: { count: 0 },
          data: [],
        },
      };

      axios.request.mockResolvedValue(mockResponse); // Mock axios response

      const searchData = {
        departureCity: 'JFK',
        destinationCity: 'MAD',
        date: '2023-08-15',
      };

      const result = await Flights.GetAvailableFlights(searchData);

      console.log(result)
      expect(result).toEqual({
          data: [],
          meta: { count: 0 },

      });
    });

    it('should return an error message on API error', async () => {
      // Mocking GetAuthToken method to return a mock token
      Flights.GetAuthToken = jest.fn(() => 'mock_token');

      // Mocking axios.request to simulate an error
      const mockResponse = {
        response: {
          data: 'Mock API error',
        },
      };
      axios.request.mockRejectedValue(mockResponse);

      const searchData = {
        departureCity: 'JFK',
        destinationCity: 'MAD',
        isoDate: '2023-08-15',
      };

      const result = await Flights.GetAvailableFlights(searchData);

      console.log(result)
      expect(result).toEqual({
        status: false,
        message: 'An Error Occured',
        error: 'Mock API error',
      });
    });
  })
  
  describe('ConfirmFlightAvailability', () => {
          const mockData = JSON.stringify({
        data:{
          type: "mock_flight_pricing",
            flightOffers: [{ flightInfo: 'mock_flight_1' }, { flightInfo: 'mock_flight_2' }]
        }
      })
    // it('should confirm flight availability and return response', async () => {
    //   const mockToken = 'mockToken';
   
    //   const mockResponseData = {
    //         data:{
    //         type: "mock_flight_pricing",
    //         flightOffers: [{ flightInfo: 'mock_flight_1' }, { flightInfo: 'mock_flight_2' }],
    //         bookingRequirements: { flightInfo: 'mock_flight_1', flightInfo: [{ flightInfo: 'mock_flight_1' }, { flightInfo: 'mock_flight_2' }] }
    //         }
    //       }
    //   axios.request.mockResolvedValueOnce(mockResponseData);
    //   Flights.GetAuthToken = jest.fn(() => mockToken);

    //   const result = await Flights.ConfirmFlightAvailability(mockData);

    //   console.log(result)
    //   // expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
    //   //   method: 'post',
    //   //   url: expect.stringContaining('/shopping/flight-offers/pricing'),
    //   //   headers: expect.objectContaining({
    //   //     'Authorization': `Bearer ${mockToken}`,
    //   //     'Content-Type': 'application/json',
    //   //     'X-HTTP-Method-Override': 'GET'
    //   //   }),
    //   //   data: expect.any(String),
    //   // }));

    //   expect(result).toEqual(mockResponseData);
    // });

    it('should handle error when confirming flight availability', async () => {
      axios.request.mockRejectedValueOnce(new Error('Request failed'));

      const result = await Flights.ConfirmFlightAvailability(mockData);

      expect(result).toBeInstanceOf(Error);
    });
  
  });

  describe('MakePayment', () => {

    let mockConvertedValue = 2000000.50;
    let mockUid = "mock-db-uid";
    let mockPaymentLink = "https://mock-payment.com"

    beforeEach(() => {
      jest.clearAllMocks(); // Clear mock function calls after each test
    });
  
    it('should make payment and return payment details', async () => {

      const saveDataSpy = jest.spyOn(DB, 'saveData').mockResolvedValue(mockUid);
      
   
      const convertSpy = jest.spyOn(RateConvert, 'convert').mockResolvedValue(mockConvertedValue);
      const makePaymentSpy = jest.spyOn(Paystack, 'makePayment').mockResolvedValue(mockPaymentLink);

      await saveDataSpy();
      await convertSpy();
      await makePaymentSpy();
      const result = await Flights.MakePayment(makePaymentMockData);

      expect(saveDataSpy).toHaveBeenCalled();
      expect(convertSpy).toHaveBeenCalled();
      expect(makePaymentSpy).toHaveBeenCalled();

      saveDataSpy.mockRestore(); 
      convertSpy.mockRestore(); 
      makePaymentSpy.mockRestore(); 
      
      console.log(result)
      expect(result).toEqual(makePaymentMockResponse);
    });

    it('should handle error when making payment', async () => {
      axios.request.mockRejectedValue(mockRejectedResponse);
      jest.spyOn(DB, 'saveData').mockResolvedValue(mockUid);
      jest.spyOn(RateConvert, 'convert').mockRejectedValue(new Error('Conversion failed'));
      jest.spyOn(Paystack, 'makePayment').mockResolvedValue(mockPaymentLink)

      const result = await Flights.MakePayment(makePaymentMockData);
      expect(result).toEqual(mockRejectedResponse);
    });
  
  });
  
  describe('VerifyPayment', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    let mockPaymentRef = 'payment-mock-ref'
    let mockDbUpdate = {
      uId: 'mock_uid',
      status: 'paid',
      paymentRef: 'sb78yu50pn',
      data: { flightOffers: [ {flight_info: "flight-info"}], travelers: [ {flight_info: "flight-info"} ] }
    }
    let mockPayment ={ 
      data:{
        status: true, 
        message: 'Payment successful.', 
        data: {
          status: 'success',
          payment_info: "payment_info",
          metadata:{
            flightOrderUid: mockDbUpdate.uId
          }
        }
      }
    };
   
    it('should verify payment and return flight order', async () => {
      // Mock data and expected results
      axios.request.mockResolvedValueOnce(mockVerifyPaymentResponse);
      const verifyPaymentSpy = jest.spyOn(Paystack, 'verifyPayment').mockResolvedValue(mockPayment);
      const updateDataSpy = jest.spyOn(DB, 'updateData').mockResolvedValue(mockDbUpdate);
      const bookFlightSpy = jest.spyOn(Flights, 'BookFlight').mockResolvedValue(mockVerifyPaymentResponse);

      await updateDataSpy();
      await bookFlightSpy();
      await verifyPaymentSpy();

      const result = await Flights.VerifyPayment(mockPaymentRef);

      expect(updateDataSpy).toHaveBeenCalled();
      expect(bookFlightSpy).toHaveBeenCalled();
      expect(verifyPaymentSpy).toHaveBeenCalled();

      updateDataSpy.mockRestore(); 
      bookFlightSpy.mockRestore(); 
      verifyPaymentSpy.mockRestore();


      expect(result).toEqual(mockVerifyPaymentResponse);
    });

    it('should handle error when verifying payment', async () => {
      axios.request.mockResolvedValueOnce(mockVerifyPaymentResponse)
      jest.spyOn(Paystack, 'verifyPayment').mockRejectedValue(new Error('Verification failed'));

      const result = await Flights.VerifyPayment(mockPaymentRef);

      expect(result).toBeInstanceOf(Error);
    });

  });

  describe('BookFlight', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    let mockData = "this is a mock-data"
    it('should book flight and return response', async () => {
      // Mock data and expected results
      axios.request.mockResolvedValueOnce(mockVerifyPaymentResponse);
      Flights.GetAuthToken = jest.fn(() => 'mockToken');

      const result = await Flights.BookFlight(makePaymentMockData);

      expect(axios.request).toHaveBeenCalledTimes(1)

      expect(result).toEqual(mockBookedResponse);
    });

  });



});
