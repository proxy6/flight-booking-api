const axios = require('axios');

const paystackSecretKey =process.env.paystackSecretKey;

// make payment fn
async function makePayment(paymentDetails) {
  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: paymentDetails.amount,
        email: paymentDetails.email,
        metadata: paymentDetails.metadata
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json'    
        }
      }
    );
    console.log(response.data)
    return response.data.data.authorization_url;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message); // Throw a custom error with the extracted message
      } else {
        throw error; // Re-throw the original error if no meaningful message is found
      }
  }
}

// verify payment fn
async function verifyPayment(paymentReference) {
  try {
    // Verify payment status with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${paymentReference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          
        }
      }
    );

    // Check if payment is successful
      if (response.data.data.status === 'success') {
        return { status: true, message: 'Payment successful.', data: response.data };
      } else if(response.data.data.status === 'pending'){
        return { status: true, message: 'Payment is processing.', data: response.data }; 
      } 
      else {
        return { status: false, message: 'Payment failed.', data: response.data };
      }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return error.response.data
  }
}

module.exports = {
  makePayment,
  verifyPayment
};
