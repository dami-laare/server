const axios = require('axios');


module.exports = (otp, phone) => {
    const headers = {
        Accept: 'application/json,text/plain,*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SENDCHAMP_BEARER}`
    }

    axios.post('https://api.sendchamp.com/api/v1/sms/send', 
    {
        to: [`${phone}`],
        message: `Your Fungry registration OTP is ${otp}.\n\nDo not share this code with anyone!`,
        sender_name: 'Sendchamp',
        route: 'dnd'
    }, 
    { headers })
}