// Generate unique transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${randomPart}`;
};

module.exports = { generateTransactionId };
