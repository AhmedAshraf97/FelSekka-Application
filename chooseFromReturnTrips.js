const graphlib = require('graphlib');
const ksp = require('k-shortest-path');
var Combinatorics = require('js-combinatorics');
var Riders;
var AvailableDriver;
var RidersRiders
var DriversRiders

function diff_minutes(dt2, dt1) {

    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return (Math.round(diff));

}

function SetDropOffTime(DriverObj) {

    if (DriverObj.AssignedRiders.length == 0) {
        return; //Driver has no passengers
    }

    var fromIndex;
    var toIndex;
    var OldTotalDurationTaken = DriverObj.TotalDurationTaken
    var OldTotalDistanceCoveredToDestination = DriverObj.TotalDistanceCoveredToDestination
    DriverObj.TotalDurationTaken = 0;
    DriverObj.TotalDistanceCoveredToDestination = 0;

    for (var i = DriverObj.AssignedRiders.length - 1; i >= -1; i--) {

        if (i == -1) { // Last iteration ( driver dropoff )
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[0]))
            fromRiderID = DriverObj.AssignedRiders[0];
            DriverIndexinDriverRiders = DriversRiders.indexOf(DriversRiders.find(n => n.ID === DriverObj.ID))
            var datee = new Date(Riders[fromIndex].DropOffTime);
            DriverObj.DropOffTime = datee
            DriverObj.DropOffTime.setMinutes(Riders[fromIndex].DropOffTime.getMinutes() + DriversRiders[DriverIndexinDriverRiders].data.find(n => n.from === fromRiderID).duration)

            DriverObj.TotalDurationTaken += DriversRiders[DriverIndexinDriverRiders].data.find(n => n.from === fromRiderID).duration;
            DriverObj.TotalDistanceCoveredToDestination += DriversRiders[DriverIndexinDriverRiders].data.find(n => n.from === fromRiderID).distance;

            if (DriverObj.DropOffTime > DriverObj.LatestDropOff) {

                DriverObj.TotalDistanceCoveredToDestination = OldTotalDistanceCoveredToDestination
                DriverObj.TotalDurationTaken = OldTotalDurationTaken

                return Promise.resolve(-1);
            } else {
                Riders[Riders.length - 1].isAssigned = true;
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
            ToIndexinRidersRiders = RidersRiders.indexOf(RidersRiders.find(n => n.ID === toID));
            var datee = new Date(Riders[fromIndex].DropOffTime);
            RiderDropOff = datee
            Riders[toIndex].DropOffTime.setMinutes(Riders[fromIndex].DropOffTime.getMinutes() + RidersRiders[ToIndexinRidersRiders].data.find(n => n.from === fromID).duration)
            DriverObj.TotalDurationTaken += RidersRiders[ToIndexinRidersRiders].data.find(n => n.from === fromID).duration;
            DriverObj.TotalDistanceCoveredToDestination += RidersRiders[ToIndexinRidersRiders].data.find(n => n.from === fromID).distance;

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

    DriverID = AvailableDriver.ID;
    DriverIDstr = `${DriverID}`
    let g = new graphlib.Graph();
    var OrganizationID = "ORG";
    g.setNode(DriverIDstr)
    g.setNode(OrganizationID)
    for (var l = 0; l < AvailableDriver.AssignedRiders.length; l++) {
        var RiderID = AvailableDriver.AssignedRiders[l];
        RiderIDstr = `${RiderID}`
        var Durationn = DriversRiders.find(n => n.ID === DriverID).data.find(n => n.from === RiderID).duration;
        g.setNode(RiderIDstr)
        g.setEdge(RiderIDstr, DriverIDstr, Durationn)
        g.setEdge(OrganizationID, RiderIDstr, Riders.find(n => n.ID === RiderID).TimeFromOrganizationMinutes)
    }

    for (var p = 0; p < AvailableDriver.AssignedRiders.length; p++) {
        for (var m = 0; m < AvailableDriver.AssignedRiders.length; m++) {

            if (m != p) {
                var SourceID = AvailableDriver.AssignedRiders[p]
                var DestID = AvailableDriver.AssignedRiders[m]
                var Durationn = RidersRiders.find(n => n.ID === DestID).data.find(n => n.from === SourceID).duration
                SourceID = `${SourceID}`
                DestID = `${DestID}`
                g.setEdge(SourceID, DestID, Durationn)
            }
        }
    }

    var n = AvailableDriver.AssignedRiders.length;
    var count = n;
    var kValue = 0;

    while (true) {
        kValue += Combinatorics.P(n, count)
        count--;
        if (count == 0)
            break;

    }

    var delta = Math.max(0.25 * AvailableDriver.MaxDuration, 10)
    var response = ksp.ksp(g, OrganizationID, DriverIDstr, kValue);
    response = response.filter(p => (p.edges.length === n + 1) && p.totalCost <= AvailableDriver.TotalDurationTaken + delta && p.totalCost <= AvailableDriver.MaxDuration)

    for (var d = 0; d < response.length; d++) {
        var AssignedTemp = []
        for (var j = response[d].edges.length - 2; j >= 0; j--) {
            AssignedTemp.push(parseInt(response[d].edges[j].toNode))
        }
        AvailableDriver.AssignedRiders = AssignedTemp;
        var ValidDuration = await SetDropOffTime(AvailableDriver)
        if (ValidDuration != -1) {
            break;
        }
    }




    return Promise.resolve();
}

module.exports = async function main() {
    var f = require('./routes/api/chooseFromReturnTripsApi').getters
    obj = f();

    Riders = obj.Riders;
    AvailableDriver = obj.driver;
    RidersRiders = obj.RidersRiders;
    DriversRiders = obj.DriversRiders;

    TimeWithoutTakingRider = AvailableDriver.TotalDurationTaken;
    let cloneDriver = Object.assign(Object.create(Object.getPrototypeOf(AvailableDriver)), AvailableDriver)


    //Setting Pickup Time and Pool Start Time


    var x = await Reorder()






    return Promise.resolve();

}