const app = require('../index');
var validationStartRiderTripTo = require('../routes/api/startRiderTripTo').validation
var validationStartDriverTripTo = require('../routes/api/startDriverTripTo').validation
var validationStartRiderTripFrom = require('../routes/api/startRiderTripFrom').validation
var validationStartDriverTripFrom = require('../routes/api/startDriverTripFrom').validation
var validationEndRiderTripTo = require('../routes/api/endRiderTriptTo').validation
var validationEndRiderTripFrom = require('../routes/api/endRiderTripFrom').validation
var validationEndDriverTripTo = require('../routes/api/endDriverTripTo').validation
var validationEndDriverTripFrom = require('../routes/api/endDriverTripFrom').validation


/// Starting trips unit tests ////
test('valid start rider trip to', async() => {
    var result = validationStartRiderTripTo("1", "1", "09:25:25")
    expect(result.validChecks).toBe(true)
})

test('valid start rider trip from', async() => {
    var result = validationStartRiderTripFrom("1", "1", "09:25:25")
    expect(result.validChecks).toBe(true)
})

test('valid start driver trip to', async() => {
    var result = validationStartDriverTripTo("1", "09:25:25", "30.22", "30.111")
    expect(result.validChecks).toBe(true)
})

test('valid start driver trip from', async() => {
    var result = validationStartDriverTripFrom("1", "09:25:25", "30.22", "30.111")
    expect(result.validChecks).toBe(true)
})


/// Ending trips unit tests ////


test('End rider trip to', async() => {
    var result = validationEndRiderTripTo("9", "20", "04:00:00", "35.2", "29")
        // console.log(result.message)
    expect(result.validChecks).toBe(true)
})


test('End rider trip from', async() => {
    var result = validationEndRiderTripFrom(9, "20", "04:00:00", "35.2", "29")
        // console.log(result.message)
    expect(result.validChecks).toBe(true)
})


test('End driver trip to', async() => {
    var result = validationEndDriverTripTo(9, "01:00:00", "35.66", "255", "30.333", "31.255")
        // console.log(result.message)
    expect(result.validChecks).toBe(true)
})



test('End driver trip from', async() => {
    var result = validationEndDriverTripFrom(9, "01:00:00", "35.66", "255", "30.333", "31.255")
        // console.log(result.message)
    expect(result.validChecks).toBe(true)
})