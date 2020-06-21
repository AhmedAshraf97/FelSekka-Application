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
import 'dart:async';
import 'package:rich_alert/rich_alert.dart';
import 'package:url_launcher/url_launcher.dart';

_launchCaller(String phonenumber) async {
  var url = "tel:"+ phonenumber;
  if (await canLaunch(url)) {
    await launch(url);
  } else {
    throw 'Could not launch $url';
  }
}

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

class NavDriverFrom extends StatefulWidget {
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
  NavDriverFrom(this.driverid,this.screenWidth,this.screenHeight,this.screenFont,this.token,this.toFrom,this.type,this.tripId,this.homeLongitude,this.homeLatitude,this.orgName,this.orgLatitude,this.orgLongitude,this.numberRiders,this.driverLongitude,this.driverLatitude,this.riders,this.initialLatitude,this.initialLongitude);
  @override
  _NavDriverFromState createState() => _NavDriverFromState();
}
//Cairo uni: 30.026628, 31.211008
class _NavDriverFromState extends State<NavDriverFrom> {
  //////////////////////////////////////////////////////////////////////////////
  Completer<GoogleMapController> _controller = Completer();
  CameraPosition cameraPosition;
  Position position;
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
  List<List<ltlng.LatLng>> listLatLngTravelled=new List.generate(10, (i) => []);
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
  List listDistances= [];
  List<RiderForDriver> riderObjs;
  //////////////////////////////////////////////////////////////////////////////
  @override
  void initState() {
    super.initState();
    startTime=DateTime.now();
    BitmapDescriptor.fromAssetImage(
        ImageConfiguration(devicePixelRatio: 2.5),
        'images/marker.png').then((onValue) {
      pinLocationIcon = onValue;
    });
    updateloc();
  }

