const axios = require('axios');

(async () => {
  try {
    const payload = {
      fullName: 'Test Student',
      email: `test.user+${Date.now()}@example.com`,
      phone: '9876543210',
      branch: 'IT',
      yearOfStudy: '1st Year',
      workshopAttendance: 'Yes',
      githubUsername: 'test-user',
      consent: true,
      recaptchaToken: 'test-token'
    };

    console.log('Sending registration payload:', payload);

    const res = await axios.post('http://localhost:3000/api/registration', payload, { timeout: 10000 });
    console.log('Response status:', res.status);
    console.log('Response data:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('Response error status:', err.response.status);
      console.error('Response data:', err.response.data);
    } else {
      console.error('Request failed:', err.message);
    }
    process.exit(1);
  }
})();
