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

class TrackingTo extends StatefulWidget {
  String drivergender="";
  String driverfirstname="";
  String driverlastname="";
  String driverphonenumber="";
  String driverrating="";
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
  TrackingTo(this.driverid,this.driverfirstname,this.driverlastname,this.drivergender,this.driverphonenumber,this.driverrating,this.screenWidth,this.screenHeight,this.screenFont,this.token,this.toFrom,this.type,this.tripId,this.homeLongitude,this.homeLatitude,this.orgName,this.orgLatitude,this.orgLongitude,this.numberRiders,this.driverLongitude,this.driverLatitude,this.riders,this.initialLatitude,this.initialLongitude);
  @override
  _TrackingToState createState() => _TrackingToState();
}

class _TrackingToState extends State<TrackingTo> {
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
  List<List<ltlng.LatLng>> listDistances= new List.generate(10, (i) => []);
  List<DateTime> listTime= [];
  Timer timer;
  //////////////////////////////////////////////////////////////////////////////
  @override
  void initState() {
    print("hi");
    super.initState();
    BitmapDescriptor.fromAssetImage(
        ImageConfiguration(devicePixelRatio: 2.5),
        'images/marker.png').then((onValue) {
      pinLocationIcon = onValue;
    });
    timer = Timer.periodic(Duration(seconds: 1), (Timer t) => updateloc());
  }

  Future<String> getlocation() async{
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
                      widget.drivergender=="female"? "images/avatarfemale.png" : "images/avatarmale.png",
                      height:widget.screenHeight/20,
                      width: widget.screenWidth/8,),
                  ),
                  Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          AutoSizeText(widget.driverfirstname+" "+widget.driverlastname+"  ", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: widget.screenFont*1.1,),
                          AutoSizeText(getDisplayRating(double.parse(widget.driverrating)), maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: widget.screenFont,),
                          Icon(
                            Icons.star,
                            color: Colors.grey[500],
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.grey[400],
                        indent: 3,
                        endIndent: 3,
                      ),
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
                              alertTitle: richTitle("Call driver"),
                              alertSubtitle: richSubtitle("Call "+widget.driverphonenumber+"?"),
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
                                    _launchCaller(widget.driverphonenumber);
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
    Map<String,String> body={
      "driverid" : widget.driverid.toString(),
      "tripid" : widget.tripId.toString()
    };
    String url="http://3.81.22.120:3000/api/gettrackinglocation";
    Response response =await post(url, body: body, headers:{'authorization': widget.token});
    if(response.statusCode == 400)
    {
      timer.cancel();
      Navigator.pop(context);
      Navigator.pop(context);
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
      Map data= jsonDecode(response.body);
      var trackingJson = data['data'] as List;
      setState(() {
        markerLatitude=double.parse(trackingJson[0]['latitude']);
        markerLongitude=double.parse(trackingJson[0]['longitude']);
      });
    }
    origin= LatLng(markerLatitude,markerLongitude);
    originDistance= ltlng.LatLng(markerLatitude,markerLongitude);
    destination= LatLng(double.parse(widget.orgLatitude),double.parse(widget.orgLongitude));
    destinationDistance= ltlng.LatLng(double.parse(widget.orgLatitude),double.parse(widget.orgLongitude));
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
    print("Arrived: "+ arrived.toString());
    return null;
  }

  updateloc() async{
    Map<String,String> body={
      "driverid" : widget.driverid.toString(),
      "tripid" : widget.tripId.toString()
    };
    String url="http://3.81.22.120:3000/api/gettrackinglocation";
    Response response =await post(url, body: body, headers:{'authorization': widget.token});
    if(response.statusCode != 200)
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
      Map data= jsonDecode(response.body);
      var trackingJson = data['data'] as List;
      setState(() {
        markerLatitude=double.parse(trackingJson[0]['latitude']);
        markerLongitude=double.parse(trackingJson[0]['longitude']);
      });
    }
    origin= LatLng(markerLatitude,markerLongitude);
    originDistance= ltlng.LatLng(markerLatitude,markerLongitude);
    destination= LatLng(double.parse(widget.orgLatitude),double.parse(widget.orgLongitude));
    destinationDistance= ltlng.LatLng(double.parse(widget.orgLatitude),double.parse(widget.orgLongitude));
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
    CameraPosition cameraPositionNew= CameraPosition(
      target: LatLng(markerLatitude , markerLongitude),
      zoom: 18,
    );
    final GoogleMapController controller = await _controller.future;
    controller.animateCamera(CameraUpdate.newCameraPosition(cameraPositionNew));
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
                        Column(
                          children: <Widget>[
                            listStops[counterStops],
                            arrived== true ?
                            MaterialButton(
                              child: Text("Arrived! Go back.",
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
                                timer.cancel();
                                Navigator.pop(context);
                                Navigator.pop(context);
                              },
                            )
                                :
                            MaterialButton(
                              child: Text("Go back.",
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
                                timer.cancel();
                                Navigator.pop(context);
                                Navigator.pop(context);
                              },
                            )
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
