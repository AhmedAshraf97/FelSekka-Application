var Riders;
var Drivers
var RidersRiders

module.exports = async function main(s) {
    var f = require(s).getters
    obj = f();

    Riders = obj.Riders;
    Drivers = obj.Drivers;
    RidersRiders = obj.RidersRiders;
    DriversRiders = obj.DriversRiders;
    var FloosKeteer = 0

    for (var j = 0; j < Drivers.length; j++) {
        if (Drivers[j].AssignedRiders.length === 0)
            continue;

        var ProfitFactor = 0;
        if (Drivers[j].AssignedRiders.length === 1) {
            ProfitFactor = 1.2;
        } else if (Drivers[j].AssignedRiders.length === 2) {
            ProfitFactor = 1.3
        } else if (Drivers[j].AssignedRiders.length === 3) {
            ProfitFactor = 1.4
        } else {
            ProfitFactor = 1.5
        }



        var DriverCollects = 0;
        var RidersDistCoveredinTrip = []
        var RidersDistCoveredIds = []
        var RidersDurationsinTrip = []
        RidersDistCoveredinTrip.push(Riders.find(n => n.ID === Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]).DistanceToOrganization)
        RidersDistCoveredIds.push(Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1])
        RidersDurationsinTrip.push(Riders.find(n => n.ID === Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]).TimeToOrganizationMinutes)
        var lastDistance = RidersDistCoveredinTrip[0]
        var lastDuration = RidersDurationsinTrip[0]
        var TotalMoneyTobePaidToDriverDist = (Drivers[j].TotalDistanceCoveredToDestination * 0.787) * 1.5;

        var TotalMoneyTobePaidToDriverDur = (0.3 * Drivers[j].TotalDurationTaken) * 1.5;

        //case 1 rider to be implemented
        if (Drivers[j].AssignedRiders.length === 1) {
            var ExpectedFare = (lastDistance / Drivers[j].TotalDistanceCoveredToDestination) * TotalMoneyTobePaidToDriverDist + (lastDuration / Drivers[j].TotalDurationTaken) * TotalMoneyTobePaidToDriverDur
            Riders.find(n => n.ID === RidersDistCoveredIds[0]).ExpectedFare = Math.max(ExpectedFare * ProfitFactor, 10);
            Drivers[j].ExpectedFare = (Math.max(ExpectedFare, 10))
            continue;
        }


        for (var k = Drivers[j].AssignedRiders.length - 2; k >= 0; k--) {
            FromIndexinRidersRiders = RidersRiders.indexOf(RidersRiders.find(n => n.ID === Drivers[j].AssignedRiders[k]));
            lastDistance += RidersRiders[FromIndexinRidersRiders].data.find(n => n.to === Drivers[j].AssignedRiders[k + 1]).distance;
            lastDuration += RidersRiders[FromIndexinRidersRiders].data.find(n => n.to === Drivers[j].AssignedRiders[k + 1]).duration;
            RidersDistCoveredinTrip.push(lastDistance)
            RidersDurationsinTrip.push(lastDuration)
            RidersDistCoveredIds.push(Drivers[j].AssignedRiders[k])

        }



        var SumRidersDistances = RidersDistCoveredinTrip.reduce(function(a, b) { return a + b; }, 0)
        var SumRidersDurations = RidersDurationsinTrip.reduce(function(a, b) { return a + b; }, 0)

        if (SumRidersDistances >= Drivers[j].TotalDistanceCoveredToDestination) {
            var DistRatio = (TotalMoneyTobePaidToDriverDist / SumRidersDistances)
            var DurRatio = (TotalMoneyTobePaidToDriverDur / SumRidersDurations)
            for (var f = 0; f < RidersDistCoveredinTrip.length; f++) {
                var ExpectedFare = RidersDistCoveredinTrip[f] * DistRatio;
                ExpectedFare += RidersDurationsinTrip[f] * DurRatio
                Riders.find(n => n.ID === RidersDistCoveredIds[f]).ExpectedFare = Math.max(ExpectedFare * ProfitFactor, 10)
                DriverCollects += Math.max(ExpectedFare * ProfitFactor, 10)
            }
        } else {
            for (var f = 0; f < RidersDistCoveredinTrip.length; f++) {
                var ExpectedFare = (RidersDistCoveredinTrip[f] / Drivers[j].TotalDistanceCoveredToDestination) * TotalMoneyTobePaidToDriverDist
                ExpectedFare += (RidersDurationsinTrip[f] / Drivers[j].TotalDurationTaken) * TotalMoneyTobePaidToDriverDur
                Riders.find(n => n.ID === RidersDistCoveredIds[f]).ExpectedFare = Math.max(ExpectedFare * ProfitFactor, 10);
                DriverCollects += Math.max(ExpectedFare * ProfitFactor, 10)
            }

        }

        Drivers[j].ExpectedFare = DriverCollects / ProfitFactor;

        FloosKeteer += (DriverCollects - Drivers[j].ExpectedFare)
    }


    console.log("Floos maksb = ", FloosKeteer)

}