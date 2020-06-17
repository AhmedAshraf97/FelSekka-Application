import 'dart:math';
import 'package:background_location/background_location.dart';
import 'package:flutter/material.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_map_polyline/google_map_polyline.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:latlong/latlong.dart' as ltlng;
import 'dart:async';

class NavMap extends StatefulWidget {
  String toFrom="";
  String type="";
  int tripId=0;
  String homeLongitude="";
  String homeLatitude="";
  String orgName="";
  String orgLatitude="";
  String orgLongitude="";
  int numberRiders=0;
  String driverLongitude="";
  String driverLatitude="";
  List riders=[];
  double initialLongitude=0;
  double initialLatitude=0;
  NavMap(this.toFrom,this.type,this.tripId,this.homeLongitude,this.homeLatitude,this.orgName,this.orgLatitude,this.orgLongitude,this.numberRiders,this.driverLongitude,this.driverLatitude,this.riders,this.initialLatitude,this.initialLongitude);
  @override
  _NavMapState createState() => _NavMapState();
}

//Cairo uni: 30.026628, 31.211008
class _NavMapState extends State<NavMap> {
  Completer<GoogleMapController> _controller = Completer();
  CameraPosition cameraPosition;
  Position position;
  double latitudeStart=0;
  double longitudeStart=0;
  List<Marker> markers=[];
  Geolocator geolocator;
  int counter=0;
  double markerLatitude=0;
  double markerLongitude=0;
  Set<Polyline> _polylines = Set<Polyline>();
  List<LatLng> polylineCoordinates = [];
  PolylinePoints polylinePoints;
  static String googleAPIKey = 'AIzaSyC6NQ_ODwiORDBTsuB5k9J8prDQ_MTZgB4';
  LatLng origin;
  LatLng destination;
  ltlng.LatLng originDistance;
  ltlng.LatLng destinationDistance;
  GoogleMapPolyline googleMapPolyline =
  new  GoogleMapPolyline(apiKey:  googleAPIKey);
  List<ltlng.LatLng> listLatLngTravelled=[];
  final  ltlng.Distance distance = new ltlng.Distance();
  double km=0;
  DateTime startTime;
  DateTime endTime;
  var Difference;
  BitmapDescriptor pinLocationIcon;
  var arrived = false;
  var ky;
  var kx;
  var dx;
  var dy;

  @override
  void initState() {
    super.initState();
    startTime=DateTime.now();
    BitmapDescriptor.fromAssetImage(
        ImageConfiguration(devicePixelRatio: 2.5),
        'assets/marker.png').then((onValue) {
      pinLocationIcon = onValue;
    });
    updateloc();
  }

  checkArrival(LatLng destnation, LatLng currentloc, double km) async
  {
    //kx and ky -> km per degree
    var ky = 40000 / 360;
    var kx = cos(pi * destnation.latitude / 180.0) * ky;
    var dx = (destnation.longitude - currentloc.longitude).abs() * kx;
    var dy = (destnation.latitude - currentloc.latitude) * ky;
    if(sqrt(dx * dx + dy * dy) <= km)
    {
      return true;
    }
    else
    {
      return false;
    }
  }


  void end() async{
    endTime= DateTime.now();
    Difference = endTime.difference(startTime).inMinutes;
    print("Total time: "+ Difference.toString());

    for(int i=1; i<listLatLngTravelled.length; i++)
    {
      km += distance.as(ltlng.LengthUnit.Meter,
          listLatLngTravelled[i],listLatLngTravelled[i-1]);
      print(km/1000);
    }
  }


  Future<String> getlocation() async{
    geolocator = Geolocator()..forceAndroidLocationManager = true;
    position = await geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
    latitudeStart= position.latitude;
    longitudeStart=position.longitude;
    markerLatitude=position.latitude;
    markerLongitude=position.longitude;
    origin= LatLng(position.latitude,position.longitude);
    originDistance= ltlng.LatLng(position.latitude,position.longitude);
    destination= LatLng(30.026628, 31.211008);
    destinationDistance= ltlng.LatLng(30.026628, 31.211008);
    listLatLngTravelled.add(originDistance);
    var ky = 40000 / 360;
    var kx = cos(pi * destination.latitude / 180.0) * ky;
    var dx = (destination.longitude - origin.longitude).abs() * kx;
    var dy = (destination.latitude - origin.latitude) * ky;
    if(sqrt(dx * dx + dy * dy) <= 1)
    {
      arrived = true;
    }
    else
    {
      arrived = false;
    }
    print("Arrived: "+ arrived.toString());
    List<LatLng> _coordinates = await googleMapPolyline.getCoordinatesWithLocation(
        origin: origin,
        destination: destination,
        mode: RouteMode.driving);
    Polyline polyline = Polyline(
        polylineId: PolylineId("polyline"),
        color: Colors.indigo[300],
        points: _coordinates,
        width: 3,
        onTap: () {});
    _polylines.add(polyline);
    cameraPosition= await CameraPosition(
      target: LatLng(position.latitude , position.longitude),
      zoom: 18,
    );
    markers.add(
        Marker(
          markerId: MarkerId('sourceMarker'),
          draggable: false,
          onTap: () {
            print('Marker Tapped');
          },
          position: LatLng(markerLatitude , markerLongitude),
          icon: pinLocationIcon,
        )
    );
    markers.add(
        Marker(
          markerId: MarkerId('destMarker'),
          draggable: false,
          onTap: () {
            print('Marker Tapped');
          },
          position: destination,
        )
    );
    return null;
  }

  updateloc() {
    BackgroundLocation.startLocationService();
    BackgroundLocation.getLocationUpdates((location)async {
      counter++;
      //print(counter);
      origin= await LatLng(location.latitude,location.longitude);
      originDistance= ltlng.LatLng(position.latitude,position.longitude);
      listLatLngTravelled.add(originDistance);
      var ky = 40000 / 360;
      var kx = cos(pi * destination.latitude / 180.0) * ky;
      var dx = (destination.longitude - origin.longitude).abs() * kx;
      var dy = (destination.latitude - origin.latitude) * ky;
      if(sqrt(dx * dx + dy * dy) <= 1)
      {
        arrived = true;
      }
      else
      {
        arrived = false;
      }
      print("Arrived: "+ arrived.toString());
      List<LatLng> _coordinates = await googleMapPolyline.getCoordinatesWithLocation(
          origin: origin,
          destination: destination,
          mode: RouteMode.driving);
      Polyline polyline = Polyline(
          polylineId: PolylineId("polyline"),
          color: Colors.indigo[300],
          points: _coordinates,
          width: 3,
          onTap: () {});
      CameraPosition cameraPositionNew= CameraPosition(
        target: LatLng(location.latitude , location.longitude),
        zoom: 18,
      );
      final GoogleMapController controller = await _controller.future;
      controller.animateCamera(CameraUpdate.newCameraPosition(cameraPositionNew));
      setState(() {
        markerLatitude=location.latitude;
        markerLongitude=location.longitude;
      });
      _polylines.clear();
      _polylines.add(polyline);
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: getlocation(),
        builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
          return Scaffold(
            body: GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                _controller.complete(controller);
              },
              initialCameraPosition: cameraPosition,
              markers: Set.from(markers),
              polylines: _polylines,

            ),
            floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
            floatingActionButton: arrived == true? new FloatingActionButton(
                elevation: 0.0,
                child: Text("End", style: TextStyle(color: Colors.white),),
                backgroundColor: Colors.indigo[400],
                onPressed: (){
                  end();
                  Navigator.pop(context);
                }
            )
                :
            Row(),
          );
        }
    );
  }
}
