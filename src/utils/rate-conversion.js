const axios = require('axios');
const access_key = process.env.exchangeRateKey
async function convert(baseCurrency, convertedCurrency, amount){
try{
 const response = await axios.get(`http://api.exchangeratesapi.io/v1/latest?access_key=${access_key}&format=1`)
 if(!response.data){
    return {status: false, message: "Conversion Failed"}
  }
    if (baseCurrency === response.data.base) {
        // If the base currency matches the response's base currency
        const conversionRate = response.data.rates[convertedCurrency];
        if (conversionRate !== undefined) {
            const convertedAmount = amount * conversionRate;
            return convertedAmount;
        } else {
            return null; // Conversion rate not found for the converted currency
        }
    } else {
        // Convert amount to the base currency first, then to the converted currency
        const baseConversionRate = response.data.rates[baseCurrency];
        const convertedBaseAmount = amount / baseConversionRate;

        const convertedToConvertedCurrencyRate = response.data.rates[convertedCurrency];
        if (convertedToConvertedCurrencyRate !== undefined) {
            const finalConvertedAmount = convertedBaseAmount * convertedToConvertedCurrencyRate;
            return finalConvertedAmount;
        } else {
            return null; // Conversion rate not found for the converted currency
        }
    }
 }catch(error){
    if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message); // Throw a custom error with the extracted message
      } else {
        console.log(error.response)
        throw error; // Re-throw the original error if no meaningful message is found
      }
 }
}

module.exports = {
    convert
}