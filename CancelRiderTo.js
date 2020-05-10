module.exports = async function main() {

        var f = require('./routes/api/cancelRiderToApi').getters
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

        for (var j = CurrentDriver.AssignedRiders.length - 1; j >= 0; j--) {
            if (j == 0) { // Last iteration ( First Rider )


                toIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[1]))
                var DriverIndexinDriverRidersDuration = DriversRidersDuration.indexOf(DriversRidersDuration.find(n => n.ID === CurrentDriver.ID))
                var DriverIndexinDriverRiders = DriversRider.indexOf(DriversRider.find(n => n.ID === CurrentDriver.ID))

                toRiderID = CurrentDriver.AssignedRiders[1];
                var datee = new Date(Riders[toIndex].PickupTime);

                CurrentDriver.TotalDurationTaken += DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.to === toRiderID).duration
                CurrentDriver.TotalDistanceCoveredToDestination += DriversRider[DriverIndexinDriverRiders].data.find(n => n.to === toRiderID).distance

                CurrentDriver.PoolStartTime = datee
                CurrentDriver.PoolStartTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - DriversRidersDuration[DriverIndexinDriverRidersDuration].data.find(n => n.to === toRiderID).duration)


            } else if (j == CurrentDriver.AssignedRiders.length - 1) { // First iteration ( Last Rider )

                fromIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[j]))
                CurrentDriver.TotalDistanceCoveredToDestination += Riders[fromIndex].DistanceToOrganization;
                CurrentDriver.TotalDurationTaken += Riders[fromIndex].TimeToOrganizationMinutes;
                var datee = new Date(CurrentDriver.ArrivalTime);
                Riders[fromIndex].PickupTime = datee

                Riders[fromIndex].PickupTime.setMinutes(CurrentDriver.ArrivalTime.getMinutes() - Riders[fromIndex].TimeToOrganizationMinutes)

            } else {
                fromIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[j]));
                toIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[j + 1]));
                toID = CurrentDriver.AssignedRiders[j + 1];
                fromID = CurrentDriver.AssignedRiders[j]
                FromIndexinRiderRiderDuration = RiderRiderDuration.indexOf(RiderRiderDuration.find(n => n.ID === fromID));
                FromIndexinRiderRider = RiderRider.indexOf(RiderRider.find(n => n.ID === fromID))
                CurrentDriver.TotalDurationTaken += RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration
                CurrentDriver.TotalDistanceCoveredToDestination += RiderRider[FromIndexinRiderRider].data.find(n => n.to === toID).distance
                var datee = new Date(Riders[toIndex].PickupTime);
                Riders[fromIndex].PickupTime = datee
                Riders[fromIndex].PickupTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - RiderRiderDuration[FromIndexinRiderRiderDuration].data.find(n => n.to === toID).duration)

            }

        }

    }
    //Return Current Driver with Riders