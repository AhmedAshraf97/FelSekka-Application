import 'dart:convert';

import 'package:auto_size_text/auto_size_text.dart';
import 'package:felsekka/pages/AnimatedPage%20Route.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/otherprofile.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';


String getDisplayRating(double rating) {
  rating = rating.abs();
  final str = rating.toStringAsFixed(rating.truncateToDouble() ==rating ? 0 : 2);
  if (str == '0') return '0';
  if (str.endsWith('.0')) return str.substring(0, str.length - 2);
  if (str.endsWith('0')) return str.substring(0, str.length -1);
  return str;
}

class RiderForRider{
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
  RiderForRider(this.id,this.username,this.firstname,this.lastname,this.phonenumber,this.rating,this.gender,this.latitude,this.longitude,this.time);
  factory RiderForRider.fromJson(dynamic json) {
    return RiderForRider(json['id'] as int,json['username'] as String, json['firstname'] as String,json['lastname'] as String, json['phonenumber'] as String,json['rating'] as String, json['gender'] as String,json['latitude'] as String, json['longitude'] as String, json['time'] as String);
  }
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


class PastRides extends StatefulWidget with NavigationStates{
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
  String driverUsername="";
  String driverFirstName="";
  String driverLastName="";
  String driverPhoneNumber="";
  String driverGender="";
  String driverRating="";
  String driverTime="";
  String driverLongitude="";
  String driverLatitude="";
  int driverId=0;
  List riders=[];
  String ridewith="";
  String smoking="";
  PastRides(this.driverId,this.toFrom,this.type,this.tripId,this.carModel,this.carBrand,this.carYear,this.carType,this.carPlateLetters,this.carPlateNumbers,this.homeLongitude,this.homeLatitude,this.orgName,this.orgLatitude,this.orgLongitude,this.pickupTime,this.arrivalTime,this.date,this.fare,this.numberRiders,this.driverUsername,this.driverFirstName,this.driverLastName,this.driverPhoneNumber,this.driverGender,this.driverRating,this.driverTime,this.driverLongitude,this.driverLatitude,this.riders,this.carColor,this.ridewith,this.smoking);
  @override
  _PastRidesState createState() => _PastRidesState();
}

class _PastRidesState extends State<PastRides> {
  var arrived= false;
  List<GestureDetector> listRides=[];
  int noRides=0;
  String token="";

