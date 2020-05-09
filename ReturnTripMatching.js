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

    //Reordering 

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
            var Durationn = DriversRidersDuration.find(n => n.ID === DriverID).data.find(n => n.from === RiderID).duration;
            g.setNode(RiderIDstr)
            g.setEdge(RiderIDstr, DriverIDstr, Durationn)
            g.setEdge(OrganizationID, RiderIDstr, Riders.find(n => n.ID === RiderID).TimeFromOrganizationMinutes)
        }

        for (var p = 1; p < Drivers[k].AssignedRiders.length; p++) {
            for (var m = 1; m < Drivers[k].AssignedRiders.length; m++) {

                if (m != p) {
                    var SourceID = Drivers[k].AssignedRiders[p]
                    var DestID = Drivers[k].AssignedRiders[m]
                    var Durationn = RiderRiderDuration.find(n => n.ID === DestID).data.find(n => n.from === SourceID).duration
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
            if (count == 0)
                break;

        }


        var response = ksp.ksp(g, OrganizationID, DriverIDstr, kValue);
        response = response.filter(p => (p.edges.length == n + 1) && p.totalCost <= (Drivers[k].TotalDurationTaken))

        for (var d = 0; d < response.length; d++) {
            var AssignedTemp = []
            for (var j = response[d].edges.length - 1; j >= 0; j--) {
                AssignedTemp.push(parseInt(response[d].edges[j].toNode))
            }
            Drivers[k].AssignedRiders = AssignedTemp;
            var ValidDuration = await SetDropOffTime(Drivers[k])
            if (ValidDuration != -1) {
                break;
            }
        }

    }


    return Promise.resolve();
}


