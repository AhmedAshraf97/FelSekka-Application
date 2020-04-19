const graphlib = require('graphlib');
const ksp = require('k-shortest-path');
var Combinatorics = require('js-combinatorics');



function diff_minutes(dt2, dt1) {

    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return (Math.round(diff));

}

function add_minutes(d1, miuntes) {

    var d2 = new Date(d1);
    d2.setMinutes(d1.getMinutes() + miuntes);
    return d2
}

class Rider {
    constructor(ID, Name, Location, DistanceFromOrganization, Options, DepartureTime, TimeFromOrganizationMinutes, LatestDropOff) {
        this.ID = ID;
        this.Name = Name;
        this.Location = Location;
        this.isAssigned = false;
        this.DriverAssigned = -1;
        this.DistanceFromOrganization = DistanceFromOrganization;
        this.TimeFromOrganizationMinutes = TimeFromOrganizationMinutes;
        this.TrustedDrivers = []
        this.UnTrustedDrivers = []

        this.MaxDistanceToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max distance from rider to all other riders
        this.MaxDurationToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max duration from rider to all other riders

        //options ( GenderSmokingMusic)
        this.Options = Options;

        //Timing
        this.DepartureTime = new Date(DepartureTime[0], DepartureTime[1], DepartureTime[2], DepartureTime[3], DepartureTime[4], DepartureTime[5]);
        this.LatestDropOff = new Date(LatestDropOff[0], LatestDropOff[1], LatestDropOff[2], LatestDropOff[3], LatestDropOff[4], LatestDropOff[5]);
        this.DropOffTime = this.DepartureTime
    }
};
class Driver {
    constructor(ID, Name, Location, DistanceFromOrganization, Options, PoolStartTime, TimeFromOrganizationMinutes, capacity, LatestDropOff) {
        this.ID = ID;
        this.Name = Name;
        this.Location = Location;
        this.AssignedRiders = [ID];
        this.TotalDistanceCoveredToDestination = 0;
        this.TotalDurationTaken = 0;
        this.DistanceFromOrganization = DistanceFromOrganization;
        this.TimeFromOrganizationMinutes = TimeFromOrganizationMinutes;
        this.capacity = capacity
        this.iteration = 0;
        this.MaxDistance = 1.5 * DistanceFromOrganization //removeee
            //options ( GenderSmokingMusic)
        this.Options = Options;
        this.calDropoff = 0;

        this.MaxDistanceToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max distance from rider to all other riders
        this.MaxDurationToNormalize = Number.NEGATIVE_INFINITY; //get from database ,, max duration from rider to all other riders
        this.MaxDropoffDiffToNormalize = Number.NEGATIVE_INFINITY;

        //Timing
        this.LatestDropOff = new Date(LatestDropOff[0], LatestDropOff[1], LatestDropOff[2], LatestDropOff[3], LatestDropOff[4], LatestDropOff[5]);
        this.PoolStartTime = new Date(PoolStartTime[0], PoolStartTime[1], PoolStartTime[2], PoolStartTime[3], PoolStartTime[4], PoolStartTime[5]);
        this.DropOffTime = this.PoolStartTime
        this.MaxDuration = diff_minutes(this.LatestDropOff, this.PoolStartTime)


    }
};

class distance {
    constructor(from, to, distance) {
        this.from = from;
        this.to = to;
        this.distance = distance;
        this.checked = 0;

    }

}
class duration {
    constructor(from, to, duration) {
        this.from = from;
        this.to = to;
        this.duration = duration;
        this.checked = 0;

    }

}
class userArray {
    constructor(ID) {
        this.length = 0;
        this.ID = ID;
        this.checked = 0;
        this.data = [];
    }
    getElementAtIndex(index) {
        return this.data[index];
    }
    push(element) {
        this.data[this.length] = element;
        this.length++;
        return this.length;
    }
    pop() {
        const item = this.data[this.length - 1];
        delete this.data[this.length - 1];
        this.length--;
        return this.data;
    }
    deleteAt(index) {
        for (let i = index; i < this.length - 1; i++) {
            this.data[i] = this.data[i + 1];
        }
        delete this.data[this.length - 1];
        this.length--;
        return this.data;
    }
    insertAt(item, index) {
        for (let i = this.length; i >= index; i--) {
            this.data[i] = this.data[i - 1];
        }
        this.data[index] = item;
        this.length++;
        return this.data;
    }
}
class values {
    constructor(to, from, distance) {
        this.from = from;
        this.to = to;
        this.distance = distance;
    }

}

//Ahmed //
values1 = new values(10, 1, 5.6)
values2 = new values(10, 2, 0.1);
values3 = new values(10, 5, 5.7);
values4 = new values(10, 7, 4.9);
values5 = new values(10, 12, 4.6);


