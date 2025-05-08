require('dotenv').config();
const axios = require('axios');

async function getAdminToken() {
  try {
    console.log('Getting admin token...');
    
    const response = await axios.post('http://localhost:8000/api/admin-auth/login', {
      email: 'samuelowase02@gmail.com',
      password: 'Admin@123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Status:', response.status);
    console.log('Token:', response.data.token);
    
    return response.data.token;
  } catch (error) {
    console.error('Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    throw error;
  }
}

async function createNewAdmin(token) {
  try {
    console.log('Creating new admin user...');
    
    const response = await axios.post('http://localhost:8000/api/admin/register', {
      firstName: 'New',
      lastName: 'Admin',
      email: 'newadmin@example.com',
      country: 'Nigeria',
      password: 'Admin@123'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Admin created successfully!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Admin creation failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    throw error;
  }
}

// Run the functions
async function main() {
  try {
    // First get the admin token
    const token = await getAdminToken();
    
    // Then use the token to create a new admin
    await createNewAdmin(token);
    
    console.log('Process completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Process failed');
    process.exit(1);
  }
}

main();
