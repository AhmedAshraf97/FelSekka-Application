var Routing = require('./routing');

var directionRoute;

function diff_minutes(dt2, dt1) {

    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return (Math.round(diff));

}




class Rider {
    constructor(ID, Name, Location, DistanceToOrganization, Options, ArrivalTime, TimeToOrganizationMinutes) {
        this.ID = ID;
        this.Name = Name;
        this.Location = Location;
        this.isAssigned = false;
        this.DriverAssigned = -1;
        this.DistanceToOrganization = DistanceToOrganization;
        this.TimeToOrganizationMinutes = TimeToOrganizationMinutes;

        //options ( GenderSmokingMusic)
        this.Options = Options;

        //Timing
        this.ArrivalTime = new Date(ArrivalTime[0], ArrivalTime[1], ArrivalTime[2], ArrivalTime[3], ArrivalTime[4], ArrivalTime[5]);
        this.PickupTime = this.ArrivalTime

    }
};
class Driver {
    constructor(ID, Name, Location, DistanceToOrganization, Options, ArrivalTime, TimeToOrganizationMinutes) {
        this.ID = ID;
        this.Name = Name;
        this.Location = Location;
        this.EmptyPlaces = 4;
        this.AssignedRiders = [ID];
        this.TotalDistanceCoveredToDestination = 0;
        this.OrganizationLocation = 0;
        this.DistanceToOrganization = DistanceToOrganization;
        this.TimeToOrganizationMinutes = TimeToOrganizationMinutes;
        this.MaxDistance = 1.5 * DistanceToOrganization;
        //options ( GenderSmokingMusic)
        this.Options = Options;

        //Timing
        this.PoolStartTime = new Date();
        this.ArrivalTime = new Date(ArrivalTime[0], ArrivalTime[1], ArrivalTime[2], ArrivalTime[3], ArrivalTime[4], ArrivalTime[5]);

    }
};


var firstDriver = new Driver(10, "Ahmed", [29.973, 31.28251], 7000, 'M11', [2020, 3, 10, 10, 0, 0], 50);
var secondDriver = new Driver(11, "Farah", [29.97773, 31.31338], 5000, 'F01', [2020, 3, 10, 4, 0, 0], 60);
//var thirdDriver = new Driver(12, "khaled", [29.97773, 31.31338],  5000, 'M11');

var Rider1 = new Rider(1, "Dina", [29.98409, 31.30631], 1000, 'F01', [2020, 3, 10, 10, 15, 0], 10);
var Rider2 = new Rider(2, "Nariman", [29.9762, 31.28636], 300, 'M11', [2020, 3, 10, 10, 30, 0], 20);
var Rider3 = new Rider(3, "mariam", [29.9769, 31.28636], 500, 'M11', [2020, , 10, 10, 50, 0], 30);
var Rider4 = new Rider(4, "rana", [29.98409, 31.30631], 1000, 'F01', [2020, 3, 10, 4, 0, 0], 40);
var Rider5 = new Rider(5, "salma", [29.9762, 31.28636], 300, 'M11', [2020, 3, 10, 10, 20, 0], 10);
var Rider6 = new Rider(6, "nermin", [29.9769, 31.28636], 500, 'M11', [2020, 3, 10, 9, 30, 0], 20);
var Rider7 = new Rider(7, "nouran", [29.98409, 31.30631], 1000, 'F01', [2020, 3, 10, 4, 35, 0], 30);
var Rider8 = new Rider(8, "nancy", [29.9762, 31.28636], 300, 'M11', [2020, 3, 10, 2, 0, 0], 40);
var Rider9 = new Rider(9, "mayar", [29.9769, 31.28636], 500, 'F01', [2020, 3, 10, 4, 18, 0], 20);




var Drivers = new Array();
Drivers.push(firstDriver);
Drivers.push(secondDriver);
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


var RidersRiders1Dist = [-1, 2000, 900, 1000, 2000, 3600, 400, 900, 5000],
    RidersRiders2Dist = [3100, -1, 1000, 9000, 800, 1500, 6000, 2000, 400],
    RidersRiders3Dist = [2000, 900, -1, 900, 7000, 4500, 500, 1000, 300],
    RidersRiders4Dist = [800, 700, 3001, -1, 200, 500, 8000, 200, 4000],
    RidersRiders5Dist = [200, 100, 1001, 801, -1, 6500, 1000, 900, 400],
    RidersRiders6Dist = [2009, 300, 500, 250, 800, -1, 1700, 1900, 2400],
    RidersRiders7Dist = [3009, 200, 800, 150, 900, 1800, -1, 2900, 4900],
    RidersRiders8Dist = [300, 100, 400, 250, 220, 1900, 700, -1, 900],
    RidersRiders9Dist = [20, 300, 700, 2000, 40, 100, 3000, 800, -1];


var DriversRiders1Dist = [2900, 6000, 2901, 2000, 700, 300, 1000, 1500, 600],
    DriversRiders2Dist = [200, 1000, 7001, 1500, 800, 900, 199, 2500, 900];