//Farah 
values6 = new values(11, 4, 1);
values7 = new values(11, 6, 1.1);
values8 = new values(11, 8, 0.5);
values9 = new values(11, 9, 3);
values10 = new values(11, 13, 3);


//Youssef
values11 = new values(14, 1, 1.7)
values12 = new values(14, 2, 5.8)
values13 = new values(14, 5, 1.1)
values14 = new values(14, 7, 8.1)
values15 = new values(14, 12, 8)


//NarimanDriver //
values16 = new values(15, 1, 5.6)
values17 = new values(15, 2, 0.1);
values18 = new values(15, 5, 5.7);
values19 = new values(15, 7, 4.9);
values20 = new values(15, 12, 4.6);


var value = [values1, values2, values3, values4, values5,
    values6, values7, values8, values9, values10,
    values11, values12, values13, values14, values15, values16, values17, values18, values19, values20
];
var driversID = [10, 11, 14, 15]
    ////////////////////////////////////////////////////RiderDatabase//////////// filter options and arrival time(-30,30) ,organization
values12r = new values(1, 2, 7.3);
values15r = new values(1, 5, 0.6); //Dina
values17r = new values(1, 7, 16);
values112r = new values(1, 12, 14);

values21r = new values(2, 1, 5.7);
values25r = new values(2, 5, 5.8);
values27r = new values(2, 7, 4.9); // Nariman
values212r = new values(2, 12, 4.6);

values51r = new values(5, 1, 0.6); //10:20 M11
values52r = new values(5, 2, 6.8);
values57r = new values(5, 7, 15); //Salma
values512r = new values(5, 12, 14);


values71r = new values(7, 1, 11);
values72r = new values(7, 2, 4.5); //Karim
values75r = new values(7, 5, 12);
values712r = new values(7, 12, 0.35);
values73r = new values(7, 3, 8.3)


values121r = new values(12, 1, 11);
values122r = new values(12, 2, 4.3); //Khaled
values125r = new values(12, 5, 11);
values127r = new values(12, 7, 0.35);
values123r = new values(12, 3, 8.2)



////////////////////////////////////////

values46r = new values(4, 6, 1.8);
values48r = new values(4, 8, 1.1); //rana
values49r = new values(4, 9, 2.8);
values413r = new values(4, 13, 2.8);

values64r = new values(6, 4, 2.8);
values68r = new values(6, 8, 2.1);
values69r = new values(6, 9, 4.3); // gezart 3arab
values613r = new values(6, 13, 3.3);

values84r = new values(8, 4, 1.9); //10:20 M11
values86r = new values(8, 6, 0.6);
values89r = new values(8, 9, 3.5); //gam3at dewl
values813r = new values(8, 13, 3.1);


values94r = new values(9, 4, 3.1);
values96r = new values(9, 6, 4.2); //semsema
values98r = new values(9, 8, 4.2);
values913r = new values(9, 13, 3.4);



values134r = new values(13, 4, 2.2);
values136r = new values(13, 6, 3.5); //mosda2
values138r = new values(13, 8, 3.4);
values139r = new values(13, 9, 1.7);


var valuer = [values12r, values15r, values17r, values112r, values21r, values25r,
    values27r, values212r, values51r, values52r, values57r,
    values512r, values71r, values72r, values73r, values75r, values712r, values121r, values122r, values123r, values125r, values127r,
    values46r, values48r, values49r, values413r, values64r, values68r, values69r, values613r, values84r, values86r, values89r,
    values813r, values94r, values96r, values98r, values913r, values134r, values136r, values138r, values139r
]


//var valuer = [values1r, values2r, values3r, values4r, values5r, values6r, values7r, values8r, values9r, values10r, values11r, values12r, values13r, values14r, values15r, values16r, values17r, values18r, values19r, values20r, values21r, values22r, values23r, values24r];
var RidersID = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13]


/////////////////////DURATION////


dvalues1 = new values(10, 1, 12);
dvalues2 = new values(10, 2, 1);
dvalues3 = new values(10, 5, 13);
dvalues4 = new values(10, 7, 16);
dvalues5 = new values(10, 12, 17);



dvalues6 = new values(11, 4, 5);
dvalues7 = new values(11, 6, 4);
dvalues8 = new values(11, 8, 2);
dvalues9 = new values(11, 9, 10);
dvalues10 = new values(11, 13, 11);

dvalues11 = new values(14, 1, 6);
dvalues12 = new values(14, 2, 12);
dvalues13 = new values(14, 5, 4);
dvalues14 = new values(14, 7, 20);
dvalues15 = new values(14, 12, 21);

