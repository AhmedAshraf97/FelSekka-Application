const graphlib = require('graphlib');
//const ksp = require('k-shortest-path');
const ksp = require('../modules/yenKSP')
var Combinatorics = require('js-combinatorics');
var Riders;
var Drivers
var RidersRiders
var DriversRiders



function diff_minutes(dt2, dt1) {

    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return (Math.round(diff));

}




function SetPickUpTime(DriverObj) {
    if (DriverObj.AssignedRiders.length === 0) {
        return;
    }
    var fromIndex;
    var toIndex;
    DriverObj.TotalDurationTaken = 0;
    DriverObj.TotalDistanceCoveredToDestination = 0;
    for (var j = DriverObj.AssignedRiders.length - 1; j >= -1; j--) {

        if (j === -1)

        { // Last iteration ( First Rider )
            toIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[0]))
            DriverIndexinDriversRiders = DriversRiders.indexOf(DriversRiders.find(n => n.ID === DriverObj.ID))
            toRiderID = DriverObj.AssignedRiders[0];
            var datee = new Date(Riders[toIndex].PickupTime);
            DriverObj.PoolStartTime = datee
            DriverObj.PoolStartTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - DriversRiders[DriverIndexinDriversRiders].data.find(n => n.to === toRiderID).duration)
            DriverObj.TotalDurationTaken += DriversRiders[DriverIndexinDriversRiders].data.find(n => n.to === toRiderID).duration;
            DriverObj.TotalDistanceCoveredToDestination += DriversRiders[DriverIndexinDriversRiders].data.find(n => n.to === toRiderID).distance;
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
            FromIndexinRidersRiders = RidersRiders.indexOf(RidersRiders.find(n => n.ID === fromID));
            var datee = new Date(Riders[toIndex].PickupTime);
            Riders[fromIndex].PickupTime = datee
            Riders[fromIndex].PickupTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - RidersRiders[FromIndexinRidersRiders].data.find(n => n.to === toID).duration)
            DriverObj.TotalDurationTaken += RidersRiders[FromIndexinRidersRiders].data.find(n => n.to === toID).duration;
            DriverObj.TotalDistanceCoveredToDestination += RidersRiders[FromIndexinRidersRiders].data.find(n => n.to === toID).distance;
            if (Riders[fromIndex].PickupTime < Riders[fromIndex].EarliestPickup)
                return Promise.resolve(-1);
        }
    }

    return Promise.resolve(DriverObj.TotalDurationTaken);
}
async function StepByStepReorder(AvailableDriver) {

    DriverID = AvailableDriver.ID;
    DriverIDstr = `${DriverID}`
    let g = new graphlib.Graph();
    var OrganizationID = "ORG";
    g.setNode(DriverIDstr)
    g.setNode(OrganizationID)
    for (var l = 0; l < AvailableDriver.AssignedRiders.length; l++) {
        var RiderID = AvailableDriver.AssignedRiders[l];
        RiderIDstr = `${RiderID}`
        var Durationn = DriversRiders.find(n => n.ID === DriverID).data.find(n => n.to === RiderID).duration;
        g.setNode(RiderIDstr)
        g.setEdge(DriverIDstr, RiderIDstr, Durationn)
        g.setEdge(RiderIDstr, OrganizationID, Riders.find(n => n.ID === RiderID).TimeToOrganizationMinutes)
    }

    for (var p = 0; p < AvailableDriver.AssignedRiders.length; p++) {
        for (var m = 0; m < AvailableDriver.AssignedRiders.length; m++) {

            if (m != p) {
                var SourceID = AvailableDriver.AssignedRiders[p]
                var DestID = AvailableDriver.AssignedRiders[m]
                try {
                    var Durationn = RidersRiders.find(n => n.ID === SourceID).data.find(n => n.to === DestID).duration

                } catch (e) {
                    console.log(e)
                }
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
        if (count === 0)
            break;

    }



    var delta = Math.max(0.25 * AvailableDriver.MaxDuration, 15)

    var response = ksp.yenKSP(g, DriverIDstr, OrganizationID, kValue, AvailableDriver.TotalDurationTaken + delta, AvailableDriver.MaxDuration);

    filteredresponse = response.filter(p => (p.edges.length === n + 1))
        //    var oldDuration = AvailableDriver.TotalDurationTaken;

    //     var response = ksp.ksp(g, DriverIDstr, OrganizationID, kValue);
    //     filteredresponse = response.filter(p => (p.edges.length === n + 1) && p.totalCost <= AvailableDriver.MaxDuration)

    //     var filterghaby = filteredresponse.filter(p => p.totalCost > AvailableDriver.TotalDurationTaken + delta)

    //     for (var f = 0; f < filterghaby.length; f++) {
    //         var Ratio = oldDuration / filterghaby[f].totalCost
    //         var x = 5;
    //     }
    //     filteredresponse = filteredresponse.filter(p => p.totalCost <= AvailableDriver.TotalDurationTaken + delta)

    var ValidDuration = -1;

    for (var d = 0; d < filteredresponse.length; d++) {
        var AssignedTemp = []
        for (var j = 0; j < filteredresponse[d].edges.length - 1; j++) {
            AssignedTemp.push(parseInt(filteredresponse[d].edges[j].toNode))
        }

        AvailableDriver.AssignedRiders = AssignedTemp;
        ValidDuration = await SetPickUpTime(AvailableDriver)

        if (ValidDuration != -1) {
            break;
        }

    }

    return Promise.resolve(ValidDuration).catch(err => {
        console.log(err)
    });
}

module.exports = async function main() {
    var f = require('../routes/api/matchingApi').getters
    obj = f();

    Riders = obj.Riders;
    Drivers = obj.Drivers;
    RidersRiders = obj.RidersRiders;
    DriversRiders = obj.DriversRiders;
    AllDriversToRider = obj.AllDriversToRider
    AllRidersToRider = obj.AllRidersToRider

    var NumberOfUnAssignedRiders = Riders.length;


    var count = -1;


    while (count != Drivers.length) {

        if (NumberOfUnAssignedRiders === 0)
            break;

        for (var j = 0; j < Drivers.length; j++) {


            if (NumberOfUnAssignedRiders === 0)
                break;
            if (Drivers[j].userID === 89) {
                var x = 5;
            }

            var DriverID = Drivers[j].ID;
            var chosenDuration = -1
            var lastRiderID = Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]
            var ChosenRiderID = -1;
            var indexinDriverRider = DriversRiders.findIndex(n => n.ID === DriverID);
            if (indexinDriverRider === -1) {
                continue;
            }

            if (lastRiderID === undefined) { //First Rider to be assigned



                if (DriversRiders[indexinDriverRider].checked === DriversRiders[indexinDriverRider].length || Drivers[j].status === 1) {
                    continue;

                }



                var WeightArray = []
                var WeightIndex = []

                for (var k = 0; k < DriversRiders[indexinDriverRider].length; k++) {
                    var RiderID = DriversRiders[indexinDriverRider].data[k].to
                    var Distance = DriversRiders[indexinDriverRider].data[k].distance
                    var Duration = DriversRiders[indexinDriverRider].data[k].duration;
                    var RiderObj = Riders.find(n => n.ID === RiderID);
                    var Trust = 0;

                    if (diff_minutes(RiderObj.ArrivalTime, Drivers[j].ArrivalTime) > 30 || diff_minutes(RiderObj.ArrivalTime, Drivers[j].ArrivalTime) < 0) {
                        DriversRiders[indexinDriverRider].data.find(n => n.to === RiderID).checked = 1;
                        DriversRiders[indexinDriverRider].checked++;
                        continue;
                    }

                    if (DriversRiders[indexinDriverRider].data.find(n => n.to === RiderID).checked === 1) {
                        continue;
                    }

                    if (RiderObj.TrustedDrivers.find(n => n === DriverID))
                        Trust = 1
                    else if (RiderObj.UnTrustedDrivers.find(n => n === DriverID))
                        Trust = -1;


                    if (RiderObj.isAssigned === false) {

                        var WeightFunction = -0.45 * Duration / Drivers[j].MaxDurationToNormalize - 0.25 * Distance / Drivers[j].MaxDistanceToNormalize +
                            0.1 * Trust -
                            0.04 * diff_minutes(RiderObj.ArrivalTime, Drivers[j].ArrivalTime) / 30;

                        if (diff_minutes(RiderObj.EarliestPickup, Drivers[j].EarliestStartTime) > 0) {
                            WeightFunction -= 0.05 * (diff_minutes(RiderObj.EarliestPickup, Drivers[j].EarliestStartTime) / Drivers[j].MaxEarliestDiffToNormalize)
                        }

                        WeightArray.push(WeightFunction)
                        WeightIndex.push(RiderID)
                    } else {
                        DriversRiders[indexinDriverRider].data.find(n => n.to === RiderID).checked = 1;
                        DriversRiders[indexinDriverRider].checked++;
                    }
                }

                var WeightArrayForDrivers = []
                var WeightIndexForDrivers = []

                if (WeightArray.length > 0) {
                    ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(Math, WeightArray))]
                    var ChosenRiderDR = DriversRiders[indexinDriverRider].data.find(n => n.to === ChosenRiderID)
                    chosenDistance = ChosenRiderDR.distance
                    chosenDuration = ChosenRiderDR.duration
                    var indexinAllDriversToRider = AllDriversToRider.findIndex(n => n.ID === ChosenRiderID);
                    var CurrentRider = Riders.find(n => n.ID === ChosenRiderID)
                    for (var g = 0; g < AllDriversToRider[indexinAllDriversToRider].length; g++) {
                        var DriverToCheckID = AllDriversToRider[indexinAllDriversToRider].data[g].from
                        var DistanceFromDriver = AllDriversToRider[indexinAllDriversToRider].data[g].distance
                        var DurationFromDriver = AllDriversToRider[indexinAllDriversToRider].data[g].duration
                        var CurrentDriver = Drivers.find(n => n.ID === DriverToCheckID)
                        var Trust, NumberofEmptyPlaces;
                        NumberofEmptyPlaces = CurrentDriver.capacity - (CurrentDriver.AssignedRiders.length)

                        if (CurrentRider.TrustedDrivers.find(n => n === DriverToCheckID))
                            Trust = 1
                        else if (CurrentRider.UnTrustedDrivers.find(n => n === DriverToCheckID))
                            Trust = -1;
                        else if (CurrentDriver.status === 1)
                            continue;

                        if (CurrentDriver.AssignedRiders.length > 0) {

                            LastRiderForDriverID = CurrentDriver.AssignedRiders[CurrentDriver.AssignedRiders.length - 1]
                            var indexinRiderRider = RidersRiders.findIndex(n => n.ID === LastRiderForDriverID);
                            var ChosenRiderRR = RidersRiders[indexinRiderRider].data.find(n => n.to === ChosenRiderID)
                            DistanceFromRider = ChosenRiderRR.distance
                            DurationFromRider = ChosenRiderRR.duration

                            var WeightFunctionDriver = -0.45 * DurationFromRider / CurrentRider.MaxDurationToNormalizeDrivers -
                                0.25 * DistanceFromRider / CurrentRider.MaxDistanceToNormalizeDrivers +
                                0.1 * Trust -
                                0.04 * diff_minutes(CurrentRider.ArrivalTime, CurrentDriver.ArrivalTime) / 30 +
                                0.1 * NumberofEmptyPlaces / CurrentDriver.capacity


                        } else {
                            var WeightFunctionDriver = -0.45 * DurationFromDriver / CurrentRider.MaxDurationToNormalizeDrivers -
                                0.25 * DistanceFromDriver / CurrentRider.MaxDistanceToNormalizeDrivers +
                                0.1 * Trust -
                                0.04 * diff_minutes(CurrentRider.ArrivalTime, CurrentDriver.ArrivalTime) / 30 +
                                0.1 * NumberofEmptyPlaces / CurrentDriver.capacity



                        }

                        WeightArrayForDrivers.push(WeightFunctionDriver)
                        WeightIndexForDrivers.push(DriverToCheckID)

                    }

                    if (Drivers[j].countDrivers == WeightArray.length) {


                        var filteredDrivers = Drivers.filter(n => n.lastChosenRider === ChosenRiderID && n.status === 0 && n.AssignedRiders.length === 0);
                        if (filteredDrivers.length != 0) {
                            var durations = [],
                                Ids = [];
                            for (var h = 0; h < filteredDrivers.length; h++) {
                                var currDriver = filteredDrivers[h]
                                var tempindexinDriversToRider = DriversRiders.findIndex(n => n.ID === currDriver.ID);
                                var DurationToChosenRider = DriversRiders[tempindexinDriversToRider].data.find(n => n.to === ChosenRiderID).duration;
                                durations.push(DurationToChosenRider)
                                Ids.push(currDriver.ID)
                            }

                            var BestDriver = Ids[durations.indexOf(Math.min.apply(null, durations))]

                            if (BestDriver === Drivers[j].ID) {
                                DriversRiders[indexinDriverRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                                DriversRiders[indexinDriverRider].checked++
                            } else {
                                ChosenRiderID = -1;
                            }
                        } else {

                            DriversRiders[indexinDriverRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                            DriversRiders[indexinDriverRider].checked++
                        }

                    } else {
                        Drivers[j].countDrivers = WeightArray.length

                        if (WeightArrayForDrivers.length > 0) {

                            var ChosenDriverID = WeightIndexForDrivers[WeightArrayForDrivers.indexOf(Math.max.apply(Math, WeightArrayForDrivers))]
                            if (ChosenDriverID !== Drivers[j].ID) {
                                Drivers[j].lastChosenRider = ChosenRiderID;
                                ChosenRiderID = -1;
                            } else {
                                DriversRiders[indexinDriverRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                                DriversRiders[indexinDriverRider].checked++;
                            }

                        } else {
                            ChosenRiderID = -1;
                        }


                    }
                }

            } else { // Not First Rider

                var indexinRiderRider = RidersRiders.findIndex(n => n.ID === lastRiderID);
                var indexLastRider = Riders.findIndex(n => n.ID === lastRiderID);
                if (indexinRiderRider === -1) {
                    continue;
                }
                if (RidersRiders[indexinRiderRider].checked === RidersRiders[indexinRiderRider].length || Drivers[j].status === 1) {
                    continue;
                }


                var WeightArray = []
                var WeightIndex = []


                for (var k = 0; k < RidersRiders[indexinRiderRider].length; k++) {
                    var RiderID = RidersRiders[indexinRiderRider].data[k].to
                    var RiderObj = Riders.find(n => n.ID === RiderID)
                    if (diff_minutes(RiderObj.ArrivalTime, Drivers[j].ArrivalTime) > 30 || diff_minutes(RiderObj.ArrivalTime, Drivers[j].ArrivalTime) < 0) {
                        RidersRiders[indexinRiderRider].data.find(n => n.to === RiderID).checked = 1;
                        RidersRiders[indexinRiderRider].checked++;
                        continue;

                    }
                    if (RidersRiders[indexinRiderRider].data.find(n => n.to === RiderID).checked === 1) {
                        continue;
                    }

                    var Distance = RidersRiders[indexinRiderRider].data[k].distance
                    var Duration = RidersRiders[indexinRiderRider].data[k].duration;
                    var Trust = 0;


                    if (RiderObj.TrustedDrivers.find(n => n === DriverID))
                        Trust = 1
                    else if (RiderObj.UnTrustedDrivers.find(n => n === DriverID))
                        Trust = -1;



                    if (RiderObj.isAssigned === false) {
                        var WeightFunction = -0.45 * Duration / Riders[indexLastRider].MaxDurationToNormalize - 0.25 * Distance / Riders[indexLastRider].MaxDistanceToNormalize + 0.1 * Trust -
                            0.04 * diff_minutes(RiderObj.ArrivalTime, Drivers[j].ArrivalTime) / 30
                        WeightArray.push(WeightFunction)
                        WeightIndex.push(RiderID)
                    } else {

                        RidersRiders[indexinRiderRider].data.find(n => n.to === RiderID).checked = 1;
                        RidersRiders[indexinRiderRider].checked++;
                    }



                }
                if (WeightArray.length > 0) {

                    ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(null, WeightArray))]
                    var chosenRiderRR = RidersRiders[indexinRiderRider].data.find(n => n.to === ChosenRiderID)
                    chosenDistance = chosenRiderRR.distance
                    chosenDuration = chosenRiderRR.duration
                    CurrentRider = Riders.find(n => n.ID === ChosenRiderID)
                    WeightArrayForRiders = []
                    WeightIndexForRiders = []

                    var indexinAllRidersToRider = AllRidersToRider.findIndex(n => n.ID === ChosenRiderID);
                    for (var g = 0; g < AllRidersToRider[indexinAllRidersToRider].length; g++) {
                        var RiderToCheckID = AllRidersToRider[indexinAllRidersToRider].data[g].from
                        var DistanceFromRider = AllRidersToRider[indexinAllRidersToRider].data[g].distance
                        var DurationFromRider = AllRidersToRider[indexinAllRidersToRider].data[g].duration;
                        var RiderToCheckobj = Riders.find(n => n.ID === RiderToCheckID)

                        if (RiderToCheckobj.DriverAssigned === -1) {
                            continue;
                        }


                        var DriverOfRiderToCheck = Drivers.find(n => n.ID === RiderToCheckobj.DriverAssigned)

                        var Trust, NumberofEmptyPlaces;


                        NumberofEmptyPlaces = DriverOfRiderToCheck.capacity - (DriverOfRiderToCheck.AssignedRiders.length)
                        if (DriverOfRiderToCheck.status === 1) {
                            var WeightFunctionRider = Number.NEGATIVE_INFINITY;
                            WeightArrayForRiders.push(WeightFunctionRider)
                            WeightIndexForRiders.push(RiderToCheckID)
                            continue;
                        }

                        if (CurrentRider.TrustedDrivers.find(n => n === DriverOfRiderToCheck.ID))
                            Trust = 1
                        else if (CurrentRider.UnTrustedDrivers.find(n => n === DriverOfRiderToCheck.ID))
                            Trust = -1;


                        var WeightFunctionRider = -0.45 * DurationFromRider / CurrentRider.MaxDurationToNormalizeRiders -
                            0.25 * DistanceFromRider / CurrentRider.MaxDistanceToNormalizeRiders +
                            0.1 * Trust -
                            0.04 * diff_minutes(CurrentRider.ArrivalTime, DriverOfRiderToCheck.ArrivalTime) / 30 +
                            0.1 * NumberofEmptyPlaces / DriverOfRiderToCheck.capacity



                        WeightArrayForRiders.push(WeightFunctionRider)
                        WeightIndexForRiders.push(RiderToCheckID)


                    }


                    if (Drivers[j].countRiders == WeightArrayForRiders.length) {

                        var filteredDrivers = Drivers.filter(n => n.lastChosenRider === ChosenRiderID && n.status === 0 && n.AssignedRiders.length != 0);
                        if (filteredDrivers.length != 0) {
                            var durations = [],
                                Ids = [];
                            for (var h = 0; h < filteredDrivers.length; h++) {
                                var currDriver = filteredDrivers[h]
                                var lastrider = currDriver.AssignedRiders[currDriver.AssignedRiders.length - 1]
                                var tempindexinRidersToRider = RidersRiders.findIndex(n => n.ID === lastrider);
                                var DurationToChosenRider = RidersRiders[tempindexinRidersToRider].data.find(n => n.to === ChosenRiderID).duration;
                                durations.push(DurationToChosenRider)
                                Ids.push(currDriver.ID)
                            }

                            var BestDriver = Ids[durations.indexOf(Math.min.apply(null, durations))]

                            if (BestDriver === Drivers[j].ID) {
                                RidersRiders[indexinRiderRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                                RidersRiders[indexinRiderRider].checked++;
                            } else {
                                ChosenRiderID = -1;

                            }
                        } else {

                            RidersRiders[indexinRiderRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                            RidersRiders[indexinRiderRider].checked++;

                        }

                    } else {
                        Drivers[j].countRiders = WeightArrayForRiders.length

                        if (WeightArrayForRiders.length > 0) {
                            var ChosenMaxRider = WeightIndexForRiders[WeightArrayForRiders.indexOf(Math.max.apply(Math, WeightArrayForRiders))]
                            var isExist = Drivers[j].AssignedRiders.find(n => n === ChosenMaxRider)



                            if (isExist === undefined) {
                                Drivers[j].lastChosenRider = ChosenRiderID;
                                ChosenRiderID = -1;
                            } else {
                                RidersRiders[indexinRiderRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                                RidersRiders[indexinRiderRider].checked++;
                            }

                        } else {
                            ChosenRiderID = -1;
                        }

                    }
                }

            }

            if (ChosenRiderID != -1 && chosenDuration != -1) {
                Drivers[j].lastChosenRider = -1;
                var old_Assigned = JSON.parse(JSON.stringify(Drivers[j].AssignedRiders));
                Drivers[j].AssignedRiders.push(ChosenRiderID)
                if (lastRiderID === undefined) {
                    var ValidAssign = await SetPickUpTime(Drivers[j])
                    if (ValidAssign === -1) {
                        Drivers[j].AssignedRiders = []
                        Drivers[j].TotalDurationTaken = 0;
                        Drivers[j].TotalDistanceCoveredToDestination = 0;
                    } else {

                        var delta = Math.max(0.25 * Drivers[j].MaxDuration, 15)
                        var TimeWithoutRider = Drivers[j].TimeToOrganizationMinutes
                        if (Drivers[j].TotalDurationTaken - TimeWithoutRider <= delta) {
                            Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                            Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                            NumberOfUnAssignedRiders--;
                            if (Drivers[j].TotalDurationTaken === Drivers.MaxDuration || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                                Drivers[j].status = 1;
                            }


                        } else {
                            Drivers[j].AssignedRiders = []
                            Drivers[j].TotalDurationTaken = 0;
                            Drivers[j].TotalDistanceCoveredToDestination = 0;
                        }

                    }
                } else {
                    var ValidAssign = await StepByStepReorder(Drivers[j])
                    if (ValidAssign === -1) {
                        Drivers[j].AssignedRiders = old_Assigned
                        ValidAssign = await SetPickUpTime(Drivers[j])
                    } else {
                        Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                        Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                        if (Drivers[j].TotalDurationTaken === Drivers.MaxDuration || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                            Drivers[j].status = 1;
                        }
                        NumberOfUnAssignedRiders--;
                    }
                }

            }
        }

        count = 0;
        for (var j = 0; j < Drivers.length; j++) {


            if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] === undefined) // last rider driver
            {
                var indexinDriverRider = DriversRiders.findIndex(n => n.ID === Drivers[j].ID);
                if (indexinDriverRider === -1) {
                    count++;
                } else if (DriversRiders[indexinDriverRider].checked === DriversRiders[indexinDriverRider].length || Drivers[j].status === 1) {
                    count++;

                }


            } else {
                var indexinRiderRider = RidersRiders.findIndex(n => n.ID === Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinRiderRider === -1) {
                    count++;
                } else if (RidersRiders[indexinRiderRider].checked === RidersRiders[indexinRiderRider].length || Drivers[j].status === 1) {
                    count++;

                }
            }
        }

    }


}