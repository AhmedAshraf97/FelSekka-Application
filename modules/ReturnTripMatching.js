const graphlib = require('graphlib');
const ksp = require('k-shortest-path');
//const ksp = require('../FelSekka-Application/modules/yenKSP')
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



function SetDropOffTime(DriverObj) {

    if (DriverObj.AssignedRiders.length == 0) {
        return; //Driver has no passengers
    }

    var fromIndex;
    var toIndex;
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
                return Promise.resolve(-1);
            }

        } else if (i == DriverObj.AssignedRiders.length - 1) { // First iteration ( first Rider ) 

            fromIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[i]))
            var datee = new Date(DriverObj.PoolStartTime);
            Riders[fromIndex].DropOffTime = datee
            DriverObj.TotalDistanceCoveredToDestination += Riders[fromIndex].DistanceFromOrganization;
            DriverObj.TotalDurationTaken += Riders[fromIndex].TimeFromOrganizationMinutes;
            Riders[fromIndex].DropOffTime.setMinutes(DriverObj.PoolStartTime.getMinutes() + Riders[fromIndex].TimeFromOrganizationMinutes)

            if (Riders[fromIndex].DropOffTime > Riders[fromIndex].LatestDropOff) {
                return Promise.resolve(-1);
            }
        } else {
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[i + 1]));
            toIndex = Riders.indexOf(Riders.find(n => n.ID === DriverObj.AssignedRiders[i]));
            var toID = DriverObj.AssignedRiders[i];
            var fromID = DriverObj.AssignedRiders[i + 1]
            ToIndexinRiderRider = RidersRiders.indexOf(RidersRiders.find(n => n.ID === toID));
            var datee = new Date(Riders[fromIndex].DropOffTime);
            Riders[toIndex].DropOffTime = datee
            Riders[toIndex].DropOffTime.setMinutes(Riders[fromIndex].DropOffTime.getMinutes() + RidersRiders[ToIndexinRiderRider].data.find(n => n.from === fromID).duration)
            DriverObj.TotalDurationTaken += RidersRiders[ToIndexinRiderRider].data.find(n => n.from === fromID).duration;
            DriverObj.TotalDistanceCoveredToDestination += RidersRiders[ToIndexinRiderRider].data.find(n => n.from === fromID).distance;

            if (Riders[toIndex].DropOffTime > Riders[toIndex].LatestDropOff) {
                return Promise.resolve(-1);
            }
        }
    }
    return Promise.resolve(DriverObj.TotalDurationTaken).catch(err => {
        console.log(err)
    })
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




    var delta = Math.max(0.25 * AvailableDriver.MaxDuration, 15)
    var response = ksp.ksp(g, OrganizationID, DriverIDstr, kValue);

    // var response = ksp.yenKSP(g, OrganizationID, DriverIDstr, kValue, AvailableDriver.TotalDurationTaken + delta, AvailableDriver.MaxDuration);

    response = response.filter(p => (p.edges.length === n + 1) && p.totalCost <= AvailableDriver.TotalDurationTaken + delta && p.totalCost <= AvailableDriver.MaxDuration)
        //  response = response.filter(p => (p.edges.length === n + 1))
    var ValidDuration = -1

    for (var d = 0; d < response.length; d++) {
        var AssignedTemp = []
        for (var j = response[d].edges.length - 2; j >= 0; j--) {
            AssignedTemp.push(parseInt(response[d].edges[j].toNode))
        }
        AvailableDriver.AssignedRiders = AssignedTemp;
        ValidDuration = await SetDropOffTime(AvailableDriver)
        if (ValidDuration != -1) {
            break;
        }
    }

    return Promise.resolve(ValidDuration).catch(err => {
        console.log(err)
    })
}