dvalues16 = new values(15, 1, 12);
dvalues17 = new values(15, 2, 1);
dvalues18 = new values(15, 5, 13);
dvalues19 = new values(15, 7, 16);
dvalues20 = new values(15, 12, 17);



var dvalue = [dvalues1, dvalues2, dvalues3, dvalues4, dvalues5,
    dvalues6, dvalues7, dvalues8, dvalues9, dvalues10,
    dvalues11, dvalues12, dvalues13, dvalues14, dvalues15, dvalues16, dvalues17, dvalues18, dvalues19, dvalues20
];

////////////////////////////////////////////////////RiderDatabase//////////// filter options and arrival time(-30,30) ,organization
dvalues12r = new values(1, 2, 21);
dvalues15r = new values(1, 5, 4); //Dina
dvalues17r = new values(1, 7, 24);
dvalues112r = new values(1, 12, 24);


dvalues21r = new values(2, 1, 12);
dvalues25r = new values(2, 5, 13); // Nariman
dvalues27r = new values(2, 7, 16);
dvalues212r = new values(2, 12, 17);


dvalues51r = new values(5, 1, 3);
dvalues52r = new values(5, 2, 17); // Salma
dvalues57r = new values(5, 7, 23);
dvalues512r = new values(5, 12, 23);

dvalues71r = new values(7, 1, 22);
dvalues72r = new values(7, 2, 13); // Karim
dvalues75r = new values(7, 5, 23);
dvalues712r = new values(7, 12, 2);
dvalues73r = new values(7, 3, 17)

dvalues121r = new values(12, 1, 22);
dvalues122r = new values(12, 2, 13); // Khaled
dvalues125r = new values(12, 5, 22);
dvalues127r = new values(12, 7, 2);
dvalues123r = new values(12, 3, 18)

dvalues46r = new values(4, 6, 8);
dvalues48r = new values(4, 8, 4); //rana
dvalues49r = new values(4, 9, 9);
dvalues413r = new values(4, 13, 10);

dvalues64r = new values(6, 4, 10);
dvalues68r = new values(6, 8, 6);
dvalues69r = new values(6, 9, 12); // gezart 3arab
dvalues613r = new values(6, 13, 11);

dvalues84r = new values(8, 4, 6); //10:20 M11
dvalues86r = new values(8, 6, 3);
dvalues89r = new values(8, 9, 7); //gam3at dewl
dvalues813r = new values(8, 13, 11);


dvalues94r = new values(9, 4, 8);
dvalues96r = new values(9, 6, 12); //semsema
dvalues98r = new values(9, 8, 10);
dvalues913r = new values(9, 13, 10);



dvalues134r = new values(13, 4, 6);
dvalues136r = new values(13, 6, 11); //mosda2
dvalues138r = new values(13, 8, 8);
dvalues139r = new values(13, 9, 5);


var dvaluer = [dvalues12r, dvalues15r, dvalues17r, dvalues112r, dvalues21r, dvalues25r,
    dvalues27r, dvalues212r, dvalues51r, dvalues52r, dvalues57r,
    dvalues512r, dvalues71r, dvalues72r, dvalues73r, dvalues75r, dvalues712r, dvalues121r, dvalues122r, dvalues125r, dvalues127r, dvalues123r,
    dvalues46r, dvalues48r, dvalues49r, dvalues413r, dvalues64r, dvalues68r, dvalues69r, dvalues613r, dvalues84r, dvalues86r, dvalues89r,
    dvalues813r, dvalues94r, dvalues96r, dvalues98r, dvalues913r, dvalues134r, dvalues136r, dvalues138r, dvalues139r
]



var firstDriver = new Driver(10, "Ahmed", [29.973, 31.28251], 13, 'M11', [2020, 3, 10, 4, 0, 0], 24, 7, [2020, 3, 10, 6, 0, 0]);
var secondDriver = new Driver(11, "Farah", [29.97773, 31.31338], 4.6, 'F01', [2020, 3, 10, 4, 0, 0], 12, 5, [2020, 3, 10, 5, 30, 0]);
var thirdDriver = new Driver(14, "Youssef", [29.972, 31.222], 16, 'M11', [2020, 3, 10, 4, 0, 0], 24, 7, [2020, 3, 10, 6, 0, 0]);
var fourthDriver = new Driver(15, "NarimanDriver", [29.9762, 31.28636], 13, 'M11', [2020, 3, 10, 4, 0, 0], 24, 5, [2020, 3, 10, 6, 00, 0]);



