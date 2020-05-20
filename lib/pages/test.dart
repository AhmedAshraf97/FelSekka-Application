import 'dart:convert';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/signup2.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flashy_tab_bar/flashy_tab_bar.dart';
import 'package:flutter/services.dart';
import 'package:flutter_datetime_picker/flutter_datetime_picker.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_maps_place_picker/google_maps_place_picker.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:searchable_dropdown/searchable_dropdown.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'AnimatedPage Route.dart';


class Trip{
  String tofrom="";
  int tripid=0;
  String arrivaltime="";
  String departuretime="";
  int avaialbleseats=0;
  String date="";
  String ridewith="";
  String smoking="";
  int orgid=0;
  String orgname="";
  String latitude="";
  String longitude="";
  String datetrip="";
  Trip(this.tofrom,this.tripid,this.arrivaltime,this.departuretime,this.avaialbleseats,this.date,this.ridewith, this.smoking,this.orgid,this.orgname,this.latitude,this.longitude,this.datetrip);
  factory Trip.fromJson(dynamic json) {
    return Trip(json['tofrom'] as String, json['tripid'] as int,json['arrivaltime'] as String, json['departuretime'] as String,json['Availableseats'] as int,json['date'] as String,json['ridewith'] as String,json['smoking'] as String,json['orgid'] as int,json['orgname'] as String,json['orglatitude'] as String,json['orglongitude'] as String,json['date'] as String);
  }
  @override
  String toString() {
    return '{ ${this.tofrom}, ${this.tripid},${this.arrivaltime}, ${this.departuretime},${this.avaialbleseats},${this.date},${this.ridewith} ,${this.smoking}}';
  }
}

class Org{
  int id=0;
  String name="";
  String domain="";
  String latitude="";
  String longitude="";
  Org(this.id,this.name,this.domain,this.latitude,this.longitude);
  factory Org.fromJson(dynamic json) {
    return Org(json['id'] as int, json['name'] as String,json['domain'] as String, json['latitude'] as String,json['longitude'] as String);
  }
  @override
  String toString() {
    return '{ ${this.id}, ${this.name},${this.domain}, ${this.latitude},${this.longitude} }';
  }
}
class JoinRide extends StatefulWidget with NavigationStates{
  @override
  _JoinRideState createState() => _JoinRideState();
}

class _JoinRideState extends State<JoinRide> {
  String selectedOrg="";
  final List<DropdownMenuItem> orgitems = [];
  List<Card> ListOrgs=[];
  List<Card> ListRides=[];
  int _selectedIndex = 0;
  int noOrgs=0;
  int noRides=0;
  String token;
  int id;
  String firstname="";
  String lastname="";
  String phonenumber="";
  String gender="";
  String password="";
  String birthdate="";
  String ridewith="";
  String smoking="";
  String rating="";
  String status="";
  String email="";
  String latitude="";
  String longitude="";
  String username="";
  String fullname="";
  double doubleRating=0;
  String trimRating="";
  String countTrust="";
  int countTrustint=0;
  String date="";
  String dateselected="";
  String earliesttime="";
  String earliesttimeselected="";
  String arrivaltime="";
  String arrivaltimeselected="";
  int ridewithselected=1;
  int smokingselected=1;
  String latesttime="";
  String latesttimeselected="";
  String departuretime="";
  String departuretimeselected="";
  final TimeOfDay _time = new TimeOfDay.now();
  static String getDisplayRating(double rating) {
    rating = rating.abs();
    final str = rating.toStringAsFixed(rating.truncateToDouble() ==rating ? 0 : 2);
    if (str == '0') return '0';
    if (str.endsWith('.0')) return str.substring(0, str.length - 2);
    if (str.endsWith('0')) return str.substring(0, str.length -1);
    return str;
  }


