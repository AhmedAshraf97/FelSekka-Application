var Routing = require('./routing');

var directionRoute;



class Rider {
	
    constructor(ID, Name, Location, type, DistanceToOrganization, Options) {
        this.ID = ID;
        this.Name = Name;
        this.Location = Location;
        this.type = type;
        this.isAssigned = false;
        this.DriverAssigned = -1;
        this.DistanceToOrganization = DistanceToOrganization;
        //options ( GenderSmokingMusic)
        this.Options = Options;
    }
};
class Driver {
    constructor(ID, Name, Location, type, DistanceToOrganization, Options) {
        this.ID = ID;
        this.Name = Name;
        this.Location = Location;
        this.type = type;
        this.EmptyPlaces = 4;
        this.AssignedRiders = [ID];
        this.TotalDistanceCoveredToDestination = 0;
        this.OrganizationLocation = 0;
        this.DistanceToOrganization = DistanceToOrganization;
        this.MaxWeight = 1.5 * DistanceToOrganization;
        //options ( GenderSmokingMusic)
        this.Options = Options;
    }
};


var firstDriver = new Driver(10, "Ahmed", [29.973, 31.28251], 'D', 7000, 'M11');
var secondDriver = new Driver(11, "Farah", [29.97773, 31.31338], 'D', 5000, 'F01');
//var thirdDriver = new Driver(12, "khaled", [29.97773, 31.31338], 'D', 5000, 'M11');

var Rider1 = new Rider(1, "Dina", [29.98409, 31.30631], 'R', 1000, 'F01');
var Rider2 = new Rider(2, "Nariman", [29.9762, 31.28636], 'R', 300, 'M11');
var Rider3 = new Rider(3, "mariam", [29.9769, 31.28636], 'R', 500, 'M11');
var Rider4 = new Rider(4, "rana", [29.98409, 31.30631], 'R', 1000, 'F01');
var Rider5 = new Rider(5, "salma", [29.9762, 31.28636], 'R', 300, 'M11');
var Rider6 = new Rider(6, "nermin", [29.9769, 31.28636], 'R', 500, 'M11');
var Rider7 = new Rider(7, "nouran", [29.98409, 31.30631], 'R', 1000, 'F01');
var Rider8 = new Rider(8, "nancy", [29.9762, 31.28636], 'R', 300, 'M11');
var Rider9 = new Rider(9, "mayar", [29.9769, 31.28636], 'R', 500, 'F01');

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


var RidersRiders1 = [-1, 2000, 900, 1000, 2000, 3600, 400, 900, 5000]
RidersRiders2 = [3100, -1, 1000, 9000, 800, 1500, 6000, 2000, 400],
    RidersRiders3 = [2000, 900, -1, 900, 7000, 4500, 500, 1000, 300],
    RidersRiders4 = [800, 700, 3001, -1, 200, 500, 8000, 200, 4000],
    RidersRiders5 = [200, 100, 1001, 801, -1, 6500, 1000, 900, 400],
    RidersRiders6 = [2009, 300, 500, 250, 800, -1, 1700, 1900, 2400],
    RidersRiders7 = [3009, 200, 800, 150, 900, 1800, -1, 2900, 4900],
    RidersRiders8 = [300, 100, 400, 250, 220, 1900, 700, -1, 900],
    RidersRiders9 = [20, 300, 700, 2000, 40, 100, 3000, 800, -1]


var DriversRiders1 = [2900, 6000, 2901, 2000, 700, 300, 1000, 1500, 600],
    DriversRiders2 = [200, 1000, 7001, 1500, 800, 900, 199, 2500, 900];

var RidersRidersDistances = [RidersRiders1, RidersRiders2, RidersRiders3, RidersRiders4, RidersRiders5, RidersRiders6, RidersRiders7, RidersRiders8, RidersRiders9]
var DriversRidersDistances = [DriversRiders1, DriversRiders2]


var DistanceThreshold = 3000;
var TotalEmptyPlaces = 4 * Drivers.length;
var NumberOfUnAssignedRiders = Riders.length;


for (var i = 0; i < 4; i++) {



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
                    Riders[DriversRidersDistances[j].indexOf(n)].Options === Drivers[j].Options))


        } else {

            lastRiderIndex = Riders.indexOf(Riders.find(n => n.ID === lastRiderID));

            MinimumDistance = Math.min.apply(null,
                RidersRidersDistances[lastRiderIndex].filter(n => n != -1 && Riders[RidersRidersDistances[lastRiderIndex].indexOf(n)].isAssigned == false &&
                    Riders[RidersRidersDistances[lastRiderIndex].indexOf(n)].Options === Drivers[j].Options))
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
            if (MinimumDistance < DistanceThreshold && Drivers[j].MaxWeight > maxDistanceCurrentRider) {

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
                if (Delta < 700 && Drivers[j].MaxWeight > maxDistanceCurrentRider) {

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



var RidersUberID = new Array();

for (var i = 0; i < Riders.length; i++) {
    var RiderID = Riders[i].ID;
    if (Riders.find(n => n.ID == RiderID).isAssigned == false)

    {
        RidersUberID.push(RiderID);
    }
}


/////print

for (var i = 0; i < Drivers.length; i++) {
    var DriverID = Drivers[i].ID;
    console.log(DriverID, Drivers[i].Name, Drivers[i].AssignedRiders)
}
console.log(RidersUberID)