import 'dart:math';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:background_location/background_location.dart';
import 'package:flutter/material.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_map_polyline/google_map_polyline.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:latlong/latlong.dart' as ltlng;
import 'dart:async';

//Driver to organization:
//----------------------------

String getDisplayRating(double rating) {
  rating = rating.abs();
  final str = rating.toStringAsFixed(rating.truncateToDouble() ==rating ? 0 : 2);
  if (str == '0') return '0';
  if (str.endsWith('.0')) return str.substring(0, str.length - 2);
  if (str.endsWith('0')) return str.substring(0, str.length -1);
  return str;
}

class RiderForDriver{
  String username="";
  String firstname="";
  String lastname="";
  String phonenumber="";
  String rating= "";
  String gender= "";
  String latitude="";
  String longitude="";
  String time="";
  String fare="";
  RiderForDriver(this.username,this.firstname,this.lastname,this.phonenumber,this.rating,this.gender,this.latitude,this.longitude,this.time,this.fare);
  factory RiderForDriver.fromJson(dynamic json) {
    return RiderForDriver(json['username'] as String, json['firstname'] as String,json['lastname'] as String, json['phonenumber'] as String,json['rating'] as String, json['gender'] as String,json['latitude'] as String, json['longitude'] as String, json['time'] as String, json['fare'] as String);
  }
}

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
  var ky;
  var kx;
  var dx;
  var dy;
  //////////////////////////////////////////////////////////////////////////////
  var arrived= false;
  int counterStops=0;
  List<LatLng> stopsLatLng=[];
  List listRiders=[];
  double screenWidth;
  double screenHeight;
  double screenFont;
  List<RiderForDriver> riderObjs;
  //////////////////////////////////////////////////////////////////////////////
  Future<String> getlocation() async{
    listRiders=[];
    var riderObjsJson = widget.riders as List;
    riderObjs = riderObjsJson.map((riderJson) => RiderForDriver.fromJson(riderJson)).toList();
    for(int i=0; i< riderObjs.length; i++)
      {
        /*List<Placemark> newPlace = await Geolocator().placemarkFromCoordinates(double.parse(riderObjs[i].latitude), double.parse(riderObjs[i].longitude));
          Placemark placeMark  = newPlace[0];
          String name = placeMark.name;
          String locality = placeMark.locality;
          String administrativeArea = placeMark.administrativeArea;
          String country = placeMark.country;
          String riderAddress= name +" - "+locality+" - "+administrativeArea+" - " +country;*/
        //print(riderAddress);
        String riderAddress="";
        listRiders.add(
          GestureDetector(
            onTap: (){},
            child: Card(
              elevation: 4,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15.0),
              ),
              child: ListTile(
                contentPadding: EdgeInsets.all(5),
                leading: CircleAvatar(
                  backgroundColor: Colors.white,
                  child: Image.asset(
                    riderObjs[i].gender=="male"? "images/avatarfemale.png" : "images/avatarmale.png",
                    height:screenHeight/20,
                    width: screenWidth/8,),
                ),
                title: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        AutoSizeText(riderObjs[i].firstname+" "+riderObjs[i].lastname+"  ", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: screenFont*1.1,),
                        AutoSizeText(getDisplayRating(double.parse(riderObjs[i].rating)), maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: screenFont,),
                        Icon(
                          Icons.star,
                          color: Colors.grey[500],
                        ),
                      ],
                    ),
                    Row(
                      children: <Widget>[
                        AutoSizeText(widget.toFrom=="to"? "Pickup time: " : "Arrival time: ", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: screenFont*0.9,),
                        AutoSizeText(riderObjs[i].time, maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: screenFont*0.9,),
                      ],
                    ),
                    Divider(
                      height: 5,
                      thickness: 1,
                      color: Colors.grey[400],
                      indent: 3,
                      endIndent: 3,
                    ),
                    AutoSizeText(riderAddress, maxLines: 3,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: screenFont*0.9,),
                  ],
                ),
              ),
            ),
          ),
        );
        //listRiders.add();
        stopsLatLng.add(
          LatLng(double.parse(riderObjs[i].latitude),double.parse(riderObjs[i].longitude))
        );
      }
    stopsLatLng.add(
        LatLng(double.parse(widget.orgLatitude),double.parse(widget.orgLongitude))
    );
    markerLatitude=widget.initialLatitude;
    markerLongitude=widget.initialLongitude;
    origin= LatLng(widget.initialLatitude,widget.initialLongitude);
    originDistance= ltlng.LatLng(widget.initialLatitude,widget.initialLongitude);
    destination= LatLng(double.parse(riderObjs[0].latitude), double.parse(riderObjs[0].longitude));
    destinationDistance= ltlng.LatLng(double.parse(riderObjs[0].latitude), double.parse(riderObjs[0].longitude));
    listLatLngTravelled.add(originDistance);
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
    //initial camera in Google maps widget
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
  //////////////////////////////////////////////////////////////////////////////
  updateloc() {
    BackgroundLocation.startLocationService();
    BackgroundLocation.getLocationUpdates((location)async {
      counter++;
      origin= await LatLng(location.latitude,location.longitude);
      originDistance= ltlng.LatLng(position.latitude,position.longitude);
      listLatLngTravelled.add(originDistance);
      destination= LatLng(double.parse(riderObjs[counterStops].latitude), double.parse(riderObjs[counterStops].longitude));
      destinationDistance= ltlng.LatLng(double.parse(riderObjs[counterStops].latitude), double.parse(riderObjs[counterStops].longitude));
      var ky = 40000 / 360;
      var kx = cos(pi * destination.latitude / 180.0) * ky;
      var dx = (destination.longitude - origin.longitude).abs() * kx;
      var dy = (destination.latitude - origin.latitude) * ky;
      if(sqrt(dx * dx + dy * dy) <= 1)
      {
        arrived = true;
        setState(() {
          counterStops++;
        });
      }
      else
      {
        arrived = false;
      }
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
  //////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////
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

  @override
  Widget build(BuildContext context) {
    screenWidth = MediaQuery.of(context).size.width;
    screenHeight = MediaQuery.of(context).size.height;
    screenFont= MediaQuery.of(context).textScaleFactor;
    return FutureBuilder(
        future: getlocation(),
        builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
          return Scaffold(
            body: GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                _controller.complete(controller);
              },
              initialCameraPosition: CameraPosition(
                target: LatLng(widget.initialLatitude ,widget.initialLongitude),
                zoom: 18,
              ),
              markers: Set.from(markers),
              polylines: _polylines,

            ),
            floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
            floatingActionButton: new FloatingActionButton(
                elevation: 0.0,
                child: Column(
                  children: <Widget>[
                    listRiders[counterStops],
                    arrived == true?
                    MaterialButton(
                      child: Text("Start this rider's ride.",
                        style: TextStyle(
                          color: Colors.indigo[400],
                          fontSize: 20.0,
                          fontFamily: "Kodchasan",
                        ),
                      ),
                      height:40,
                      minWidth:100,
                      color: Colors.white,
                      elevation: 15,
                      highlightColor: Colors.grey,
                      splashColor: Colors.blueGrey,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(50),
                      ),
                      onPressed: (){
                      },
                    ) :
                        Row()
                  ],
                ),
                backgroundColor: Colors.indigo[400],
                onPressed: (){
                  //end();
                  Navigator.pop(context);
                }
            ),
          );
        }
    );
  }
}
