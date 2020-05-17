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
                try {
                    var Durationn = RiderRiderDuration.find(n => n.ID === SourceID).data.find(n => n.to === DestID).duration
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
    RiderRider = obj.RiderRider;
    RiderRiderDuration = obj.RiderRiderDuration;
    DriversRidersDuration = obj.DriversRidersDuration;
    DriversRider = obj.DriversRider;
    var NumberOfUnAssignedRiders = Riders.length;

    //Drivers are sorted by rating
    var count = -1;

    while (count != Drivers.length) {

        if (NumberOfUnAssignedRiders === 0)
            break;


        for (var j = 0; j < Drivers.length; j++) {
            if (Drivers[j].continueFlag === 1) {
                Drivers[j].continueFlag = 0;
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

                        var WeightFunction = -0.45 * Duration / Drivers[j].MaxDurationToNormalize - 0.25 * Distance / Drivers[j].MaxDistanceToNormalize +
                            0.3 * Trust -
                            0.04 * diff_minutes(Riders.find(n => n.ID === RiderID).ArrivalTime, Drivers[j].ArrivalTime) / 30; ///arrival time diff

                        if (diff_minutes(Riders.find(n => n.ID === RiderID).EarliestPickup, Drivers[j].EarliestStartTime) > 0) {
                            WeightFunction -= 0.15 * (diff_minutes(Riders.find(n => n.ID === RiderID).EarliestPickup, Drivers[j].EarliestStartTime) / Drivers[j].MaxEarliestDiffToNormalize)
                        }


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
                    if (Drivers[j].closestFlag == 0) {
                        if (chosenDuration <= 5) {
                            DriversRidersDuration[indexinDriverRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                            DriversRidersDuration[indexinDriverRider].checked++;
                            Drivers[j].continueFlag = 1;


                        } else {
                            ChosenRiderID = -1;
                        }

                        Drivers[j].closestFlag = 1
                    } else {
                        DriversRidersDuration[indexinDriverRider].data.find(n => n.to === ChosenRiderID).checked = 1;
                        DriversRidersDuration[indexinDriverRider].checked++;
                    }

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
                var indexinDriverRider = DriversRidersDuration.findIndex(n => n.ID === Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinDriverRider === -1) {
                    count++;
                } else if (DriversRidersDuration[indexinDriverRider].checked === DriversRidersDuration[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }


            } else {
                var indexinRiderRider = RiderRiderDuration.findIndex(n => n.ID === Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinRiderRider === -1) {
                    count++;
                } else if (RiderRiderDuration[indexinRiderRider].checked === RiderRiderDuration[indexinRiderRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }
            }
        }

    }


}