var Rider1 = new Rider(1, "Dina", [29.98409, 31.30631], 17, 'F01', [2020, 3, 10, 3, 45, 0], 24, [2020, 3, 10, 4, 30, 0]);
var Rider2 = new Rider(2, "Nariman", [29.9762, 31.28636], 13, 'M11', [2020, 3, 10, 4, 0, 0], 24, [2020, 3, 10, 5, 15, 0]);
var Rider3 = new Rider(3, "salma", [29.9769, 31.28636], 2.8, 'M11', [2020, 3, 10, 5, 00, 0], 8, [2020, 3, 10, 4, 30, 0]);
var Rider5 = new Rider(5, "salma saber ", [29.9762, 31.28636], 16, 'M11', [2020, 3, 10, 3, 0, 0], 23, [2020, 3, 10, 5, 15, 0]);
var Rider7 = new Rider(7, "karim", [29.98409, 31.30631], 11, 'F01', [2020, 3, 10, 3, 55, 0], 21, [2020, 3, 10, 5, 5, 0]);
var Rider12 = new Rider(12, "khaled", [29.98409, 31.30631], 11, 'F01', [2020, 3, 10, 4, 0, 0], 21, [2020, 3, 10, 6, 0, 0]);


var Rider4 = new Rider(4, "rana", [29.98409, 31.30631], 4.3, 'F01', [2020, 3, 10, 4, 0, 0], 9, [2020, 3, 10, 5, 15, 0]);
var Rider6 = new Rider(6, "gzrt3arb", [29.9769, 31.28636], 7, 'M11', [2020, 3, 10, 4, 0, 0], 16, [2020, 3, 10, 5, 35, 0]);
var Rider8 = new Rider(8, "gam3tdewl", [29.9762, 31.28636], 4.9, 'F01', [2020, 3, 10, 4, 0, 0], 12, [2020, 3, 10, 5, 35, 0]);
var Rider9 = new Rider(9, "semsema", [29.9769, 31.28636], 1.5, 'M11', [2020, 3, 10, 4, 0, 0], 5, [2020, 3, 10, 5, 50, 0]);
var Rider13 = new Rider(13, "msda2", [29.9769, 31.28636], 3.8, 'M11', [2020, 3, 10, 4, 0, 0], 8, [2020, 3, 10, 5, 0, 0]);
var Drivers = new Array();

Drivers.push(firstDriver);
Drivers.push(secondDriver);
Drivers.push(thirdDriver)
Drivers.push(fourthDriver)
var Riders = new Array();
Riders.push(Rider1);
Riders.push(Rider2);
Riders.push(Rider3);
Riders.push(Rider4);
Riders.push(Rider5);
Riders.push(Rider6);
Riders.push(Rider7);
Riders.push(Rider8);
Riders.push(Rider9);
Riders.push(Rider12)
Riders.push(Rider13)


////////////////////////////////////////////////////////////

var DriversRider = new Array();

for (var i = 0; i < Drivers.length; i++) { //get id's from offers
    var driverID = Drivers[i].ID
    var DriverRow = new userArray(driverID);

    for (var j = 0; j < value.length; j++) {
        if (value[j].to === driverID) {
            var distanceObj = new distance(value[j].from, value[j].to, value[j].distance);
            Drivers[i].MaxDistanceToNormalize = Math.max(value[j].distance, Drivers[i].MaxDistanceToNormalize)
            DriverRow.push(distanceObj);
        }

    }
    if (Drivers[i].MaxDistanceToNormalize === 0)
        Drivers[i].MaxDistanceToNormalize = 1;
    DriversRider.push(DriverRow);



}

var RiderRider = new Array();

for (var i = 0; i < Riders.length; i++) {
    var riderID = Riders[i].ID
    var RiderRow = new userArray(riderID);

    for (var j = 0; j < valuer.length; j++) {
        if (valuer[j].to === riderID) {
            var distanceObj = new distance(valuer[j].from, valuer[j].to, valuer[j].distance);
            Riders[i].MaxDistanceToNormalize = Math.max(valuer[j].distance, Riders[i].MaxDistanceToNormalize)

            RiderRow.push(distanceObj);
        }



    }
    if (Riders[i].MaxDistanceToNormalize === 0)
        Riders[i].MaxDistanceToNormalize = 1;
    RiderRider.push(RiderRow);


}

var DriversRidersDuration = new Array();

for (var i = 0; i < Drivers.length; i++) { //get id's from offers

    var driverID = Drivers[i].ID
    var DriverRowDuration = new userArray(driverID);
    var diffDropOff;

    for (var j = 0; j < dvalue.length; j++) {
        if (dvalue[j].to === driverID) {
            var durationObj = new duration(dvalue[j].from, dvalue[j].to, dvalue[j].distance);
            Riders[i].MaxDurationToNormalize = Math.max(dvalue[j].distance, Drivers[i].MaxDurationToNormalize)
            diffDropOff = diff_minutes(Drivers[i].LatestDropOff, Riders.find(n => n.ID === dvalue[j].from).LatestDropOff) - dvalue[j].distance
            Riders[i].MaxEarliestDiffToNormalize = Math.max(diffDropOff, Drivers[i].MaxEarliestDiffToNormalize)

            DriverRowDuration.push(durationObj);
        }

    }
    if (Drivers[i].MaxDurationToNormalize === 0)
        Drivers[i].MaxDurationToNormalize = 1;

    if (Drivers[i].MaxEarliestDiffToNormalize === 0)
        Drivers[i].MaxEarliestDiffToNormalize = 1;
    DriversRidersDuration.push(DriverRowDuration);


}

