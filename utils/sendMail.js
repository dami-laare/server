const nodemailer = require('nodemailer');
const ErrorHandler = require('./errorHandler');

module.exports = async (email, otp, next) => {
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'osunkiyesitayo@gmail.com',
    //         pass: 'tvsjnikcuwlvcrqv'
    //     }
    // })

    const transporter = nodemailer.createTransport({
        host: "mail.getfungry.com",
        port: 465,
        secure: true, // upgrade later with STARTTLS
        auth: {
          user: "admin@getfungry.com",
          pass: "Bwt21^o8",
        },
        dkim: {
            domainName: "getfungry.com",
            keySelector: "default",
            privateKey: process.env.DKIM_PRIVATE_KEY
          }
      })

    let mailDetails = {
        from: '"OTP" <admin@getfungry.com>',
        to: email,
        subject: 'Verification code for GetFungry',
        text:`Your Fungry registration OTP is ${otp}.\n\nDo not share this code with anyone!`
    };
      
    await transporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log(err)
        }
    });
}