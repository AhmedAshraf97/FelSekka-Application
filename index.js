const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
var queue = require('express-queue');
const graphlib = require('graphlib');
//const spawn = require("child_process").spawn;
//const ksp = require('k-shortest-path');
//const ksp = require('../FelSekka-Application/yenKSP')
//var process = spawn('python', ["./authentication.py"]);
//process.stdout.on('data', data => {
//  console.log(data.toString())
//});
const API_KEY = "AIzaSyCso0RkjKJy74V2LcmnR1Ek5UpB6yvw2Ts";
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));



//DB connection
require("./database/connection");
//Uers API route
app.use('/api/signup', queue({ activeLimit: 1, queuedLimit: -1 }), require('./routes/api/sign_up').router);
app.use('/api/chooseorg', require('./routes/api/chooseorg').router);
app.use('/api/userexists', require('./routes/api/userexists'));
app.use('/api/addorg', require('./routes/api/addorg').router);
app.use('/api/acceptorg', require('./routes/api/acceptorg').router);
app.use('/api/showpendingorg', require('./routes/api/showpendingorg'));
app.use('/api/showexistingorg', require('./routes/api/showexistingorg'));
app.use('/api/verifyone', require('./routes/api/verifyone'));
app.use('/api/verifytwo', require('./routes/api/verifytwo'));
app.use('/api/verifythree', require('./routes/api/verifythree'));
app.use('/api/peopletrustme', require('./routes/api/peopletrustme'));
app.use('/api/peopleItrust', require('./routes/api/peopleItrust'));
app.use('/api/updatetrust', require('./routes/api/updatetrust').router);
app.use('/api/requestridefrom', require('./routes/api/requestridefrom').router);
app.use('/api/requestrideto', require('./routes/api/requestrideto').router);
app.use('/api/retrieveuserdata', require('./routes/api/retrieveuserdata'));
app.use('/api/offerrideto', require('./routes/api/offerrideto').router);
app.use('/api/offerridefrom', require('./routes/api/offerridefrom').router);
app.use('/api/showmyorg', require('./routes/api/showmyorg'));
app.use('/api/deleteorg', require('./routes/api/deleteorg'));
app.use('/api/editcar', require('./routes/api/edit_car').router);
app.use('/api/inserttrackinglocation', require('./routes/api/inserttrackinglocation'));
app.use('/api/gettrackinglocation', require('./routes/api/gettrackinglocation'));
app.use('/api/getcreditcardinfo', require('./routes/api/getcreditcardinfo'));
app.use('/api/addcreditcardinfo', require('./routes/api/addcreditcardinfo'));
app.use('/api/newtoken', require('./routes/api/newtoken'));

app.use('/api/editprofile', require('./routes/api/editprofile').router);
app.use('/api/changepassword', require('./routes/api/changepassword'));
app.use('/api/forgetpassword', require('./routes/api/forgetpassword'));
app.use('/api/showpasttrips', require('./routes/api/ShowPastTrips'));
app.use('/api/getreviews', require('./routes/api/get_user_reviews'));
app.use('/api/showprofile', require('./routes/api/show_profile'));
app.use('/api/showprofileextra', require('./routes/api/show_profile_extra'));
app.use('/api/signin', require('./routes/api/sign_in'));
app.use('/api/addreview', require('./routes/api/add_review').router);
app.use('/api/addcar', require('./routes/api/add_car').router);
app.use('/api/deletecar', require('./routes/api/delete_car'));
app.use('/api/showmycars', require('./routes/api/show_my_cars'));
app.use('/api/addrating', require('./routes/api/add_rating').router);
app.use('/api/signout', require('./routes/api/sign_out'));
app.use('/api/deleteaccount', require('./routes/api/delete_account'));

app.use('/api/scheduledtrips', require('./routes/api/scheduled'));

