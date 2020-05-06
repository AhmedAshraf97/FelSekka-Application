const graphlib = require('graphlib');
const ksp = require('k-shortest-path');
var Combinatorics = require('js-combinatorics');
var Riders;
var Drivers
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
            if (DriverObj.PoolStartTime < DriverObj.EarliestStartTime)
                return Promise.resolve(-1);
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

    for (var k = 0; k < Drivers.length; k++) {
        if (Drivers[k].AssignedRiders.length === 1)
            break;
        DriverID = Drivers[k].ID;
        DriverIDstr = `${DriverID}`
        let g = new graphlib.Graph();
        var OrganizationID = "ORG";
        g.setNode(DriverIDstr)
        g.setNode(OrganizationID)
        for (var l = 1; l < Drivers[k].AssignedRiders.length; l++) {
            var RiderID = Drivers[k].AssignedRiders[l];
            RiderIDstr = `${RiderID}`
            var Durationn = DriversRidersDuration.find(n => n.ID === DriverID).data.find(n => n.to === RiderID).duration;
            g.setNode(RiderIDstr)
            g.setEdge(DriverIDstr, RiderIDstr, Durationn)
            g.setEdge(RiderIDstr, OrganizationID, Riders.find(n => n.ID === RiderID).TimeToOrganizationMinutes)
        }

        for (var p = 1; p < Drivers[k].AssignedRiders.length; p++) {
            for (var m = 1; m < Drivers[k].AssignedRiders.length; m++) {

                if (m != p) {
                    var SourceID = Drivers[k].AssignedRiders[p]
                    var DestID = Drivers[k].AssignedRiders[m]
                    var Durationn = RiderRiderDuration.find(n => n.ID === SourceID).data.find(n => n.to === DestID).duration
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
            if (count === 0)
                break;

        }

        var response = ksp.ksp(g, DriverIDstr, OrganizationID, kValue);
        response = response.filter(p => (p.edges.length === n + 1) && p.totalCost <= (Drivers[k].TotalDurationTaken + Drivers[k].TimeToOrganizationMinutes))

        for (var d = 0; d < response.length; d++) {
            var AssignedTemp = []
            AssignedTemp.push(DriverID)
            for (var j = 0; j < response[d].edges.length - 1; j++) {
                AssignedTemp.push(parseInt(response[d].edges[j].toNode))
            }
            Drivers[k].AssignedRiders = AssignedTemp;
            var ValidDuration = await SetPickUpTime(Drivers[k])
            if (ValidDuration != -1) {
                break;
            }
        }

    }
    return Promise.resolve();
}

module.exports = async function main() {
    Riders = require('./routes/api/matching').Riders
    Drivers = require('./routes/api/matching').Drivers
    RiderRider = require('./routes/api/matching').RiderRider
    RiderRiderDuration = require('./routes/api/matching').RiderRiderDuration
    DriversRidersDuration = require('./routes/api/matching').DriversRidersDuration
    DriversRider = require('./routes/api/matching').DriversRider

    var DistanceThreshold = 8;

    var NumberOfUnAssignedRiders = Riders.length;

    //Drivers are sorted by rating
    var count = -1;

    while (count != Drivers.length) {

        if (NumberOfUnAssignedRiders === 0)
            break;


        for (var j = 0; j < Drivers.length; j++) {


            if (NumberOfUnAssignedRiders === 0)
                break;

            var DriverID = Drivers[j].ID;
            var chosenDuration = -1
            var chosenDistance = -1
            var lastRiderID = Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]
            var ChosenRiderID = -1;
            var indexinDriverRider = DriversRider.findIndex(n => n.ID === DriverID);
            if (DriversRidersDuration.findIndex(n => n.ID === Drivers[j].ID) === -1) {
                continue;
            }
            if (lastRiderID === DriverID) { //First Rider to be assigned

                if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] === Drivers[j].ID) // last rider driver
                {

                    var indexinDriverRider = DriversRidersDuration.findIndex(n => n.ID === Drivers[j].ID);
                    if (indexinDriverRider === -1) {
                        continue;
                    }
                    if (DriversRidersDuration[indexinDriverRider].checked === DriversRidersDuration[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                        continue;

                    }


                }
                var WeightArray = []
                var WeightIndex = []

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

                        var WeightFunction = -0.45 * Duration / Drivers[j].MaxDurationToNormalize - 0.25 * Distance / Drivers[j].MaxDistanceToNormalize + 0.3 * Trust -
                            0.15 * (diff_minutes(Riders.find(n => n.ID === RiderID).EarliestPickup, Drivers[j].EarliestStartTime) - Duration) / Drivers[j].MaxEarliestDiffToNormalize -
                            0.04 * diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) / 30; ///arrival time diff

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

                var indexinRiderRider = RiderRiderDuration.findIndex(n => n.ID === lastRiderID);
                if (indexinRiderRider === -1) {
                    continue;
                }
                if (RiderRiderDuration[indexinRiderRider].checked === RiderRiderDuration[indexinRiderRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    continue;

                }


                var WeightArray = []
                var WeightIndex = []


                for (var k = 0; k < RiderRiderDuration[indexinRiderRider].length; k++) {
                    var RiderID = RiderRiderDuration[indexinRiderRider].data[k].to
                    var IndexInRiders = Riders.findIndex(n => n.ID === RiderID)
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

                        var WeightFunction = -0.45 * Duration / Riders[IndexInRiders].MaxDurationToNormalize - 0.25 * Distance / Riders[IndexInRiders].MaxDistanceToNormalize + 0.3 * Trust -
                            0.04 * diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) / 30
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

            }

            if (ChosenRiderID != -1 && chosenDuration != -1) {
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


            if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] === Drivers[j].ID) // last rider driver
            {
                var indexinDriverRider = DriversRidersDuration.findIndex(n => n.ID === Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinDriverRider === -1) {
                    count++;
                } else if (DriversRidersDuration[indexinDriverRider].checked === DriversRidersDuration[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }


            } else {
                var indexinRiderRider = RiderRiderDuration.findIndex(n => n.ID === Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinRiderRider) {
                    count++;
                } else if (RiderRiderDuration[indexinRiderRider].checked === RiderRiderDuration[indexinRiderRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }
            }
        }

    }



    //Setting Pickup Time and Pool Start Time
    var x = await MatchingReorder()
    for (var i = 0; i < Drivers.length; i++) {
        if (Drivers[i].AssignedRiders.length !== 1) {

            console.log(Drivers[i].ID, Drivers[i].Name, Drivers[i].AssignedRiders, "Start ", Drivers[i].PoolStartTime)
            console.log("Total Covered = ", Drivers[i].TotalDistanceCoveredToDestination, " max duration ", Drivers[i].MaxDuration, "total time taken", Drivers[i].TotalDurationTaken, "arrival", Drivers[i].ArrivalTime)
            for (var j = 1; j < Drivers[i].AssignedRiders.length; j++) {
                index1 = Riders.indexOf(Riders.find(n => n.ID === Drivers[i].AssignedRiders[j]));
                console.log(Drivers[i].AssignedRiders[j], Riders[index1].PickupTime)
            }
            console.log(" //////////////////////////////////////////// ")
        }
    }

}