  Future<String> getlocation() async{
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
            child: Column(
              children: <Widget>[
                Row(
                  children: <Widget>[
                    CircleAvatar(
                      backgroundColor: Colors.white,
                      child: Image.asset(
                        riderObjs[i].gender=="female"? "images/avatarfemale.png" : "images/avatarmale.png",
                        height:widget.screenHeight/20,
                        width: widget.screenWidth/8,),
                    ),
                    Column(
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
                    IconButton(
                      icon: Icon(
                        Icons.phone_in_talk,
                        color:Colors.redAccent,
                      ),
                      onPressed: (){
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Call rider"),
                                alertSubtitle: richSubtitle("Call "+riderObjs[i].phonenumber+"?"),
                                alertType: RichAlertType.WARNING,
                                dialogIcon: Icon(
                                  Icons.help,
                                  color: Colors.yellowAccent,
                                  size: 55,
                                ),
                                actions: <Widget>[
                                  new OutlineButton(
                                    shape: StadiumBorder(),
                                    textColor: Colors.blue,
                                    child: Text('Yes', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                                    borderSide: BorderSide(
                                        color: Colors.indigo[400], style: BorderStyle.solid,
                                        width: 1),
                                    onPressed: () async{
                                      Navigator.pop(context);
                                      _launchCaller(riderObjs[i].phonenumber);
                                    },
                                  ),
                                  SizedBox(width: 20,),
                                  new OutlineButton(
                                    shape: StadiumBorder(),
                                    textColor: Colors.blue,
                                    child: Text('No', style: TextStyle(color: Colors.red[400],fontSize: 30),),
                                    borderSide: BorderSide(
                                        color: Colors.red[400], style: BorderStyle.solid,
                                        width: 1),
                                    onPressed: () {
                                      Navigator.pop(context);
                                    },
                                  ),
                                ],
                              );
                            });
                      },
                    ),
                  ],
                )
              ],
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
          child: Column(
            children: <Widget>[
              Row(
                children: <Widget>[
                  CircleAvatar(
                    backgroundColor: Colors.white,
                    child: Image.asset(
                      "images/home.png",
                      height:widget.screenHeight/20,
                      width: widget.screenWidth/8,),
                  ),
                  Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          AutoSizeText("Home", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: widget.screenFont*1.1,),
                        ],
                      ),
                    ],
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
    stopsLatLng.add(
        LatLng(double.parse(widget.homeLatitude),double.parse(widget.homeLongitude))
    );
    print("list stops length: "+ listStops.length.toString());
    print("list stops: "+ listStops.toString());
    geolocator = Geolocator()..forceAndroidLocationManager = true;
    position = await geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
    latitudeStart= position.latitude;
    longitudeStart=position.longitude;
    markerLatitude=position.latitude;
    markerLongitude=position.longitude;
    origin= LatLng(position.latitude,position.longitude);
    originDistance= ltlng.LatLng(position.latitude,position.longitude);
    destination= LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
    destinationDistance= ltlng.LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
    listDistances.add(originDistance);
    print("Dist: "+ listDistances.toString());
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
    //Insert tracking location:
    Map<String,String> body={
      "driverid" : widget.driverid.toString(),
      "tripid" : widget.tripId.toString(),
      "latitude" : markerLatitude.toString(),
      "longitude" : markerLongitude.toString(),
    };
    String url="http://3.81.22.120:3000/api/inserttrackinglocation";
    Response response =await post(url, body: body, headers:{'authorization': widget.token});
    if(response.statusCode == 400)
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle(data['error']),
              alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
              alertType: RichAlertType.WARNING,
              dialogIcon: Icon(
                Icons.warning,
                color: Colors.red,
                size: 80,
              ),
              actions: <Widget>[
                new OutlineButton(
                  shape: StadiumBorder(),
                  textColor: Colors.blue,
                  child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                  borderSide: BorderSide(
                      color: Colors.indigo[400], style: BorderStyle.solid,
                      width: 1),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ],
            );
          });
    }
    else if(response.statusCode != 200)
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle('User error'),
              alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
              alertType: RichAlertType.WARNING,
              dialogIcon: Icon(
                Icons.warning,
                color: Colors.red,
                size: 80,
              ),
              actions: <Widget>[
                new OutlineButton(
                  shape: StadiumBorder(),
                  textColor: Colors.blue,
                  child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                  borderSide: BorderSide(
                      color: Colors.indigo[400], style: BorderStyle.solid,
                      width: 1),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ],
            );
          });
    }
    else {
      Map data = jsonDecode(response.body);
      print(data);
    }
    return null;
  }

  updateloc() {
    BackgroundLocation.startLocationService();
    BackgroundLocation.getLocationUpdates((location)async {
      print("Stop lat lng:" + stopsLatLng[counterStops].latitude.toString()+" "+stopsLatLng[counterStops].longitude.toString());
      origin= await LatLng(location.latitude,location.longitude);
      originDistance= ltlng.LatLng(position.latitude,position.longitude);
      destination= LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
      destinationDistance= ltlng.LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
      listDistances.add(originDistance);
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
      Map<String,String> body={
        "driverid" : widget.driverid.toString(),
        "tripid" : widget.tripId.toString(),
        "latitude" : location.latitude.toString(),
        "longitude" : location.longitude.toString(),
      };
      String url="http://3.81.22.120:3000/api/inserttrackinglocation";
      Response response =await post(url, body: body, headers:{'authorization': widget.token});
      if(response.statusCode == 400)
      {
        Map data= jsonDecode(response.body);
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return RichAlertDialog(
                alertTitle: richTitle(data['error']),
                alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
                alertType: RichAlertType.WARNING,
                dialogIcon: Icon(
                  Icons.warning,
                  color: Colors.red,
                  size: 80,
                ),
                actions: <Widget>[
                  new OutlineButton(
                    shape: StadiumBorder(),
                    textColor: Colors.blue,
                    child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                    borderSide: BorderSide(
                        color: Colors.indigo[400], style: BorderStyle.solid,
                        width: 1),
                    onPressed: () {
                      Navigator.pop(context);
                    },
                  ),
                ],
              );
            });
      }
      else if(response.statusCode != 200)
      {
        Map data= jsonDecode(response.body);
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return RichAlertDialog(
                alertTitle: richTitle('User error'),
                alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
                alertType: RichAlertType.WARNING,
                dialogIcon: Icon(
                  Icons.warning,
                  color: Colors.red,
                  size: 80,
                ),
                actions: <Widget>[
                  new OutlineButton(
                    shape: StadiumBorder(),
                    textColor: Colors.blue,
                    child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                    borderSide: BorderSide(
                        color: Colors.indigo[400], style: BorderStyle.solid,
                        width: 1),
                    onPressed: () {
                      Navigator.pop(context);
                    },
                  ),
                ],
              );
            });
      }
      else {
        Map data = jsonDecode(response.body);
        print(data);
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
  void startRide() async{
    DateTime arrivalTime=DateTime.now();
    String actualpickuptime= DateFormat('Hms').format(arrivalTime);
    for(int i=0; i<riderObjs.length; i++)
      {
        Map<String,String> body = {
          'tripid' : widget.tripId.toString(),
          'driverid' : widget.driverid.toString(),
          'riderid' : riderObjs[i].id.toString(),
          'actualpickuptime': actualpickuptime,
        };
        String url="http://3.81.22.120:3000/api/startRiderTripFrom";
        Response response =await post(url, body: body);
        print(response.body);
        if(response.statusCode == 400)
        {
          Map data= jsonDecode(response.body);
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return RichAlertDialog(
                  alertTitle: richTitle(data['error']),
                  alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
                  alertType: RichAlertType.WARNING,
                  dialogIcon: Icon(
                    Icons.warning,
                    color: Colors.red,
                    size: 80,
                  ),
                  actions: <Widget>[
                    new OutlineButton(
                      shape: StadiumBorder(),
                      textColor: Colors.blue,
                      child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                      borderSide: BorderSide(
                          color: Colors.indigo[400], style: BorderStyle.solid,
                          width: 1),
                      onPressed: () {
                        Navigator.pop(context);
                      },
                    ),
                  ],
                );
              });
        }
        else if(response.statusCode != 200)
        {
          Map data= jsonDecode(response.body);
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return RichAlertDialog(
                  alertTitle: richTitle('User error'),
                  alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
                  alertType: RichAlertType.WARNING,
                  dialogIcon: Icon(
                    Icons.warning,
                    color: Colors.red,
                    size: 80,
                  ),
                  actions: <Widget>[
                    new OutlineButton(
                      shape: StadiumBorder(),
                      textColor: Colors.blue,
                      child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                      borderSide: BorderSide(
                          color: Colors.indigo[400], style: BorderStyle.solid,
                          width: 1),
                      onPressed: () {
                        Navigator.pop(context);
                      },
                    ),
                  ],
                );
              });
        }
        else {
          Map data = jsonDecode(response.body);
          print(data);
        }
      }
  }
  //////////////////////////////////////////////////////////////////////////////
  void end() async{
    print("end");
    endTime= DateTime.now();
    String actualarrivaltime= DateFormat('Hms').format(endTime);
    var diffTime = endTime.difference(startTime).inMinutes;
    print("Total time: "+ diffTime.toString());
    double meters=0;
    double kilometers=0;
    for(int j=1; j<listDistances.length; j++)
    {
      meters += distance.as(ltlng.LengthUnit.Meter,
          listDistances[j],listDistances[j-1]);
    }
    kilometers=meters/1000;
    //end rider:
    Map<String,String> body = {
      'tripid' : widget.tripId.toString(),
      'driverid': widget.driverid.toString(),
      'riderid': riderObjs[counterStops].id.toString(),
      'time' : diffTime.toString(),
      'distance' : kilometers.toString(),
      'actualarrivaltime': actualarrivaltime,
      'latitude': listDistances[listDistances.length-1].latitude.toString(),
      'longitude': listDistances[listDistances.length-1].longitude.toString(),
    };
    String url="http://3.81.22.120:3000/api/endRiderTripFrom";
    Response response =await post(url, body: body, headers:{'authorization': widget.token});
    if(response.statusCode == 400 )
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle(data['error']),
              alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
              alertType: RichAlertType.WARNING,
              dialogIcon: Icon(
                Icons.warning,
                color: Colors.red,
                size: 80,
              ),
              actions: <Widget>[
                new OutlineButton(
                  shape: StadiumBorder(),
                  textColor: Colors.blue,
                  child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                  borderSide: BorderSide(
                      color: Colors.indigo[400], style: BorderStyle.solid,
                      width: 1),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ],
            );
          });
    }
    else if(response.statusCode != 200)
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle('User error'),
              alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
              alertType: RichAlertType.WARNING,
              dialogIcon: Icon(
                Icons.warning,
                color: Colors.red,
                size: 80,
              ),
              actions: <Widget>[
                new OutlineButton(
                  shape: StadiumBorder(),
                  textColor: Colors.blue,
                  child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                  borderSide: BorderSide(
                      color: Colors.indigo[400], style: BorderStyle.solid,
                      width: 1),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ],
            );
          });
    }
    else {
      Map data = jsonDecode(response.body);
      print(data);
    }
    setState(() {
      counterStops++;
    });
  }