app.use('/api/searchTrip', require('./routes/api/searchTrip'));
app.use('/api/matching', require('./routes/api/matchingApi').router);
app.use('/api/ReturnTripMatch', require('./routes/api/ReturnTripMatchingApi').router);
//, queue({ activeLimit: 1, queuedLimit: -1 })
app.use('/api/chooseFromAvailableRides', require('./routes/api/chooseFromAvailableRidesApi').router)
app.use('/api/chooseFromReturnTripsApi', require('./routes/api/chooseFromReturnTripsApi').router)


app.use('/api/cleanrequestsoffers', require('./routes/api/CleanRequests&Offers'));

app.use('/api/betweenusers', require('./routes/api/betweenusershandler'));

app.use('/api/cancelRiderTo', require('./routes/api/cancelRiderToApi').router)
app.use('/api/cancelRiderFrom', require('./routes/api/cancelRiderFromApi').router)
app.use('/api/canceldriverTo', require('./routes/api/canceldriverToApi').router)

app.use('/api/canceldriverFrom', require('./routes/api/canceldriverFromApi').router)

app.use('/api/endRiderTripTo', require('./routes/api/endRiderTriptTo').router)
app.use('/api/startRiderTripTo', require('./routes/api/startRiderTripTo').router)

app.use('/api/endRiderTripFrom', require('./routes/api/endRiderTripFrom').router)
app.use('/api/startRiderTripFrom', require('./routes/api/startRiderTripFrom').router)
app.use('/api/startDriverTripFrom', require('./routes/api/startDriverTripFrom').router)
app.use('/api/startDriverTripTo', require('./routes/api/startDriverTripTo').router)
app.use('/api/endDriverTripFrom', require('./routes/api/endDriverTripFrom').router)
app.use('/api/endDriverTripTo', require('./routes/api/endDriverTripTo').router)

app.use('/api/cancelRequest', require('./routes/api/cancelRequest'))

app.use('/api/cancelOffer', require('./routes/api/cancelOffer'))
app.use('/api/showrequests', require('./routes/api/show_requests'))
app.use('/api/showoffers', require('./routes/api/show_offers'))

app.use('/api/showreview', require('./routes/api/showReview'));
app.use('/api/showrating', require('./routes/api/showRating'));
app.use('/api/showtrust', require('./routes/api/ShowTrust'));

app.use('/api/scheduler', require('./routes/api/scheduler'));
app.use('/api/verify_email', require('./routes/api/verify_email'));
app.use('/api/verify_org', require('./routes/api/verify_org'));

var schedule = require('node-schedule');
var request = require('request');

// var cleanrequestsoffers = schedule.scheduleJob('* * 20 * * *', function() {
//     request.post({
//         url: 'http://localhost:3000/api/cleanrequestsoffers'
//     }, function(err, httpResponse, body) {
//         console.log(body);
//     })

// });

// var matchingschedules1 = schedule.scheduleJob('* * 21 * * *', function() {
//     request.post({
//         url: 'http://localhost:3000/api/scheduler'
//     }, function(err, httpResponse, body) {
//         console.log(body);
//     })

// });


// var matchingschedules2 = schedule.scheduleJob('* * 6 * * *', function() {
//     request.post({
//         url: 'http://localhost:3000/api/scheduler'
//     }, function(err, httpResponse, body) {
//         console.log(body);
//     })

// });

// var matchingschedules3 = schedule.scheduleJob('* * 12 * * *', function() {
//     request.post({
//         url: 'http://localhost:3000/api/scheduler'
//     }, function(err, httpResponse, body) {
//         console.log(body);
//     })

// });

// var matchingschedules4 = schedule.scheduleJob('* * 15 * * *', function() {
//     request.post({
//         url: 'http://localhost:3000/api/scheduler'
//     }, function(err, httpResponse, body) {
//         console.log(body);
//     })
// });

// var matchingschedules5 = schedule.scheduleJob('* * 18 * * *', function() {
//     request.post({
//         url: 'http://localhost:3000/api/scheduler'
//     }, function(err, httpResponse, body) {
//         console.log(body);
//     })
// });


module.exports = app