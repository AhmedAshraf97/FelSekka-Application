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
    constructor(ID, Name, Location, DistanceToOrganization, Options, ArrivalTime, TimeToOrganizationMinutes, EarliestPickup) {
        this.ID = ID;
        this.Name = Name;
        this.Location = Location;
        this.isAssigned = false;
        this.DriverAssigned = -1;
        this.DistanceToOrganization = DistanceToOrganization;
        this.TimeToOrganizationMinutes = TimeToOrganizationMinutes;
        this.TrustedDrivers = []
        this.UnTrustedDrivers = []

        this.EarliestPickup = new Date(EarliestPickup[0], EarliestPickup[1], EarliestPickup[2], EarliestPickup[3], EarliestPickup[4], EarliestPickup[5]);

        //options ( GenderSmokingMusic)
        this.Options = Options;


        //Timing
        this.ArrivalTime = new Date(ArrivalTime[0], ArrivalTime[1], ArrivalTime[2], ArrivalTime[3], ArrivalTime[4], ArrivalTime[5]);
        this.PickupTime = this.ArrivalTime

    }
};
class Driver {
    constructor(ID, Name, Location, DistanceToOrganization, Options, ArrivalTime, TimeToOrganizationMinutes, capacity, EarliestStartTime) {
        this.ID = ID;
        this.Name = Name;
        this.Location = Location;
        this.AssignedRiders = [ID];
        this.TotalDistanceCoveredToDestination = 0;
        this.TotalDurationTaken = 0;
        this.DistanceToOrganization = DistanceToOrganization;
        this.TimeToOrganizationMinutes = TimeToOrganizationMinutes;
        this.EarliestStartTime = new Date(EarliestStartTime[0], EarliestStartTime[1], EarliestStartTime[2], EarliestStartTime[3], EarliestStartTime[4], EarliestStartTime[5]);
        this.capacity = capacity
        this.iteration = 0;
        this.MaxDistance = 1.5 * DistanceToOrganization //removeee
            //options ( GenderSmokingMusic)
        this.Options = Options;

        //Timing
        this.PoolStartTime = new Date();
        this.ArrivalTime = new Date(ArrivalTime[0], ArrivalTime[1], ArrivalTime[2], ArrivalTime[3], ArrivalTime[4], ArrivalTime[5]);

        this.MaxDuration = diff_minutes(this.ArrivalTime, this.EarliestStartTime)

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
    constructor(from, to, distance) {
        this.from = from;
        this.to = to;
        this.distance = distance;
    }
}

/////////////////////////////DataBase/////////////////////////////////////////

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



var firstDriver = new Driver(10, "Ahmed", [29.973, 31.28251], 13, 'M11', [2020, 3, 10, 10, 0, 0], 24, 7, [2020, 3, 10, 9, 0, 0]);
var secondDriver = new Driver(11, "Farah", [29.97773, 31.31338], 4.6, 'F01', [2020, 3, 10, 4, 0, 0], 12, 5, [2020, 3, 10, 2, 30, 0]);
var thirdDriver = new Driver(14, "Youssef", [29.972, 31.222], 16, 'M11', [2020, 3, 10, 10, 0, 0], 24, 7, [2020, 3, 10, 9, 0, 0]);
var fourthDriver = new Driver(15, "NarimanDriver", [29.9762, 31.28636], 13, 'M11', [2020, 3, 10, 10, 0, 0], 24, 5, [2020, 3, 10, 9, 00, 0]);



var Rider1 = new Rider(1, "Dina", [29.98409, 31.30631], 17, 'F01', [2020, 3, 10, 10, 15, 0], 24, [2020, 3, 10, 9, 15, 0]);
var Rider2 = new Rider(2, "Nariman", [29.9762, 31.28636], 13, 'M11', [2020, 3, 10, 10, 15, 0], 24, [2020, 3, 10, 9, 15, 0]);
var Rider3 = new Rider(3, "salma", [29.9769, 31.28636], 2.8, 'M11', [2020, 3, 10, 10, 30, 0], 8, [2020, 3, 10, 9, 30, 0]);
var Rider5 = new Rider(5, "salma saber ", [29.9762, 31.28636], 16, 'M11', [2020, 3, 10, 10, 20, 0], 23, [2020, 3, 10, 9, 15, 0]);
var Rider7 = new Rider(7, "karim", [29.98409, 31.30631], 11, 'F01', [2020, 3, 10, 10, 5, 0], 21, [2020, 3, 10, 9, 5, 0]);
var Rider12 = new Rider(12, "khaled", [29.98409, 31.30631], 11, 'F01', [2020, 3, 10, 10, 6, 0], 21, [2020, 3, 10, 9, 6, 0]);


var Rider4 = new Rider(4, "rana", [29.98409, 31.30631], 4.3, 'F01', [2020, 3, 10, 4, 0, 0], 9, [2020, 3, 10, 3, 15, 0]);
var Rider6 = new Rider(6, "gzrt3arb", [29.9769, 31.28636], 7, 'M11', [2020, 3, 10, 4, 0, 0], 16, [2020, 3, 10, 3, 15, 0]);
var Rider8 = new Rider(8, "gam3tdewl", [29.9762, 31.28636], 4.9, 'F01', [2020, 3, 10, 4, 0, 0], 12, [2020, 3, 10, 3, 15, 0]);
var Rider9 = new Rider(9, "semsema", [29.9769, 31.28636], 1.5, 'M11', [2020, 3, 10, 4, 30, 0], 5, [2020, 3, 10, 3, 50, 0]);
var Rider13 = new Rider(13, "msda2", [29.9769, 31.28636], 3.8, 'M11', [2020, 3, 10, 4, 30, 0], 8, [2020, 3, 10, 3, 0, 0]);
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

for (var i = 0; i < driversID.length; i++) { //get id's from offers
    var DriverRow = new userArray(driversID[i]);

    for (var j = 0; j < value.length; j++) {
        if (value[j].from === driversID[i]) {
            var distanceObj = new distance(value[j].from, value[j].to, value[j].distance);

            DriverRow.push(distanceObj);
        }

    }
    DriversRider.push(DriverRow);


}


var RiderRider = new Array();

for (var i = 0; i < RidersID.length; i++) {
    var RiderRow = new userArray(RidersID[i]);

    for (var j = 0; j < valuer.length; j++) {
        if (valuer[j].from === RidersID[i]) {
            var distanceObj = new distance(valuer[j].from, valuer[j].to, valuer[j].distance);

            RiderRow.push(distanceObj);
        }



    }
    RiderRider.push(RiderRow);


}


var DriversRidersDuration = new Array();

for (var i = 0; i < driversID.length; i++) { //get id's from offers
    var DriverRowDuration = new userArray(driversID[i]);

    for (var j = 0; j < dvalue.length; j++) {
        if (dvalue[j].from === driversID[i]) {
            var durationObj = new duration(dvalue[j].from, dvalue[j].to, dvalue[j].distance);

            DriverRowDuration.push(durationObj);
        }

    }
    DriversRidersDuration.push(DriverRowDuration);


}


var RiderRiderDuration = new Array();

for (var i = 0; i < RidersID.length; i++) {
    var RiderRowDuration = new userArray(RidersID[i]);

    for (var j = 0; j < dvaluer.length; j++) {
        if (dvaluer[j].from === RidersID[i]) {
            var durationObj = new duration(dvaluer[j].from, dvaluer[j].to, dvaluer[j].distance);

            RiderRowDuration.push(durationObj);
        }



    }
    RiderRiderDuration.push(RiderRowDuration);


}


var DistanceThreshold = 8;

var NumberOfUnAssignedRiders = Riders.length;

//Drivers are sorted by rating
var maxCap = 7 // get from query
var count = -1;

while (count != Drivers.length) {

    if (NumberOfUnAssignedRiders === 0)
        break;

    for (var j = 0; j < Drivers.length; j++) {
        //for (var j = 1; j < 2; j++) {

        if (NumberOfUnAssignedRiders === 0)
            break;

        var DriverID = Drivers[j].ID;

        var LastRiderExists = false;
        var chosenDuration = -1
        var chosenDistance = -1
        var CurrentRiderIndex = -1
        var lastRiderID = Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] /////
        var CurrentRiderID;
        var maxDistanceCurrentRider;
        var ChosenRiderID = -1;
        var indexinDriverRider = DriversRider.findIndex(n => n.ID == DriverID);
        var lastRiderIndex = -1;





        if (lastRiderID === DriverID) { //First Rider to be assigned

            if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] == Drivers[j].ID) // last rider driver
            {
                var indexinDriverRider = DriversRidersDuration.findIndex(n => n.ID == Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (DriversRidersDuration[indexinDriverRider].checked === DriversRidersDuration[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    continue;

                }


            }
            var WeightArray = []
            var WeightIndex = []
            var MaxDist2 = DriversRider[indexinDriverRider].data[0].distance
            var MaxDur2 = DriversRidersDuration[indexinDriverRider].data[0].duration
            var MaxZ = Number.NEGATIVE_INFINITY,
                MaxY2 = Number.NEGATIVE_INFINITY;
            for (var p = 0; p < DriversRidersDuration[indexinDriverRider].length; p++) {
                var RiderID = DriversRidersDuration[indexinDriverRider].data[p].to
                var Distance = DriversRider[indexinDriverRider].data[p].distance
                var Duration = DriversRidersDuration[indexinDriverRider].data[p].duration;


                MaxZ = Math.max(diff_minutes(Riders.find(n => n.ID === RiderID).EarliestPickup, Drivers[j].EarliestStartTime) - Duration, MaxZ)
                MaxY2 = Math.max(diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime), MaxY2)
                MaxDist2 = Math.max(DriversRider[indexinDriverRider].data[p].distance, MaxDist2)
                MaxDur2 = Math.max(DriversRidersDuration[indexinDriverRider].data[p].duration, MaxDur2)


            }

            //            for (var k = 1; k < DriversRidersDuration[indexinDriverRider].length; k++) {}


            for (var k = 0; k < DriversRidersDuration[indexinDriverRider].length; k++) {
                var RiderID = DriversRidersDuration[indexinDriverRider].data[k].to
                var Distance = DriversRider[indexinDriverRider].data[k].distance
                var Duration = DriversRidersDuration[indexinDriverRider].data[k].duration;
                var Trust = 0;
                if (diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) > 30 || diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) < 0) {
                    DriversRidersDuration[indexinDriverRider].data.find(n => n.to === RiderID).checked = 1;
                    DriversRidersDuration[indexinDriverRider].checked++;
                    continue;
                }

