const axios = require('axios');
const paystackModule = require('./paystack');

// Mocking axios
jest.mock('axios');

describe('Paystack Module Tests', () => {
  const mockPaymentDetails = {
    amount: 1000,
    email: 'test@example.com',
    metadata: { order_id: '12345' },
  };
  const mockPaymentReference = 'PAYMENT123';

  it('should make a payment and return authorization URL', async () => {
    const mockResponse = {
      data: {
        data: {
          authorization_url: 'https://example.com/authorization',
        },
      },
    };
    axios.post.mockResolvedValue(mockResponse);

    const result = await paystackModule.makePayment(mockPaymentDetails);

    expect(result).toBe(mockResponse.data.data.authorization_url);
    expect(axios.post).toHaveBeenCalledWith(
      'https://api.paystack.co/transaction/initialize',
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should verify successful payment', async () => {
    const mockResponse = {
      data: {
        data: {
          status: 'success',
        },
      },
    };
    axios.get.mockResolvedValue(mockResponse);

    const result = await paystackModule.verifyPayment(mockPaymentReference);

    expect(result.status).toBe(true);
    expect(result.message).toBe('Payment successful.');
  });

  it('should verify pending payment', async () => {
    const mockResponse = {
      data: {
        data: {
          status: 'pending',
        },
      },
    };
    axios.get.mockResolvedValue(mockResponse);

    const result = await paystackModule.verifyPayment(mockPaymentReference);

    expect(result.status).toBe(true);
    expect(result.message).toBe('Payment is processing.');
  });

  it('should verify failed payment', async () => {
    const mockResponse = {
      data: {
        data: {
          status: 'failed',
        },
      },
    };
    axios.get.mockResolvedValue(mockResponse);

    const result = await paystackModule.verifyPayment(mockPaymentReference);

    expect(result.status).toBe(false);
    expect(result.message).toBe('Payment failed.');
  });
});
