const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const User = require('../models/user');
const axios = require("axios");
const user = require('../models/user');
const referralCodes = require('referral-codes');
const ErrorHandler = require('../utils/errorHandler');



// Verifies an inputed BVN api/v1/bvn/verify
exports.verifyBVN = catchAsyncErrors(async (req, res, next) => {

    let {bvn, dob} = req.body;

    let month = dob.split('-')[1]

    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const strMonth = months[Number(month) - 1]

    dob = dob.replace(month, strMonth)


    let {name, phone} = req.user;

    const user = req.user

    const apiKey = process.env.MONNIFY_API_KEY;
    const apiSecret = process.env.MONNIFY_SECRET_KEY;
    const baseUrl = process.env.MONNIFY_BASE_URL;
    
    const clientIDSecretInBase64 = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

    let headers = {
        Authorization: `Basic ${clientIDSecretInBase64}`
    }
    
    let response = await axios.post('https://api.monnify.com/api/v1/auth/login',null, {headers});
    const { responseBody } = response.data
    name = name.toUpperCase()
    const accessToken = responseBody.accessToken;

    const body = {
        "bvn":bvn,
        "name": name,
        "dateOfBirth": dob,
        "mobileNo": phone
    }
    headers = {
        Authorization: `Bearer ${accessToken}`
    }
    
    response = await axios.post('https://api.monnify.com/api/v1/vas/bvn-details-match', body, {headers});
    
    const mobileMatch = response.data.responseBody.mobileNo
    const dobMatch = response.data.responseBody.dateOfBirth
    
    if(response.data.responseBody.name === 'FULL_MATCH'||'PARTIAL_MATCH' && response.data.responseBody.name.matchPercentage > 50){
        if(mobileMatch === 'FULL_MATCH' || dobMatch === 'FULL_MATCH'){
            user.bvn = bvn;
            user.bvnAdded = true;
            await user.save()
            return res.json({success: true, bvnAdded:user.bvnAdded})
        }
    }
    return next(new ErrorHandler('Invalid BVN', 400));

    
})

// adds card to user database api/v1/user/add-card
exports.addCard = catchAsyncErrors(async (req, res, next) => {
    try{
        const user = req.user;
        const {cardNo,expMnth,expYr, cvv, pin} = req.body;
        const reference = await referralCodes.generate({
            length: 10
        })
    
        user.card.forEach(card => {
            if(card.cardNo === cardNo){
                console.log('err')
                return next(new ErrorHandler('You already added this card', 400))
            }
        })
    
        const apiKey = process.env.MONNIFY_API_KEY;
        const apiSecret = process.env.MONNIFY_SECRET_KEY;
        const baseUrl = process.env.MONNIFY_BASE_URL;
        
        const clientIDSecretInBase64 = Buffer.from(apiKey + ':' + apiSecret).toString('base64');
    
        let headers = {
            Authorization: `Basic ${clientIDSecretInBase64}`
        }
        
        let response = await axios.post('https://api.monnify.com/api/v1/auth/login',null, {headers});
        const { responseBody } = response.data
        const accessToken = responseBody.accessToken;
    
        headers = {
            Authorization: `Bearer ${accessToken}`
        }
    
        const body = {
            "amount": 50.00,
            "customerName": user.name,
            "customerEmail": user.email,
            "paymentReference": reference[0],
            "paymentDescription": "Test Card",
            "currencyCode": "NGN",
            "contractCode":"829507385232",
            "redirectUrl": "http://localhost:3000/dashboard",
            "paymentMethods":["CARD"]
          }
    
    
        response = await axios.post('https://api.monnify.com/api/v1/merchant/transactions/init-transaction',body, {headers});
        
        const checkoutUrl = response.data.responseBody.checkoutUrl;
          
    
        user.card.push({
            cardNo,
            expMnth,
            expYr,
            cvv,
            pin
        })
        user.addedCard = true
        user.transactions.push({
            transactionReference: response.data.responseBody.transactionReference,
            paymentReference: reference[0],
        })
        await user.save();
    
        res.json({success: true, checkoutUrl})
    }catch(err){
        console.log(err)
    }
    
})

// Gets transaction status api/v1/transaction/status
exports.getTransactionStatus = catchAsyncErrors( async  (req, res, next) => {
    try{
        const latestTransaction = req.user.transactions[req.user.transactions.length - 1]

        if(!latestTransaction) {
            return next()
        }
        const encoded = encodeURI(latestTransaction.transactionReference)

        const apiKey = process.env.MONNIFY_API_KEY;
        const apiSecret = process.env.MONNIFY_SECRET_KEY;
        const baseUrl = process.env.MONNIFY_BASE_URL;
        
        const clientIDSecretInBase64 = Buffer.from(apiKey + ':' + apiSecret).toString('base64');

        let headers = {
            Authorization: `Basic ${clientIDSecretInBase64}`
        }
        
        let response = await axios.post('https://api.monnify.com/api/v1/auth/login',null, {headers});
        const { responseBody } = response.data
        const accessToken = responseBody.accessToken;

        headers = {
            Authorization: `Bearer ${accessToken}`
        }

        response = await axios.get(`https://api.monnify.com/api/v2/transactions/${encoded}`, {headers});

        const status = response.data.responseBody.paymentStatus

        if(status === 'PAID'){
            req.user.transactions[req.user.transactions.length - 1].status = status;
            await req.user.save()
            return res.json({
                success: true,
                status
            })
        }

        return next(new ErrorHandler('Last transaction pending'))
    }catch(err) {
        console.log(err)
        return next(new ErrorHandler(err))
    }
    
})