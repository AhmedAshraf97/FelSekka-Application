const mbxClient = require('@mapbox/mapbox-sdk');
const mbxDirections = require('@mapbox/mapbox-sdk/services/directions')
const mbxgetMatrix = require('@mapbox/mapbox-sdk/services/matrix')

const baseClient = mbxClient({ accessToken: 'pk.eyJ1IjoiYWhtZWRhc2hyYWYiLCJhIjoiY2s3NGh0cGpwMDAxNTNsbGd5a2dnenRsbCJ9.TBaDTH2E1orAkGEU8mX8Qw' });
const directionsService = mbxDirections(baseClient);

var Routing = function(waypoint1, waypoint2) {
    return new Promise((resolve, reject) => {

        directionsService.getDirections({
                profile: 'driving-traffic',
                waypoints: [{
                        coordinates: [waypoint1[0], waypoint1[1]], //ahmed
                        approach: 'unrestricted'
                    },
                    {
                        coordinates: [waypoint2[0], waypoint2[1]],
                        approach: 'unrestricted'
                    }
                ],
                annotations: ['duration', 'distance', 'speed'],
                alternatives: true
            })
            .send()
            .then(response => {
                const directions = response.body;
                // console.log(directions)
                // console.log('Duration:', directions.routes[0].duration / 60, "minutes");
                // console.log('Distance:', directions.routes[0].distance / 1000, "km ");
                // retrun(response.body.routes[0].duration, response.body.routes[0].distance);4
                resolve(directions);
            });

    });

};