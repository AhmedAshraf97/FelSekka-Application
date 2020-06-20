const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
var queue = require('express-queue');
const graphlib = require('graphlib');
//const ksp = require('k-shortest-path');
//const ksp = require('../FelSekka-Application/yenKSP')


const API_KEY = "AIzaSyCso0RkjKJy74V2LcmnR1Ek5UpB6yvw2Ts";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
app.use('/api/requestridefrom', require('./routes/api/requestridefrom'));
app.use('/api/requestrideto', require('./routes/api/requestrideto'));
app.use('/api/retrieveuserdata', require('./routes/api/retrieveuserdata'));
app.use('/api/offerrideto', require('./routes/api/offerrideto'));
app.use('/api/offerridefrom', require('./routes/api/offerridefrom'));
app.use('/api/showmyorg', require('./routes/api/showmyorg'));
app.use('/api/deleteorg', require('./routes/api/deleteorg'));
app.use('/api/editcar', require('./routes/api/edit_car'));
app.use('/api/inserttrackinglocation', require('./routes/api/inserttrackinglocation'));
app.use('/api/gettrackinglocation', require('./routes/api/gettrackinglocation'));

app.use('/api/editprofile', require('./routes/api/editprofile'));
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
app.use('/api/chooseFromAvailableRides', queue({ activeLimit: 1, queuedLimit: -1 }), require('./routes/api/chooseFromAvailableRidesApi').router)
app.use('/api/chooseFromReturnTripsApi', queue({ activeLimit: 1, queuedLimit: -1 }), require('./routes/api/chooseFromReturnTripsApi').router)


app.use('/api/cleanrequestsoffers', require('./routes/api/CleanRequests&Offers'));

app.use('/api/betweenusers', require('./routes/api/betweenusershandler'));

app.use('/api/cancelRiderTo', require('./routes/api/cancelRiderToApi').router)
app.use('/api/cancelRiderFrom', require('./routes/api/cancelRiderFromApi').router)
app.use('/api/canceldriverTo', require('./routes/api/canceldriverToApi').router)

app.use('/api/canceldriverFrom', require('./routes/api/canceldriverFromApi').router)

app.use('/api/endRiderTripTo', require('./routes/api/endRiderTriptTo'))
app.use('/api/startRiderTripTo', require('./routes/api/startRiderTripTo').router)

app.use('/api/endRiderTripFrom', require('./routes/api/endRiderTripFrom'))
app.use('/api/startRiderTripFrom', require('./routes/api/startRiderTripFrom').router)
app.use('/api/startDriverTripFrom', require('./routes/api/startDriverTripFrom').router)
app.use('/api/startDriverTripTo', require('./routes/api/startDriverTripTo').router)
app.use('/api/endDriverTripFrom', require('./routes/api/endDriverTripFrom'))
app.use('/api/endDriverTripTo', require('./routes/api/endDriverTripTo'))

app.use('/api/cancelRequest', require('./routes/api/cancelRequest'))

app.use('/api/cancelOffer', require('./routes/api/cancelOffer'))
app.use('/api/showrequests', require('./routes/api/show_requests'))
app.use('/api/showoffers', require('./routes/api/show_offers'))


var schedule = require('node-schedule');
var request = require('request');

/*
var jsontosend = {
    "latesttime": "05:00:00",
    "smoking": "no",
    "ridewith": "female",
    "tripid": 121
}
 */
