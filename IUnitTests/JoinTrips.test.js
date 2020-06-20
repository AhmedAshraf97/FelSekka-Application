var validationChooseRides = require('../routes/api/chooseFromAvailableRidesApi').validation;
var validationReturn = require('../routes/api/chooseFromReturnTripsApi').validation;

test('invalid  earliest date in choose from available rides', async() => {


    var result = validationChooseRides("12")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("EarliestTime is unvalid")
}, 100000)

test('invalid  latest date in choose from available rides', async() => {


    var result = validationReturn("12")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("LatestTime is unvalid")
}, 100000)