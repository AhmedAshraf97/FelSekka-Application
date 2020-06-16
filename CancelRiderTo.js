module.exports = async function main() {

        var f = require('./routes/api/cancelRiderToApi').getters
        obj = f();

        Riders = obj.Riders;
        Drivers = obj.Drivers;
        CurrentDriver = Drivers[0]
        RidersRiders = obj.RidersRiders;

        DriversRiders = obj.DriversRiders;



        var fromIndex;
        var toIndex;
        CurrentDriver.TotalDurationTaken = 0;
        CurrentDriver.TotalDistanceCoveredToDestination = 0;

        for (var j = CurrentDriver.AssignedRiders.length - 1; j >= -1; j--) {
            if (j == -1) { // Last iteration ( First Rider )


                toIndex = Riders.indexOf(Riders.find(n => n.ID === CurrentDriver.AssignedRiders[0]))
                var DriverIndexinDriverRiders = DriversRiders.indexOf(DriversRiders.find(n => n.ID === CurrentDriver.ID))

                toRiderID = CurrentDriver.AssignedRiders[0];
                var datee = new Date(Riders[toIndex].PickupTime);

                CurrentDriver.TotalDurationTaken += DriversRiders[DriverIndexinDriverRiders].data.find(n => n.to === toRiderID).duration
                CurrentDriver.TotalDistanceCoveredToDestination += DriversRiders[DriverIndexinDriverRiders].data.find(n => n.to === toRiderID).distance

                CurrentDriver.PoolStartTime = datee
                CurrentDriver.PoolStartTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - DriversRiders[DriverIndexinDriverRiders].data.find(n => n.to === toRiderID).duration)


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
                FromIndexinRidersRiders = RidersRiders.indexOf(RidersRiders.find(n => n.ID === fromID));
                CurrentDriver.TotalDurationTaken += RidersRiders[FromIndexinRidersRiders].data.find(n => n.to === toID).duration
                CurrentDriver.TotalDistanceCoveredToDestination += RidersRiders[FromIndexinRidersRiders].data.find(n => n.to === toID).distance
                var datee = new Date(Riders[toIndex].PickupTime);
                Riders[fromIndex].PickupTime = datee
                Riders[fromIndex].PickupTime.setMinutes(Riders[toIndex].PickupTime.getMinutes() - RidersRiders[FromIndexinRidersRiders].data.find(n => n.to === toID).duration)

            }

        }

    }
    //Return Current Driver with Riders