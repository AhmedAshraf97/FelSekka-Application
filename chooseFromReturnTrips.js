const graphlib = require('graphlib');
const ksp = require('k-shortest-path');
var Combinatorics = require('js-combinatorics');
var Riders;
var AvailableDriver;
var RiderRider
var RiderRiderDuration
var DriversRidersDuration
var DriversRider

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

    DriverID = AvailableDriver.ID;
    DriverIDstr = `${DriverID}`
    let g = new graphlib.Graph();
    var OrganizationID = "ORG";
    g.setNode(DriverIDstr)
    g.setNode(OrganizationID)
    for (var l = 1; l < AvailableDriver.AssignedRiders.length; l++) {
        var RiderID = AvailableDriver.AssignedRiders[l];
        RiderIDstr = `${RiderID}`
        var Durationn = DriversRidersDuration.find(n => n.ID === DriverID).data.find(n => n.from === RiderID).duration;
        g.setNode(RiderIDstr)
        g.setEdge(RiderIDstr, DriverIDstr, Durationn)
        g.setEdge(OrganizationID, RiderIDstr, Riders.find(n => n.ID === RiderID).TimeFromOrganizationMinutes)
    }

    for (var p = 1; p < AvailableDriver.AssignedRiders.length; p++) {
        for (var m = 1; m < AvailableDriver.AssignedRiders.length; m++) {

            if (m != p) {
                var SourceID = AvailableDriver.AssignedRiders[p]
                var DestID = AvailableDriver.AssignedRiders[m]
                var Durationn = RiderRiderDuration.find(n => n.ID === DestID).data.find(n => n.from === SourceID).duration
                SourceID = `${SourceID}`
                DestID = `${DestID}`
                g.setEdge(SourceID, DestID, Durationn)
            }
        }
    }

    var n = AvailableDriver.AssignedRiders.length - 1;
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
        for (var j = response[d].edges.length - 1; j >= 0; j--) {
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
    RiderRider = obj.RiderRider;
    RiderRiderDuration = obj.RiderRiderDuration;
    DriversRidersDuration = obj.DriversRidersDuration;
    DriversRider = obj.DriversRider;

    TimeWithoutTakingRider = AvailableDriver.TotalDurationTaken;
    let cloneDriver = Object.assign(Object.create(Object.getPrototypeOf(AvailableDriver)), AvailableDriver)


    //Setting Pickup Time and Pool Start Time


    var x = await Reorder()






    return Promise.resolve();

}