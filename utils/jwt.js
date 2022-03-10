const sendToken = (user, statusCode, res, login) => {
    const token = user.getJwtToken()

    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    let details
    if (login) {
        details = {
            name: user.name,
            phone: user.phone,
            email: user.email,
            address: user.address     
        }
    }
    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token,
        dashData: {verified: user.verified, bvnAdded:user.bvnAdded},
        tickets: user.tickets.length,
        details,
        addedCard: user.addedCard
    })
};

module.exports = sendToken