var RidersRidersDistances = [RidersRiders1Dist, RidersRiders2Dist, RidersRiders3Dist, RidersRiders4Dist, RidersRiders5Dist, RidersRiders6Dist, RidersRiders7Dist, RidersRiders8Dist, RidersRiders9Dist]
var DriversRidersDistances = [DriversRiders1Dist, DriversRiders2Dist]


var RidersRiders1Duration = [-1, 0.1, 0.3, 0.5, 0.9, 1.4, 1.3, 3, 5000],
    RidersRiders2Duration = [3100, -1, 1000, 9000, 800, 1500, 6000, 2000, 400],
    RidersRiders3Duration = [2000, 900, -1, 900, 7000, 4500, 500, 1000, 300],
    RidersRiders4Duration = [800, 700, 3001, -1, 200, 500, 8000, 200, 4000],
    RidersRiders5Duration = [200, 100, 1001, 801, -1, 6500, 1000, 900, 400],
    RidersRiders6Duration = [2009, 300, 500, 250, 800, -1, 1700, 1900, 2400],
    RidersRiders7Duration = [3009, 200, 800, 150, 900, 1800, -1, 2900, 4900],
    RidersRiders8Duration = [300, 100, 400, 250, 220, 1900, 700, -1, 900],
    RidersRiders9Duration = [20, 300, 700, 2000, 40, 100, 3000, 800, -1];

var DriversRiders1Duration = [2900, 6000, 2901, 2000, 30, 300, 1000, 1500, 600],
    DriversRiders2Duration = [200, 1000, 7001, 60, 800, 900, 199, 2500, 900];

var RidersRidersDuration = [RidersRiders1Duration, RidersRiders2Duration, RidersRiders3Duration, RidersRiders4Duration, RidersRiders5Duration, RidersRiders6Duration, RidersRiders7Duration, RidersRiders8Duration, RidersRiders9Duration]
var DriversRidersDuration = [DriversRiders1Duration, DriversRiders2Duration]

var DistanceThreshold = 3000;
var TotalEmptyPlaces = 4 * Drivers.length;
var NumberOfUnAssignedRiders = Riders.length;


for (var i = 0; i < 4; i++) {

    if (NumberOfUnAssignedRiders === 0)
        break;

    for (var j = 0; j < Drivers.length; j++) {
        var DriverID = Drivers[j].ID;
        var LastRiderExists = false;
        var MinimumDistance = -1,
            CurrentRiderIndex = -1
        var lastRiderID = Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] /////
        var CurrentRiderID;
        var maxDistanceCurrentRider;

        var lastRiderIndex = -1;
        if (lastRiderID === DriverID) {
            MinimumDistance = Math.min.apply(null,
                DriversRidersDistances[j].filter(n => n != -1 && Riders[DriversRidersDistances[j].indexOf(n)].isAssigned == false &&
                    Riders[DriversRidersDistances[j].indexOf(n)].Options === Drivers[j].Options &&
                    diff_minutes(Riders[DriversRidersDistances[j].indexOf(n)].ArrivalTime, Drivers[j].ArrivalTime) <= 30 &&
                    diff_minutes(Riders[DriversRidersDistances[j].indexOf(n)].ArrivalTime, Drivers[j].ArrivalTime) >= 0))


        } else {

            lastRiderIndex = Riders.indexOf(Riders.find(n => n.ID === lastRiderID));

            MinimumDistance = Math.min.apply(null,
                RidersRidersDistances[lastRiderIndex].filter(n => n != -1 && Riders[RidersRidersDistances[lastRiderIndex].indexOf(n)].isAssigned == false &&
                    Riders[RidersRidersDistances[lastRiderIndex].indexOf(n)].Options === Drivers[j].Options &&
                    diff_minutes(Riders[RidersRidersDistances[lastRiderIndex].indexOf(n)].ArrivalTime, Drivers[j].ArrivalTime) <= 30 &&
                    diff_minutes(Riders[RidersRidersDistances[lastRiderIndex].indexOf(n)].ArrivalTime, Drivers[j].ArrivalTime) >= 0))
            LastRiderExists = true;

        }
        // search for options

        if (MinimumDistance != Infinity) { //Rider Exists
            if (LastRiderExists) {

                CurrentRiderIndex = RidersRidersDistances[lastRiderIndex].indexOf(MinimumDistance)

            } else {
                CurrentRiderIndex = DriversRidersDistances[j].indexOf(MinimumDistance)
            }
            CurrentRiderID = Riders[CurrentRiderIndex].ID;
            // rider = Riders.find(n => n.ID == index);
            // check for threshold 
            maxDistanceCurrentRider = Drivers[j].TotalDistanceCoveredToDestination + MinimumDistance + Riders[CurrentRiderIndex].DistanceToOrganization;
            if (MinimumDistance < DistanceThreshold && Drivers[j].MaxDistance > maxDistanceCurrentRider) {

                Riders[CurrentRiderIndex].isAssigned = true;
                Riders[CurrentRiderIndex].DriverAssigned = DriverID;
                Drivers[j].EmptyPlaces--;
                Drivers[j].AssignedRiders.push(CurrentRiderID)
                Drivers[j].TotalDistanceCoveredToDestination += MinimumDistance;
                TotalEmptyPlaces--;
                NumberOfUnAssignedRiders--;

            } else {

                var Delta = 0;
                if (lastRiderID !== DriverID) {

                    var distanceWithoutRider = Riders[lastRiderIndex].DistanceToOrganization;
                    var distanceWithRider = RidersRidersDistances[lastRiderIndex][CurrentRiderIndex] + Riders[CurrentRiderIndex].DistanceToOrganization
                    Delta = distanceWithRider - distanceWithoutRider;
                } else {
                    var DriverIndex = Drivers.indexOf(Drivers.find(n => n.ID === DriverID));
                    var distanceWithoutRider = Drivers[j].DistanceToOrganization
                    var distanceWithRider = DriversRidersDistances[DriverIndex][CurrentRiderIndex] + Riders[CurrentRiderIndex].DistanceToOrganization
                    Delta = distanceWithRider - distanceWithoutRider;

                }
                if (Delta < 700 && Drivers[j].MaxDistance > maxDistanceCurrentRider) {

                    Riders[CurrentRiderIndex].isAssigned = true;
                    Riders[CurrentRiderIndex].DriverAssigned = DriverID;
                    Drivers[j].EmptyPlaces--;
                    Drivers[j].AssignedRiders.push(CurrentRiderID)
                    Drivers[j].TotalDistanceCoveredToDestination += MinimumDistance;
                    TotalEmptyPlaces--;
                    NumberOfUnAssignedRiders--;
                }


            }
            //console.log(index, DriverID, "a")
        }
        //check if rider assigned or the chosen index is driver
        // If user deletes the acc , replace in distance matrix with 0s

    }



}