  @override
  Widget build(BuildContext context) {
    _launchCaller(String phonenumber) async {
      var url = "tel:"+ phonenumber;
      if (await canLaunch(url)) {
        await launch(url);
      } else {
        throw 'Could not launch $url';
      }
    }
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;
    double screenFont= MediaQuery.of(context).textScaleFactor;
    String cardetails = widget.carColor; //car color
    cardetails = cardetails + " ";
    cardetails = cardetails + widget.carBrand;
    cardetails = cardetails + " ";
    cardetails = cardetails + widget.carModel;
    String carextradetails = widget.carType;
    carextradetails = carextradetails + " - ";
    carextradetails = carextradetails + widget.carYear.toString();
    String plate = widget.carPlateLetters;
    plate = plate + " | ";
    plate = plate + widget.carPlateNumbers.toString();
    List<GestureDetector> listRiders=[];
    String driverAddress="";
    Future<String> getData() async {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      token = await (prefs.getString('token')??'');
      if(widget.type=="Rider")
      {
        //List riders
        listRiders=[];
        var riderObjsJson = widget.riders as List;
        List<RiderForRider> riderObjs = riderObjsJson.map((riderJson) => RiderForRider.fromJson(riderJson)).toList();
        for(int i=0; i<riderObjs.length; i++)
        {
          String riderAddress="";
          String review="";
          double rating=0;
          int trust12=0;
          int trust21=0;
          // Review:
          String urlReview="http://3.81.22.120:3000/api/showReview";
          Map<String,String> body={
            "username" : riderObjs[i].username,
            "tripid" : widget.tripId.toString()
          };
          Response responseReview =await post(urlReview, headers:{'authorization': token}, body: body);
          if(responseReview.statusCode==409)
          {
            review="";
          }
          else if(responseReview.statusCode != 200)
          {
            Map data= jsonDecode(responseReview.body);
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return RichAlertDialog(
                    alertTitle: richTitle('User error'),
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
          }
          else{
            Map data= jsonDecode(responseReview.body);
            review= data['review'];
          }


          // Rating:
          String urlRating="http://3.81.22.120:3000/api/showRating";
          Response responseRating =await post(urlRating, headers:{'authorization': token}, body: body);
          if(responseRating.statusCode==409)
          {
            rating=0;
          }
          else if(responseRating.statusCode != 200)
          {
            Map data= jsonDecode(responseRating.body);
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return RichAlertDialog(
                    alertTitle: richTitle('User error'),
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
          }
          else{
            Map data= jsonDecode(responseRating.body);
            rating=double.parse(data['rating']);
          }


          // Trust:
          String urlTrust="http://3.81.22.120:3000/api/showTrust";
          Response responseTrust =await post(urlTrust, headers:{'authorization': token}, body: body);
          if(responseTrust.statusCode != 200)
          {
            Map data= jsonDecode(responseTrust.body);
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return RichAlertDialog(
                    alertTitle: richTitle('User error'),
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
          }
          else{
            Map data= jsonDecode(responseTrust.body);
            var trustJson = data['trustArr'] as List;
            trust12= trustJson[0]['trust'];
            trust21= trustJson[1]['trust'];
          }
          listRiders.add(
            GestureDetector(
              onTap: (){
                //edit here to view profile
                Navigator.push(context, AnimatedPageRoute(widget: OtherProfile(widget.tripId,riderObjs[i].rating,riderObjs[i].username,riderObjs[i].firstname,riderObjs[i].lastname,riderObjs[i].gender,rating,review,trust12,trust21)));
              },
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
                      riderObjs[i].gender=="female"? "images/avatarfemale.png" : "images/avatarmale.png",
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
        }
      }
      else
      {
        //List riders
        listRiders=[];
        var riderObjsJson = widget.riders as List;
        List<RiderForDriver> riderObjs = riderObjsJson.map((riderJson) => RiderForDriver.fromJson(riderJson)).toList();
        for(int i=0; i<riderObjs.length; i++)
        {
          String riderAddress="";
          String review="";
          double rating=0;
          int trust12=0;
          int trust21=0;
          // Review:
          String urlReview="http://3.81.22.120:3000/api/showReview";
          Map<String,String> body={
            "username" : riderObjs[i].username,
            "tripid" : widget.tripId.toString()
          };
          Response responseReview =await post(urlReview, headers:{'authorization': token}, body: body);
          if(responseReview.statusCode==409)
          {
            review="";
          }
          else if(responseReview.statusCode != 200)
          {
            Map data= jsonDecode(responseReview.body);
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return RichAlertDialog(
                    alertTitle: richTitle('User error'),
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
          }
          else{
            Map data= jsonDecode(responseReview.body);
            review= data['review'];
          }


          // Rating:
          String urlRating="http://3.81.22.120:3000/api/showRating";
          Response responseRating =await post(urlRating, headers:{'authorization': token}, body: body);
          if(responseRating.statusCode==409)
          {
            rating=0;
          }
          else if(responseRating.statusCode != 200)
          {
            Map data= jsonDecode(responseRating.body);
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return RichAlertDialog(
                    alertTitle: richTitle('User error'),
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
          }
          else{
            Map data= jsonDecode(responseRating.body);
            rating=double.parse(data['rating']);
          }


          // Trust:
          String urlTrust="http://3.81.22.120:3000/api/showTrust";
          Response responseTrust =await post(urlTrust, headers:{'authorization': token}, body: body);
          if(responseTrust.statusCode != 200)
          {
            Map data= jsonDecode(responseTrust.body);
            showDialog(
                context: context,
                builder: (BuildContext context) {
                  return RichAlertDialog(
                    alertTitle: richTitle('User error'),
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
          }
          else{
            Map data= jsonDecode(responseTrust.body);
            var trustJson = data['trustArr'] as List;
            trust12= trustJson[0]['trust'];
            trust21= trustJson[1]['trust'];
          }

          listRiders.add(
            GestureDetector(
              onTap: (){
                //edit here to view profile
                Navigator.push(context, AnimatedPageRoute(widget: OtherProfile(widget.tripId,riderObjs[i].rating,riderObjs[i].username,riderObjs[i].firstname,riderObjs[i].lastname,riderObjs[i].gender,rating,review,trust12,trust21)));
              },
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
                      riderObjs[i].gender=="female"? "images/avatarfemale.png" : "images/avatarmale.png",
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
                        ],
                      ),
                      Row(
                        children: <Widget>[
                          AutoSizeText(widget.toFrom=="to"? "Pickup time: " : "Arrival time: ", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: screenFont*0.9,),
                          AutoSizeText(riderObjs[i].time, maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: screenFont*0.9,),
                        ],
                      ),
                      Row(
                        children: <Widget>[
                          AutoSizeText("Fare: ", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: screenFont*0.9,),
                          AutoSizeText(riderObjs[i].fare+" L.E", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: screenFont*0.9,),
                        ],
                      ),
                      Row(
                        children: <Widget>[
                          AutoSizeText(getDisplayRating(double.parse(riderObjs[i].rating)), maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: screenFont,),
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
                      AutoSizeText(riderAddress, maxLines: 3,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: screenFont*0.9,),
                    ],
                  ),
                  trailing: Column(
                    children: <Widget>[
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
                  ),
                ),
              ),
            ),
          );
        }
      }
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
                                  child: SingleChildScrollView(
                                    scrollDirection: Axis.vertical,
                                    child: Padding(
                                      padding: EdgeInsets.fromLTRB(screenWidth/15,screenHeight/35,screenWidth/15,screenHeight/35),
                                      child: Column(
                                        children: <Widget>[
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: <Widget>[
                                              OutlineButton(
                                                shape: StadiumBorder(),
                                                textColor: Colors.blue,
                                                child: Row(
                                                  children: <Widget>[
                                                    Icon(
                                                      Icons.arrow_back,
                                                      color: Colors.indigo[400],
                                                      size: 19,
                                                    ),
                                                    Text('Go back', style: TextStyle(color: Colors.indigo[400],fontSize: 12),),
                                                  ],
                                                ),
                                                borderSide: BorderSide(
                                                    color: Colors.indigo[400], style: BorderStyle.solid,
                                                    width: 1),
                                                onPressed: () {
                                                  Navigator.pop(context);
                                                },
                                              ),
                                            ],
                                          ),
                                          Column(
                                            children: <Widget>[
                                              Image.asset(
                                                widget.type=="Rider" ?
                                                "images/rider.png"
                                                    :
                                                "images/driver.png",
                                                height:screenHeight/12,
                                                width: screenWidth/6,
                                              ),
                                              SizedBox(
                                                height: 5,
                                              ),
                                              AutoSizeText(
                                                widget.type=="Rider" ?
                                                "Rider"
                                                    :
                                                "Driver",
                                                textScaleFactor: screenFont*1.2,
                                                style: TextStyle(
                                                  color: Colors.indigo[400],
                                                  fontWeight: FontWeight.bold,
                                                ),
                                                minFontSize: 2,
                                                maxLines: 1,
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
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Row(
                                            children: <Widget>[
                                              AutoSizeText(
                                                widget.toFrom=="to" ?
                                                "To: "
                                                    :
                                                "From: ",
                                                textScaleFactor: screenFont*1.2,
                                                style: TextStyle(
                                                  color: Colors.indigo[400],
                                                ),
                                                minFontSize: 2,
                                                maxLines: 1,
                                              ),
                                            ],
                                          ),
                                          Card(
                                            elevation: 4,
                                            color: Colors.white,
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(15.0),
                                            ),
                                            child: ListTile(
                                              contentPadding: EdgeInsets.all(5),
                                              leading: CircleAvatar(
                                                backgroundColor: Colors.white,
                                                child: Image.asset("images/org.png",
                                                  height:screenHeight/20,
                                                  width: screenWidth/8,),
                                              ),
                                              title: AutoSizeText(widget.orgName, maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400], ),textScaleFactor: screenFont*1.1,),
                                              trailing: IconButton(
                                                icon: Icon(
                                                  Icons.location_on,
                                                  color:Colors.redAccent,
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
                                                            position: LatLng(double.parse(widget.orgLatitude), double.parse(widget.orgLongitude))));
                                                        return Scaffold(
                                                            body: GoogleMap(
                                                              initialCameraPosition: CameraPosition(
                                                                target: LatLng(double.parse(widget.orgLatitude), double.parse(widget.orgLongitude)),
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
                                            ),
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Row(
                                            children: <Widget>[
                                              AutoSizeText(
                                                widget.toFrom=="to" ?
                                                "From: "
                                                    :
                                                "To: ",
                                                textScaleFactor: screenFont*1.2,
                                                style: TextStyle(
                                                  color: Colors.indigo[400],
                                                ),
                                                minFontSize: 2,
                                                maxLines: 1,
                                              ),
                                            ],
                                          ),
                                          Card(
                                            elevation: 4,
                                            color: Colors.white,
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(15.0),
                                            ),
                                            child: ListTile(
                                              contentPadding: EdgeInsets.all(5),
                                              leading: CircleAvatar(
                                                backgroundColor: Colors.white,
                                                child: Image.asset("images/home.png",
                                                  height:screenHeight/20,
                                                  width: screenWidth/8,),
                                              ),
                                              title: AutoSizeText("Home location", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: screenFont*1.1,),
                                              trailing: IconButton(
                                                icon: Icon(
                                                  Icons.location_on,
                                                  color:Colors.redAccent,
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
                                                            position: LatLng(double.parse(widget.homeLatitude), double.parse(widget.homeLongitude))));
                                                        return Scaffold(
                                                            body: GoogleMap(
                                                              initialCameraPosition: CameraPosition(
                                                                target: LatLng(double.parse(widget.homeLatitude), double.parse(widget.homeLongitude)),
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
                                            ),
                                          ),
                                          widget.type=="Rider"? Column(
                                            children: <Widget>[
                                              Row(
                                                children: <Widget>[
                                                  AutoSizeText(
                                                    "Driver:  ",
                                                    textScaleFactor: screenFont*1.2,
                                                    style: TextStyle(
                                                      color: Colors.indigo[400],
                                                    ),
                                                    minFontSize: 2,
                                                    maxLines: 1,
                                                  ),
                                                ],
                                              ),
                                              GestureDetector(
                                                onTap: () async{
                                                  String review="";
                                                  double rating=0;
                                                  int trust12=0;
                                                  int trust21=0;
                                                  // Review:
                                                  String urlReview="http://3.81.22.120:3000/api/showReview";
                                                  Map<String,String> body={
                                                    "username" : widget.driverUsername,
                                                    "tripid" : widget.tripId.toString()
                                                  };
                                                  Response responseReview =await post(urlReview, headers:{'authorization': token}, body: body);
                                                  if(responseReview.statusCode==409)
                                                  {
                                                    review="";
                                                  }
                                                  else if(responseReview.statusCode != 200)
                                                  {
                                                    Map data= jsonDecode(responseReview.body);
                                                    showDialog(
                                                        context: context,
                                                        builder: (BuildContext context) {
                                                          return RichAlertDialog(
                                                            alertTitle: richTitle('User error'),
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
                                                  }
                                                  else{
                                                    Map data= jsonDecode(responseReview.body);
                                                    review= data['review'];
                                                  }


                                                  // Rating:
                                                  String urlRating="http://3.81.22.120:3000/api/showRating";
                                                  Response responseRating =await post(urlRating, headers:{'authorization': token}, body: body);
                                                  if(responseRating.statusCode==409)
                                                  {
                                                    rating=0;
                                                  }
                                                  else if(responseRating.statusCode != 200)
                                                  {
                                                    Map data= jsonDecode(responseRating.body);
                                                    showDialog(
                                                        context: context,
                                                        builder: (BuildContext context) {
                                                          return RichAlertDialog(
                                                            alertTitle: richTitle('User error'),
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
                                                  }
                                                  else{
                                                    Map data= jsonDecode(responseRating.body);
                                                    rating=double.parse(data['rating']);
                                                  }


                                                  // Trust:
                                                  String urlTrust="http://3.81.22.120:3000/api/showTrust";
                                                  Response responseTrust =await post(urlTrust, headers:{'authorization': token}, body: body);
                                                  if(responseTrust.statusCode != 200)
                                                  {
                                                    Map data= jsonDecode(responseTrust.body);
                                                    showDialog(
                                                        context: context,
                                                        builder: (BuildContext context) {
                                                          return RichAlertDialog(
                                                            alertTitle: richTitle('User error'),
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
                                                  }
                                                  else{
                                                    Map data= jsonDecode(responseTrust.body);
                                                    var trustJson = data['trustArr'] as List;
                                                    trust12= trustJson[0]['trust'];
                                                    trust21= trustJson[1]['trust'];
                                                  }

                                                  Navigator.push(context, AnimatedPageRoute(widget: OtherProfile(widget.tripId,widget.driverRating,widget.driverUsername,widget.driverFirstName,widget.driverLastName,widget.driverGender,rating,review,trust12,trust21)));
                                                },
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
                                                        widget.driverGender=="female"? "images/avatarfemale.png" : "images/avatarmale.png",
                                                        height:screenHeight/20,
                                                        width: screenWidth/8,),
                                                    ),
                                                    title: Column(
                                                      mainAxisAlignment: MainAxisAlignment.start,
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: <Widget>[
                                                        Row(
                                                          children: <Widget>[
                                                            AutoSizeText(widget.driverFirstName+" "+widget.driverLastName+"  ", maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400]),textScaleFactor: screenFont*1.1,),
                                                            AutoSizeText(getDisplayRating(double.parse(widget.driverRating)), maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: screenFont,),
                                                            Icon(
                                                              Icons.star,
                                                              color: Colors.grey[500],
                                                            ),
                                                          ],
                                                        ),
                                                        AutoSizeText(driverAddress, maxLines: 2,minFontSize: 2, style: TextStyle(color: Colors.grey[500]),textScaleFactor: screenFont*0.9,),
                                                      ],
                                                    ),
                                                    trailing: IconButton(
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
                                                                alertSubtitle: richSubtitle("Call "+widget.driverPhoneNumber+"?"),
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
                                                                      _launchCaller(widget.driverPhoneNumber);
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
                                                  ),
                                                ),
                                              ),
                                            ],
                                          )
                                              :
                                          Row(),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Row(
                                            children: <Widget>[
                                              AutoSizeText(
                                                "Car:",
                                                textScaleFactor: screenFont*1.2,
                                                style: TextStyle(
                                                  color: Colors.indigo[400],
                                                ),
                                                minFontSize: 2,
                                                maxLines: 1,
                                              ),
                                            ],
                                          ),
                                          Card(
                                            elevation: 4,
                                            color: Colors.white,
                                            shape: RoundedRectangleBorder(
                                              borderRadius: BorderRadius.circular(15.0),
                                            ),
                                            child: ListTile(
                                              contentPadding: EdgeInsets.all(10),
                                              leading: CircleAvatar(
                                                backgroundColor: Colors.white,
                                                child: Image.asset("images/caricon.jpg", height: 200),
                                              ),
                                              title: Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                children: <Widget>[
                                                  Column(
                                                    children: <Widget>[
                                                      AutoSizeText(cardetails, style: TextStyle(color: Colors.indigo[400]),textScaleFactor:screenFont,maxLines: 1,minFontSize: 2,),
                                                      AutoSizeText(carextradetails, style: TextStyle(color: Colors.grey[500]),textScaleFactor:screenFont*0.9,maxLines: 1,minFontSize: 2,),
                                                    ],
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
                                                            border: Border.all(color: Colors.grey[400])
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

                                            ),
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Divider(
                                            height: 5,
                                            thickness: 1,
                                            color: Colors.grey[400],
                                            indent: 3,
                                            endIndent: 3,
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(4.0),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.start,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                Icon(
                                                  Icons.calendar_today,
                                                  color: Colors.indigo[400],
                                                ),
                                                SizedBox(
                                                  width: 3,
                                                ),
                                                AutoSizeText(
                                                  "Date: ",
                                                  textScaleFactor: screenFont*1.3,
                                                  style: TextStyle(
                                                    color: Colors.indigo[400],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                                AutoSizeText(
                                                  DateFormat('dd-MM-yyyy').format(DateTime.parse(widget.date)),
                                                  textScaleFactor: screenFont*1.2,
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                              ],
                                            ),
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Divider(
                                            height: 5,
                                            thickness: 1,
                                            color: Colors.grey[400],
                                            indent: 3,
                                            endIndent: 3,
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(4.0),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.start,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                Icon(
                                                  Icons.alarm,
                                                  color: Colors.indigo[400],
                                                ),
                                                SizedBox(
                                                  width: 3,
                                                ),
                                                AutoSizeText(
                                                  "Start time: ",
                                                  textScaleFactor: screenFont*1.3,
                                                  style: TextStyle(
                                                    color: Colors.indigo[400],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                                AutoSizeText(
                                                  widget.pickupTime,
                                                  textScaleFactor: screenFont*1.2,
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                              ],
                                            ),
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Divider(
                                            height: 5,
                                            thickness: 1,
                                            color: Colors.grey[400],
                                            indent: 3,
                                            endIndent: 3,
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(4.0),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.start,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                Icon(
                                                  Icons.alarm,
                                                  color: Colors.indigo[400],
                                                ),
                                                SizedBox(
                                                  width: 3,
                                                ),
                                                AutoSizeText(
                                                  "Arrival time: ",
                                                  textScaleFactor: screenFont*1.3,
                                                  style: TextStyle(
                                                    color: Colors.indigo[400],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                                AutoSizeText(
                                                  widget.arrivalTime,
                                                  textScaleFactor: screenFont*1.2,
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                              ],
                                            ),
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Divider(
                                            height: 5,
                                            thickness: 1,
                                            color: Colors.grey[400],
                                            indent: 3,
                                            endIndent: 3,
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(4.0),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.start,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                Icon(
                                                  Icons.attach_money,
                                                  color: Colors.indigo[400],
                                                ),
                                                SizedBox(
                                                  width: 3,
                                                ),
                                                AutoSizeText(
                                                  widget.type=="Rider"? "Expected to pay: " : "Expected to earn: ",
                                                  textScaleFactor: screenFont*1.3,
                                                  style: TextStyle(
                                                    color: Colors.indigo[400],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                                AutoSizeText(
                                                  widget.fare+" L.E",
                                                  textScaleFactor: screenFont*1.2,
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                              ],
                                            ),
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Divider(
                                            height: 5,
                                            thickness: 1,
                                            color: Colors.grey[400],
                                            indent: 3,
                                            endIndent: 3,
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(4.0),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.start,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                Icon(
                                                  Icons.wc,
                                                  color: Colors.indigo[400],
                                                ),
                                                SizedBox(
                                                  width: 3,
                                                ),
                                                AutoSizeText(
                                                  "Ride with: ",
                                                  textScaleFactor: screenFont*1.3,
                                                  style: TextStyle(
                                                    color: Colors.indigo[400],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                                AutoSizeText(
                                                  widget.ridewith,
                                                  textScaleFactor: screenFont*1.2,
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                              ],
                                            ),
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Divider(
                                            height: 5,
                                            thickness: 1,
                                            color: Colors.grey[400],
                                            indent: 3,
                                            endIndent: 3,
                                          ),

                                          Padding(
                                            padding: const EdgeInsets.all(4.0),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.start,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                Icon(
                                                  Icons.smoking_rooms,
                                                  color: Colors.indigo[400],
                                                ),
                                                SizedBox(
                                                  width: 3,
                                                ),
                                                AutoSizeText(
                                                  "Smoking: ",
                                                  textScaleFactor: screenFont*1.3,
                                                  style: TextStyle(
                                                    color: Colors.indigo[400],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                                AutoSizeText(
                                                  widget.smoking,
                                                  textScaleFactor: screenFont*1.2,
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                              ],
                                            ),
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Divider(
                                            height: 5,
                                            thickness: 1,
                                            color: Colors.grey[400],
                                            indent: 3,
                                            endIndent: 3,
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(4.0),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.start,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                Icon(
                                                  Icons.group,
                                                  color: Colors.indigo[400],
                                                ),
                                                SizedBox(
                                                  width: 3,
                                                ),
                                                AutoSizeText(
                                                  "Number of riders: ",
                                                  textScaleFactor: screenFont*1.3,
                                                  style: TextStyle(
                                                    color: Colors.indigo[400],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                                AutoSizeText(
                                                  widget.numberRiders.toString(),
                                                  textScaleFactor: screenFont*1.2,
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                              ],
                                            ),
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Divider(
                                            height: 5,
                                            thickness: 1,
                                            color: Colors.grey[400],
                                            indent: 3,
                                            endIndent: 3,
                                          ),
                                          SizedBox(
                                            height: 5,
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(4.0),
                                            child: Row(
                                              mainAxisAlignment: MainAxisAlignment.start,
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: <Widget>[
                                                Icon(
                                                  Icons.group,
                                                  color: Colors.indigo[400],
                                                ),
                                                SizedBox(
                                                  width: 3,
                                                ),
                                                AutoSizeText(
                                                  widget.type=="Rider"?
                                                  "Other riders: "
                                                      :
                                                  "Riders",
                                                  textScaleFactor: screenFont*1.3,
                                                  style: TextStyle(
                                                    color: Colors.indigo[400],
                                                  ),
                                                  minFontSize: 2,
                                                  maxLines: 1,
                                                ),
                                              ],
                                            ),
                                          ),
                                          Column(
                                            children: listRiders,
                                          ),





                                        ],
                                      ),
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
