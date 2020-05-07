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
var Riders;
var AvailableDriver;
var RiderRider
var RiderRiderDuration
var DriversRidersDuration
var DriversRider

module.exports = async function main() {
    Riders = require('./routes/api/chooseFromAvailableRidesApi').Riders
    AvailableDriver = require('./routes/api/chooseFromAvailableRidesApi').Drivers[0]
    RiderRider = require('./routes/api/chooseFromAvailableRidesApi').RiderRider
    RiderRiderDuration = require('./routes/api/chooseFromAvailableRidesApi').RiderRiderDuration
    DriversRidersDuration = require('./routes/api/chooseFromAvailableRidesApi').DriversRidersDuration
    DriversRider = require('./routes/api/chooseFromAvailableRidesApi').DriversRider

    TimeWithoutTakingRider = AvailableDriver.TotalDurationTaken;
    let cloneDriver = Object.assign(Object.create(Object.getPrototypeOf(AvailableDriver)), AvailableDriver)

    var NewAssignedArray = []
    var AssignedDurationArray = []

    for (var i = 1; i < cloneDriver.AssignedRiders.length + 1; i++) {
        var newAssigned = []
        var count = 0;
        newAssigned.push(cloneDriver.ID)
        for (var k = 1; k < cloneDriver.AssignedRiders.length + 1; k++) {
            if (k < i) {
                newAssigned.push(cloneDriver.AssignedRiders[k])
            } else if (k > i) {
                newAssigned.push(cloneDriver.AssignedRiders[k - 1])
            } else {
                newAssigned.push(Riders[Riders.length - 1].ID)
            }

        }

        var fromIndex;
        var toIndex;

        for (var j = newAssigned.length - 1; j >= 0; j--) {
            if (j == 0)

            { // Last iteration ( First Rider )


                toIndex = Riders.indexOf(Riders.find(n => n.ID === newAssigned[1]))
                DriverIndexinDriverRidersDuration = DriversRidersDuration.indexOf(DriversRidersDuration.find(n => n.ID === cloneDriver.ID))
                toRiderID = newAssigned[1];
                var datee = new Date(Riders[toIndex].PickupTime);
                cloneDriver.PoolStartTime = datee
                cloneDriver.PoolStartTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.to === toRiderID).duration)

                //RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration

            } else if (j == newAssigned.length - 1) { // First iteration ( Last Rider )

                fromIndex = Riders.indexOf(Riders.find(n => n.ID === newAssigned[j]))
                cloneDriver.TotalDistanceCoveredToDestination += Riders[fromIndex].DistanceToOrganization;
                cloneDriver.TotalDurationTaken += Riders[fromIndex].TimeToOrganizationMinutes;
                var datee = new Date(cloneDriver.ArrivalTime);
                Riders[fromIndex].PickupTime = datee

                Riders[fromIndex].PickupTime.setMinutes(cloneDriver.ArrivalTime.getMinutes() - Riders[fromIndex].TimeToOrganizationMinutes)

            } else {
                fromIndex = Riders.indexOf(Riders.find(n => n.ID === newAssigned[j]));
                toIndex = Riders.indexOf(Riders.find(n => n.ID === newAssigned[j + 1]));
                toID = newAssigned[j + 1];
                fromID = newAssigned[j]
                FromIndexinRiderRiderDuration = RiderRiderDuration.indexOf(RiderRiderDuration.find(n => n.ID === fromID));

                var datee = new Date(Riders[toIndex].PickupTime);

                Riders[fromIndex].PickupTime = datee

                Riders[fromIndex].PickupTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration)


            }

        }
        var flag = 0;
        for (var k = 1; k < newAssigned.length; k++) {
            var EarliestPick = Riders.find(n => n.ID === newAssigned[k]).EarliestPickup
            var ActualPick = Riders.find(n => n.ID === newAssigned[k]).PickupTime
            if (ActualPick < EarliestPick) {
                flag = 1;
                break;
            }

        }

        var TimeWithTakingRider = diff_minutes(cloneDriver.ArrivalTime, cloneDriver.PoolStartTime);
        var delta = TimeWithTakingRider - TimeWithoutTakingRider;

        if (diff_minutes(cloneDriver.ArrivalTime, cloneDriver.PoolStartTime) > cloneDriver.MaxDuration || delta > 30 || flag === 1) {
            continue;
        }

        NewAssignedArray.push(newAssigned)
        AssignedDurationArray.push(TimeWithTakingRider)
    }
    if (NewAssignedArray.length > 0) {

        AvailableDriver.AssignedRiders = NewAssignedArray[AssignedDurationArray.indexOf(Math.min.apply(null, AssignedDurationArray))]

        var fromIndex;
        var toIndex;
        var FromIndexinRiderRiderDuration;
        var DriverIndexinDriverRidersDuration;
        AvailableDriver.TotalDurationTaken = 0;
        AvailableDriver.TotalDistanceCoveredToDestination = 0;


        for (var j = AvailableDriver.AssignedRiders.length - 1; j >= 0; j--) {
            if (j == 0)

            { // Last iteration ( First Rider )


                toIndex = Riders.indexOf(Riders.find(n => n.ID === AvailableDriver.AssignedRiders[1]))
                DriverIndexinDriverRidersDuration = DriversRidersDuration.indexOf(DriversRidersDuration.find(n => n.ID === AvailableDriver.ID))
                toRiderID = AvailableDriver.AssignedRiders[1];
                var datee = new Date(Riders[toIndex].PickupTime);

                AvailableDriver.TotalDurationTaken += DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.to === toRiderID).duration
                AvailableDriver.TotalDistanceCoveredToDestination += DriversRider[DriverIndexinDriverRidersDuration].data.find(n => n.to === toRiderID).distance

                AvailableDriver.PoolStartTime = datee
                AvailableDriver.PoolStartTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.to === toRiderID).duration)

                RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration

            } else if (j == AvailableDriver.AssignedRiders.length - 1) { // First iteration ( Last Rider )

                fromIndex = Riders.indexOf(Riders.find(n => n.ID === AvailableDriver.AssignedRiders[j]))
                AvailableDriver.TotalDistanceCoveredToDestination += Riders[fromIndex].DistanceToOrganization;
                AvailableDriver.TotalDurationTaken += Riders[fromIndex].TimeToOrganizationMinutes;
                var datee = new Date(AvailableDriver.ArrivalTime);
                Riders[fromIndex].PickupTime = datee

                Riders[fromIndex].PickupTime.setMinutes(AvailableDriver.ArrivalTime.getMinutes() - Riders[fromIndex].TimeToOrganizationMinutes)
                Riders[fromIndex].isAssigned = true;

            } else {
                fromIndex = Riders.indexOf(Riders.find(n => n.ID === AvailableDriver.AssignedRiders[j]));
                toIndex = Riders.indexOf(Riders.find(n => n.ID === AvailableDriver.AssignedRiders[j + 1]));
                toID = AvailableDriver.AssignedRiders[j + 1];
                fromID = AvailableDriver.AssignedRiders[j]
                FromIndexinRiderRiderDuration = RiderRiderDuration.indexOf(RiderRiderDuration.find(n => n.ID === fromID));
                AvailableDriver.TotalDurationTaken += RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration
                AvailableDriver.TotalDistanceCoveredToDestination += RiderRider[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).distance

                var datee = new Date(Riders[toIndex].PickupTime);

                Riders[fromIndex].PickupTime = datee

                Riders[fromIndex].PickupTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration)
                Riders[fromIndex].isAssigned = true;

            }

        }


    }
}