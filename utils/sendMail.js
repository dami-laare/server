const nodemailer = require('nodemailer');
const ErrorHandler = require('./errorHandler');

module.exports = async (email, otp, next, qr) => {
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: 'osunkiyesitayo@gmail.com',
    //         pass: 'tvsjnikcuwlvcrqv'
    //     }
    // })
    let attachments = [];
    

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
          },
        
      })
      let mailDetails = {}
      if(otp) {

          mailDetails = {
            from: '"OTP" <admin@getfungry.com>',
            to: email,
            subject: 'Verification code for GetFungry',
            text:`Your Fungry registration OTP is ${otp}.\n\nDo not share this code with anyone!`,
        };
      }
      if (qr){

        const regex = /^data:.+\/(.+);base64,(.*)$/;
        
        const matches = qr.match(regex);
        const ext = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64')
        attachments.push(
            {   // binary buffer as an attachment
                filename: 'MealTicket.png',
                content: new Buffer(data,'base64')
            }
        )
        mailDetails = {
            from: '"Your first meal ticket" <admin@getfungry.com>',
            to: email,
            subject: 'Meal Ticket',
            text:`Here/s your first meal ticket`,
            attachments
        };
    }
      
    await transporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log(err)
        }
    });
}