var RiderRiderDuration = new Array();


for (var i = 0; i < Riders.length; i++) {
    var riderID = Riders[i].ID
    var RiderRowDuration = new userArray(riderID);

    for (var j = 0; j < dvaluer.length; j++) {
        if (dvaluer[j].to === riderID) {
            var durationObj = new duration(dvaluer[j].from, dvaluer[j].to, dvaluer[j].distance);
            Riders[i].MaxDurationToNormalize = Math.max(dvaluer[j].distance, Riders[i].MaxDurationToNormalize)

            RiderRowDuration.push(durationObj);
        }
        if (Riders[i].MaxDurationToNormalize === 0)
            Riders[i].MaxDurationToNormalize = 1;



    }
    RiderRiderDuration.push(RiderRowDuration);


}


function SetDropOffTime(DriverObj) {

    if (DriverObj.AssignedRiders.length == 1) {
        return; //Driver has no passengers
    }

    var fromIndex;
    var toIndex;
    var OldTotalDurationTaken = DriverObj.TotalDurationTaken
    var OldTotalDistanceCoveredToDestination = DriverObj.TotalDistanceCoveredToDestination
    DriverObj.TotalDurationTaken = 0;
    DriverObj.TotalDistanceCoveredToDestination = 0;

    for (var i = DriverObj.AssignedRiders.length - 1; i >= 0; i--) {

        if (i == 0) { // Last iteration ( driver dropoff )
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[1]))
            fromRiderID = DriverObj.AssignedRiders[1];
            DriverIndexinDriverRidersDuration = DriversRidersDuration.indexOf(DriversRidersDuration.find(n => n.ID === DriverObj.ID))
            DriverIndexinDriverRiders = DriversRider.indexOf(DriversRider.find(n => n.ID === DriverObj.ID))
            var datee = new Date(Riders[fromIndex].DropOffTime);
            DriverObj.DropOffTime = datee
            DriverObj.DropOffTime.setMinutes(Riders[fromIndex].DropOffTime.getMinutes() + DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.from === fromRiderID).duration)

            DriverObj.TotalDurationTaken += DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.from === fromRiderID).duration;
            DriverObj.TotalDistanceCoveredToDestination += DriversRider[DriverIndexinDriverRiders].data.find(n => n.from === fromRiderID).distance;

            if (DriverObj.DropOffTime > DriverObj.LatestDropOff) {

                DriverObj.TotalDistanceCoveredToDestination = OldTotalDistanceCoveredToDestination
                DriverObj.TotalDurationTaken = OldTotalDurationTaken

                return Promise.resolve(-1);
            }

        } else if (i == DriverObj.AssignedRiders.length - 1) { // First iteration ( first Rider ) 

            fromIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[i]))
            var datee = new Date(DriverObj.PoolStartTime);
            Riders[fromIndex].DropOffTime = datee
            DriverObj.TotalDistanceCoveredToDestination += Riders[fromIndex].DistanceFromOrganization;
            DriverObj.TotalDurationTaken += Riders[fromIndex].TimeFromOrganizationMinutes;
            Riders[fromIndex].DropOffTime.setMinutes(DriverObj.PoolStartTime.getMinutes() + Riders[fromIndex].TimeFromOrganizationMinutes)

            if (Riders[fromIndex].DropOffTime > Riders[fromIndex].LatestDropOff) {
                DriverObj.TotalDistanceCoveredToDestination = OldTotalDistanceCoveredToDestination
                DriverObj.TotalDurationTaken = OldTotalDurationTaken
                return Promise.resolve(-1);
            }
        } else {
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[i + 1]));
            toIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[i]));
            var toID = DriverObj.AssignedRiders[i];
            var fromID = DriverObj.AssignedRiders[i + 1]
            ToIndexinRiderRiderDuration = RiderRiderDuration.indexOf(RiderRiderDuration.find(n => n.ID === toID));
            ToIndexinRiderRider = RiderRider.indexOf(RiderRider.find(n => n.ID === toID));
            var datee = new Date(Riders[fromIndex].DropOffTime);
            RiderDropOff = datee
            Riders[toIndex].DropOffTime.setMinutes(Riders[fromIndex].DropOffTime.getMinutes() + RiderRiderDuration[ToIndexinRiderRiderDuration].data.find(n => n.from === fromID).duration)
            DriverObj.TotalDurationTaken += RiderRiderDuration[ToIndexinRiderRiderDuration].data.find(n => n.from === fromID).duration;
            DriverObj.TotalDistanceCoveredToDestination += RiderRider[ToIndexinRiderRiderDuration].data.find(n => n.from === fromID).distance;

            if (Riders[toIndex].DropOffTime > Riders[toIndex].LatestDropOff) {
                DriverObj.TotalDistanceCoveredToDestination = OldTotalDistanceCoveredToDestination
                DriverObj.TotalDurationTaken = OldTotalDurationTaken
                return Promise.resolve(-1);
            }
        }
    }
    return Promise.resolve(DriverObj.TotalDurationTaken);
}