                if (DriversRidersDuration[indexinDriverRider].data.find(n => n.to === RiderID).checked === 1) {
                    continue;
                }

                if (Riders.find(n => n.ID === RiderID).TrustedDrivers.find(n => n === DriverID)) //given from rider
                    Trust = 1
                else if (Riders.find(n => n.ID === RiderID).UnTrustedDrivers.find(n => n === DriverID))
                    Trust = -1;

                //add duration 
                if (Riders.find(n => n.ID === RiderID).isAssigned === false) {

                    var WeightFunction = -0.45 * Duration / MaxDur2 - 0.25 * Distance / MaxDist2 + 0.3 * Trust -
                        0.15 * (diff_minutes(Riders.find(n => n.ID === RiderID).EarliestPickup, Drivers[j].EarliestStartTime) - Duration) / MaxZ -
                        0.04 * diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) / MaxY2; ///arrival time diff

                    WeightArray.push(WeightFunction)
                    WeightIndex.push(RiderID)
                } else {
                    DriversRidersDuration[indexinDriverRider].data.find(n => n.to === RiderID).checked = 1;
                    DriversRidersDuration[indexinDriverRider].checked++;
                }
            }

            if (WeightArray.length > 0) {
                ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(Math, WeightArray))]
                chosenDistance = DriversRider[indexinDriverRider].data.find(n => n.to === ChosenRiderID).distance
                chosenDuration = DriversRidersDuration[indexinDriverRider].data.find(n => n.to === ChosenRiderID).duration
                DriversRidersDuration[indexinDriverRider].data.find(n => n.to === ChosenRiderID).checked = 1;
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
            var MaxDist = RiderRider[indexinRiderRider].data[0].distance
            var MaxDur = RiderRiderDuration[indexinRiderRider].data[0].duration
            var MaxY = Number.NEGATIVE_INFINITY;
            for (var p = 0; p < RiderRiderDuration[indexinRiderRider].length; p++) {
                var RiderID = RiderRiderDuration[indexinRiderRider].data[p].to
                var Distance = RiderRider[indexinRiderRider].data[p].distance
                var Duration = RiderRiderDuration[indexinRiderRider].data[p].duration;


                MaxY = Math.max(diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime), MaxY)
                MaxDist = Math.max(RiderRider[indexinRiderRider].data[p].distance, MaxDist)
                MaxDur = Math.max(RiderRiderDuration[indexinRiderRider].data[p].duration, MaxDur)


            }


            for (var k = 0; k < RiderRiderDuration[indexinRiderRider].length; k++) {
                var RiderID = RiderRiderDuration[indexinRiderRider].data[k].to
                if (diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) > 30 || diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) < 0) {
                    RiderRiderDuration[indexinRiderRider].data.find(n => n.to === RiderID).checked = 1;
                    RiderRiderDuration[indexinRiderRider].checked++;
                    continue;

                }
                if (RiderRiderDuration[indexinRiderRider].data.find(n => n.to === RiderID).checked === 1) {
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

                    var WeightFunction = -0.45 * Duration / MaxDur - 0.25 * Distance / MaxDist + 0.3 * Trust -
                        0.04 * diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) / MaxY
                        //- 0.15 * (diff_minutes(Riders.find(n => n.ID === RiderID).EarliestPickup, Riders.find(n => n.ID === lastRiderID).EarliestPickup) - Duration);
                    WeightArray.push(WeightFunction)
                    WeightIndex.push(RiderID)
                } else {

                    RiderRiderDuration[indexinRiderRider].data.find(n => n.to === RiderID).checked = 1;
                    RiderRiderDuration[indexinRiderRider].checked++;
                }



            }
            if (WeightArray.length > 0) {

                ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(null, WeightArray))]
                chosenDistance = RiderRider[indexinRiderRider].data.find(n => n.to === ChosenRiderID).distance
                chosenDuration = RiderRiderDuration[indexinRiderRider].data.find(n => n.to === ChosenRiderID).duration
                RiderRiderDuration[indexinRiderRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                RiderRiderDuration[indexinRiderRider].checked++;


            }

            LastRiderExists = true;

        }

        if (ChosenRiderID != -1 && chosenDuration != -1) {

            // check for threshold 
            //maxDistance   CurrentRider = Drivers[j].TotalDistanceCoveredToDestination + chosenDistance + Riders.find(n => n.ID === ChosenRiderID).DistanceToOrganization;
            var EarliestFrom;
            var EarliestTo;
            var UpdateEarliest = false;
            if (lastRiderID !== DriverID) {
                EarliestFrom = Riders.find(n => n.ID === lastRiderID).EarliestPickup;
                EarliestTo = Riders.find(n => n.ID === ChosenRiderID).EarliestPickup;


            } else {

                EarliestFrom = Drivers.find(n => n.ID === DriverID).EarliestStartTime;
                EarliestTo = Riders.find(n => n.ID === ChosenRiderID).EarliestPickup;
            }

            if (add_minutes(EarliestFrom, chosenDuration).getTime() > EarliestTo.getTime()) {
                if (add_minutes(EarliestFrom, chosenDuration + Riders.find(n => n.ID === ChosenRiderID).TimeToOrganizationMinutes) > Drivers[j].ArrivalTime) {
                    continue;
                } else {
                    UpdateEarliest = true;
                }


            }
            //
            maxDurationCurrentRider = Drivers[j].TotalDurationTaken + chosenDuration + Riders.find(n => n.ID === ChosenRiderID).TimeToOrganizationMinutes;
            if (maxDurationCurrentRider < Drivers[j].MaxDuration && chosenDistance < DistanceThreshold) {
                Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                Drivers[j].AssignedRiders.push(ChosenRiderID)
                Drivers[j].TotalDistanceCoveredToDestination += chosenDistance;
                Drivers[j].TotalDurationTaken += chosenDuration;

                NumberOfUnAssignedRiders--;
                if (UpdateEarliest === true) {
                    Riders.find(n => n.ID === ChosenRiderID).EarliestPickup.setTime(add_minutes(EarliestFrom, chosenDuration).getTime())
                }
            } else {

                var Delta = 0;

                if (lastRiderID !== DriverID) {

                    var TimeTakenWithoutTakingRider = Riders.find(n => n.ID === lastRiderID).TimeToOrganizationMinutes;
                    var TimeTakenAfterTakingRider = RiderRiderDuration.find(n => n.ID === lastRiderID).data.find(n => n.to === ChosenRiderID).duration + Riders.find(n => n.ID === ChosenRiderID).TimeToOrganizationMinutes
                    Delta = TimeTakenAfterTakingRider - TimeTakenWithoutTakingRider;
                } else {
                    //var DriverIndex = Drivers.indexOf(Drivers.find(n => n.ID === DriverID));
                    var TimeTakenWithoutTakingRider = Drivers[j].TimeToOrganizationMinutes
                    var TimeTakenAfterTakingRider = DriversRidersDuration[indexinDriverRider].data.find(n => n.to === ChosenRiderID).duration + Riders.find(n => n.ID === ChosenRiderID).TimeToOrganizationMinutes
                    Delta = TimeTakenAfterTakingRider - TimeTakenWithoutTakingRider;


                }

                if (Delta < 30 && maxDurationCurrentRider < Drivers[j].MaxDuration) {
                    Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                    Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                    Drivers[j].AssignedRiders.push(ChosenRiderID)
                    Drivers[j].TotalDistanceCoveredToDestination += chosenDistance;
                    Drivers[j].TotalDurationTaken += chosenDuration;
                    NumberOfUnAssignedRiders--;
                    if (UpdateEarliest === true) {
                        Riders.find(n => n.ID === ChosenRiderID).EarliestPickup.setTime(add_minutes(EarliestFrom, chosenDuration).getTime())

                    }
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







// for (var i = 0; i < DriversRider.length; i++) {
//     console.log("Driver:", DriversRider[i].ID)
//     for (var j = 0; j < DriversRider[i].length; j++) {
//         console.log(DriversRider[i].data[j])
//     }

// }

/* console.log("farah")

for (var i = 0; i < RiderRider.length; i++) {
    console.log("Rider:", RiderRider[i].ID)
    for (var j = 0; j < RiderRider[i].length; j++) {
        console.log(RiderRider[i].data[j])
    }

}  */
//Setting Pickup Time and Pool Start Time
for (var i = 0; i < Drivers.length; i++) {



    if (Drivers[i].AssignedRiders.length == 1) {
        break; //Driver has no passengers
    }
    var fromIndex;
    var toIndex;

    for (var j = Drivers[i].AssignedRiders.length - 1; j >= 0; j--) {
        if (j == 0)

        { // Last iteration ( First Rider )


            toIndex = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[1]))
            DriverIndexinDriverRidersDuration = DriversRidersDuration.indexOf(DriversRidersDuration.find(n => n.ID === Drivers[i].ID))
            toRiderID = Drivers[i].AssignedRiders[1];
            var datee = new Date(Riders[toIndex].PickupTime);
            Drivers[i].PoolStartTime = datee
            Drivers[i].PoolStartTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.to === toRiderID).duration)

            //RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration

        } else if (j == Drivers[i].AssignedRiders.length - 1) { // First iteration ( Last Rider )

            fromIndex = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j]))
            Drivers[i].TotalDistanceCoveredToDestination += Riders[fromIndex].DistanceToOrganization;
            Drivers[i].TotalDurationTaken += Riders[fromIndex].TimeToOrganizationMinutes;

            var datee = new Date(Drivers[i].ArrivalTime);
            Riders[fromIndex].PickupTime = datee

            Riders[fromIndex].PickupTime.setMinutes(Drivers[i].ArrivalTime.getMinutes() - Riders[fromIndex].TimeToOrganizationMinutes)

        } else {
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j]));
            toIndex = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j + 1]));
            toID = Drivers[i].AssignedRiders[j + 1];
            fromID = Drivers[i].AssignedRiders[j]
            FromIndexinRiderRiderDuration = RiderRiderDuration.indexOf(RiderRiderDuration.find(n => n.ID === fromID));

            var datee = new Date(Riders[toIndex].PickupTime);

            Riders[fromIndex].PickupTime = datee

            Riders[fromIndex].PickupTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration)


        }
    }
}


for (var i = 0; i < Drivers.length; i++) {

    console.log(Drivers[i].ID, Drivers[i].Name, Drivers[i].AssignedRiders, "Start ", Drivers[i].PoolStartTime)
    console.log("Total Covered = ", Drivers[i].TotalDistanceCoveredToDestination, " max duration ", Drivers[i].MaxDuration, "total time taken", Drivers[i].TotalDurationTaken, "arrival", Drivers[i].ArrivalTime)
    for (var j = 1; j < Drivers[i].AssignedRiders.length; j++) {
        index1 = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j]));
        console.log(Drivers[i].AssignedRiders[j], Riders[index1].PickupTime, Riders[index1].ArrivalTime)
    }
    console.log(" //////////////////////////////////////////// ")
}


//Sort assigned and then shift between them