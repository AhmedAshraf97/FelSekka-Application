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




function SetPickUpTime(DriverObj) {
    if (DriverObj.AssignedRiders.length === 1) {
        return; //Driver has no passengers
    }
    var fromIndex;
    var toIndex;
    DriverObj.TotalDurationTaken = 0;
    DriverObj.TotalDistanceCoveredToDestination = 0;
    for (var j = DriverObj.AssignedRiders.length - 1; j >= 0; j--) {

        if (j === 0)

        { // Last iteration ( First Rider )
            toIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[1]))
            DriverIndexinDriverRidersDuration = DriversRidersDuration.indexOf(DriversRidersDuration.find(n => n.ID === DriverObj.ID))
            DriverIndexinDriverRidersDistance = DriversRider.indexOf(DriversRider.find(n => n.ID === DriverObj.ID))
            toRiderID = DriverObj.AssignedRiders[1];
            var datee = new Date(Riders[toIndex].PickupTime);
            DriverObj.PoolStartTime = datee
            DriverObj.PoolStartTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.to === toRiderID).duration)
            DriverObj.TotalDurationTaken += DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.to === toRiderID).duration;
            DriverObj.TotalDistanceCoveredToDestination += DriversRider[DriverIndexinDriverRidersDistance].data.find(n => n.to === toRiderID).distance;
            if (DriverObj.PoolStartTime < DriverObj.EarliestStartTime) {
                return Promise.resolve(-1);
            } else {
                Riders[Riders.length - 1].isAssigned = true;
            }
        } else if (j === DriverObj.AssignedRiders.length - 1) { // First iteration ( Last Rider )
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[j]))
            DriverObj.TotalDistanceCoveredToDestination += Riders[fromIndex].DistanceToOrganization;
            DriverObj.TotalDurationTaken += Riders[fromIndex].TimeToOrganizationMinutes;
            var datee = new Date(DriverObj.ArrivalTime);
            Riders[fromIndex].PickupTime = datee
            Riders[fromIndex].PickupTime.setMinutes(DriverObj.ArrivalTime.getMinutes() - Riders[fromIndex].TimeToOrganizationMinutes)
            if (Riders[fromIndex].PickupTime < Riders[fromIndex].EarliestPickup)
                return Promise.resolve(-1);
        } else {
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[j]));
            toIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[j + 1]));
            toID = DriverObj.AssignedRiders[j + 1];
            fromID = DriverObj.AssignedRiders[j]
            FromIndexinRiderRiderDuration = RiderRiderDuration.indexOf(RiderRiderDuration.find(n => n.ID === fromID));
            FromIndexinRiderRiderDistance = RiderRider.indexOf(RiderRider.find(n => n.ID === fromID));
            var datee = new Date(Riders[toIndex].PickupTime);
            Riders[fromIndex].PickupTime = datee
            Riders[fromIndex].PickupTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration)
            DriverObj.TotalDurationTaken += RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration;
            DriverObj.TotalDistanceCoveredToDestination += RiderRider[FromIndexinRiderRiderDistance].data.find(n => n.to === toID).distance;
            if (Riders[fromIndex].PickupTime < Riders[fromIndex].EarliestPickup)
                return Promise.resolve(-1);
        }
    }

    return Promise.resolve(DriverObj.TotalDurationTaken);
}


async function MatchingReorder() {



    DriverID = AvailableDriver.ID;
    DriverIDstr = `${DriverID}`
    let g = new graphlib.Graph();
    var OrganizationID = "ORG";
    g.setNode(DriverIDstr)
    g.setNode(OrganizationID)
    for (var l = 1; l < AvailableDriver.AssignedRiders.length; l++) {
        var RiderID = AvailableDriver.AssignedRiders[l];
        RiderIDstr = `${RiderID}`
        var Durationn = DriversRidersDuration.find(n => n.ID === DriverID).data.find(n => n.to === RiderID).duration;
        g.setNode(RiderIDstr)
        g.setEdge(DriverIDstr, RiderIDstr, Durationn)
        g.setEdge(RiderIDstr, OrganizationID, Riders.find(n => n.ID === RiderID).TimeToOrganizationMinutes)
    }

    for (var p = 1; p < AvailableDriver.AssignedRiders.length; p++) {
        for (var m = 1; m < AvailableDriver.AssignedRiders.length; m++) {

            if (m != p) {
                var SourceID = AvailableDriver.AssignedRiders[p]
                var DestID = AvailableDriver.AssignedRiders[m]
                var Durationn = RiderRiderDuration.find(n => n.ID === SourceID).data.find(n => n.to === DestID).duration
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
        if (count === 0)
            break;

    }
    ////////////////////////
    /* var TimeWithTakingRider = diff_minutes(cloneDriver.ArrivalTime, cloneDriver.PoolStartTime);
    var delta = TimeWithTakingRider - TimeWithoutTakingRider;

    if (diff_minutes(cloneDriver.ArrivalTime, cloneDriver.PoolStartTime) > cloneDriver.MaxDuration || delta > 30 || flag === 1) {
        continue;
    }
     */

    ////////////////////////
    //////////////
    var delta = Math.max(0.25 * AvailableDriver.MaxDuration, 10)
    var response = ksp.ksp(g, DriverIDstr, OrganizationID, kValue);
    response = response.filter(p => (p.edges.length === n + 1) && p.totalCost <= AvailableDriver.TotalDurationTaken + delta && p.totalCost <= AvailableDriver.MaxDuration)

    for (var d = 0; d < response.length; d++) {
        var AssignedTemp = []
        AssignedTemp.push(DriverID)
        for (var j = 0; j < response[d].edges.length - 1; j++) {
            AssignedTemp.push(parseInt(response[d].edges[j].toNode))
        }
        AvailableDriver.AssignedRiders = AssignedTemp;
        var ValidDuration = await SetPickUpTime(AvailableDriver)
        if (ValidDuration != -1) {
            break;
        }

    }


    return Promise.resolve().catch(err => {
        console.log(err)
    });
}

module.exports = async function main() {
    var f = require('./routes/api/chooseFromAvailableRidesApi').getters
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


    var x = await MatchingReorder()






    return Promise.resolve();

}