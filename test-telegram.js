const axios = require('axios');

// Telegram bot token
const TELEGRAM_TOKEN = '7771432535:AAF0xp-kOf-Pi4jiuYwCL5K9D2oleRb9XsQ';
const CHAT_ID = '7730034235';
const API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;
const TELEGRAM_API_IP = '149.154.167.220';

// Test functions
async function testDomainConnection() {
  try {
    console.log('Testing connection to Telegram API using domain name...');
    const response = await axios.get(`${API_URL}/getMe`);
    console.log('Domain connection successful!');
    console.log('Bot info:', response.data);
    return true;
  } catch (error) {
    console.error('Domain connection failed:', error.message);
    return false;
  }
}

async function testIPConnection() {
  try {
    console.log('Testing connection to Telegram API using IP address...');
    const response = await axios.get(`https://${TELEGRAM_API_IP}/bot${TELEGRAM_TOKEN}/getMe`, {
      headers: {
        'Host': 'api.telegram.org'
      }
    });
    console.log('IP connection successful!');
    console.log('Bot info:', response.data);
    return true;
  } catch (error) {
    console.error('IP connection failed:', error.message);
    return false;
  }
}

async function testSendMessage() {
  try {
    console.log('Testing sending message to Telegram...');
    const response = await axios.post(`${API_URL}/sendMessage`, {
      chat_id: CHAT_ID,
      text: 'Test message from PitchSmith bot'
    });
    console.log('Message sent successfully!');
    console.log('Response:', response.data);
    return true;
  } catch (error) {
    console.error('Failed to send message:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('=== TELEGRAM CONNECTION TEST ===');
  
  const domainSuccess = await testDomainConnection();
  if (!domainSuccess) {
    const ipSuccess = await testIPConnection();
    if (!ipSuccess) {
      console.log('Both connection methods failed. Please check your network settings.');
      return;
    }
  }
  
  await testSendMessage();
  
  console.log('=== TEST COMPLETED ===');
}

runTests().catch(error => {
  console.error('Test failed with error:', error);
});
