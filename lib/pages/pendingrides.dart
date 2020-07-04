import 'dart:convert';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/pastride.dart';
import 'package:flashy_tab_bar/flashy_tab_bar.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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

class Request{
  String toFrom="";
  int tripId=0;
  String toLongitude="";
  String toLatitude="";
  String fromLongitude="";
  String fromLatitude="";
  String orgName="";
  String orgLatitude="";
  String orgLongitude="";
  String arrivalTime="";
  String departureTime="";
  String date="";
  String ridewith="";
  String smoking="";
  String earliesttime="";
  String latesttime="";
  Request(this.toFrom,this.tripId,this.toLatitude,this.toLongitude,this.fromLatitude,this.fromLongitude,this.orgName,this.orgLatitude,this.orgLongitude,this.departureTime,this.arrivalTime,this.date,this.ridewith,this.smoking,this.earliesttime,this.latesttime);
  factory Request.fromJson(dynamic json) {
    return Request(
      json['tofrom'] as String,
      json['id'] as int,
      json['tolatitude'] as String,
      json['tolongitude'] as String,
      json['fromlatitude'] as String,
      json['fromlongitude'] as String,
      json['orgname'] as String,
      json['orglatitude'] as String,
      json['orglongitude'] as String,
      json['departuretime'] as String,
      json['arrivaltime'] as String,
      json['date'] as String,
      json['ridewith'] as String,
      json['smoking'] as String,
      json['earliesttime'] as String,
      json['latesttime'] as String,
    );
  }
}

class Offer{
  String toFrom="";
  int tripId=0;
  String toLongitude="";
  String toLatitude="";
  String fromLongitude="";
  String fromLatitude="";
  String orgName="";
  String orgLatitude="";
  String orgLongitude="";
  String arrivalTime="";
  String departureTime="";
  String date="";
  String ridewith="";
  String smoking="";
  String earliesttime="";
  String latesttime="";
  String carModel="";
  String carBrand="";
  int carYear=0;
  String carColor="";
  String carType="";
  String carPlateLetters="";
  String carPlateNumbers="";
  Offer(this.carModel,this.carBrand,this.carYear,this.carType,this.carColor,this.carPlateLetters, this.carPlateNumbers,this.toFrom,this.tripId,this.toLatitude,this.toLongitude,this.fromLatitude,this.fromLongitude,this.orgName,this.orgLatitude,this.orgLongitude,this.departureTime,this.arrivalTime,this.date,this.ridewith,this.smoking,this.earliesttime,this.latesttime);
  factory Offer.fromJson(dynamic json) {
    return Offer(
      json['carModel'] as String,
      json['carBrand'] as String,
      json['carYear'] as int,
      json['carType'] as String,
      json['carColor'] as String,
      json['carPlateletters'] as String,
      json['carPlatenumbers'] as String,
      json['tofrom'] as String,
      json['id'] as int,
      json['tolatitude'] as String,
      json['tolongitude'] as String,
      json['fromlatitude'] as String,
      json['fromlongitude'] as String,
      json['orgname'] as String,
      json['orglatitude'] as String,
      json['orglongitude'] as String,
      json['departuretime'] as String,
      json['arrivaltime'] as String,
      json['date'] as String,
      json['ridewith'] as String,
      json['smoking'] as String,
      json['earliesttime'] as String,
      json['latesttime'] as String,
    );
  }
}


class PendingRides extends StatefulWidget with NavigationStates{
  @override
  _PendingRidesState createState() => _PendingRidesState();
}