  Future<String> getData() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token')??'');
    //retrieve user data
    String url="http://3.81.22.120:3000/api/retrieveuserdata";
    Response response =await post(url, headers:{'authorization': token});
    if(response.statusCode != 200)
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle("User error"),
              alertSubtitle: richSubtitle(data['message']),
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
      setState(() {
        Map data= jsonDecode(response.body);
        Map userInfo = data['decoded'];
        id = userInfo['id'];
        firstname = userInfo['firstname'];
        lastname = userInfo['lastname'];
        phonenumber = userInfo['phonenumber'];
        gender = userInfo['gender'];
        password = userInfo['password'];
        birthdate = userInfo['birthdate'];
        ridewith = userInfo['ridewith'];
        smoking = userInfo['smoking'];
        rating = userInfo['rating'];
        status = userInfo['status'];
        email = userInfo['email'];
        latitude = userInfo['latitude'];
        longitude = userInfo['longitude'];
        username = userInfo['username'];
        fullname = firstname + " "+ lastname;
        doubleRating = double.parse(rating);
        trimRating = getDisplayRating(doubleRating);
        if(ridewith=="female")
        {
          ridewithselected=2;
        }
        else if(ridewith=="male")
        {
          ridewithselected=1;
        }
        else
        {
          ridewithselected=3;
        }
        if(smoking=="yes")
        {
          smokingselected=1;
        }
        else if(smoking=="no")
        {
          smokingselected=2;
        }
        else
        {
          smokingselected=3;
        }
      });
    }
    //User orgs
    String urlMyOrgs="http://3.81.22.120:3000/api/showmyorg";
    Response responseMyOrgs =await post(urlMyOrgs, headers:{'authorization': token});
    if(responseMyOrgs.statusCode==409)
    {
      noOrgs=1;
    }
    else if(responseMyOrgs.statusCode != 200)
    {
      Map data= jsonDecode(responseMyOrgs.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle(data['error']),
              alertSubtitle: richSubtitle(data['message']),
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
      noOrgs=0;
      ListOrgs=[];
      Map data= jsonDecode(responseMyOrgs.body);
      var orgObjsJson = data['organizations'] as List;
      List<Org> orgObjs = orgObjsJson.map((reviewJson) => Org.fromJson(reviewJson)).toList();
      for(int i=0; i<orgObjs.length; i++)
      {
        orgitems.add(
            DropdownMenuItem(
              child: ListTile(
                contentPadding: EdgeInsets.all(10),
                leading: CircleAvatar(
                  backgroundColor: Colors.white,
                  child: Image.asset("images/org.png",height: 100,),
                ),
                title: Text(orgObjs[i].name,style: TextStyle(color: Colors.indigo),),
                subtitle: Text(orgObjs[i].domain),
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
                              position: LatLng(double.parse(orgObjs[i].latitude), double.parse(orgObjs[i].longitude))));
                          return Scaffold(
                              body: GoogleMap(
                                initialCameraPosition: CameraPosition(
                                  target: LatLng(double.parse(orgObjs[i].latitude), double.parse(orgObjs[i].longitude)),
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
              value: orgObjs[i].id.toString(),
            )
        );
      }
    }






    ////////////////////////////////////////////////////////////////////////////////////////
    Map<String, String> body = {
      'tofrom' : "",
      'toorgid': "",
      'fromorgid': "",
      'departuretime': "",
      'arrivaltime' : "",
      'ridewith': "",
      'smoking' : "",
      'date' : ""
    };
    print(body);
    String urlTrips="http://3.81.22.120:3000/api/searchtrip";
    Response responseMyTrips =await post(urlTrips, headers:{'authorization': token},body: body);
    print(responseMyTrips.statusCode);
    print(responseMyTrips.body);
    if(responseMyTrips.statusCode==409)
    {
      noRides=1;
    }
    else if(responseMyTrips.statusCode != 200)
    {
      Map data= jsonDecode(responseMyTrips.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle(data['error']),
              alertSubtitle: richSubtitle(data['message']),
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
      ListRides=[];
      Map data= jsonDecode(responseMyTrips.body);
      var tripObjsJson = data['Trips'] as List;
      List<Trip> tripObjs = tripObjsJson.map((reviewJson) => Trip.fromJson(reviewJson)).toList();
      for(int i=0; i<tripObjs.length; i++)
      {
        String datetimetrip = tripObjs[i].datetrip + " ";
        String tofromorg="";
        if(tripObjs[i].departuretime=="")
        {
          tofromorg="To ";
          datetimetrip=datetimetrip + tripObjs[i].arrivaltime;
        }
        else
        {
          tofromorg="From ";
          datetimetrip=datetimetrip + tripObjs[i].departuretime;
        }
        String orgtrip= tofromorg + tripObjs[i].orgname;
        ListRides.add(
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
                child: Image.asset("images/trip.png",height: 150,),
              ),
              title: Text(orgtrip),
              subtitle: Text(datetimetrip),
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
                            position: LatLng(double.parse(tripObjs[i].latitude), double.parse(tripObjs[i].longitude))));
                        return Scaffold(
                            body: GoogleMap(
                              initialCameraPosition: CameraPosition(
                                target: LatLng(double.parse(tripObjs[i].latitude), double.parse(tripObjs[i].longitude)),
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
              onTap: (){
                /*showDialog(
                    context: context,
                    builder: (BuildContext context) {
                      return RichAlertDialog(
                        alertTitle: richTitle("Leave organization"),
                        alertSubtitle: richSubtitle("Are you sure you want to leave organization?"),
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
                              String url="http://3.81.22.120:3000/api/deleteorg";
                              Response response =await post(url, headers:{'authorization': token}, body:{'orgid': orgObjs[i].id.toString()});
                              if(response.statusCode != 200)
                              {
                                Map data= jsonDecode(response.body);
                                showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return RichAlertDialog(
                                        alertTitle: richTitle("User error"),
                                        alertSubtitle: richSubtitle(data['message']),
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
                                setState(() {
                                });
                                showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return RichAlertDialog(
                                        alertTitle: richTitle("Done"),
                                        alertSubtitle: richSubtitle("You left this organization."),
                                        alertType: RichAlertType.SUCCESS,
                                        dialogIcon: Icon(
                                          Icons.check,
                                          color: Colors.green,
                                          size: 100,
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
                    });*/
              },
            ),
          ),
        );
      }
    }
    setState(() {
    });
    return null;
  }


  @override
  void initState() {
    getData();
    super.initState();
  }


  @override
  Widget build(BuildContext context) {
    final tabs=[
      //Tab 1

      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


      //Tab 2
      SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            SizedBox(
              height: 17,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Icon(
                  Icons.time_to_leave,
                  color:Colors.redAccent,
                ),
                SizedBox(
                  width: 7,
                ),
                Text(
                  "Request ride from organization.",
                  style: TextStyle(
                    color: Colors.indigo,
                    fontSize: 20,
                  ),
                ),
              ],
            ),
            Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                SizedBox(
                  height: 14,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("From:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22.0,0,22,3),
                  child: SearchableDropdown.single(
                    iconDisabledColor: Colors.grey,
                    iconEnabledColor: Colors.indigo,
                    items: orgitems,
                    value: selectedOrg,
                    hint: "Select organization",
                    searchHint: "Select organization",
                    onChanged: (value) {
                      setState(() {
                        selectedOrg = value;
                      });
                    },
                    isExpanded: true,
                  ),
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,22,0),
                      child: Text("To:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    new OutlineButton(
                      shape: StadiumBorder(),
                      textColor: Colors.blue,
                      child: Text('View home location', style: TextStyle(color: Colors.indigo[400]),),
                      borderSide: BorderSide(
                          color: Colors.indigo[400], style: BorderStyle.solid,
                          width: 1),
                      onPressed: () {
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
                                  position: LatLng(double.parse(latitude), double.parse(longitude))));
                              return Scaffold(
                                  body: GoogleMap(
                                    initialCameraPosition: CameraPosition(
                                      target: LatLng(double.parse(latitude) , double.parse(longitude)),
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
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,22,0),
                      child: Text("Date:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    SizedBox(
                      width: 205,
                    ),
                    Container(
                      height: 30,
                      child: IconButton(
                        icon: Icon(Icons.calendar_today),
                        color: Colors.redAccent,
                        iconSize: 25,
                        onPressed: () {
                          DatePicker.showDatePicker(context,
                              showTitleActions: true,
                              onConfirm: (datepick) {
                                dateselected= DateFormat('yyyy-MM-dd').format(datepick).toString();
                                date= DateFormat('dd-MM-yyyy').format(datepick).toString();
                                setState(() {
                                });
                              }, currentTime: DateTime.now(), locale: LocaleType.en);
                        },
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text(
                    date== ""? "Please, pick date." : date,
                    style: TextStyle(
                      color: Colors.blueGrey,
                      fontFamily: "Kodchasan",
                      fontSize: 15.0,
                    ),
                  ),
                ),
                SizedBox(
                  height: 10,
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,22,0),
                      child: Text("Departure time:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    SizedBox(
                      width: 128,
                    ),
                    Container(
                      height: 30,
                      child: IconButton(
                        icon: Icon(Icons.alarm),
                        color: Colors.redAccent,
                        iconSize: 25,
                        onPressed: () {
                          DatePicker.showTimePicker(context,
                              showTitleActions: true,
                              onConfirm: (date) {
                                departuretime= DateFormat('Hms').format(date).toString();
                                setState(() {

                                });
                              }, currentTime: DateTime.now(), locale: LocaleType.en);
                        },
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text(
                    departuretime == ""? "Please, pick departure time." : departuretime,
                    style: TextStyle(
                      color: Colors.blueGrey,
                      fontFamily: "Kodchasan",
                      fontSize: 15.0,
                    ),
                  ),
                ),
                SizedBox(
                  height: 10,
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,22,0),
                      child: Text("Latest time possible to go home: ", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    Container(
                      height: 30,
                      child: IconButton(
                        icon: Icon(Icons.alarm),
                        color: Colors.redAccent,
                        iconSize: 25,
                        onPressed: () {
                          DatePicker.showTimePicker(context,
                              showTitleActions: true,
                              onConfirm: (date) {
                                latesttime= DateFormat('Hms').format(date).toString();
                                setState(() {
                                });
                              }, currentTime: DateTime.now(), locale: LocaleType.en);
                        },
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text(
                    latesttime == ""? "Please, pick latest time." : latesttime,
                    style: TextStyle(
                      color: Colors.blueGrey,
                      fontFamily: "Kodchasan",
                      fontSize: 15.0,
                    ),
                  ),
                ),
                SizedBox(
                  height: 10,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Ride with:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Radio(
                      activeColor: Colors.indigo[400],
                      value: 1,
                      groupValue: ridewithselected,
                      onChanged: (T){
                        setState(() {
                          ridewithselected=T;
                        });
                      },
                    ),
                    Text(
                      "Male",
                      style: TextStyle(
                        color: Colors.blueGrey,
                        fontFamily: "Kodchasan",
                        fontSize: 15.0,
                      ),
                    ),
                    Radio(
                      activeColor: Colors.indigo[400],
                      value: 2,
                      groupValue: ridewithselected,
                      onChanged: (T){
                        setState(() {
                          ridewithselected=T;
                        });
                      },
                    ),
                    Text(
                      "Female",
                      style: TextStyle(
                        color: Colors.blueGrey,
                        fontFamily: "Kodchasan",
                        fontSize: 15.0,
                      ),
                    ),
                    Radio(
                      activeColor: Colors.indigo[400],
                      value: 3,
                      groupValue: ridewithselected,
                      onChanged: (T){
                        setState(() {
                          ridewithselected=T;
                        });
                      },
                    ),
                    Text(
                      "Any",
                      style: TextStyle(
                        color: Colors.blueGrey,
                        fontFamily: "Kodchasan",
                        fontSize: 15.0,
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Smoking:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Radio(
                      activeColor: Colors.indigo[400],
                      value: 1,
                      groupValue: smokingselected,
                      onChanged: (T){
                        setState(() {
                          smokingselected=T;
                        });
                      },
                    ),
                    Text(
                      "Yes",
                      style: TextStyle(
                        color: Colors.blueGrey,
                        fontFamily: "Kodchasan",
                        fontSize: 15.0,
                      ),
                    ),
                    Radio(
                      activeColor: Colors.indigo[400],
                      value: 2,
                      groupValue: smokingselected,
                      onChanged: (T){
                        setState(() {
                          smokingselected=T;
                        });
                      },
                    ),
                    Text(
                      "No",
                      style: TextStyle(
                        color: Colors.blueGrey,
                        fontFamily: "Kodchasan",
                        fontSize: 15.0,
                      ),
                    ),
                    Radio(
                      activeColor: Colors.indigo[400],
                      value: 3,
                      groupValue: smokingselected,
                      onChanged: (T){
                        setState(() {
                          smokingselected=T;
                        });
                      },
                    ),
                    Text(
                      "Any",
                      style: TextStyle(
                        color: Colors.blueGrey,
                        fontFamily: "Kodchasan",
                        fontSize: 15.0,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            SizedBox(height: 8,),
            Padding(
              padding: const EdgeInsets.fromLTRB(33,0,33,0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  MaterialButton(
                    child: Text("Request",
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
                      bool Valid= true;
                      //To validation validations:
                      if(selectedOrg.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Destination"),
                                alertSubtitle: richSubtitle("Destination is required"),
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
                      //Date validations:
                      else if(dateselected.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Date"),
                                alertSubtitle: richSubtitle("Date is required"),
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
                      //Earliest validations:
                      else if(departuretime.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Departure time"),
                                alertSubtitle: richSubtitle("Departure time is required"),
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
                      //Date validations:
                      else if(latesttime.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Latest time"),
                                alertSubtitle: richSubtitle("Latest time is required"),
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
                      if(Valid==true)
                      {
                        void sendData() async{
                          String r="";
                          String s="";
                          if(ridewithselected==1)
                          {
                            r="male";
                          }
                          else if(ridewithselected==2)
                          {
                            r="female";
                          }
                          else{
                            r="any";
                          }
                          if(smokingselected==1)
                          {
                            s="yes";
                          }
                          else if(smokingselected==2)
                          {
                            s="no";
                          }
                          else{
                            s="any";
                          }
                          SharedPreferences prefs = await SharedPreferences.getInstance();
                          String token = await (prefs.getString('token')??'');
                          Map<String, String> body = {
                            'fromorgid': selectedOrg,
                            'date': dateselected,
                            'departuretime': departuretime,
                            'latesttime' : latesttime,
                            'ridewith': r,
                            'smoking' : s,
                          };
                          String url="http://3.81.22.120:3000/api/requestridefrom";
                          Response response =await post(url, headers:{'authorization': token}, body: body);
                          print(response.statusCode);
                          print(response.body);
                          if(response.statusCode != 200)
                          {
                            Map data= jsonDecode(response.body);
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle(data['error']),
                                    alertSubtitle: richSubtitle(data['message']),
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
                            if(ridewith=="female")
                            {
                              ridewithselected=2;
                            }
                            else if(ridewith=="male")
                            {
                              ridewithselected=1;
                            }
                            else
                            {
                              ridewithselected=3;
                            }
                            if(smoking=="yes")
                            {
                              smokingselected=1;
                            }
                            else if(smoking=="no")
                            {
                              smokingselected=2;
                            }
                            else
                            {
                              smokingselected=3;
                            }
                            departuretime="";
                            latesttime="";
                            date="";
                            dateselected="";
                            selectedOrg="";
                            setState(() {
                            });
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Done"),
                                    alertSubtitle: richSubtitle("Your request will be processed."),
                                    alertType: RichAlertType.SUCCESS,
                                    dialogIcon: Icon(
                                      Icons.check,
                                      color: Colors.green,
                                      size: 100,
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
                                          Navigator.pop(context);
                                          Navigator.push(context, AnimatedPageRoute(widget: JoinRide()));
                                        },
                                      ),
                                    ],
                                  );
                                });
                          }
                        }
                        sendData();
                      }
                    },
                  ),
                  SizedBox(width:50,),
                  MaterialButton(
                    child: Text("Back",
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
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ];

    return Scaffold(
      body: Column(
        children: <Widget>[
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.indigo,
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10.0,10,10,0),
                child: Container(
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30))
                  ),
                  child:Scaffold(
                    bottomNavigationBar: FlashyTabBar(
                      animationCurve: Curves.linear,
                      selectedIndex: _selectedIndex,
                      showElevation: true, // use this to remove appBar's elevation
                      onItemSelected: (index) => setState(() {
                        _selectedIndex = index;
                      }),
                      items: [
                        FlashyTabBarItem(
                          icon: Icon(Icons.directions_run,color: Colors.indigo,),
                          title: Text('Join ride', style: TextStyle(fontSize: 15,color: Colors.indigo),),
                        ),
                        FlashyTabBarItem(
                          icon: Icon(Icons.search,color: Colors.indigo,),
                          title: Text('Search for ride', style: TextStyle(fontSize: 15,color: Colors.indigo),),
                        ),
                      ],
                    ),
                    body: tabs[_selectedIndex],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}