//////////////////////////////////////////////////////////////////////////////
  void endDriver() async{
    print("end"+ listDistances[listDistances.length-1].latitude.toString() + "," + listDistances[listDistances.length-1].longitude.toString());
    endTime= DateTime.now();
    String actualarrivaltime= DateFormat('Hms').format(endTime);
    var diffTime = endTime.difference(startTime).inMinutes;
    print("Total time: "+ diffTime.toString());
    double meters=0;
    double kilometers=0;
    for(int j=1; j<listDistances.length; j++)
    {
      meters += distance.as(ltlng.LengthUnit.Meter,
          listDistances[j],listDistances[j-1]);
    }
    kilometers=meters/1000;
    Map<String,String> body = {
      'tripid' : widget.tripId.toString(),
      'time' : diffTime.toString(),
      'distance' : kilometers.toString(),
      'actualarrivaltime': actualarrivaltime,
      'latitude': listDistances[listDistances.length-1].latitude.toString(),
      'longitude': listDistances[listDistances.length-1].longitude.toString(),
    };
    String url="http://3.81.22.120:3000/api/endDriverTripFrom";
    Response response =await post(url, body: body, headers:{'authorization': widget.token});
    if(response.statusCode == 400 )
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle(data['error']),
              alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
              alertType: RichAlertType.WARNING,
              dialogIcon: Icon(
                Icons.warning,
                color: Colors.red,
                size: 80,
              ),
              actions: <Widget>[
                new OutlineButton(
                  shape: StadiumBorder(),
                  textColor: Colors.blue,
                  child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                  borderSide: BorderSide(
                      color: Colors.indigo[400], style: BorderStyle.solid,
                      width: 1),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ],
            );
          });
    }
    else if(response.statusCode != 200)
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle('User error'),
              alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
              alertType: RichAlertType.WARNING,
              dialogIcon: Icon(
                Icons.warning,
                color: Colors.red,
                size: 80,
              ),
              actions: <Widget>[
                new OutlineButton(
                  shape: StadiumBorder(),
                  textColor: Colors.blue,
                  child: Text('Ok', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                  borderSide: BorderSide(
                      color: Colors.indigo[400], style: BorderStyle.solid,
                      width: 1),
                  onPressed: () {
                    Navigator.pop(context);
                  },
                ),
              ],
            );
          });
    }
    else {
      Map data = jsonDecode(response.body);
      print(data);
    }
    BackgroundLocation.stopLocationService();
    Navigator.pop(context);
    Navigator.pop(context);
  }


  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
        future: getlocation(),
        builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
          return Scaffold(
            body: Stack(
              alignment: AlignmentDirectional.bottomCenter,
              children: <Widget>[
                GoogleMap(
                  onMapCreated: (GoogleMapController controller) {
                    _controller.complete(controller);
                  },
                  initialCameraPosition: CameraPosition(
                    target: LatLng(widget.initialLatitude, widget.initialLongitude),
                    zoom: 18,
                  ),
                  markers: Set.from(markers),
                  polylines: _polylines,
                ),
                Positioned(
                  bottom: 0,
                  child: Center(
                    child: Column(
                      children: <Widget>[
                        arrived==true?
                        Column(
                          children: <Widget>[
                            counterStops==widget.numberRiders?
                            Column(
                              children: <Widget>[
                                listStops[counterStops],
                                MaterialButton(
                                  child: Text("End ride.",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 16.0,
                                      fontFamily: "Kodchasan",
                                    ),
                                  ),
                                  height:40,
                                  minWidth:100,
                                  color: Colors.indigo[400],
                                  elevation: 15,
                                  highlightColor: Colors.grey,
                                  splashColor: Colors.blueGrey,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(50),
                                  ),
                                  onPressed: (){
                                    endDriver();
                                  },
                                ),
                              ],
                            )
                                :
                            Column(
                              children: <Widget>[
                                listStops[counterStops],
                                MaterialButton(
                                  child: Text("End this rider's ride.",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 20.0,
                                      fontFamily: "Kodchasan",
                                    ),
                                  ),
                                  height:40,
                                  minWidth:100,
                                  color: Colors.indigo[400],
                                  elevation: 15,
                                  highlightColor: Colors.grey,
                                  splashColor: Colors.blueGrey,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(50),
                                  ),
                                  onPressed: (){
                                    end();
                                  },
                                ),
                              ],
                            )
                            ,
                          ],
                        )
                            :
                        Column(
                          children: <Widget>[
                            listStops[counterStops],
                          ],
                        )
                      ],
                    ),
                  ),
                )
              ],
            ),
          );
        }
    );
  }
}
