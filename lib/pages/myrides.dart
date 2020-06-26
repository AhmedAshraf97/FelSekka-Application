import 'dart:convert';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/pastride.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'AnimatedPage Route.dart';


String getDisplayRating(double rating) {
  rating = rating.abs();
  final str = rating.toStringAsFixed(rating.truncateToDouble() ==rating ? 0 : 2);
  if (str == '0') return '0';
  if (str.endsWith('.0')) return str.substring(0, str.length - 2);
  if (str.endsWith('0')) return str.substring(0, str.length -1);
  return str;
}

class RideRider{
  String toFrom="";
  String type="";
  int tripId=0;
  String carModel="";
  String carBrand="";
  int carYear=0;
  String carColor="";
  String carType="";
  String carPlateLetters="";
  String carPlateNumbers="";
  String homeLongitude="";
  String homeLatitude="";
  String orgName="";
  String orgLatitude="";
  String orgLongitude="";
  String pickupTime="";
  String arrivalTime="";
  String date="";
  String fare="";
  int numberRiders=0;
  int driverId=0;
  String driverUsername="";
  String driverFirstName="";
  String driverLastName="";
  String driverPhoneNumber="";
  String driverGender="";
  String driverRating="";
  String driverTime="";
  String driverLongitude="";
  String driverLatitude="";
  List riders=[];
  String ridewith="";
  String smoking="";
  RideRider(this.driverId,this.toFrom,this.type,this.tripId,this.carModel,this.carBrand,this.carYear,this.carType,this.carPlateLetters,this.carPlateNumbers,this.homeLongitude,this.homeLatitude,this.orgName,this.orgLatitude,this.orgLongitude,this.pickupTime,this.arrivalTime,this.date,this.fare,this.numberRiders,this.driverUsername,this.driverFirstName,this.driverLastName,this.driverPhoneNumber,this.driverGender,this.driverRating,this.driverTime,this.driverLongitude,this.driverLatitude,this.riders,this.carColor,this.ridewith,this.smoking);
  factory RideRider.fromJson(dynamic json) {
    return RideRider(
      json['Driver']['driverid'] as int,
      json['tofrom'] as String,
      json['type'] as String,
      json['tripid'] as int,
      json['carModel'] as String,
      json['carBrand'] as String,
      json['carYear'] as int,
      json['carType'] as String,
      json['carPlateletters'] as String,
      json['carPlatenumbers'] as String,
      json['homelongitude'] as String,
      json['homelatitude'] as String,
      json['orgname'] as String,
      json['orglatitude'] as String,
      json['orglongitude'] as String,
      json['pickuptime'] as String,
      json['arrivaltime'] as String,
      json['date'] as String,
      json['fare'] as String,
      json['numberRiders'] as int,
      json['Driver']['Driverusername'] as String,
      json['Driver']['Driverfirstname'] as String,
      json['Driver']['Driverlastname'] as String,
      json['Driver']['Driverphonenumber'] as String,
      json['Driver']['DriverGender'] as String,
      json['Driver']['DriverRating'] as String,
      json['Driver']['time'] as String,
      json['Driver']['longitude'] as String,
      json['Driver']['latitude'] as String,
      json['Riders in the trip']['RiderTrip'] as List,
      json['carColor'] as String,
      json['ridewith'] as String,
      json['smoking'] as String,
    );
  }
}


class RideDriver{
  int driverId=0;
  String toFrom="";
  String type="";
  int tripId=0;
  String carModel="";
  String carBrand="";
  int carYear=0;
  String carColor="";
  String carType="";
  String carPlateLetters="";
  String carPlateNumbers="";
  String homeLongitude="";
  String homeLatitude="";
  String orgName="";
  String orgLatitude="";
  String orgLongitude="";
  String pickupTime="";
  String arrivalTime="";
  String date="";
  String fare="";
  int numberRiders=0;
  List riders=[];
  String ridewith="";
  String smoking="";
  RideDriver(this.toFrom,this.type,this.tripId,this.carModel,this.carBrand,this.carYear,this.carType,this.carPlateLetters,this.carPlateNumbers,this.homeLongitude,this.homeLatitude,this.orgName,this.orgLatitude,this.orgLongitude,this.pickupTime,this.arrivalTime,this.date,this.fare,this.numberRiders,this.riders,this.carColor,this.ridewith,this.smoking);
  factory RideDriver.fromJson(dynamic json) {
    return RideDriver(
      json['tofrom'] as String,
      json['type'] as String,
      json['tripid'] as int,
      json['carModel'] as String,
      json['carBrand'] as String,
      json['carYear'] as int,
      json['carType'] as String,
      json['carPlateletters'] as String,
      json['carPlatenumbers'] as String,
      json['homelongitude'] as String,
      json['homelatitude'] as String,
      json['orgname'] as String,
      json['orglatitude'] as String,
      json['orglongitude'] as String,
      json['pickuptime'] as String,
      json['arrivaltime'] as String,
      json['date'] as String,
      json['fare'] as String,
      json['numberRiders'] as int,
      json['Riders in the trip']['RiderTrip'] as List,
      json['carColor'] as String,
      json['ridewith'] as String,
      json['smoking'] as String,
    );
  }
}

