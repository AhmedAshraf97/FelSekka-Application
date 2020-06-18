import 'dart:convert';
import 'dart:math';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:background_location/background_location.dart';
import 'package:flutter/material.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_map_polyline/google_map_polyline.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:latlong/latlong.dart' as ltlng;
import 'package:progress_indicators/progress_indicators.dart';
import 'dart:async';
import 'package:rich_alert/rich_alert.dart';

String getDisplayRating(double rating) {
  rating = rating.abs();
  final str = rating.toStringAsFixed(rating.truncateToDouble() ==rating ? 0 : 2);
  if (str == '0') return '0';
  if (str.endsWith('.0')) return str.substring(0, str.length - 2);
  if (str.endsWith('0')) return str.substring(0, str.length -1);
  return str;
}


class RiderForDriver{
  int id=0;
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
  RiderForDriver(this.id,this.username,this.firstname,this.lastname,this.phonenumber,this.rating,this.gender,this.latitude,this.longitude,this.time,this.fare);
  factory RiderForDriver.fromJson(dynamic json) {
    return RiderForDriver(json['id'] as int,json['username'] as String, json['firstname'] as String,json['lastname'] as String, json['phonenumber'] as String,json['rating'] as String, json['gender'] as String,json['latitude'] as String, json['longitude'] as String, json['time'] as String, json['fare'] as String);
  }
}

class NavDriverTo extends StatefulWidget {
  int driverid=0;
  double screenWidth=0;
  double screenHeight=0;
  double screenFont=0;
  String token="";
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
  NavDriverTo(this.driverid,this.screenWidth,this.screenHeight,this.screenFont,this.token,this.toFrom,this.type,this.tripId,this.homeLongitude,this.homeLatitude,this.orgName,this.orgLatitude,this.orgLongitude,this.numberRiders,this.driverLongitude,this.driverLatitude,this.riders,this.initialLatitude,this.initialLongitude);
  @override
  _NavDriverToState createState() => _NavDriverToState();
}

class _NavDriverToState extends State<NavDriverTo> {
  Completer<GoogleMapController> _controller = Completer();
  CameraPosition cameraPosition;
  double latitudeStart=0;
  double longitudeStart=0;
  List<Marker> markers=[];
  Geolocator geolocator;
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
  List listStops=[];
  List<List<ltlng.LatLng>> listDistances;
  List listTime=[];
  List<RiderForDriver> riderObjs;
  //////////////////////////////////////////////////////////////////////////////
  Future<String> initializations() async{
    listStops=[];
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
      listStops.add(
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
                  height:widget.screenHeight/20,
                  width: widget.screenWidth/8,),
              ),
              title: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      AutoSizeText(riderObjs[i].firstname+" "+riderObjs[i].lastname+"  ", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: widget.screenFont*1.1,),
                      AutoSizeText(getDisplayRating(double.parse(riderObjs[i].rating)), maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: widget.screenFont,),
                      Icon(
                        Icons.star,
                        color: Colors.grey[500],
                      ),
                    ],
                  ),
                  Row(
                    children: <Widget>[
                      AutoSizeText(widget.toFrom=="to"? "Pickup time: " : "Arrival time: ", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: widget.screenFont*0.9,),
                      AutoSizeText(riderObjs[i].time, maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: widget.screenFont*0.9,),
                    ],
                  ),
                  Divider(
                    height: 5,
                    thickness: 1,
                    color: Colors.grey[400],
                    indent: 3,
                    endIndent: 3,
                  ),
                  AutoSizeText(riderAddress, maxLines: 3,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: widget.screenFont*0.9,),
                ],
              ),
            ),
          ),
        ),
      );
      stopsLatLng.add(
          LatLng(double.parse(riderObjs[i].latitude),double.parse(riderObjs[i].longitude))
      );
    }
    listStops.add(
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
                "images/org.png",
                height:widget.screenHeight/20,
                width: widget.screenWidth/8,),
            ),
            title: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    AutoSizeText(widget.orgName, maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: widget.screenFont*1.1,),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
    stopsLatLng.add(
        LatLng(double.parse(widget.orgLatitude),double.parse(widget.orgLongitude))
    );
    print("Add to stopslatlng");
    markerLatitude=widget.initialLatitude;
    markerLongitude=widget.initialLongitude;
    print("Marker loc: "+markerLatitude.toString()+" "+markerLongitude.toString());
    origin= LatLng(widget.initialLatitude,widget.initialLongitude);
    originDistance= ltlng.LatLng(widget.initialLatitude,widget.initialLongitude);
    print("Origin: " +origin.toString()+ " "+ originDistance.toString());
    destination= LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
    destinationDistance= ltlng.LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
    print("Destination: " +destination.toString()+ " "+ destinationDistance.toString());
    listDistances[0].add(originDistance);
    print("Distance: "+listDistances[0].toString());
    listTime[0].add(DateTime.now());
    print("Initialize variables");
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
    print("Add markers, polylines.");
    return null;
  }
  //////////////////////////////////////////////////////////////////////////////
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: initializations(),
        builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
          if(snapshot.connectionState == ConnectionState.done)
          {
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
              floatingActionButton: arrived == true? new FloatingActionButton(
                  elevation: 0.0,
                  child: Text("End", style: TextStyle(color: Colors.white),),
                  backgroundColor: Colors.indigo[400],
                  onPressed: (){
                    //end();
                    Navigator.pop(context);
                  }
              )
                  :
              Row(),
            );
          }
          else{
            return Scaffold(
              body: Column(
                children: <Widget>[
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                            begin: Alignment.center,
                            colors: [
                              Colors.indigo[600],
                              Colors.indigo[500],
                              Colors.indigo[400],
                              Colors.indigo[300]
                            ]
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(10.0),
                        child: Container(
                            decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30),bottomLeft:Radius.circular(30),bottomRight: Radius.circular(30) )
                            ),
                            child:Center(
                              child: GlowingProgressIndicator(
                                child: Image.asset("images/bluelogonobg.png", width: 150, height: 150,),
                              ),
                            )
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }
        }
    );
  }
}