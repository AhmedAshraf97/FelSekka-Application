var validationRequstrideTo = require('../routes/api/requestrideto').validation
var validationRequstrideFrom = require('../routes/api/requestridefrom').validation
var validationOfferrideTo = require('../routes/api/offerrideto').validation
var validationOfferrideFrom = require('../routes/api/offerridefrom').validation




test('valid request ride to', async() => {
    var result = validationRequstrideTo(9, "2021-05-16", "01:00:00", "04:00:00", "female", "no")
        // console.log(result.message)
    expect(result.validChecks).toBe(true)
})
test('valid request ride from', async() => {
    var result = validationRequstrideFrom(9, "2021-05-16", "01:00:00", "04:00:00", "female", "no")
        // console.log(result.message)
    expect(result.validChecks).toBe(true)
})
test('valid offer ride to', async() => {
    var result = validationOfferrideTo(40, 4, 9, "2021-05-27", "01:00:00", "04:00:00", "female", "no")
        // console.log(result.message)
    expect(result.validChecks).toBe(true)
})
test('valid offer ride from', async() => {
    var result = validationOfferrideFrom(40, 4, 9, "2021-05-27", "01:00:00", "04:00:00", "female", "no")
        // console.log(result.message)
    expect(result.validChecks).toBe(true)
})