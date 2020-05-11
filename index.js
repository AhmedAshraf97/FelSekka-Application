const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//DB connection
require("./database/connection");
//Uers API route
app.use('/api/signup', require('./routes/api/sign_up'));
app.use('/api/chooseorg', require('./routes/api/chooseorg'));
app.use('/api/userexists', require('./routes/api/userexists'));
app.use('/api/addorg', require('./routes/api/addorg'));
app.use('/api/acceptorg', require('./routes/api/acceptorg'));
app.use('/api/showpendingorg', require('./routes/api/showpendingorg'));
app.use('/api/showexistingorg', require('./routes/api/showexistingorg'));
app.use('/api/verifyone', require('./routes/api/verifyone'));
app.use('/api/verifytwo', require('./routes/api/verifytwo'));
app.use('/api/verifythree', require('./routes/api/verifythree'));
app.use('/api/peopletrustme', require('./routes/api/peopletrustme'));
app.use('/api/peopleItrust', require('./routes/api/peopleItrust'));
app.use('/api/updatetrust', require('./routes/api/updatetrust'));
app.use('/api/requestridefrom', require('./routes/api/requestridefrom'));
app.use('/api/requestrideto', require('./routes/api/requestrideto'));
app.use('/api/retrieveuserdata', require('./routes/api/retrieveuserdata'));
app.use('/api/offerrideto', require('./routes/api/offerrideto'));

app.use('/api/editcar', require('./routes/api/edit_car'));

app.use('/api/editprofile', require('./routes/api/editprofile'));
app.use('/api/changepassword', require('./routes/api/changepassword'));
app.use('/api/forgetpassword', require('./routes/api/forgetpassword'));
app.use('/api/showpasttrips', require('./routes/api/ShowPastTrips'));
app.use('/api/getreviews', require('./routes/api/get_user_reviews'));
app.use('/api/showprofile', require('./routes/api/show_profile'));
app.use('/api/showprofileextra', require('./routes/api/show_profile_extra'));
app.use('/api/signin', require('./routes/api/sign_in'));
app.use('/api/addreview', require('./routes/api/add_review'));
app.use('/api/addcar', require('./routes/api/add_car'));
app.use('/api/deletecar', require('./routes/api/delete_car'));
app.use('/api/showmycars', require('./routes/api/show_my_cars'));
app.use('/api/addrating', require('./routes/api/add_rating'));
app.use('/api/scheduledtrips', require('./routes/api/scheduledtrips'));
//app.use('/api/showAvailableRides', require('./routes/api/NotUsedshowAvailableRides'));
app.use('/api/signout', require('./routes/api/sign_out'));
app.use('/api/deleteaccount', require('./routes/api/delete_account'));

app.use('/api/searchTrip', require('./routes/api/searchTrip'));

app.use('/api/matching', require('./routes/api/matchingApi').router);

app.use('/api/ReturnTripMatch', require('./routes/api/ReturnTripMatch').router);
app.use('/api/chooseFromAvailableRides', require('./routes/api/chooseFromAvailableRidesApi').router)
app.use('/api/chooseFromReturnTripsApi', require('./routes/api/chooseFromReturnTripsApi').router)

app.use('/api/cancelRiderTo', require('./routes/api/cancelRiderToApi').router)
app.use('/api/cancelRiderFrom', require('./routes/api/cancelRiderFromApi').router)
app.use('/api/canceldriverTo', require('./routes/api/canceldriverToApi').router)

app.use('/api/canceldriverFrom', require('./routes/api/canceldriverFromApi').router)

app.use('/api/startDriverTripFrom', require('./routes/api/startDriverTripFrom'))
app.use('/api/startDriverTripTo', require('./routes/api/startDriverTripTo'))
app.use('/api/endDriverTripFrom', require('./routes/api/endDriverTripFrom'))
app.use('/api/endDriverTripTo', require('./routes/api/endDriverTripTo'))