class _PendingRidesState extends State<PendingRides> {
  List<GestureDetector> listRequests=[];
  List<GestureDetector> listOffers=[];
  int noRequests=0;
  int noOffers=0;
  String token="";
  int _selectedIndex = 0;
  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;
    double screenFont= MediaQuery.of(context).textScaleFactor;
    Future<String> getData() async{
      SharedPreferences prefs = await SharedPreferences.getInstance();
      token = await (prefs.getString('token')??'');
      String url="http://3.81.22.120:3000/api/showrequests";
      Response response =await post(url, headers:{'authorization': token});
      if(response.statusCode==409)
      {
        noRequests=1;
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
        noRequests=0;
        listRequests=[];
        List<Request> requestObjects=[];
        Map data= jsonDecode(response.body);
        var rideObjectsJson = data['Requests'] as List;
        requestObjects= rideObjectsJson.map((rideJson) => Request.fromJson(rideJson)).toList();

          for(int i=0; i<requestObjects.length; i++)
          {
            String dateride= DateFormat('dd-MM-yyyy').format(DateTime.parse(requestObjects[i].date)).toString();
            String tofromorg="";
            if(requestObjects[i].toFrom=="to")
            {
              tofromorg="To: ";
            }
            else
            {
              tofromorg="From: ";
            }
            listRequests.add(
              GestureDetector(
                onTap: () async{
                  showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return RichAlertDialog(
                          alertTitle: richTitle("Cancel request"),
                          alertSubtitle: richSubtitle("Are you sure you want to cancel request?"),
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
                              child: Text('Yes', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                              borderSide: BorderSide(
                                  color: Colors.indigo[400], style: BorderStyle.solid,
                                  width: 1),
                              onPressed: () async{
                                String url="http://3.81.22.120:3000/api/cancelrequest";
                                Map<String,String> body={
                                  "tofrom": requestObjects[i].toFrom,
                                  "requestid": requestObjects[i].tripId.toString(),
                                };
                                Response response =await post(url, headers:{'authorization': token},body:body);
                                if(response.statusCode != 200)
                                {
                                  Map data= jsonDecode(response.body);
                                  showDialog(
                                      context: context,
                                      builder: (BuildContext context) {
                                        return RichAlertDialog(
                                          alertTitle: richTitle("User error"),
                                          alertSubtitle: Text(data['message'], maxLines: 1, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
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
                                  Navigator.pop(context);
                                }
                                else{
                                  Navigator.pop(context);
                                  showDialog(
                                      context: context,
                                      builder: (BuildContext context) {
                                        return RichAlertDialog(
                                          alertTitle: richTitle("Done"),
                                          alertSubtitle: richSubtitle("Request is cancelled successfully"),
                                          alertType: RichAlertType.SUCCESS,
                                          dialogIcon: Icon(
                                            Icons.check,
                                            color: Colors.green,
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
                                                setState(() {
                                                });
                                                },
                                            ),
                                          ],
                                        );
                                      });
                                }
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
                            AutoSizeText(
                              "Request ride",
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
                                  requestObjects[i].orgName,
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
                                              position: LatLng(double.parse(requestObjects[i].orgLatitude), double.parse(requestObjects[i].orgLongitude))));
                                          return Scaffold(
                                              body: GoogleMap(
                                                initialCameraPosition: CameraPosition(
                                                  target: LatLng(double.parse(requestObjects[i].orgLatitude), double.parse(requestObjects[i].orgLongitude)),
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
                                    requestObjects[i].toFrom=="to"?"Earliest time: " :"Latest time: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    requestObjects[i].toFrom=="to"? requestObjects[i].earliesttime : requestObjects[i].latesttime,
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
                                    requestObjects[i].toFrom=="to"?"Arrival time: " :"Departure time: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    requestObjects[i].toFrom=="to"? requestObjects[i].arrivalTime : requestObjects[i].departureTime,
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
                                    "Ride with: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    requestObjects[i].ridewith,
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
                                    "Smoking: ",
                                    textScaleFactor: screenFont,
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                    ),
                                    minFontSize: 2,
                                    maxLines: 1,
                                  ),
                                  AutoSizeText(
                                    requestObjects[i].smoking,
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
      String urlOffer="http://3.81.22.120:3000/api/showoffers";
      Response responseOffer =await post(urlOffer, headers:{'authorization': token});
      if(responseOffer.statusCode==409)
      {
        noOffers=1;
      }
      else if(responseOffer.statusCode != 200)
      {
        Map data= jsonDecode(responseOffer.body);
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
        noOffers=0;
        listOffers=[];
        Map data= jsonDecode(responseOffer.body);
        var rideObjectsJson = data['Offers'] as List;
        List<Offer> offerObjects = rideObjectsJson.map((rideJson) => Offer.fromJson(rideJson)).toList();
        for(int i=0; i<offerObjects.length; i++)
        {
          String dateride= DateFormat('dd-MM-yyyy').format(DateTime.parse(offerObjects[i].date)).toString();
          String tofromorg="";
          String cardetails = offerObjects[i].carColor; //car color
          cardetails = cardetails + " ";
          cardetails = cardetails + offerObjects[i].carBrand;
          cardetails = cardetails + " ";
          cardetails = cardetails + offerObjects[i].carModel;
          String carextradetails = offerObjects[i].carType;
          carextradetails = carextradetails + " - ";
          carextradetails = carextradetails + offerObjects[i].carYear.toString();
          String plate = offerObjects[i].carPlateLetters;
          plate = plate + " | ";
          plate = plate + offerObjects[i].carPlateNumbers.toString();
          if(offerObjects[i].toFrom=="to")
          {
            tofromorg="To: ";
          }
          else
          {
            tofromorg="From: ";
          }
          listOffers.add(
            GestureDetector(
              onTap: () async{
                showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return RichAlertDialog(
                        alertTitle: richTitle("Cancel offer"),
                        alertSubtitle: richSubtitle("Are you sure you want to cancel offer?"),
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
                            child: Text('Yes', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                            borderSide: BorderSide(
                                color: Colors.indigo[400], style: BorderStyle.solid,
                                width: 1),
                            onPressed: () async{
                              String url="http://3.81.22.120:3000/api/canceloffer";
                              Map<String,String> body={
                                "tofrom": offerObjects[i].toFrom,
                                "offerid": offerObjects[i].tripId.toString(),
                              };
                              Response response =await post(url, headers:{'authorization': token},body:body);
                              if(response.statusCode != 200)
                              {
                                Map data= jsonDecode(response.body);
                                showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return RichAlertDialog(
                                        alertTitle: richTitle("User error"),
                                        alertSubtitle: Text(data['message'], maxLines: 1, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
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
                                Navigator.pop(context);
                              }
                              else{
                                Navigator.pop(context);
                                showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return RichAlertDialog(
                                        alertTitle: richTitle("Done"),
                                        alertSubtitle: richSubtitle("Offer is cancelled successfully"),
                                        alertType: RichAlertType.SUCCESS,
                                        dialogIcon: Icon(
                                          Icons.check,
                                          color: Colors.green,
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
                                              setState(() {
                                              });
                                              },
                                          ),
                                        ],
                                      );
                                    });
                              }
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
                          AutoSizeText(
                            "Offer ride",
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
                                offerObjects[i].orgName,
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
                                            position: LatLng(double.parse(offerObjects[i].orgLatitude), double.parse(offerObjects[i].orgLongitude))));
                                        return Scaffold(
                                            body: GoogleMap(
                                              initialCameraPosition: CameraPosition(
                                                target: LatLng(double.parse(offerObjects[i].orgLatitude), double.parse(offerObjects[i].orgLongitude)),
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
                                  offerObjects[i].toFrom=="to"?"Earliest time: " :"Latest time: ",
                                  textScaleFactor: screenFont,
                                  style: TextStyle(
                                    color: Colors.indigo[400],
                                  ),
                                  minFontSize: 2,
                                  maxLines: 1,
                                ),
                                AutoSizeText(
                                  offerObjects[i].toFrom=="to"? offerObjects[i].earliesttime : offerObjects[i].latesttime,
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
                                  offerObjects[i].toFrom=="to"?"Arrival time: " :"Departure time: ",
                                  textScaleFactor: screenFont,
                                  style: TextStyle(
                                    color: Colors.indigo[400],
                                  ),
                                  minFontSize: 2,
                                  maxLines: 1,
                                ),
                                AutoSizeText(
                                  offerObjects[i].toFrom=="to"? offerObjects[i].arrivalTime : offerObjects[i].departureTime,
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
                                  "Ride with: ",
                                  textScaleFactor: screenFont,
                                  style: TextStyle(
                                    color: Colors.indigo[400],
                                  ),
                                  minFontSize: 2,
                                  maxLines: 1,
                                ),
                                AutoSizeText(
                                  offerObjects[i].ridewith,
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
                                  "Smoking: ",
                                  textScaleFactor: screenFont,
                                  style: TextStyle(
                                    color: Colors.indigo[400],
                                  ),
                                  minFontSize: 2,
                                  maxLines: 1,
                                ),
                                AutoSizeText(
                                  offerObjects[i].smoking,
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
      return null;
    }

    final tabs=[
      Padding(
        padding: const EdgeInsets.fromLTRB(30, 0, 30, 0),
        child: Container(
          child: noOffers == 1 ? Center(child: AutoSizeText("No offers to show yet.",style: TextStyle(color: Colors.indigo, fontSize: 20,),maxLines: 1,minFontSize: 2,)) :
          Column(
            children: <Widget>[
              SizedBox(
                height: 20,
              ),
              AutoSizeText(
                "Tap to cancel Offer.",
                style: TextStyle(
                  color: Colors.blueGrey,
                  fontSize: 15,
                ),
                minFontSize: 2,
                maxLines: 1,
              ),
              Expanded(
                child: ListView(
                  children: listOffers,
                ),
              ),
            ],
          ),
        ),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(30, 0, 30, 0),
        child: Container(
          child: noRequests == 1 ? Center(child: AutoSizeText("No requests to show yet.",style: TextStyle(color: Colors.indigo, fontSize: 20,),maxLines: 1,minFontSize: 2,)) :
          Column(
            children: <Widget>[
              SizedBox(
                height: 20,
              ),
              AutoSizeText(
                "Tap to cancel Request.",
                style: TextStyle(
                  color: Colors.blueGrey,
                  fontSize: 15,
                ),
                minFontSize: 2,
                maxLines: 1,
              ),
              Expanded(
                child: ListView(
                  children: listRequests,
                ),
              ),
            ],
          ),
        ),
      ),
    ];
    return FutureBuilder(
        future: getData(),
        builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
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
                        padding: const EdgeInsets.fromLTRB(10.0, 10, 10, 0),
                        child: Container(
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.only(
                                  topLeft: Radius.circular(30),
                                  topRight: Radius.circular(30))
                          ),
                          child: Scaffold(
                            bottomNavigationBar: FlashyTabBar(
                              animationCurve: Curves.linear,
                              selectedIndex: _selectedIndex,
                              showElevation: true,
                              // use this to remove appBar's elevation
                              onItemSelected: (index) =>
                                  setState(() {
                                    _selectedIndex = index;
                                  }),
                              items: [
                                FlashyTabBarItem(
                                  icon: Icon(Icons.time_to_leave),
                                  title: Text('Pending Offers', style: TextStyle(
                                      fontSize: 11, color: Colors.indigo[400]),),
                                ),
                                FlashyTabBarItem(
                                  icon: Icon(Icons.time_to_leave),
                                  title: Text('Pending Requests', style: TextStyle(
                                      fontSize: 11, color: Colors.indigo[400]),),
                                ),
                              ],
                            ),
                            body: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: tabs[_selectedIndex],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }
          else {
            return Container(
                child:Center(
                  child: GlowingProgressIndicator(
                    child: Image.asset("images/bluelogonobg.png", width: 150, height: 150,),
                  ),
                )
            );
          }
        }
    );
  }
}
