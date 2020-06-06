var Riders;
var Drivers
var RidersRiders

module.exports = async function main() {
    var f = require('./routes/api/matchingApi').getters
    obj = f();

    Riders = obj.Riders;
    Drivers = obj.Drivers;
    RidersRiders = obj.RidersRiders;
    DriversRiders = obj.DriversRiders;
    AllDriversToRider = obj.AllDriversToRider
    AllRidersToRider = obj.AllRidersToRider

    for (var j = 0; j < Drivers.length; j++) {
        if (Drivers[j].AssignedRiders.length === 0)
            continue;

        var RidersDistCoveredinTrip = []
        var RidersDistCoveredIds = []
        RidersDistCoveredinTrip.push(Riders.find(n => n.ID === Drivers[j].AssignedRiders[Drivers.AssignedRiders.length - 1]).DistanceToOrganization)
        RidersDistCoveredIds.push(Drivers[j].AssignedRiders[Drivers.AssignedRiders.length - 1])
        var lastDistance = RidersDistCoveredinTrip[0]
        var TotalMoneyTobePaidToDriver = Drivers[j].TotalDistanceCoveredToDestination * 1.5 * 0.787;


        //case 1 rider to be implemented
        if (Drivers[j].AssignedRiders.length === 1) {
            var ExpectedFare = (lastDistance / Drivers[j].TotalDistanceCoveredToDestination) * TotalMoneyTobePaidToDriver
            Riders.find(n => n.ID === RidersDistCoveredIds[0]).ExpectedFare = ExpectedFare;
            continue;
        }


        for (var k = Drivers[j].AssignedRiders.length - 2; k >= 0; k--) {
            FromIndexinRidersRiders = RidersRiders.indexOf(RidersRiders.find(n => n.ID === Drivers[j].AssignedRiders[k]));
            lastDistance += RidersRiders[FromIndexinRidersRiders].data.find(n => n.to === Drivers[j].AssignedRiders[k + 1]).distance;
            RidersDistCoveredinTrip.push(lastDistance)
            RidersDistCoveredIds.push(Drivers[j].AssignedRiders[k])
        }
    }

    var SumRidersDistances = RidersDistCoveredinTrip.reduce(function(a, b) { return a + b; }, 0)
    if (SumRidersDistances >= Drivers[j].TotalDistanceCoveredToDestination) {
        var Ratio = TotalMoneyTobePaidToDriver / SumRidersDistances;
        for (var f = 0; f < RidersDistCoveredinTrip.length; f++) {
            var ExpectedFare = RidersDistCoveredinTrip[f] * Ratio;
            Riders.find(n => n.ID === RidersDistCoveredIds[f]).ExpectedFare = ExpectedFare;
        }
    } else {
        for (var f = 0; f < RidersDistCoveredinTrip.length; f++) {
            var ExpectedFare = (RidersDistCoveredinTrip[f] / Drivers[j].TotalDistanceCoveredToDestination) * TotalMoneyTobePaidToDriver
            Riders.find(n => n.ID === RidersDistCoveredIds[f]).ExpectedFare = ExpectedFare;
        }

    }

}