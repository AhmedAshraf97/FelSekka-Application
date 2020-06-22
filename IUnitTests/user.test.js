const app = require('../index');
const bcrypt = require('bcrypt')

var validationcar = require('../routes/api/add_car').validation;
var validationAccOrg = require('../routes/api/acceptorg').validation;
var validationRating = require('../routes/api/add_rating').validation;
var validationReview = require('../routes/api/add_review').validation;
var validationOrganization = require('../routes/api/addorg').validation;
var validationChooseOrg = require('../routes/api/chooseorg').validation;
var validationEditCar = require('../routes/api/edit_car').validation;
var validationEditProfile = require('../routes/api/editprofile').validation;
var validationAccOrg = require('../routes/api/acceptorg').validation
var validationUpdateTrust = require('../routes/api/updatetrust').validation;
var validationSignUp = require('../routes/api/sign_up').validation


test('valid sign up', async() => {
    var result = validationSignUp(
        "menna",
        "Fawzy",
        "a",
        "mennafawzy@live.com",
        "01112223333",
        "12345n67-",
        "12345n67-",
        "male",
        "2020-01-01",
        "female",
        "no",
        "31.29217160",
        "29.96108870"
    )
    expect(result.validChecks).toBe(true)

})
test('signup with woring confirm password', async() => {
    var result = validationSignUp(
        "menna",
        "Fawzy",
        "a",
        "mennafawzy@live.com",
        "01112223333",
        "12345n67-",
        "12345n67",
        "male",
        "2020-01-01",
        "female",
        "no",
        "31.29217160",
        "29.96108870"
    )

    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Passwords don't match")

})

test('valid trust update', async() => {
    var result = validationUpdateTrust("1", "1")
    expect(result.validChecks).toBe(true)
})

test('invalid trust update', async() => {
    var result = validationUpdateTrust("1", "2")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Trust parameter must be -1 or 0 or 1")
})
test('valid year of the car', async() => {
    var result = validationcar("Mercedes", "benzema", "2020", "Sedan", "123", "458",
        "29702143676", "abc", "abc", "123", "1234", "green", "4")

    expect(result.validChecks).toBe(true)
}, 100000)


test('invalid year of the car', async() => {
    var result = validationcar("Mercedes", "benzema", "20202", "Sedan", "123", "458",
        "29702143676", "abc", "abc", "123", "1234", "green", "4")

    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("year must be a number of 4 digits")
}, 100000)

test('empty number of seats of the car', async() => {
    var result = validationcar("Mercedes", "benzema", "20202", "Sedan", "123", "458",
        "29702143676", "abc", "abc", "123", "1234", "green", "")

    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Number of seats be a number of (1-300) digits")
}, 100000)

test('invalid number of seats of the car', async() => {
    var result = validationcar("Mercedes", "benzema", "20202", "Sedan", "123", "458",
        "29702143676", "abc", "abc", "123", "1234", "green", "f")

    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Numberofseats must be a number")
}, 100000)



test('invalid organization id', async() => {


    var result = validationAccOrg("1farah")

    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Organization ID must be a number")
}, 100000)


test('invalid rating', async() => {


    var result = validationRating("20", "2020-05-27 23:04:18")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Rating should be a number of value (1-5)")
}, 100000)
test('valid rating', async() => {


    var result = validationRating("1", "2020-05-27 23:04:18")
    expect(result.validChecks).toBe(true)
}, 100000)


test('invalid review', async() => {
    var result = validationReview("2020-05-27 23:04:18", "")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Review size must be between (1-300) characters")
}, 100000)
test('valid review', async() => {
    var result = validationReview("2020-05-27 23:04:18", "good trip")
    expect(result.validChecks).toBe(true)
}, 100000)


test('invalid organization', async() => {


    var result = validationOrganization("hav University In Egypt", "", "30.3030", "31.3131")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Domain can't be empty")
}, 100000)

test('invalid organization', async() => {


    var result = validationOrganization(12, "@hav", "30.3030", "31.3131")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Name must be a string")
}, 100000)

test('valid organization', async() => {


    var result = validationOrganization("hav University In Egypt", "@hav", "30.3030", "31.3131")
    expect(result.validChecks).toBe(true)
}, 100000)


test('valid paramters in choose org', async() => {


    var result = validationChooseOrg("12", "nouran.magdy@hav.com")
    expect(result.validChecks).toBe(true)
}, 100000)
test('invalid  email in choose org', async() => {


    var result = validationChooseOrg("12", "nouran.magdy")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Email address is unvalid")
}, 100000)


test('invalid  paramter in edit car', async() => {


    var result = validationEditCar("Mercedes", 1, "", "",
        "", "", "", "",
        "", "", "", "", "")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Model must be a string of (1-300) characters")
}, 100000)

test('valid  old password in edit profile', async() => {
    var result = validationEditProfile("", "", "1234", bcrypt.hashSync("1234", 10), "1224567n-",
        "1224567n-", "", "", "", "", "", "")
    expect(result.validChecks).toBe(true)

}, 100000)

test('invalid  old password in edit profile', async() => {
    var result = validationEditProfile("", "", "123", bcrypt.hashSync("1234", 10), "1224567n-",
        "1224567n-", "", "", "", "", "", "")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Old password is incorrect")
}, 100000)

test('invalid birthdate in edit profile', async() => {
    var result = validationEditProfile("", "", "", "", "",
        "", "", "12", "", "", "", "")
    expect(result.validChecks).toBe(false)
    expect(result.message.message).toBe("Birthdate is unvalid")
}, 100000)