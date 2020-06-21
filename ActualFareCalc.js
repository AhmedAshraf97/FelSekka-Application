module.exports = async function main(s) {
    var f = require(s).getters
    obj = f();
    var driver = obj.driver;
    var RidersinTrip = obj.RidersinTrip
    var FloosKeteer = 0;

    var ProfitFactor = 0;
    if (RidersinTrip.length === 1) {
        ProfitFactor = 1.2;
    } else if (RidersinTrip.length === 2) {
        ProfitFactor = 1.3
    } else if (RidersinTrip.length === 3) {
        ProfitFactor = 1.4
    } else {
        ProfitFactor = 1.5
    }


    for (var k = RidersinTrip.length - 1; k >= 0; k--) {
        RidersinTrip[k].time = parseFloat(RidersinTrip[k].time)
        RidersinTrip[k].distance = parseFloat(RidersinTrip[k].distance)
    }
    var DriverCollects = 0;
    var RidersDistCoveredinTrip = []
    var RidersDistCoveredIds = []
    var RidersDurationsinTrip = []

    RidersDistCoveredinTrip.push(RidersinTrip[RidersinTrip.length - 1].distance)
    RidersDistCoveredIds.push(RidersinTrip[RidersinTrip.length - 1].riderid)
    RidersDurationsinTrip.push(RidersinTrip[RidersinTrip.length - 1].time)
    var lastDistance = RidersDistCoveredinTrip[0]
    var lastDuration = RidersDurationsinTrip[0]
    var TotalMoneyTobePaidToDriverDist = (driver.distance * 0.787) * 1.5;
    var TotalMoneyTobePaidToDriverDur = (0.3 * driver.time) * 1.5;


    if (RidersinTrip.length === 1) {
        var ExpectedFare = (lastDistance / driver.distance) * TotalMoneyTobePaidToDriverDist +
            (lastDuration / driver.time) * TotalMoneyTobePaidToDriverDur
        Riders.find(n => n.ID === RidersDistCoveredIds[0]).ExpectedFare = Math.max(ExpectedFare * ProfitFactor, 10);
        driver.fare = Math.max(ExpectedFare, 10);
        FloosKeteer += 0.2 * driver.fare
        return;
    }


    for (var k = RidersinTrip.length - 2; k >= 0; k--) {
        lastDistance = RidersinTrip[k].distance;
        lastDuration = RidersinTrip[k].time;
        RidersDistCoveredinTrip.push(lastDistance)
        RidersDurationsinTrip.push(lastDuration)
        RidersDistCoveredIds.push(RidersinTrip[k].riderid)
    }

    var SumRidersDistances = RidersDistCoveredinTrip.reduce(function(a, b) { return a + b; }, 0)
    var SumRidersDurations = RidersDurationsinTrip.reduce(function(a, b) { return a + b; }, 0)

    if (SumRidersDistances >= driver.distance) {
        var DistRatio = TotalMoneyTobePaidToDriverDist / SumRidersDistances;
        var DurRatio = TotalMoneyTobePaidToDriverDur / SumRidersDurations

        for (var f = 0; f < RidersDistCoveredinTrip.length; f++) {
            var ExpectedFare = RidersDistCoveredinTrip[f] * DistRatio + RidersDurationsinTrip[f] * DurRatio
            RidersinTrip.find(n => n.riderid === RidersDistCoveredIds[f]).fare = Math.max(ExpectedFare * ProfitFactor, 10);
            DriverCollects += Math.max(ExpectedFare * ProfitFactor, 10)
        }
    } else {
        for (var f = 0; f < RidersDistCoveredinTrip.length; f++) {
            var ExpectedFare = (RidersDistCoveredinTrip[f] / driver.distance) * TotalMoneyTobePaidToDriverDist
            ExpectedFare += (RidersDurationsinTrip[f] / driver.time) * TotalMoneyTobePaidToDriverDur
            RidersinTrip.find(n => n.riderid === RidersDistCoveredIds[f]).fare = Math.max(ExpectedFare * ProfitFactor, 10);
            DriverCollects += Math.max(ExpectedFare * ProfitFactor, 10)
        }

    }
    driver.fare = DriverCollects / ProfitFactor;
    FloosKeteer += (DriverCollects - driver.fare)
    console.log("Floos maksb = ", FloosKeteer)
}