async function Reorder() {

    //Reordering 

    for (var k = 0; k < Drivers.length; k++) {

        DriverID = Drivers[k].ID;
        DriverIDstr = `${DriverID}`
        let g = new graphlib.Graph();
        var OrganizationID = "ORG";
        g.setNode(DriverIDstr)
        g.setNode(OrganizationID)
        for (var l = 1; l < Drivers[k].AssignedRiders.length; l++) {
            var RiderID = Drivers[k].AssignedRiders[l];
            RiderIDstr = `${RiderID}`
            var Durationn = DriversRidersDuration.find(n => n.ID === DriverID).data.find(n => n.from === RiderID).duration;
            g.setNode(RiderIDstr)
            g.setEdge(RiderIDstr, DriverIDstr, Durationn)
            g.setEdge(OrganizationID, RiderIDstr, Riders.find(n => n.ID === RiderID).TimeFromOrganizationMinutes)
        }

        for (var p = 1; p < Drivers[k].AssignedRiders.length; p++) {
            for (var m = 1; m < Drivers[k].AssignedRiders.length; m++) {

                if (m != p) {
                    var SourceID = Drivers[k].AssignedRiders[p]
                    var DestID = Drivers[k].AssignedRiders[m]
                    var Durationn = RiderRiderDuration.find(n => n.ID === DestID).data.find(n => n.from === SourceID).duration
                    SourceID = `${SourceID}`
                    DestID = `${DestID}`
                    g.setEdge(SourceID, DestID, Durationn)
                }
            }
        }

        var n = Drivers[k].AssignedRiders.length - 1;
        var count = n;
        var kValue = 0;

        while (true) {
            kValue += Combinatorics.P(n, count)
            count--;
            if (count == 0)
                break;

        }


        var response = ksp.ksp(g, OrganizationID, DriverIDstr, kValue);
        response = response.filter(p => (p.edges.length == n + 1) && p.totalCost <= (Drivers[k].TotalDurationTaken))

        for (var d = 0; d < response.length; d++) {
            var AssignedTemp = []
            for (var j = response[d].edges.length - 1; j >= 0; j--) {
                AssignedTemp.push(parseInt(response[d].edges[j].toNode))
            }
            Drivers[k].AssignedRiders = AssignedTemp;
            var ValidDuration = await SetDropOffTime(Drivers[k])
            if (ValidDuration != -1) {
                break;
            }
        }

    }


    return Promise.resolve();
}


