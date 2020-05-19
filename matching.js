const graphlib = require('graphlib');
const ksp = require('k-shortest-path');
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
            DriverIndexinDriversRiders = DriversRiders.indexOf(DriversRiders.find(n => n.ID === DriverObj.ID))
            toRiderID = DriverObj.AssignedRiders[1];
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
    for (var l = 1; l < AvailableDriver.AssignedRiders.length; l++) {
        var RiderID = AvailableDriver.AssignedRiders[l];
        RiderIDstr = `${RiderID}`
        var Durationn = DriversRiders.find(n => n.ID === DriverID).data.find(n => n.to === RiderID).duration;
        g.setNode(RiderIDstr)
        g.setEdge(DriverIDstr, RiderIDstr, Durationn)
        g.setEdge(RiderIDstr, OrganizationID, Riders.find(n => n.ID === RiderID).TimeToOrganizationMinutes)
    }

    for (var p = 1; p < AvailableDriver.AssignedRiders.length; p++) {
        for (var m = 1; m < AvailableDriver.AssignedRiders.length; m++) {

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

    var n = AvailableDriver.AssignedRiders.length - 1;

    var count = n;
    var kValue = 0;

    while (true) {
        kValue += Combinatorics.P(n, count)
        count--;
        if (count === 0)
            break;

    }

    var delta = Math.max(0.25 * AvailableDriver.MaxDuration, 10)
    var response = ksp.ksp(g, DriverIDstr, OrganizationID, kValue);
    response = response.filter(p => (p.edges.length === n + 1) && p.totalCost <= AvailableDriver.TotalDurationTaken + delta && p.totalCost <= AvailableDriver.MaxDuration)


    var ValidDuration = -1;

    for (var d = 0; d < response.length; d++) {
        var AssignedTemp = []
        AssignedTemp.push(DriverID)
        for (var j = 0; j < response[d].edges.length - 1; j++) {
            AssignedTemp.push(parseInt(response[d].edges[j].toNode))
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
    var f = require('./routes/api/matchingApi').getters
    obj = f();

    Riders = obj.Riders;
    Drivers = obj.Drivers;
    RidersRiders = obj.RidersRiders;
    DriversRiders = obj.DriversRiders;
    AllDriversToRider = obj.AllDriversToRider
    AllRidersToRider = obj.AllRidersToRider

    var NumberOfUnAssignedRiders = Riders.length;

    //Drivers are sorted by rating
    var count = -1;

    while (count != Drivers.length) {

        if (NumberOfUnAssignedRiders === 0)
            break;


        for (var j = 0; j < Drivers.length; j++) {
            if (Drivers[j].skipFlag === 1) {
                Drivers[j].skipFlag = 0;
                continue;
            }
            if (Drivers[j].ID == 44) {


                var x = 5;
            }

            if (NumberOfUnAssignedRiders === 0)
                break;

            var DriverID = Drivers[j].ID;
            var chosenDuration = -1
            var lastRiderID = Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]
            var ChosenRiderID = -1;
            var indexinDriverRider = DriversRiders.findIndex(n => n.ID === DriverID);
            if (indexinDriverRider === -1) {
                continue;
            }

            if (lastRiderID === DriverID) { //First Rider to be assigned

                if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] === Drivers[j].ID) // last rider driver
                {


                    if (DriversRiders[indexinDriverRider].checked === DriversRiders[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                        continue;

                    }


                }
                var WeightArray = []
                var WeightIndex = []

                for (var k = 0; k < DriversRiders[indexinDriverRider].length; k++) {
                    var RiderID = DriversRiders[indexinDriverRider].data[k].to
                    var Distance = DriversRiders[indexinDriverRider].data[k].distance
                    var Duration = DriversRiders[indexinDriverRider].data[k].duration;
                    var Trust = 0;
                    if (diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) > 30 || diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) < 0) {
                        DriversRiders[indexinDriverRider].data.find(n => n.to === RiderID).checked = 1;
                        DriversRiders[indexinDriverRider].checked++;
                        continue;
                    }

                    if (DriversRiders[indexinDriverRider].data.find(n => n.to === RiderID).checked === 1) {
                        continue;
                    }

                    if (Riders.find(n => n.ID === RiderID).TrustedDrivers.find(n => n === DriverID)) //given from rider
                        Trust = 1
                    else if (Riders.find(n => n.ID === RiderID).UnTrustedDrivers.find(n => n === DriverID))
                        Trust = -1;

                    //add duration 
                    if (Riders.find(n => n.ID === RiderID).isAssigned === false) {

                        var WeightFunction = -0.45 * Duration / Drivers[j].MaxDurationToNormalize - 0.25 * Distance / Drivers[j].MaxDistanceToNormalize +
                            0.3 * Trust -
                            0.04 * diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) / 30; ///arrival time diff

                        if (diff_minutes(Riders.find(n => n.ID === RiderID).EarliestPickup, Drivers[j].EarliestStartTime) > 0) {
                            WeightFunction -= 0.15 * (diff_minutes(Riders.find(n => n.ID === RiderID).EarliestPickup, Drivers[j].EarliestStartTime) / Drivers[j].MaxEarliestDiffToNormalize)
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
                    chosenDistance = DriversRiders[indexinDriverRider].data.find(n => n.to === ChosenRiderID).distance
                    chosenDuration = DriversRiders[indexinDriverRider].data.find(n => n.to === ChosenRiderID).duration
                    var indexinAllDriversToRider = AllDriversToRider.findIndex(n => n.ID === ChosenRiderID);
                    var CurrentRider = Riders.find(n => n.ID === ChosenRiderID)
                    for (var g = 0; g < AllDriversToRider[indexinAllDriversToRider].length; g++) {
                        var DriverToCheckID = AllDriversToRider[indexinAllDriversToRider].data[g].from
                        var DistanceFromDriver = AllDriversToRider[indexinAllDriversToRider].data[g].distance
                        var DurationFromDriver = AllDriversToRider[indexinAllDriversToRider].data[g].duration;

                        var CurrentDriver = Drivers.find(n => n.ID === DriverToCheckID)
                        var Trust, NumberofEmptyPlaces;

                        NumberofEmptyPlaces = CurrentDriver.capacity - (CurrentDriver.AssignedRiders.length - 1)
                        if (CurrentRider.TrustedDrivers.find(n => n === DriverToCheckID))
                            Trust = 1
                        else if (CurrentRider.UnTrustedDrivers.find(n => n === DriverToCheckID))
                            Trust = -1;


                        var WeightFunctionDriver = -0.45 * DurationFromDriver / CurrentRider.MaxDurationToNormalizeDrivers -
                            0.25 * DistanceFromDriver / CurrentRider.MaxDistanceToNormalizeDrivers +
                            0.3 * Trust -
                            0.04 * diff_minutes(CurrentRider.ArrivalTime, CurrentDriver.ArrivalTime) / 30 +
                            0.2 * NumberofEmptyPlaces

                        WeightArrayForDrivers.push(WeightFunctionDriver)
                        WeightIndexForDrivers.push(DriverToCheckID)


                    }

                    if (Drivers[j].countDrivers == WeightArray.length) {
                        DriversRiders[indexinDriverRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                        DriversRiders[indexinDriverRider].checked++;

                    } else {
                        Drivers[j].countDrivers = WeightArray.length

                        if (WeightArrayForDrivers.length > 0) {
                            var ChosenDriverID = WeightIndexForDrivers[WeightArrayForDrivers.indexOf(Math.max.apply(Math, WeightArrayForDrivers))]
                            if (ChosenDriverID !== Drivers[j].ID) {
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
                if (indexinRiderRider === -1) {
                    continue;
                }
                if (RidersRiders[indexinRiderRider].checked === RidersRiders[indexinRiderRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    continue;
                }


                var WeightArray = []
                var WeightIndex = []


                for (var k = 0; k < RidersRiders[indexinRiderRider].length; k++) {
                    var RiderID = RidersRiders[indexinRiderRider].data[k].to
                    var IndexInRiders = Riders.findIndex(n => n.ID === RiderID)
                    if (diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) > 30 || diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) < 0) {
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


                    if (Riders.find(n => n.ID === RiderID).TrustedDrivers.find(n => n === DriverID)) //given from rider
                        Trust = 1
                    else if (Riders.find(n => n.ID === RiderID).UnTrustedDrivers.find(n => n === DriverID))
                        Trust = -1;



                    if (Riders.find(n => n.ID === RiderID).isAssigned === false) {
                        var WeightFunction = -0.45 * Duration / Riders[IndexInRiders].MaxDurationToNormalize - 0.25 * Distance / Riders[IndexInRiders].MaxDistanceToNormalize + 0.3 * Trust -
                            0.04 * diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) / 30
                        WeightArray.push(WeightFunction)
                        WeightIndex.push(RiderID)
                    } else {

                        RidersRiders[indexinRiderRider].data.find(n => n.to === RiderID).checked = 1;
                        RidersRiders[indexinRiderRider].checked++;
                    }



                }
                if (WeightArray.length > 0) {
                    ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(null, WeightArray))]
                    chosenDistance = RidersRiders[indexinRiderRider].data.find(n => n.to === ChosenRiderID).distance
                    chosenDuration = RidersRiders[indexinRiderRider].data.find(n => n.to === ChosenRiderID).duration
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

                        NumberofEmptyPlaces = DriverOfRiderToCheck.capacity - (DriverOfRiderToCheck.AssignedRiders.length - 1)


                        if (RiderToCheckobj.TrustedDrivers.find(n => n === DriverOfRiderToCheck.ID))
                            Trust = 1
                        else if (RiderToCheckobj.UnTrustedDrivers.find(n => n === DriverOfRiderToCheck.ID))
                            Trust = -1;


                        var WeightFunctionRider = -0.45 * DurationFromRider / CurrentRider.MaxDistanceToNormalizeRiders -
                            0.25 * DistanceFromRider / CurrentRider.MaxDurationToNormalizeRiders +
                            0.3 * Trust -
                            0.04 * diff_minutes(CurrentRider.ArrivalTime, DriverOfRiderToCheck.ArrivalTime) / 30 +
                            0.2 * NumberofEmptyPlaces

                        WeightArrayForRiders.push(WeightFunctionRider)
                        WeightIndexForRiders.push(RiderToCheckID)


                    }
                    if (Drivers[j].countRiders == WeightArrayForRiders.length) {
                        RidersRiders[indexinRiderRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                        RidersRiders[indexinRiderRider].checked++;

                    } else {
                        Drivers[j].countRiders = WeightArrayForRiders.length

                        if (WeightArrayForRiders.length > 0) {
                            var ChosenMaxRider = WeightIndexForRiders[WeightArrayForRiders.indexOf(Math.max.apply(Math, WeightArrayForRiders))]
                            if (ChosenMaxRider !== lastRiderID) {
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

                var old_Assigned = JSON.parse(JSON.stringify(Drivers[j].AssignedRiders));
                Drivers[j].AssignedRiders.push(ChosenRiderID)
                if (lastRiderID === DriverID) {
                    var ValidAssign = await SetPickUpTime(Drivers[j])
                    if (ValidAssign === -1) {
                        Drivers[j].AssignedRiders = [Drivers[j].ID]
                        Drivers[j].TotalDurationTaken = 0;
                        Drivers[j].TotalDistanceCoveredToDestination = 0;
                    } else {
                        Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                        Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                        NumberOfUnAssignedRiders--;


                        //hageb 5 min then ha7ot flag eno maykhosh fy weight function elgya le nas tanya 

                    }
                } else {
                    var ValidAssign = await StepByStepReorder(Drivers[j])
                    if (ValidAssign === -1) {
                        Drivers[j].AssignedRiders = old_Assigned
                        ValidAssign = await SetPickUpTime(Drivers[j])
                    } else {
                        Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                        Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                        NumberOfUnAssignedRiders--;
                    }
                }

            }
        }

        count = 0;
        for (var j = 0; j < Drivers.length; j++) {


            if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] === Drivers[j].ID) // last rider driver
            {
                var indexinDriverRider = DriversRiders.findIndex(n => n.ID === Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinDriverRider === -1) {
                    count++;
                } else if (DriversRiders[indexinDriverRider].checked === DriversRiders[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }


            } else {
                var indexinRiderRider = RidersRiders.findIndex(n => n.ID === Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinRiderRider === -1) {
                    count++;
                } else if (RidersRiders[indexinRiderRider].checked === RidersRiders[indexinRiderRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }
            }
        }

    }


}