//Setting Pickup Time and Pool Start Time
for (var i = 0; i < Drivers.length; i++) {



    if (Drivers[i].AssignedRiders.length == 1) {
        break; //Driver has no passengers
    }
    var fromIndex;
    var toIndex;

    for (var j = Drivers[i].AssignedRiders.length - 1; j >= 0; j--) {
        if (j == 0)

        {
            //fromIndex = Drivers.indexOf(Riders.find(n => n.ID === Drivers[i].ID));
            toIndex = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[1]))

            var datee = new Date(Riders[toIndex].PickupTime);
            Drivers[i].PoolStartTime = datee

            //Drivers[fromIndex].PickupTime = Riders[toIndex].PickupTime
            Drivers[i].PoolStartTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - DriversRidersDuration[i][toIndex])
                // console.log(Riders[toIndex].PickupTime, DriversRidersDuration[i][toIndex], Drivers[i].PoolStartTime)


        } else if (j == Drivers[i].AssignedRiders.length - 1) {
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j]))

            Riders[fromIndex].PickupTime.setMinutes(Drivers[i].ArrivalTime.getMinutes() - Riders[fromIndex].TimeToOrganizationMinutes)
                // console.log(Drivers[i].ArrivalTime.getMinutes(), Riders[fromIndex].TimeToOrganizationMinutes, Riders[fromIndex].PickupTime)
                //console.log("heeh ", Drivers[i].ArrivalTime)
                // console.log(Riders[fromIndex].PickupTime, Drivers[i].AssignedRiders[j], "far")
        } else {
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j]));
            toIndex = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j + 1]));
            //Riders[fromIndex].PickupTime = Riders[toIndex].PickupTime
            var datee = new Date(Riders[toIndex].PickupTime);
            //console.log("Date ", datee)
            Riders[fromIndex].PickupTime = datee
                //console.log(Riders[toIndex].PickupTime)
            Riders[fromIndex].PickupTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - RidersRidersDuration[fromIndex][toIndex])

            // console.log(Riders[toIndex].PickupTime, "a", Riders[fromIndex].PickupTime, Riders[toIndex].PickupTime.getMinutes(), RidersRidersDuration[fromIndex][toIndex], fromIndex, toIndex)

        }
    }
    //birthday.setMinutes(birthday.getMinutes() - 31);
}




var RidersUberID = new Array();

for (var i = 0; i < Riders.length; i++) {
    var RiderID = Riders[i].ID;
    if (Riders.find(n => n.ID == RiderID).isAssigned == false)

    {
        RidersUberID.push(RiderID);
    }
}


/////print
var index1
for (var i = 0; i < Drivers.length; i++) {
    var DriverID = Drivers[i].ID;
    console.log(DriverID, Drivers[i].Name, Drivers[i].AssignedRiders, "Start ", Drivers[i].PoolStartTime)

    for (var j = 1; j < Drivers[i].AssignedRiders.length; j++) {
        index1 = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j]));
        console.log(Drivers[i].AssignedRiders[j], Riders[index1].PickupTime)
    }
}
console.log(RidersUberID)