module.exports = async function main() {

    var f = require('./routes/api/ReturnTripMatch').getters
    obj = f();

    Riders = obj.Riders;
    Drivers = obj.Drivers;
    RiderRider = obj.RiderRider;
    RiderRiderDuration = obj.RiderRiderDuration;
    DriversRidersDuration = obj.DriversRidersDuration;
    DriversRider = obj.DriversRider;

    var NumberOfUnAssignedRiders = Riders.length;
    var count = -1;
    while (count != Drivers.length) {

        if (NumberOfUnAssignedRiders === 0)
            break;

        for (var j = 0; j < Drivers.length; j++) {

            if (NumberOfUnAssignedRiders === 0)
                break;

            var DriverID = Drivers[j].ID;
            var LastRiderExists = false;
            var chosenDuration = -1
            var chosenDistance = -1
            var lastRiderID = Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] /////
            var ChosenRiderID = -1;
            var indexinDriverRider = DriversRider.findIndex(n => n.ID == DriverID);
            if (DriversRidersDuration.findIndex(n => n.ID == Drivers[j].ID) === -1) {
                continue;
            }
            if (lastRiderID === DriverID) { //First Rider to be assigned

                if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] == Drivers[j].ID) // last rider -> driver
                {
                    var indexinDriverRider = DriversRidersDuration.findIndex(n => n.ID == Drivers[j].ID);

                    if (DriversRidersDuration[indexinDriverRider].checked === DriversRidersDuration[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                        continue;

                    }

                }
                var WeightArray = []
                var WeightIndex = []


                for (var k = 0; k < DriversRidersDuration[indexinDriverRider].length; k++) {
                    var RiderID = DriversRidersDuration[indexinDriverRider].data[k].from
                    var Distance = DriversRider[indexinDriverRider].data[k].distance
                    var Duration = DriversRidersDuration[indexinDriverRider].data[k].duration;
                    var Trust = 0;
                    if (diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) > 30 || diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) < 0) {
                        DriversRidersDuration[indexinDriverRider].data.find(n => n.from === RiderID).checked = 1;
                        DriversRidersDuration[indexinDriverRider].checked++;
                        continue;
                    }

                    if (DriversRidersDuration[indexinDriverRider].data.find(n => n.from === RiderID).checked === 1) {
                        continue;
                    }

                    if (Riders.find(n => n.ID === RiderID).TrustedDrivers.find(n => n === DriverID)) //given from rider
                        Trust = 1
                    else if (Riders.find(n => n.ID === RiderID).UnTrustedDrivers.find(n => n === DriverID))
                        Trust = -1;

                    //add duration 
                    if (Riders.find(n => n.ID === RiderID).isAssigned === false) {

                        var WeightFunction = -0.45 * Duration / Drivers[j].MaxDurationToNormalize - 0.25 * Distance / Drivers[j].MaxDistanceToNormalize + 0.3 * Trust -
                            0.15 * (diff_minutes(Drivers[j].LatestDropOff, Riders.find(n => n.ID === RiderID).LatestDropOff) - Duration) / Drivers[j].MaxDropoffDiffToNormalize -
                            0.04 * diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) / 30; ///arrival time diff
                        WeightArray.push(WeightFunction)
                        WeightIndex.push(RiderID)
                    } else {
                        DriversRidersDuration[indexinDriverRider].data.find(n => n.from === RiderID).checked = 1;
                        DriversRidersDuration[indexinDriverRider].checked++;
                    }
                }

                if (WeightArray.length > 0) {
                    ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(Math, WeightArray))]
                    chosenDistance = DriversRider[indexinDriverRider].data.find(n => n.from === ChosenRiderID).distance
                    chosenDuration = DriversRidersDuration[indexinDriverRider].data.find(n => n.from === ChosenRiderID).duration
                    DriversRidersDuration[indexinDriverRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                    DriversRidersDuration[indexinDriverRider].checked++;
                }

            } else { // Not First Rider


                var indexinRiderRider = RiderRiderDuration.findIndex(n => n.ID == Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinRiderRider === -1) {
                    continue;
                }
                if (RiderRiderDuration[indexinRiderRider].checked === RiderRiderDuration[indexinRiderRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    continue;

                }
                var indexinRiderRider = RiderRiderDuration.indexOf(RiderRiderDuration.find(n => n.ID == lastRiderID));
                var WeightArray = []
                var WeightIndex = []
                for (var k = 0; k < RiderRiderDuration[indexinRiderRider].length; k++) {
                    var RiderID = RiderRiderDuration[indexinRiderRider].data[k].from
                    var IndexInRiders = Riders.findIndex(n => n.ID === RiderID)

                    if (diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) > 30 || diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) < 0) {
                        RiderRiderDuration[indexinRiderRider].data.find(n => n.from === RiderID).checked = 1;
                        RiderRiderDuration[indexinRiderRider].checked++;
                        continue;

                    }
                    if (RiderRiderDuration[indexinRiderRider].data.find(n => n.from === RiderID).checked === 1) {
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
                            0.04 * diff_minutes(Drivers[j].PoolStartTime, Riders.find(n => n.ID === RiderID).DepartureTime) / 30
                        WeightArray.push(WeightFunction)
                        WeightIndex.push(RiderID)
                    } else {

                        RiderRiderDuration[indexinRiderRider].data.find(n => n.from === RiderID).checked = 1;
                        RiderRiderDuration[indexinRiderRider].checked++;
                    }



                }
                if (WeightArray.length > 0) {

                    ChosenRiderID = WeightIndex[WeightArray.indexOf(Math.max.apply(null, WeightArray))]
                    chosenDistance = RiderRider[indexinRiderRider].data.find(n => n.from === ChosenRiderID).distance
                    chosenDuration = RiderRiderDuration[indexinRiderRider].data.find(n => n.from === ChosenRiderID).duration
                    RiderRiderDuration[indexinRiderRider].data.find(n => n.from === ChosenRiderID).checked = 1;
                    RiderRiderDuration[indexinRiderRider].checked++;


                }

                LastRiderExists = true;

            }

            if (ChosenRiderID != -1 && chosenDuration != -1) {


                /////////////////////////////////////////////////////////////////////////////////////////////////////////
                var fromIndex;
                var toIndex;
                var invalidRider = 0;

                // driver rider1 rider2 "chosenrider" organization
                // driver  chosenrider organization
                toIndex = Riders.indexOf(Riders.find(n => n.ID === ChosenRiderID))
                var datee = new Date(Drivers[j].PoolStartTime);
                Riders[toIndex].DropOffTime = datee
                Riders[toIndex].DropOffTime.setMinutes(Drivers[j].PoolStartTime.getMinutes() + Riders[toIndex].TimeFromOrganizationMinutes)
                if (Riders[toIndex].DropOffTime > Riders[toIndex].LatestDropOff) {
                    invalidRider = 1;

                }
                if (invalidRider !== 1) {
                    Drivers[j].AssignedRiders.push(ChosenRiderID)
                    var ValidDuration = await SetDropOffTime(Drivers[j])
                    Drivers[j].AssignedRiders.pop()
                    if (ValidDuration === -1) {

                        continue;
                    }
                } else {
                    continue;
                }
                //////////////////////////////////////////////////////////////////////////////////////////////////////////
                maxDurationCurrentRider = Drivers[j].TotalDurationTaken
                    // maxDurationCurrentRider = Drivers[j].TotalDurationTaken + chosenDuration + Riders.find(n => n.ID === ChosenRiderID).TimeFromOrganizationMinutes;
                if (maxDurationCurrentRider < Drivers[j].MaxDuration) {
                    Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                    Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                    Drivers[j].AssignedRiders.push(ChosenRiderID)
                        //   Drivers[j].TotalDistanceCoveredToDestination += chosenDistance;
                        //  Drivers[j].TotalDurationTaken += chosenDuration;
                    NumberOfUnAssignedRiders--;

                } else {

                    var Delta = 0;

                    if (lastRiderID !== DriverID) {

                        var TimeTakenWithoutTakingRider = Riders.find(n => n.ID === lastRiderID).TimeFromOrganizationMinutes;
                        var TimeTakenAfterTakingRider = RiderRiderDuration.find(n => n.ID === lastRiderID).data.find(n => n.from === ChosenRiderID).duration + Riders.find(n => n.ID === ChosenRiderID).TimeFromOrganizationMinutes
                        Delta = TimeTakenAfterTakingRider - TimeTakenWithoutTakingRider;
                    } else {
                        //var DriverIndex = Drivers.indexOf(Drivers.find(n => n.ID === DriverID));
                        var TimeTakenWithoutTakingRider = Drivers[j].TimeFromOrganizationMinutes
                        var TimeTakenAfterTakingRider = DriversRidersDuration[indexinDriverRider].data.find(n => n.from === ChosenRiderID).duration + Riders.find(n => n.ID === ChosenRiderID).TimeFromOrganizationMinutes
                        Delta = TimeTakenAfterTakingRider - TimeTakenWithoutTakingRider;


                    }
                    var CheckedDelta = Math.max(0.25 * Drivers[j].MaxDuration, 10)

                    if (Delta < CheckedDelta && maxDurationCurrentRider < Drivers[j].MaxDuration) {
                        Riders.find(n => n.ID === ChosenRiderID).isAssigned = true;
                        Riders.find(n => n.ID === ChosenRiderID).DriverAssigned = DriverID;
                        Drivers[j].AssignedRiders.push(ChosenRiderID)
                            //  Drivers[j].TotalDistanceCoveredToDestination += chosenDistance;
                            //Drivers[j].TotalDurationTaken += chosenDuration;
                        NumberOfUnAssignedRiders--;

                    }



                }

            }
        }
        count = 0;
        for (var j = 0; j < Drivers.length; j++) {


            if (Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1] == Drivers[j].ID) // last rider driver
            {
                var indexinDriverRider = DriversRidersDuration.findIndex(n => n.ID == Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinDriverRider === -1) {
                    count++;
                } else if (DriversRidersDuration[indexinDriverRider].checked === DriversRidersDuration[indexinDriverRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }


            } else {
                var indexinRiderRider = RiderRiderDuration.findIndex(n => n.ID == Drivers[j].AssignedRiders[Drivers[j].AssignedRiders.length - 1]);
                if (indexinRiderRider === -1) {
                    count++;
                } else if (RiderRiderDuration[indexinRiderRider].checked === RiderRiderDuration[indexinRiderRider].length || Drivers[j].AssignedRiders.length === Drivers[j].capacity) {
                    count++;

                }
            }
        }

    }

    // Reorder and calculate dropOff
    var x = await Reorder();


}