async function main() {
    var NumberOfUnAssignedRiders = Riders.length;
    var count = -1;
    while (count != Drivers.length) {

        if (NumberOfUnAssignedRiders === 0)
            break;

        for (var j = 0; j < Drivers.length; j++) {

            if (NumberOfUnAssignedRiders === 0)
                break;

            var DriverID = Drivers[j].ID;
            var LastRiderExists = false;
            var chosenDuration = -1
            var chosenDistance = -1
            var lastRiderID = Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] /////
            var ChosenRiderID = -1;
            var indexinDriverRider = DriversRider.findIndex(n => n.ID == DriverID);
            if (lastRiderID === DriverID) { //First Rider to be assigned

                if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] == Drivers[j].ID) // last rider -> driver
                {
                    var indexinDriverRider = DriversRidersDuration.findIndex(n => n.ID == Drivers[j].ID);
                    if (DriversRidersDuration[indexinDriverRider].checked === DriversRidersDuration[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                        continue;

                    }

                }
                var WeightArray = []
                var WeightIndex = []


                for (var k = 0; k < DriversRidersDuration[indexinDriverRider].length; k++) {
                    var RiderID = DriversRidersDuration[indexinDriverRider].data[k].from
                    var Distance = DriversRider[indexinDriverRider].data[k].distance
                    var Duration = DriversRidersDuration[indexinDriverRider].data[k].duration;
                    var Trust = 0;
                    if (diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) > 30 || diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) < 0) {
                        DriversRidersDuration[indexinDriverRider].data.find(n => n.from === RiderID).checked = 1;
                        DriversRidersDuration[indexinDriverRider].checked++;
                        continue;
                    }

                    if (DriversRidersDuration[indexinDriverRider].data.find(n => n.from === RiderID).checked === 1) {
                        continue;
                    }

                    if (Riders.find(n => n.ID === RiderID).TrustedDrivers.find(n => n === DriverID)) //given from rider
                        Trust = 1
                    else if (Riders.find(n => n.ID === RiderID).UnTrustedDrivers.find(n => n === DriverID))
                        Trust = -1;

                    //add duration 
                    if (Riders.find(n => n.ID === RiderID).isAssigned === false) {

                        var WeightFunction = -0.45 * Duration / Drivers[j].MaxDurationToNormalize - 0.25 * Distance / Drivers[j].MaxDistanceToNormalize + 0.3 * Trust -
                            0.15 * (diff_minutes(Drivers[j].LatestDropOff, Riders.find(n => n.ID === RiderID).LatestDropOff) - Duration) / Drivers[j].MaxDropoffDiffToNormalize -
                            0.04 * diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) / 30; ///arrival time diff
                        WeightArray.push(WeightFunction)
                        WeightIndex.push(RiderID)
                    } else {
                        DriversRidersDuration[indexinDriverRider].data.find(n => n.from === RiderID).checked = 1;
                        DriversRidersDuration[indexinDriverRider].checked++;
                    }
                }

                if (WeightArray.length > 0) {
                    ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(Math, WeightArray))]
                    chosenDistance = DriversRider[indexinDriverRider].data.find(n => n.from === ChosenRiderID).distance
                    chosenDuration = DriversRidersDuration[indexinDriverRider].data.find(n => n.from === ChosenRiderID).duration
                    DriversRidersDuration[indexinDriverRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                    DriversRidersDuration[indexinDriverRider].checked++;
                }

            } else { // Not First Rider

                var indexinRiderRider = RiderRiderDuration.findIndex(n => n.ID == Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (RiderRiderDuration[indexinRiderRider].checked === RiderRiderDuration[indexinRiderRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    continue;

                }
                var indexinRiderRider = RiderRiderDuration.indexOf(RiderRiderDuration.find(n => n.ID == lastRiderID));
                var WeightArray = []
                var WeightIndex = []
                for (var k = 0; k < RiderRiderDuration[indexinRiderRider].length; k++) {
                    var RiderID = RiderRiderDuration[indexinRiderRider].data[k].from
                    var IndexInRiders = Riders.findIndex(n => n.ID === RiderID)

                    if (diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) > 30 || diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) < 0) {
                        RiderRiderDuration[indexinRiderRider].data.find(n => n.from === RiderID).checked = 1;
                        RiderRiderDuration[indexinRiderRider].checked++;
                        continue;

                    }
                    if (RiderRiderDuration[indexinRiderRider].data.find(n => n.from === RiderID).checked === 1) {
                        continue;
                    }

                    var Distance = RiderRider[indexinRiderRider].data[k].distance
                    var Duration = RiderRiderDuration[indexinRiderRider].data[k].duration;
                    var Trust = 0;


                    if (Riders.find(n => n.ID === RiderID).TrustedDrivers.find(n => n === DriverID)) //given from rider
                        Trust = 1
                    else if (Riders.find(n => n.ID === RiderID).UnTrustedDrivers.find(n => n === DriverID))
                        Trust = -1;



                    //add duration ,,trial error equation

                    if (Riders.find(n => n.ID === RiderID).isAssigned === false) {

                        var WeightFunction = -0.45 * Duration / Riders[IndexInRiders].MaxDurationToNormalize - 0.25 * Distance / Riders[IndexInRiders].MaxDistanceToNormalize + 0.3 * Trust -
                            0.04 * diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) / 30
                        WeightArray.push(WeightFunction)
                        WeightIndex.push(RiderID)
                    } else {

                        RiderRiderDuration[indexinRiderRider].data.find(n => n.from === RiderID).checked = 1;
                        RiderRiderDuration[indexinRiderRider].checked++;
                    }



                }
                if (WeightArray.length > 0) {

                    ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(null, WeightArray))]
                    chosenDistance = RiderRider[indexinRiderRider].data.find(n => n.from === ChosenRiderID).distance
                    chosenDuration = RiderRiderDuration[indexinRiderRider].data.find(n => n.from === ChosenRiderID).duration
                    RiderRiderDuration[indexinRiderRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                    RiderRiderDuration[indexinRiderRider].checked++;


                }

                LastRiderExists = true;

            }

            if (ChosenRiderID != -1 && chosenDuration != -1) {


                /////////////////////////////////////////////////////////////////////////////////////////////////////////
                var fromIndex;
                var toIndex;
                var invalidRider = 0;

                // driver rider1 rider2 "chosenrider" organization
                // driver  chosenrider organization
                toIndex = Riders.indexOf(Riders.find(n => n.ID === ChosenRiderID))
                var datee = new Date(Drivers[j].PoolStartTime);
                Riders[toIndex].DropOffTime = datee
                Riders[toIndex].DropOffTime.setMinutes(Drivers[j].PoolStartTime.getMinutes() + Riders[toIndex].TimeFromOrganizationMinutes)
                if (Riders[toIndex].DropOffTime > Riders[toIndex].LatestDropOff) {
                    invalidRider = 1;

                }
                if (invalidRider !== 1) {
                    Drivers[j].AssignedRiders.push(ChosenRiderID)
                    var ValidDuration = await SetDropOffTime(Drivers[j])
                    Drivers[j].AssignedRiders.pop()
                    if (ValidDuration === -1) {

                        continue;
                    }
                } else {
                    continue;
                }
                //////////////////////////////////////////////////////////////////////////////////////////////////////////
                maxDurationCurrentRider = Drivers[j].TotalDurationTaken
                    // maxDurationCurrentRider = Drivers[j].TotalDurationTaken + chosenDuration + Riders.find(n => n.ID === ChosenRiderID).TimeFromOrganizationMinutes;
                if (maxDurationCurrentRider < Drivers[j].MaxDuration) {
                    Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                    Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                    Drivers[j].AssignedRiders.push(ChosenRiderID)
                        //   Drivers[j].TotalDistanceCoveredToDestination += chosenDistance;
                        //  Drivers[j].TotalDurationTaken += chosenDuration;
                    NumberOfUnAssignedRiders--;

                } else {

                    var Delta = 0;

                    if (lastRiderID !== DriverID) {

                        var TimeTakenWithoutTakingRider = Riders.find(n => n.ID === lastRiderID).TimeFromOrganizationMinutes;
                        var TimeTakenAfterTakingRider = RiderRiderDuration.find(n => n.ID === lastRiderID).data.find(n => n.from === ChosenRiderID).duration + Riders.find(n => n.ID === ChosenRiderID).TimeFromOrganizationMinutes
                        Delta = TimeTakenAfterTakingRider - TimeTakenWithoutTakingRider;
                    } else {
                        //var DriverIndex = Drivers.indexOf(Drivers.find(n => n.ID === DriverID));
                        var TimeTakenWithoutTakingRider = Drivers[j].TimeFromOrganizationMinutes
                        var TimeTakenAfterTakingRider = DriversRidersDuration[indexinDriverRider].data.find(n => n.from === ChosenRiderID).duration + Riders.find(n => n.ID === ChosenRiderID).TimeFromOrganizationMinutes
                        Delta = TimeTakenAfterTakingRider - TimeTakenWithoutTakingRider;


                    }
                    var CheckedDelta = Math.max(0.25 * Drivers[j].MaxDuration, 10)

                    if (Delta < CheckedDelta && maxDurationCurrentRider < Drivers[j].MaxDuration) {
                        Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                        Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                        Drivers[j].AssignedRiders.push(ChosenRiderID)
                            //  Drivers[j].TotalDistanceCoveredToDestination += chosenDistance;
                            //Drivers[j].TotalDurationTaken += chosenDuration;
                        NumberOfUnAssignedRiders--;

                    }



                }

            }
        }
        count = 0;
        for (var j = 0; j < Drivers.length; j++) {


            if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] == Drivers[j].ID) // last rider driver
            {
                var indexinDriverRider = DriversRidersDuration.findIndex(n => n.ID == Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (DriversRidersDuration[indexinDriverRider].checked === DriversRidersDuration[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }


            } else {
                var indexinRiderRider = RiderRiderDuration.findIndex(n => n.ID == Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (RiderRiderDuration[indexinRiderRider].checked === RiderRiderDuration[indexinRiderRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }
            }
        }

    }

    // Reorder and calculate dropOff
    var x = await Reorder();

    //Print
    for (var i = 0; i < Drivers.length; i++) {

        console.log(Drivers[i].ID, Drivers[i].Name, Drivers[i].AssignedRiders)
        console.log("Total Covered = ", Drivers[i].TotalDistanceCoveredToDestination, " max duration ", Drivers[i].MaxDuration, "total time taken", Drivers[i].TotalDurationTaken, "dropoff", Drivers[i].DropOffTime)
        for (var j = 1; j < Drivers[i].AssignedRiders.length; j++) {
            index1 = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j]));
            console.log(Drivers[i].AssignedRiders[j], "Drop off", Riders[index1].DropOffTime)
        }
        console.log(" //////////////////////////////////////////// ")
    }

}


main()