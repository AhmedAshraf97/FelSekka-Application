module.exports = async function main() {

    var f = require('./routes/api/cancelRiderFromApi').getters
    obj = f();

    Riders = obj.Riders;
    Drivers = obj.Drivers;
    CurrentDriver = Drivers[0]
    RiderRider = obj.RiderRider;
    RiderRiderDuration = obj.RiderRiderDuration;
    DriversRidersDuration = obj.DriversRidersDuration;
    DriversRider = obj.DriversRider;



    var fromIndex;
    var toIndex;
    CurrentDriver.TotalDurationTaken = 0;
    CurrentDriver.TotalDistanceCoveredToDestination = 0;

    for (var i = CurrentDriver.AssignedRiders.length - 1; i >= 0; i--) {

        if (i == 0) { // Last iteration ( driver dropoff )
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[1]))
            fromRiderID = CurrentDriver.AssignedRiders[1];
            DriverIndexinDriverRidersDuration = DriversRidersDuration.indexOf(DriversRidersDuration.find(n => n.ID === CurrentDriver.ID))
            DriverIndexinDriverRiders = DriversRider.indexOf(DriversRider.find(n => n.ID === CurrentDriver.ID))
            var datee = new Date(Riders[fromIndex].DropOffTime);
            CurrentDriver.DropOffTime = datee
            CurrentDriver.DropOffTime.setMinutes(Riders[fromIndex].DropOffTime.getMinutes() + DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.from === fromRiderID).duration)

            CurrentDriver.TotalDurationTaken += DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.from === fromRiderID).duration;
            CurrentDriver.TotalDistanceCoveredToDestination += DriversRider[DriverIndexinDriverRiders].data.find(n => n.from === fromRiderID).distance;



        } else if (i == CurrentDriver.AssignedRiders.length - 1) { // First iteration ( first Rider ) 

            fromIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[i]))
            var datee = new Date(CurrentDriver.PoolStartTime);
            Riders[fromIndex].DropOffTime = datee
            CurrentDriver.TotalDistanceCoveredToDestination += Riders[fromIndex].DistanceFromOrganization;
            CurrentDriver.TotalDurationTaken += Riders[fromIndex].TimeFromOrganizationMinutes;
            Riders[fromIndex].DropOffTime.setMinutes(CurrentDriver.PoolStartTime.getMinutes() + Riders[fromIndex].TimeFromOrganizationMinutes)


        } else {
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[i + 1]));
            toIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[i]));
            var toID = CurrentDriver.AssignedRiders[i];
            var fromID = CurrentDriver.AssignedRiders[i + 1]
            ToIndexinRiderRiderDuration = RiderRiderDuration.indexOf(RiderRiderDuration.find(n => n.ID === toID));
            ToIndexinRiderRider = RiderRider.indexOf(RiderRider.find(n => n.ID === toID));
            var datee = new Date(Riders[fromIndex].DropOffTime);
            RiderDropOff = datee
            Riders[toIndex].DropOffTime.setMinutes(Riders[fromIndex].DropOffTime.getMinutes() + RiderRiderDuration[ToIndexinRiderRiderDuration].data.find(n => n.from === fromID).duration)
            CurrentDriver.TotalDurationTaken += RiderRiderDuration[ToIndexinRiderRiderDuration].data.find(n => n.from === fromID).duration;
            CurrentDriver.TotalDistanceCoveredToDestination += RiderRider[ToIndexinRiderRiderDuration].data.find(n => n.from === fromID).distance;


        }
    }

}