module.exports = async function main(s) {

    var f = require(s).getters
    obj = f();

    Riders = obj.Riders;
    Drivers = obj.Drivers;
    RidersRiders = obj.RidersRiders;
    DriversRiders = obj.DriversRiders;


    FromRiderToAllDrivers = obj.FromRiderToAllDrivers
    FromRiderToAllRiders = obj.FromRiderToAllRiders

    var NumberOfUnAssignedRiders = Riders.length;
    var count = -1;
    var farah = 0;
    while (count != Drivers.length) {
        farah++;
        if (NumberOfUnAssignedRiders === 0)
            break;

        for (var j = 0; j < Drivers.length; j++) {
            if (Drivers[j].ID === 56) {
                var x = 5;
            }

            if (NumberOfUnAssignedRiders === 0)
                break;

            var DriverID = Drivers[j].ID;
            var chosenDuration = -1
            var lastRiderID = Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] /////
            var ChosenRiderID = -1;
            var indexinDriverRider = DriversRiders.findIndex(n => n.ID == DriverID);
            if (DriversRiders.findIndex(n => n.ID == Drivers[j].ID) === -1) {
                continue;
            }
            if (lastRiderID === undefined) { //First Rider to be assigned


                var indexinDriverRider = DriversRiders.findIndex(n => n.ID == Drivers[j].ID);

                if (DriversRiders[indexinDriverRider].checked === DriversRiders[indexinDriverRider].length || Drivers[j].status === 1) {
                    continue;

                }


                var WeightArray = []
                var WeightIndex = []


                for (var k = 0; k < DriversRiders[indexinDriverRider].length; k++) {
                    var RiderID = DriversRiders[indexinDriverRider].data[k].from
                    var Distance = DriversRiders[indexinDriverRider].data[k].distance
                    var Duration = DriversRiders[indexinDriverRider].data[k].duration;
                    var Trust = 0;
                    if (diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) > 30 || diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) < 0) {
                        DriversRiders[indexinDriverRider].data.find(n => n.from === RiderID).checked = 1;
                        DriversRiders[indexinDriverRider].checked++;
                        continue;
                    }

                    if (DriversRiders[indexinDriverRider].data.find(n => n.from === RiderID).checked === 1) {
                        continue;
                    }

                    if (Riders.find(n => n.ID === RiderID).TrustedDrivers.find(n => n === DriverID)) //given from rider
                        Trust = 1
                    else if (Riders.find(n => n.ID === RiderID).UnTrustedDrivers.find(n => n === DriverID))
                        Trust = -1;

                    //add duration 
                    if (Riders.find(n => n.ID === RiderID).isAssigned === false) {

                        var WeightFunction = -0.45 * Duration / Drivers[j].MaxDurationToNormalize - 0.25 * Distance / Drivers[j].MaxDistanceToNormalize + 0.3 * Trust -
                            0.04 * diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) / 30; ///arrival time diff

                        if (Drivers[j].ID == 79 && RiderID == 75) {
                            var x = 6;
                        }

                        if (diff_minutes(Drivers[j].LatestDropOff, Riders.find(n => n.ID === RiderID).LatestDropOff) > 0) {
                            WeightFunction -= 0.05 *
                                (diff_minutes(Drivers[j].LatestDropOff, (Riders.find(n => n.ID === RiderID).LatestDropOff)) / Drivers[j].MaxDropoffDiffToNormalize)
                        }
                        WeightArray.push(WeightFunction)
                        WeightIndex.push(RiderID)
                    } else {
                        DriversRiders[indexinDriverRider].data.find(n => n.from === RiderID).checked = 1;
                        DriversRiders[indexinDriverRider].checked++;
                    }
                }
                var WeightArrayForDrivers = []
                var WeightIndexForDrivers = []

                if (Drivers[j].ID === 64 || Drivers[j].ID === 61) {
                    var x = 5;
                }
                if (WeightArray.length > 0) {
                    ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(Math, WeightArray))]
                    chosenDistance = DriversRiders[indexinDriverRider].data.find(n => n.from === ChosenRiderID).distance
                    chosenDuration = DriversRiders[indexinDriverRider].data.find(n => n.from === ChosenRiderID).duration
                    var indexinFromRiderToAllDrivers = FromRiderToAllDrivers.findIndex(n => n.ID === ChosenRiderID);
                    var CurrentRider = Riders.find(n => n.ID === ChosenRiderID)

                    for (var g = 0; g < FromRiderToAllDrivers[indexinFromRiderToAllDrivers].length; g++) {
                        var DriverToCheckID = FromRiderToAllDrivers[indexinFromRiderToAllDrivers].data[g].to
                        var DistanceToDriver = FromRiderToAllDrivers[indexinFromRiderToAllDrivers].data[g].distance
                        var DurationToDriver = FromRiderToAllDrivers[indexinFromRiderToAllDrivers].data[g].duration;

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
                            DistanceToRider = RidersRiders[indexinRiderRider].data.find(n => n.from === ChosenRiderID).distance
                            DurationToRider = RidersRiders[indexinRiderRider].data.find(n => n.from === ChosenRiderID).duration

                            var WeightFunctionDriver = -0.45 * DurationToRider / CurrentRider.MaxDurationToNormalizeDrivers -
                                0.25 * DistanceToRider / CurrentRider.MaxDistanceToNormalizeDrivers +
                                0.3 * Trust -
                                0.04 * diff_minutes(CurrentDriver.PoolStartTime, CurrentRider.DepartureTime) / 30 +
                                0.1 * NumberofEmptyPlaces / CurrentDriver.capacity


                        } else {


                            var WeightFunctionDriver = -0.45 * DurationToDriver / CurrentRider.MaxDurationToNormalizeDrivers -
                                0.25 * DistanceToDriver / CurrentRider.MaxDistanceToNormalizeDrivers +
                                0.3 * Trust -
                                0.04 * diff_minutes(CurrentDriver.PoolStartTime, CurrentRider.DepartureTime) / 30 +
                                0.1 * NumberofEmptyPlaces / CurrentDriver.capacity
                        }

                        WeightArrayForDrivers.push(WeightFunctionDriver)
                        WeightIndexForDrivers.push(DriverToCheckID)


                    }

                    if (Drivers[j].countDrivers == WeightArray.length) { //to prevent loop

                        if (Drivers[j].ID === 63) {
                            var x = 5;
                        }
                        var filteredDrivers = Drivers.filter(n => n.lastChosenRider === ChosenRiderID && n.status === 0 && n.AssignedRiders.length === 0);
                        if (filteredDrivers.length != 0) {
                            var durations = [],
                                Ids = [];
                            for (var h = 0; h < filteredDrivers.length; h++) {
                                var currDriver = filteredDrivers[h]
                                var tempindexinDriversToRider = DriversRiders.findIndex(n => n.ID === currDriver.ID);
                                var DurationFromChosenRider = DriversRiders[tempindexinDriversToRider].data.find(n => n.from === ChosenRiderID).duration;
                                durations.push(DurationFromChosenRider)
                                Ids.push(currDriver.ID)
                            }

                            var BestDriver = Ids[durations.indexOf(Math.min.apply(null, durations))]

                            if (BestDriver === Drivers[j].ID) {
                                DriversRiders[indexinDriverRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                                DriversRiders[indexinDriverRider].checked++;
                            } else {
                                ChosenRiderID = -1;
                            }
                        } else {

                            DriversRiders[indexinDriverRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                            DriversRiders[indexinDriverRider].checked++;
                        }

                    } else {

                        if (Drivers[j].ID === 64 || Drivers[j].ID === 61) {
                            var x = 5;
                        }
                        Drivers[j].countDrivers = WeightArray.length

                        if (WeightArrayForDrivers.length > 0) {
                            var ChosenDriverID = WeightIndexForDrivers[WeightArrayForDrivers.indexOf(Math.max.apply(Math, WeightArrayForDrivers))]
                            if (ChosenDriverID !== Drivers[j].ID) {
                                Drivers[j].lastChosenRider = ChosenRiderID;
                                ChosenRiderID = -1;
                            } else {
                                DriversRiders[indexinDriverRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                                DriversRiders[indexinDriverRider].checked++;
                            }

                        } else {
                            ChosenRiderID = -1;
                        }


                    }

                }

            } else { // Not First Rider


                var indexinRiderRider = RidersRiders.findIndex(n => n.ID == Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinRiderRider === -1) {
                    continue;
                }
                if (RidersRiders[indexinRiderRider].checked === RidersRiders[indexinRiderRider].length || Drivers[j].status === 1) {
                    continue;

                }
                var indexinRiderRider = RidersRiders.indexOf(RidersRiders.find(n => n.ID == lastRiderID));
                var indexLastRider = Riders.findIndex(n => n.ID === lastRiderID);
                var WeightArray = []
                var WeightIndex = []
                for (var k = 0; k < RidersRiders[indexinRiderRider].length; k++) {
                    var RiderID = RidersRiders[indexinRiderRider].data[k].from
                    var IndexInRiders = Riders.findIndex(n => n.ID === RiderID)

                    if (diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) > 30 || diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) < 0) {
                        RidersRiders[indexinRiderRider].data.find(n => n.from === RiderID).checked = 1;
                        RidersRiders[indexinRiderRider].checked++;
                        continue;

                    }
                    if (RidersRiders[indexinRiderRider].data.find(n => n.from === RiderID).checked === 1) {
                        continue;
                    }

                    var Distance = RidersRiders[indexinRiderRider].data[k].distance
                    var Duration = RidersRiders[indexinRiderRider].data[k].duration;
                    var Trust = 0;


                    if (Riders.find(n => n.ID === RiderID).TrustedDrivers.find(n => n === DriverID)) //given from rider
                        Trust = 1
                    else if (Riders.find(n => n.ID === RiderID).UnTrustedDrivers.find(n => n === DriverID))
                        Trust = -1;



                    //add duration ,,trial error equation

                    if (Riders.find(n => n.ID === RiderID).isAssigned === false) {

                        var WeightFunction = -0.45 * Duration / Riders[indexLastRider].MaxDurationToNormalize - 0.25 * Distance / Riders[indexLastRider].MaxDistanceToNormalize + 0.3 * Trust -
                            0.04 * diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) / 30
                        WeightArray.push(WeightFunction)
                        WeightIndex.push(RiderID)
                    } else {

                        RidersRiders[indexinRiderRider].data.find(n => n.from === RiderID).checked = 1;
                        RidersRiders[indexinRiderRider].checked++;
                    }



                }
                if (WeightArray.length > 0) {
                    if (Drivers[j].ID === 64 || Drivers[j].ID === 61) {
                        var x = 5;
                    }

                    ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(null, WeightArray))]
                    chosenDistance = RidersRiders[indexinRiderRider].data.find(n => n.from === ChosenRiderID).distance
                    chosenDuration = RidersRiders[indexinRiderRider].data.find(n => n.from === ChosenRiderID).duration
                    CurrentRider = Riders.find(n => n.ID === ChosenRiderID)
                    WeightArrayForRiders = []
                    WeightIndexForRiders = []

                    var indexinFromRiderToAllRiders = FromRiderToAllRiders.findIndex(n => n.ID === ChosenRiderID);
                    for (var g = 0; g < FromRiderToAllRiders[indexinFromRiderToAllRiders].length; g++) {
                        var RiderToCheckID = FromRiderToAllRiders[indexinFromRiderToAllRiders].data[g].to
                        var DistanceToRider = FromRiderToAllRiders[indexinFromRiderToAllRiders].data[g].distance
                        var DurationToRider = FromRiderToAllRiders[indexinFromRiderToAllRiders].data[g].duration;
                        var RiderToCheckobj = Riders.find(n => n.ID === RiderToCheckID)

                        if (RiderToCheckobj.DriverAssigned === -1) {
                            continue;
                        }
                        var DriverOfRiderToCheck = Drivers.find(n => n.ID === RiderToCheckobj.DriverAssigned)

                        var Trust, NumberofEmptyPlaces;

                        NumberofEmptyPlaces = DriverOfRiderToCheck.capacity - (DriverOfRiderToCheck.AssignedRiders.length)

                        if (DriverOfRiderToCheck.status === 1) //driver of rider has no emty place
                        {
                            var WeightFunctionRider = Number.NEGATIVE_INFINITY;
                            WeightArrayForRiders.push(WeightFunctionRider)
                            WeightIndexForRiders.push(RiderToCheckID)
                            continue;
                        }
                        if (CurrentRider.TrustedDrivers.find(n => n === DriverOfRiderToCheck.ID))
                            Trust = 1
                        else if (CurrentRider.UnTrustedDrivers.find(n => n === DriverOfRiderToCheck.ID))
                            Trust = -1;


                        var WeightFunctionRider = -0.45 * DurationToRider / CurrentRider.MaxDurationToNormalizeRiders -
                            0.25 * DistanceToRider / CurrentRider.MaxDistanceToNormalizeRiders +
                            0.3 * Trust -
                            0.04 * diff_minutes(DriverOfRiderToCheck.PoolStartTime, RiderToCheckobj.DepartureTime) / 30 +
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
                                var DurationFromChosenRider = RidersRiders[tempindexinRidersToRider].data.find(n => n.from === ChosenRiderID).duration;
                                durations.push(DurationFromChosenRider)
                                Ids.push(currDriver.ID)
                            }

                            var BestDriver = Ids[durations.indexOf(Math.min.apply(null, durations))]

                            if (BestDriver === Drivers[j].ID) {
                                RidersRiders[indexinRiderRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                                RidersRiders[indexinRiderRider].checked++;
                            } else {
                                ChosenRiderID = -1;

                            }
                        } else {
                            RidersRiders[indexinRiderRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                            RidersRiders[indexinRiderRider].checked++;

                        }



                    } else {
                        Drivers[j].countRiders = WeightArrayForRiders.length
                        if (Drivers[j].ID === 64 || Drivers[j].ID === 61) {
                            var x = 5;
                        }

                        if (WeightArrayForRiders.length > 0) {
                            var ChosenMaxRider = WeightIndexForRiders[WeightArrayForRiders.indexOf(Math.max.apply(Math, WeightArrayForRiders))]
                            isExist = Drivers[j].AssignedRiders.find(n => n === ChosenMaxRider)
                            if (isExist === undefined) {
                                Drivers[j].lastChosenRider = ChosenRiderID
                                ChosenRiderID = -1;


                            } else {
                                RidersRiders[indexinRiderRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                                RidersRiders[indexinRiderRider].checked++;
                            }

                        } else {
                            ChosenRiderID = -1;
                        }

                    }

                }

                LastRiderExists = true;

            }

            if (ChosenRiderID != -1 && chosenDuration != -1) {

                if (Drivers[j].ID === 63) {
                    var x = 5;
                }
                Drivers[j].lastChosenRider = -1;

                var old_Assigned = JSON.parse(JSON.stringify(Drivers[j].AssignedRiders));
                Drivers[j].AssignedRiders.push(ChosenRiderID)
                if (lastRiderID === undefined) {


                    var ValidAssign = await SetDropOffTime(Drivers[j])

                    if (ValidAssign === -1) {
                        Drivers[j].AssignedRiders = []
                        Drivers[j].TotalDurationTaken = 0;
                        Drivers[j].TotalDistanceCoveredToDestination = 0;
                    } else {
                        var delta = Math.max(0.25 * Drivers[j].MaxDuration, 15)
                        var TimeWithoutRider = Drivers[j].TimeFromOrganizationMinutes
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
                    if (Drivers[j].ID === 56) {
                        var x = 5;
                    }
                    var ValidAssign = await StepByStepReorder(Drivers[j])
                    if (ValidAssign === -1) {
                        Drivers[j].AssignedRiders = old_Assigned
                        ValidAssign = await SetDropOffTime(Drivers[j])
                    } else {
                        Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                        Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                        NumberOfUnAssignedRiders--;
                        if (Drivers[j].TotalDurationTaken === Drivers.MaxDuration || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                            Drivers[j].status = 1;
                        }
                    }
                }



            }
        }
        count = 0;
        for (var j = 0; j < Drivers.length; j++) {


            if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] == undefined) // last rider driver
            {
                var indexinDriverRider = DriversRiders.findIndex(n => n.ID == Drivers[j].ID);
                if (indexinDriverRider === -1) {
                    count++;
                } else if (DriversRiders[indexinDriverRider].checked === DriversRiders[indexinDriverRider].length || Drivers[j].status === 1) {
                    count++;

                }


            } else {
                var indexinRiderRider = RidersRiders.findIndex(n => n.ID == Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinRiderRider === -1) {
                    count++;
                } else if (RidersRiders[indexinRiderRider].checked === RidersRiders[indexinRiderRider].length || Drivers[j].status === 1) {
                    count++;

                }
            }
        }

    }

}