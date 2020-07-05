module.exports = async function main() {

    var f = require('../routes/api/cancelRiderFromApi').getters
    obj = f();

    Riders = obj.Riders;
    Drivers = obj.Drivers;
    CurrentDriver = Drivers[0]
    RidersRiders = obj.RidersRiders;
    DriversRiders = obj.DriversRiders;

    /////////////
    /////////////////////////


    var fromIndex;
    var toIndex;
    CurrentDriver.TotalDurationTaken = 0;
    CurrentDriver.TotalDistanceCoveredToDestination = 0;

    for (var i = CurrentDriver.AssignedRiders.length - 1; i >= -1; i--) {

        if (i == -1) { // Last iteration ( driver dropoff )
            fromIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[0]))
            fromRiderID = CurrentDriver.AssignedRiders[0];
            DriverIndexinDriverRiders = DriversRiders.indexOf(DriversRiders.find(n => n.ID === CurrentDriver.ID))
            var datee = new Date(Riders[fromIndex].DropOffTime);
            CurrentDriver.DropOffTime = datee
            CurrentDriver.DropOffTime.setMinutes(Riders[fromIndex].DropOffTime.getMinutes() + DriversRiders[DriverIndexinDriverRiders].data.find(n => n.from === fromRiderID).duration)

            CurrentDriver.TotalDurationTaken += DriversRiders[DriverIndexinDriverRiders].data.find(n => n.from === fromRiderID).duration;
            CurrentDriver.TotalDistanceCoveredToDestination += DriversRiders[DriverIndexinDriverRiders].data.find(n => n.from === fromRiderID).distance;



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
            ToIndexinRidersRiders = RidersRiders.indexOf(RidersRiders.find(n => n.ID === toID));
            var datee = new Date(Riders[fromIndex].DropOffTime);
            RiderDropOff = datee
            Riders[toIndex].DropOffTime.setMinutes(Riders[fromIndex].DropOffTime.getMinutes() + RidersRiders[ToIndexinRidersRiders].data.find(n => n.from === fromID).duration)
            CurrentDriver.TotalDurationTaken += RidersRiders[ToIndexinRidersRiders].data.find(n => n.from === fromID).duration;
            CurrentDriver.TotalDistanceCoveredToDestination += RidersRiders[ToIndexinRidersRiders].data.find(n => n.from === fromID).distance;


        }
    }

}