/* //ID = 45
var choose1 = schedule.scheduleJob('50 * * * * *', function() {
    request.post({
        url: 'http://localhost:3000/api/chooseFromReturnTripsApi',
        json: true,
        body: jsontosend,
        headers: {
            'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDUsImZpcnN0bmFtZSI6ImRpbmEiLCJsYXN0bmFtZSI6IndhbGlkIiwicGhvbmVudW1iZXIiOiIwMTExMjIxMzA1NyIsInBhc3N3b3JkIjoiJDJiJDEwJDFvSXVCeUU5YnVDeGdBSlM4NzFoNHVqeFJOT0p3eElsajhCWmVDTTJNdHFZZ1dTS3lmUDN1IiwiZ2VuZGVyIjoiZmVtYWxlIiwiYmlydGhkYXRlIjoiMTk5Ny0xMC0wNSIsInBob3RvIjpudWxsLCJyaWRld2l0aCI6ImZlbWFsZSIsInNtb2tpbmciOiJubyIsInJhdGluZyI6IjUuMDAwIiwic3RhdHVzIjoiZXhpc3RpbmciLCJlbWFpbCI6ImRpbmEud2FsaWQ5N0Bob3RtYWlsLmNvbSIsImxhdGl0dWRlIjoiMzEuMzA2MTg3MDAiLCJsb25naXR1ZGUiOiIyOS45ODQxNjkwMCIsInVzZXJuYW1lIjoiZGluYXdhbGlkIiwiY3JlYXRlZEF0IjoiMjAyMC0wNC0yMlQwMzoxMTo1Ni4wMDBaIiwidXBkYXRlZEF0IjoiMjAyMC0wNC0yMlQwMzoxMTo1Ni4wMDBaIiwiaWF0IjoxNTg5Mjk5NTk5fQ.HzSCTpGqjzaCh64iKMKFepngL_7Li-i0f-dZIF8dgAs'
        }
    }, function(err, httpResponse, body) {
        console.log(body);
    })
});

//ID = 52
var choose2 = schedule.scheduleJob('50 * * * * *', function() {
    request.post({
        url: 'http://localhost:3000/api/chooseFromReturnTripsApi',
        json: true,
        body: jsontosend,
        headers: {
            'authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTIsImZpcnN0bmFtZSI6Im5hcmltYW4iLCJsYXN0bmFtZSI6InJlZGEiLCJwaG9uZW51bWJlciI6IjAxMTQ1Nzg1NjIyIiwicGFzc3dvcmQiOiIkMmIkMTAkVEg4N2NzLmVUNzdrcURaQ2JiVFlOT3VuUTl6QlFLd3lSSjhudGFXeEV3TlBQLkJqQUd1bGEiLCJnZW5kZXIiOiJmZW1hbGUiLCJiaXJ0aGRhdGUiOiIxOTk3LTAyLTE0IiwicGhvdG8iOm51bGwsInJpZGV3aXRoIjoiZmVtYWxlIiwic21va2luZyI6Im5vIiwicmF0aW5nIjoiNS4wMDAiLCJzdGF0dXMiOiJleGlzdGluZyIsImVtYWlsIjoibmFyaW1hbkBob3RtYWlsLmNvbSIsImxhdGl0dWRlIjoiMzEuNTU1NjI1MDAiLCJsb25naXR1ZGUiOiIyOS41NTY1NjAwMCIsInVzZXJuYW1lIjoibmFyaW1hbiIsImNyZWF0ZWRBdCI6IjIwMjAtMDQtMjJUMjI6Mjk6NDcuMDAwWiIsInVwZGF0ZWRBdCI6IjIwMjAtMDQtMjJUMjI6Mjk6NDcuMDAwWiIsImlhdCI6MTU4OTI5ODQ1NH0.lDVPUrJ8DHwLjBAB7QqOYzjLwwSzBuJU2-2rax_orvY'
        }
    }, function(err, httpResponse, body) {
        console.log(body);
    })
});
 */



//////////////////////////////////////////////

// var matchingSchedule = schedule.scheduleJob('50 * * * * *', function() {
//     request.post({
//         url: 'http://localhost:3000/api/matching'
//     }, function(err, httpResponse, body) {
//         console.log(body);
//     })

// });

// var ReturnmatchingSchedule = schedule.scheduleJob('50 * * * * *', function() {
//     request.post({
//         url: 'http://localhost:3000/api/ReturnTripMatch'
//     }, function(err, httpResponse, body) {
//         console.log(body);
//     })

// });







module.exports = app