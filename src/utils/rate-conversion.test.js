require('dotenv').config();
const axios = require('axios');
const convertModule = require('./rate-conversion');
const mockAccessKey = process.env.exchangeRateKey;


// Mocking axios
jest.mock('axios');

describe('Conversion Module Tests', () => {
  
  process.env.exchangeRateKey = mockAccessKey;

  const baseCurrency = 'USD';
  const convertedCurrency = 'EUR';
  const amount = 100;

  it('should convert amount when base currency matches response base currency', async () => {
    const mockResponse = {
      data: {
        base: 'USD',
        rates: {
          EUR: 0.85,
        },
      },
    };
    axios.get.mockResolvedValue(mockResponse);

    const result = await convertModule.convert(baseCurrency, convertedCurrency, amount);

    expect(result).toBeCloseTo(85);
    expect(axios.get).toHaveBeenCalledWith(
      `http://api.exchangeratesapi.io/v1/latest?access_key=${mockAccessKey}&format=1`
    );
  });

  it('should convert amount when base currency differs from response base currency', async () => {
    const mockResponse = {
      data: {
        base: 'EUR',
        rates: {
          USD: 1.18,
        },
      },
    };
    axios.get.mockResolvedValue(mockResponse);

    const result = await convertModule.convert(baseCurrency, convertedCurrency, amount);
    expect(axios.get).toHaveBeenCalledWith(
      `http://api.exchangeratesapi.io/v1/latest?access_key=${mockAccessKey}&format=1`
    );
  });

  it('should handle conversion rate not found', async () => {
    const mockResponse = {
      data: {
        base: 'USD',
        rates: {
          EUR: 0.85,
        },
      },
    };
    axios.get.mockResolvedValue(mockResponse);

    const invalidCurrency = 'GBP';
    const result = await convertModule.convert(baseCurrency, invalidCurrency, amount);

    expect(result).toBeNull();
    expect(axios.get).toHaveBeenCalledWith(
      `http://api.exchangeratesapi.io/v1/latest?access_key=${mockAccessKey}&format=1`
    );
  });

  it('should handle conversion API error', async () => {
    axios.get.mockRejectedValue(new Error('Mocked API error'));

    await expect(convertModule.convert(baseCurrency, convertedCurrency, amount)).rejects.toThrow(
      'Mocked API error'
    );

    expect(axios.get).toHaveBeenCalledWith(
      `http://api.exchangeratesapi.io/v1/latest?access_key=${mockAccessKey}&format=1`
    );
  });

});