class MyRides extends StatefulWidget with NavigationStates{
  @override
  _MyRidesState createState() => _MyRidesState();
}

class _MyRidesState extends State<MyRides> {
  List<GestureDetector> listRides=[];
  int noRides=0;
  String token="";
  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;
    double screenFont= MediaQuery.of(context).textScaleFactor;
    Future<String> builder;
    Future<String> getData() async{
      SharedPreferences prefs = await SharedPreferences.getInstance();
      token = await (prefs.getString('token')??'');
      String url="http://3.81.22.120:3000/api/showpasttrips";
      Response response =await post(url, headers:{'authorization': token});
      if(response.statusCode==409)
      {
        noRides=1;
      }
      else if(response.statusCode != 200)
      {
        Map data= jsonDecode(response.body);
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return RichAlertDialog(
                alertTitle: Text('User error'),
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
        noRides=0;
        listRides=[];
        Map data= jsonDecode(response.body);
        var rideObjectsJson = data['ScheduledTrips'] as List;
        if(rideObjectsJson[0]['type']=="Rider")
        {
          List<RideRider> rideObjects = rideObjectsJson.map((rideJson) => RideRider.fromJson(rideJson)).toList();
          for(int i=0; i<rideObjects.length; i++)
          {
            String dateride= DateFormat('dd-MM-yyyy').format(DateTime.parse(rideObjects[i].date)).toString();
            String tofromorg="";
            String cardetails = rideObjects[i].carColor; //car color
            cardetails = cardetails + " ";
            cardetails = cardetails + rideObjects[i].carBrand;
            cardetails = cardetails + " ";
            cardetails = cardetails + rideObjects[i].carModel;
            String carextradetails = rideObjects[i].carType;
            carextradetails = carextradetails + " - ";
            carextradetails = carextradetails + rideObjects[i].carYear.toString();
            String plate = rideObjects[i].carPlateLetters;
            plate = plate + " | ";
            plate = plate + rideObjects[i].carPlateNumbers.toString();
            if(rideObjects[i].toFrom=="to")
            {
              tofromorg="To: ";
            }
            else
            {
              tofromorg="From: ";
            }
            listRides.add(
              GestureDetector(
                onTap: (){
                  Navigator.push(context, AnimatedPageRoute(widget: PastRides(rideObjects[i].driverId,rideObjects[i].toFrom,rideObjects[i].type,rideObjects[i].tripId,rideObjects[i].carModel,rideObjects[i].carBrand,rideObjects[i].carYear,rideObjects[i].carType,rideObjects[i].carPlateLetters,rideObjects[i].carPlateNumbers,rideObjects[i].homeLongitude,rideObjects[i].homeLatitude,rideObjects[i].orgName,rideObjects[i].orgLatitude,rideObjects[i].orgLongitude,rideObjects[i].pickupTime,rideObjects[i].arrivalTime,rideObjects[i].date,rideObjects[i].fare,rideObjects[i].numberRiders,rideObjects[i].driverUsername,rideObjects[i].driverFirstName,rideObjects[i].driverLastName,rideObjects[i].driverPhoneNumber,rideObjects[i].driverGender,rideObjects[i].driverRating,rideObjects[i].driverTime,rideObjects[i].driverLongitude,rideObjects[i].driverLatitude,rideObjects[i].riders,rideObjects[i].carColor,rideObjects[i].ridewith,rideObjects[i].smoking)));
                },
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(0,8,0,8),
                  child: Card(
                    elevation: 15,
                    color: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: Column(
                      children: <Widget>[
                        SizedBox(
                          height: 5,
                        ),
                        Column(
                          children: <Widget>[
                            Image.asset(
                              "images/rider.png",
                              height: screenHeight/13,
                              width: screenWidth/5,
                            ),
                            SizedBox(
                              height: screenHeight/40,
                            ),
                            AutoSizeText(
                              "Rider",
                              textScaleFactor: screenFont,
                              style: TextStyle(
                                color: Colors.indigo[400],
                                fontWeight: FontWeight.bold,
                              ),
                              minFontSize: 2,
                              maxLines: 1,
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: <Widget>[
                                AutoSizeText(
                                  tofromorg,
                                  textScaleFactor: screenFont*1.2,
                                  style: TextStyle(
                                    color: Colors.indigo[400],
                                  ),
                                  minFontSize: 2,
                                  maxLines: 1,
                                ),
                                AutoSizeText(
                                  rideObjects[i].orgName,
                                  textScaleFactor: screenFont*1.1,
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                  ),
                                  minFontSize: 2,
                                  maxLines: 1,
                                ),
                                IconButton(
                                  alignment: Alignment.center,
                                  splashColor: Colors.grey,
                                  icon: Icon(
                                    Icons.location_on,
                                    color:Colors.red[300],
                                    size: screenWidth/24,
                                  ),
                                  onPressed: (){
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) {
                                          List<Marker> allMarkers = [];
                                          allMarkers.add(Marker(
                                              markerId: MarkerId('myMarker'),
                                              draggable: true,
                                              onTap: () {
                                                print('Marker Tapped');
                                              },
                                              position: LatLng(double.parse(rideObjects[i].orgLatitude), double.parse(rideObjects[i].orgLongitude))));
                                          return Scaffold(
                                              body: GoogleMap(
                                                initialCameraPosition: CameraPosition(
                                                  target: LatLng(double.parse(rideObjects[i].orgLatitude), double.parse(rideObjects[i].orgLongitude)),
                                                  zoom: 16,
                                                ),
                                                markers: Set.from(allMarkers),
                                              ),
                                              floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
                                              floatingActionButton: new FloatingActionButton(
                                                  elevation: 0.0,
                                                  child: new Icon(Icons.close),
                                                  backgroundColor: Colors.indigo[400],
                                                  onPressed: (){
                                                    Navigator.pop(context);
                                                  }
                                              )
                                          );
                                        },
                                      ),
                                    );
                                  },
                                ),
                              ],
                            ),
                            Container(
                              height: 1,
                              width: screenWidth/1.5,
                              color: Colors.grey[300],
                            ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.all(10.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  AutoSizeText(
                                    "Date: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    dateride,
                                    textScaleFactor: screenFont*0.9,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 3,
                              ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  AutoSizeText(
                                    "Start time: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    rideObjects[i].pickupTime,
                                    textScaleFactor: screenFont*0.9,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 3,
                              ),
                              Row(
                                children: <Widget>[
                                  AutoSizeText(
                                    "Arrival time: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    rideObjects[i].arrivalTime,
                                    textScaleFactor: screenFont*0.9,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 3,
                              ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  AutoSizeText(
                                    "Fare: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    rideObjects[i].fare+" LE",
                                    textScaleFactor: screenFont*0.9,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 5,
                              ),
                              Container(
                                height: 1,
                                width: screenWidth/2,
                                color: Colors.grey[300],
                              ),
                              SizedBox(
                                height: 5,
                              ),
                              Row(
                                children: <Widget>[
                                  Column(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.start,
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: <Widget>[
                                          AutoSizeText(
                                            cardetails,
                                            textScaleFactor: screenFont*0.9,
                                            style: TextStyle(
                                              color: Colors.grey[600],
                                            ),
                                            minFontSize: 2,
                                            maxLines: 1,
                                          ),
                                        ],
                                      ),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.start,
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: <Widget>[
                                          AutoSizeText(
                                            carextradetails,
                                            textScaleFactor: screenFont*0.9,
                                            style: TextStyle(
                                              color: Colors.grey[600],
                                            ),
                                            minFontSize: 2,
                                            maxLines: 1,
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    width: 5,
                                  ),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Container(
                                        margin: const EdgeInsets.all(5.0),
                                        padding: const EdgeInsets.all(3.0),
                                        decoration: BoxDecoration(
                                            borderRadius:  BorderRadius.all(
                                                Radius.circular(5.0) //
                                            ),
                                            border: Border.all(color: Colors.grey[600])
                                        ),
                                        child: AutoSizeText(
                                          plate,
                                          textScaleFactor: screenFont*1.1,
                                          style: TextStyle(
                                            color: Colors.grey[500],
                                          ),
                                          minFontSize: 2,
                                          maxLines: 1,
                                        ),
                                      )
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }
        }
        else
        {
          listRides=[];
          List<RideDriver> rideDriverObjects = rideObjectsJson.map((rideJson) => RideDriver.fromJson(rideJson)).toList();
          for(int i=0; i<rideDriverObjects.length; i++)
          {
            String dateride= DateFormat('dd-MM-yyyy').format(DateTime.parse(rideDriverObjects[i].date)).toString();
            String tofromorg="";
            String cardetails = rideDriverObjects[i].carColor; //car color
            cardetails = cardetails + " ";
            cardetails = cardetails + rideDriverObjects[i].carBrand;
            cardetails = cardetails + " ";
            cardetails = cardetails + rideDriverObjects[i].carModel;
            String carextradetails = rideDriverObjects[i].carType;
            carextradetails = carextradetails + " - ";
            carextradetails = carextradetails + rideDriverObjects[i].carYear.toString();
            String plate = rideDriverObjects[i].carPlateLetters;
            plate = plate + " | ";
            plate = plate + rideDriverObjects[i].carPlateNumbers.toString();
            if(rideDriverObjects[i].toFrom=="to")
            {
              tofromorg="To: ";
            }
            else
            {
              tofromorg="From: ";
            }
            //Driver
            listRides.add(
              GestureDetector(
                onTap: (){
                  Navigator.push(context, AnimatedPageRoute(widget: PastRides(rideDriverObjects[i].driverId,rideDriverObjects[i].toFrom,rideDriverObjects[i].type,rideDriverObjects[i].tripId,rideDriverObjects[i].carModel,rideDriverObjects[i].carBrand,rideDriverObjects[i].carYear,rideDriverObjects[i].carType,rideDriverObjects[i].carPlateLetters,rideDriverObjects[i].carPlateNumbers,rideDriverObjects[i].homeLongitude,rideDriverObjects[i].homeLatitude,rideDriverObjects[i].orgName,rideDriverObjects[i].orgLatitude,rideDriverObjects[i].orgLongitude,rideDriverObjects[i].pickupTime,rideDriverObjects[i].arrivalTime,rideDriverObjects[i].date,rideDriverObjects[i].fare,rideDriverObjects[i].numberRiders,"","","","","","","","","",rideDriverObjects[i].riders,rideDriverObjects[i].carColor,rideDriverObjects[i].ridewith,rideDriverObjects[i].smoking)));
                },
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(0,8,0,8),
                  child: Card(
                    elevation: 15,
                    color: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15.0),
                    ),
                    child: Column(
                      children: <Widget>[
                        SizedBox(
                          height: 5,
                        ),
                        Column(
                          children: <Widget>[
                            Image.asset(
                              "images/driver.png",
                              height: screenHeight/16,
                              width: screenWidth/5,
                            ),
                            SizedBox(
                              height: 3,
                            ),
                            AutoSizeText(
                              "Driver",
                              textScaleFactor: screenFont,
                              style: TextStyle(
                                color: Colors.indigo[400],
                                fontWeight: FontWeight.bold,
                              ),
                              minFontSize: 2,
                              maxLines: 1,
                            ),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: <Widget>[
                                AutoSizeText(
                                  tofromorg,
                                  textScaleFactor: screenFont*1.2,
                                  style: TextStyle(
                                    color: Colors.indigo[400],
                                  ),
                                  minFontSize: 2,
                                  maxLines: 1,
                                ),
                                AutoSizeText(
                                  rideDriverObjects[i].orgName,
                                  textScaleFactor: screenFont*1.1,
                                  style: TextStyle(
                                    color: Colors.grey[600],
                                  ),
                                  minFontSize: 2,
                                  maxLines: 1,
                                ),
                                IconButton(
                                  alignment: Alignment.center,
                                  splashColor: Colors.grey,
                                  icon: Icon(
                                    Icons.location_on,
                                    color:Colors.red[300],
                                    size: screenWidth/24,
                                  ),
                                  onPressed: (){
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) {
                                          List<Marker> allMarkers = [];
                                          allMarkers.add(Marker(
                                              markerId: MarkerId('myMarker'),
                                              draggable: true,
                                              onTap: () {
                                                print('Marker Tapped');
                                              },
                                              position: LatLng(double.parse(rideDriverObjects[i].orgLatitude), double.parse(rideDriverObjects[i].orgLongitude))));
                                          return Scaffold(
                                              body: GoogleMap(
                                                initialCameraPosition: CameraPosition(
                                                  target: LatLng(double.parse(rideDriverObjects[i].orgLatitude), double.parse(rideDriverObjects[i].orgLongitude)),
                                                  zoom: 16,
                                                ),
                                                markers: Set.from(allMarkers),
                                              ),
                                              floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
                                              floatingActionButton: new FloatingActionButton(
                                                  elevation: 0.0,
                                                  child: new Icon(Icons.close),
                                                  backgroundColor: Colors.indigo[400],
                                                  onPressed: (){
                                                    Navigator.pop(context);
                                                  }
                                              )
                                          );
                                        },
                                      ),
                                    );
                                  },
                                ),
                              ],
                            ),
                            Container(
                              height: 1,
                              width: screenWidth/1.5,
                              color: Colors.grey[300],
                            ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.all(10.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.start,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  AutoSizeText(
                                    "Date: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    dateride,
                                    textScaleFactor: screenFont*0.9,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 3,
                              ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  AutoSizeText(
                                    "Start time: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    rideDriverObjects[i].pickupTime,
                                    textScaleFactor: screenFont*0.9,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 3,
                              ),
                              Row(
                                children: <Widget>[
                                  AutoSizeText(
                                    "Arrival time: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    rideDriverObjects[i].arrivalTime,
                                    textScaleFactor: screenFont*0.9,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 3,
                              ),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.start,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  AutoSizeText(
                                    "Fare: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    rideDriverObjects[i].fare+" LE",
                                    textScaleFactor: screenFont*0.9,
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                ],
                              ),
                              SizedBox(
                                height: 5,
                              ),
                              Container(
                                height: 1,
                                width: screenWidth/1.5,
                                color: Colors.grey[300],
                              ),
                              SizedBox(
                                height: 5,
                              ),
                              Row(
                                children: <Widget>[
                                  Column(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.start,
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: <Widget>[
                                          AutoSizeText(
                                            cardetails,
                                            textScaleFactor: screenFont*0.9,
                                            style: TextStyle(
                                              color: Colors.grey[600],
                                            ),
                                            minFontSize: 2,
                                            maxLines: 1,
                                          ),
                                        ],
                                      ),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.start,
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: <Widget>[
                                          AutoSizeText(
                                            carextradetails,
                                            textScaleFactor: screenFont*0.9,
                                            style: TextStyle(
                                              color: Colors.grey[600],
                                            ),
                                            minFontSize: 2,
                                            maxLines: 1,
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  SizedBox(
                                    width: 5,
                                  ),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Container(
                                        margin: const EdgeInsets.all(5.0),
                                        padding: const EdgeInsets.all(3.0),
                                        decoration: BoxDecoration(
                                            borderRadius:  BorderRadius.all(
                                                Radius.circular(5.0) //
                                            ),
                                            border: Border.all(color: Colors.grey[600])
                                        ),
                                        child: AutoSizeText(
                                          plate,
                                          textScaleFactor: screenFont*1.1,
                                          style: TextStyle(
                                            color: Colors.grey[500],
                                          ),
                                          minFontSize: 2,
                                          maxLines: 1,
                                        ),
                                      )
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }
        }
      }
      builder=null;
      return null;
    }
    return FutureBuilder(
        future: getData(),
        builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
          if(snapshot.connectionState == ConnectionState.done)
          {
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
                        padding: const EdgeInsets.fromLTRB(10,10,10,10),
                        child: Container(
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.all(Radius.circular(30))
                          ),
                          child: Column(
                            children: <Widget>[
                              Expanded(
                                child: noRides == 1 ?
                                Center(
                                  child: AutoSizeText(
                                    "No rides to show yet.",
                                    minFontSize: 2,
                                    maxLines: 1,
                                    textScaleFactor: screenFont*1.5,
                                    style: TextStyle(
                                        color: Colors.grey[500]
                                    ),
                                  ),
                                )
                                    :
                                Scrollbar(
                                  child: Padding(
                                    padding: EdgeInsets.fromLTRB(screenWidth/10,screenHeight/35,screenWidth/10,screenHeight/35),
                                    child: Column(
                                      children: <Widget>[
                                        AutoSizeText(
                                          "My Rides",
                                          minFontSize: 2,
                                          maxLines: 1,
                                          textScaleFactor: screenFont*1.5,
                                          style: TextStyle(
                                              color: Colors.indigo[400]
                                          ),
                                        ),
                                        Expanded(
                                          child: ListView(
                                            children: listRides,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }
          else
          {
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
                                child: Image.asset("images/bluelogonobg.png", width: screenWidth/3, height: screenHeight/5,),
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
