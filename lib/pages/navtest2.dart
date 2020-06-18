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
  NavDriverTo(this.screenWidth,this.screenHeight,this.screenFont,this.token,this.toFrom,this.type,this.tripId,this.homeLongitude,this.homeLatitude,this.orgName,this.orgLatitude,this.orgLongitude,this.numberRiders,this.driverLongitude,this.driverLatitude,this.riders,this.initialLatitude,this.initialLongitude);
  @override
  _NavDriverToState createState() => _NavDriverToState();
}

class _NavDriverToState extends State<NavDriverTo> {
  int driverid=0;
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
  List<List<ltlng.LatLng>> listDistances=[];
  List listTime=[];
  List<RiderForDriver> riderObjs;
  //////////////////////////////////////////////////////////////////////////////
  Future<String> initializations() async{
    print("First step retrieve id");
    String url="http://3.81.22.120:3000/api/retrieveuserdata";
    Response response =await post(url, headers:{'authorization': widget.token});
    if(response.statusCode != 200)
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle("User error"),
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
    else{
      Map data= jsonDecode(response.body);
      Map userInfo = data['decoded'];
      driverid = userInfo['id'];
    }
    print("Driver id.");
    ////////////////////////////////////////////////////////////////////////////
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
    origin= LatLng(widget.initialLatitude,widget.initialLongitude);
    originDistance= ltlng.LatLng(widget.initialLatitude,widget.initialLongitude);
    destination= LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
    destinationDistance= ltlng.LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
    listDistances[0].add(originDistance);
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
  updateloc() {
    print("Update loc.");
    BackgroundLocation.startLocationService();
    BackgroundLocation.getLocationUpdates((location)async {
      print("Start background loc.");
      origin= await LatLng(location.latitude,location.longitude);
      originDistance= ltlng.LatLng(location.latitude,location.longitude);
      for(int i=0; i<counterStops; i++)
      {
        listDistances[i].add(originDistance);
      }
      destination= LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
      destinationDistance= ltlng.LatLng(stopsLatLng[counterStops].latitude,stopsLatLng[counterStops].longitude);
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
      print("Arrived or not.");
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
  void startRide() async{
    DateTime arrivalTime=DateTime.now();
    String actualpickuptime= DateFormat('Hms').format(arrivalTime);
    listTime.add(
        arrivalTime
    );
    Map<String,String> body = {
      'tripid' : widget.tripId.toString(),
      'driverid' : driverid.toString(),
      'riderid' : riderObjs[counterStops].id.toString(),
      'actualpickuptime': actualpickuptime,
    };
    String url="http://3.81.22.120:3000/api/startRiderTripTo";
    Response response =await post(url, body: body);
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
    setState(() {
      counterStops++;
    });
  }
  //////////////////////////////////////////////////////////////////////////////
  void end() async{
    endTime= DateTime.now();
    String actualarrivaltime= DateFormat('Hms').format(endTime);
    var diffTime = endTime.difference(listTime[0]).inMinutes;
    print("Total time: "+ diffTime.toString());
    double meters=0;
    double kilometers=0;
    for(int j=1; j<listDistances[0].length; j++)
    {
      meters += distance.as(ltlng.LengthUnit.Meter,
          listDistances[0][j],listDistances[0][j-1]);
    }
    kilometers=meters/1000;
    //end driver:
    Map<String,String> body = {
      'tripid' : widget.tripId.toString(),
      'time' : diffTime.toString(),
      'distance' : kilometers.toString(),
      'actualarrivaltime': actualarrivaltime,
      'latitude': listDistances[0][listDistances.length-1].latitude.toString(),
      'longitude': listDistances[0][listDistances.length-1].longitude.toString(),
    };
    String url="http://3.81.22.120:3000/api/endDriverTripTo";
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
    //////////////////////////////////
    for(int i=1; i<listTime.length;i++)
    {
      var diffTime = endTime.difference(listTime[i]).inMinutes;
      print("Total time: "+ diffTime.toString());
      double meters=0;
      double kilometers=0;
      for(int j=1; j<listDistances[i].length; j++)
      {
        meters += distance.as(ltlng.LengthUnit.Meter,
            listDistances[i][j],listDistances[i][j-1]);
      }
      kilometers=meters/1000;
      //end rider:
      Map<String,String> body = {
        'tripid' : widget.tripId.toString(),
        'driverid': driverid.toString(),
        'riderid': riderObjs[i-1].id.toString(),
        'time' : diffTime.toString(),
        'distance' : kilometers.toString(),
        'actualarrivaltime': actualarrivaltime,
        'latitude': listDistances[0][listDistances.length-1].latitude.toString(),
        'longitude': listDistances[0][listDistances.length-1].longitude.toString(),
      };
      String url="http://3.81.22.120:3000/api/endRiderTripTo";
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
    }
    BackgroundLocation.stopLocationService();
  }
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
                    end();
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
