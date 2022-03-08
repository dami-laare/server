const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const User = require('../models/user');
const axios = require("axios");
const user = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');



// Verifies an inputed BVN api/v1/bvn/verify
exports.verifyBVN = catchAsyncErrors(async (req, res, next) => {

    const {bvn, dob} = req.body;

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
        "dateOfBirth": "21-Aug-1996",
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
            user.verified = true;
            await user.save()
            return res.json({success: true, verified: user.verified})
        }
    }
    return next(new ErrorHandler('Invalid BVN', 400));

    
})


