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

class Car{
  int id=0;
  String brand="";
  String model="";
  int year=0;
  String type="";
  String plateletters="";
  String platenumbers="";
  int numberofseats=0;
  int nationalid=0;
  String carlicensefront="";
  String carlicenseback="";
  String driverlicensefront="";
  String driverlicenseback="";
  String color="";
  Car(this.id,this.brand,this.model,this.year,this.type,this.plateletters,this.platenumbers,this.numberofseats,this.nationalid,this.carlicensefront,this.carlicenseback,this.driverlicensefront,this.driverlicenseback,this.color);
  factory Car.fromJson(dynamic json) {
    return Car(json['id'] as int, json['brand'] as String,json['model'] as String, json['year'] as int,json['type'] as String,json['plateletters'] as String,json['platenumbers'] as String,json['numberofseats'] as int,json['nationalid'] as int,json['carlicensefront'] as String,json['carlicenseback'] as String,json['driverlicensefront'] as String,json['driverlicenseback'] as String,json['color'] as String);
  }
  @override
  String toString() {
    return '{ ${this.id}, ${this.brand},${this.model}, ${this.year},${this.type},${this.plateletters},${this.platenumbers},${this.numberofseats},${this.nationalid},${this.carlicensefront},${this.carlicenseback},${this.driverlicensefront},${this.driverlicenseback},${this.color}}';
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
class OfferRide extends StatefulWidget with NavigationStates{
  @override
  _OfferRideState createState() => _OfferRideState();
}

class _OfferRideState extends State<OfferRide> {
  String selectedOrg="";
  String selectedOrgfrom="";
  String selectedCar="";
  String selectedCarfrom="";
  final List<DropdownMenuItem> orgitems = [];
  final List<DropdownMenuItem> caritems = [];
  List<Card> ListOrgs=[];
  List<Card> ListCars=[];
  static TextEditingController nameController = new TextEditingController();
  static TextEditingController domainController = new TextEditingController();
  static TextEditingController emailController = new TextEditingController();
  int _selectedIndex = 0;
  int noOrgs=0;
  int noCars=0;
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
  String datefrom="";
  String dateselectedfrom="";
  String latesttime="";
  String latesttimeselected="";
  String departuretime="";
  String departuretimeselected="";
  int ridewithselectedfrom=1;
  int smokingselectedfrom=1;
  static TextEditingController numberofseatsController = new TextEditingController();
  static TextEditingController numberofseatsControllerfrom = new TextEditingController();
  final TimeOfDay _time = new TimeOfDay.now();
  static String getDisplayRating(double rating) {
    rating = rating.abs();
    final str = rating.toStringAsFixed(rating.truncateToDouble() ==rating ? 0 : 2);
    if (str == '0') return '0';
    if (str.endsWith('.0')) return str.substring(0, str.length - 2);
    if (str.endsWith('0')) return str.substring(0, str.length -1);
    return str;
  }


  Future<String> getData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token') ?? '');
    //retrieve user data
    String url = "http://3.81.22.120:3000/api/retrieveuserdata";
    Response response = await post(url, headers: {'authorization': token});
    if (response.statusCode != 200) {
      Map data = jsonDecode(response.body);
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
                  child: Text('Ok',
                    style: TextStyle(color: Colors.indigo[400], fontSize: 30),),
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
      setState(() {
        Map data = jsonDecode(response.body);
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
        fullname = firstname + " " + lastname;
        doubleRating = double.parse(rating);
        trimRating = getDisplayRating(doubleRating);
        if (ridewith == "female") {
          ridewithselected = 2;
          ridewithselectedfrom = 2;
        }
        else if (ridewith == "male") {
          ridewithselected = 1;
          ridewithselectedfrom = 1;
        }
        else {
          ridewithselected = 3;
          ridewithselectedfrom = 3;
        }
        if (smoking == "yes") {
          smokingselected = 1;
          smokingselectedfrom = 1;
        }
        else if (smoking == "no") {
          smokingselected = 2;
          smokingselectedfrom = 2;
        }
        else {
          smokingselected = 3;
          smokingselectedfrom = 3;
        }
      });
    }
    //User orgs
    String urlMyOrgs = "http://3.81.22.120:3000/api/showmyorg";
    Response responseMyOrgs = await post(
        urlMyOrgs, headers: {'authorization': token});
    if (responseMyOrgs.statusCode == 409) {
      noOrgs = 1;
    }
    else if (responseMyOrgs.statusCode != 200) {
      Map data = jsonDecode(responseMyOrgs.body);
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
                  child: Text('Ok',
                    style: TextStyle(color: Colors.indigo[400], fontSize: 30),),
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
      noOrgs = 0;
      ListOrgs = [];
      Map data = jsonDecode(responseMyOrgs.body);
      var orgObjsJson = data['organizations'] as List;
      List<Org> orgObjs = orgObjsJson.map((reviewJson) =>
          Org.fromJson(reviewJson)).toList();
      for (int i = 0; i < orgObjs.length; i++) {
        orgitems.add(
            DropdownMenuItem(
              child: ListTile(
                contentPadding: EdgeInsets.all(10),
                leading: CircleAvatar(
                  backgroundColor: Colors.white,
                  child: Image.asset("images/org.png", height: 100,),
                ),
                title: Text(
                  orgObjs[i].name, style: TextStyle(color: Colors.indigo),),
                subtitle: Text(orgObjs[i].domain),
                trailing: IconButton(
                  icon: Icon(
                    Icons.location_on,
                    color: Colors.redAccent,
                  ),
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
                              position: LatLng(
                                  double.parse(orgObjs[i].latitude),
                                  double.parse(orgObjs[i].longitude))));
                          return Scaffold(
                              body: GoogleMap(
                                initialCameraPosition: CameraPosition(
                                  target: LatLng(
                                      double.parse(orgObjs[i].latitude),
                                      double.parse(orgObjs[i].longitude)),
                                  zoom: 16,
                                ),
                                markers: Set.from(allMarkers),
                              ),
                              floatingActionButtonLocation: FloatingActionButtonLocation
                                  .centerFloat,
                              floatingActionButton: new FloatingActionButton(
                                  elevation: 0.0,
                                  child: new Icon(Icons.close),
                                  backgroundColor: Colors.indigo[400],
                                  onPressed: () {
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
    //user cars
    String urlMyCars = "http://3.81.22.120:3000/api/showmycars";
    Response responseMyCars = await post(
        urlMyCars, headers: {'authorization': token});
    if (responseMyCars.statusCode == 409) {
      noCars = 1;
    }
    else if (responseMyCars.statusCode != 200) {
      Map data = jsonDecode(responseMyCars.body);
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
                  child: Text('Ok',
                    style: TextStyle(color: Colors.indigo[400], fontSize: 30),),
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
      noCars = 0;
      ListCars = [];
      Map data = jsonDecode(responseMyCars.body);
      var carObjsJson = data['Cars'] as List;
      List<Car> carObjs = carObjsJson.map((reviewJson) =>
          Car.fromJson(reviewJson)).toList();
      for (int i = 0; i < carObjs.length; i++) {
        String up = carObjs[i].color;
        up = up + " ";
        up = up + carObjs[i].brand;
        up = up + " ";
        up = up + carObjs[i].model;
        String down = carObjs[i].type;
        down = down + " - ";
        down = down + carObjs[i].year.toString();
        String seats = "Number of seats: ";
        seats = seats + carObjs[i].numberofseats.toString();
        String plate = carObjs[i].plateletters;
        plate = plate + " - ";
        plate = plate + carObjs[i].platenumbers.toString();
        caritems.add(
          DropdownMenuItem(
            child: ListTile(
              contentPadding: EdgeInsets.all(10),
              leading: CircleAvatar(
                backgroundColor: Colors.white,
                child: Image.asset("images/caricon.jpg", height: 200,),
              ),
              title: Text(up, style: TextStyle(color: Colors.indigo),),
              subtitle: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(down),
                  Text(seats),
                  Text(plate),
                ],
              ),
            ),
            value: [carObjs[i].id.toString(),carObjs[i].numberofseats.toString()],
          )
        );
      }
      setState(() {});
      return null;
    }
  }


  @override
  void initState() {
    getData();
    super.initState();
  }

  @override
  void dispose() {
    numberofseatsController.text="";
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final tabs=[
      //Tab 1
      SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            SizedBox(
              height: 10,
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
                  "Offer ride to organization.",
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
                  height: 4,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Car:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22.0,0,22,3),
                  child: SearchableDropdown.single(
                    iconDisabledColor: Colors.grey,
                    iconEnabledColor: Colors.indigo,
                    items: caritems,
                    value: selectedCar,
                    hint: "Select car",
                    searchHint: "Select car",
                    onChanged: (value) {
                        selectedCar = value;
                        numberofseatsController.text=value[1];
                    },
                    isExpanded: true,

                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Number of seats available:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: Colors.grey[200])),
                    ),
                    child: TextField(
                      keyboardType: TextInputType.number,
                      controller: numberofseatsController,
                      maxLength: 30,
                      decoration: InputDecoration(
                        counterText: "",
                        hintText: "Number of seats",
                        hintStyle: TextStyle(color:Colors.grey),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("To:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
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
                      child: Text("From:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
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
                      width: 213,
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
                                print(date);
                                print(dateselected);
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
                    date == ""? "Please, pick date." : date,
                    style: TextStyle(
                      color: Colors.blueGrey,
                      fontFamily: "Kodchasan",
                      fontSize: 15.0,
                    ),
                  ),
                ),
                SizedBox(
                  height: 5,
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,22,0),
                      child: Text("Earliest time possible to start ride:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
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
                                earliesttime= DateFormat('Hms').format(date).toString();
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
                    earliesttime == ""? "Please, pick earliest time." : earliesttime,
                    style: TextStyle(
                      color: Colors.blueGrey,
                      fontFamily: "Kodchasan",
                      fontSize: 15.0,
                    ),
                  ),
                ),
                SizedBox(
                  height: 5,
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,22,0),
                      child: Text("Arrival time:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    SizedBox(
                      width: 165,
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
                                arrivaltime= DateFormat('Hms').format(date).toString();
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
                    arrivaltime == ""? "Please, pick arrival time." : arrivaltime,
                    style: TextStyle(
                      color: Colors.blueGrey,
                      fontFamily: "Kodchasan",
                      fontSize: 15.0,
                    ),
                  ),
                ),
                SizedBox(
                  height: 5,
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,0,0),
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
                  ],
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,0,0),
                      child: Text("Smoking:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    SizedBox(
                      width: 5,
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
                        SizedBox(
                          width: 10,
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
                        SizedBox(
                          width: 30,
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
              ],
            ),
            SizedBox(height: 5,),
            Padding(
              padding: const EdgeInsets.fromLTRB(33,0,33,0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  MaterialButton(
                    child: Text("Offer",
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
                      String noofseats=numberofseatsController.text;
                      bool Valid= true;
                      //Car validation
                      if(selectedCar.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Car"),
                                alertSubtitle: richSubtitle("Car is required"),
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
                      //Number of seats
                      else if(noofseats.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Number of seats"),
                                alertSubtitle: richSubtitle("Number of seats is required"),
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
                      //To validation validations:
                      else if(selectedOrg.isEmpty)
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
                      else if(earliesttime.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Earliest time"),
                                alertSubtitle: richSubtitle("Earliest time is required"),
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
                      else if(arrivaltime.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Arrival time"),
                                alertSubtitle: richSubtitle("Arrival time is required"),
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
                            'carid' : selectedCar,
                            'numberofseats': noofseats,
                            'toorgid': selectedOrg,
                            'date': dateselected,
                            'earliesttime': earliesttime,
                            'arrivaltime' : arrivaltime,
                            'ridewith': r,
                            'smoking' : s,
                          };
                          String url="http://3.81.22.120:3000/api/offerrideto";
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
                            arrivaltime="";
                            earliesttime="";
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
                                    alertSubtitle: richSubtitle("Your offer will be processed."),
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
                                          Navigator.push(context, AnimatedPageRoute(widget: OfferRide()));
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


      /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


      //Tab 2
      SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            SizedBox(
              height: 10,
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
                  "Offer ride from organization.",
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
                  height: 4,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Car:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22.0,0,22,3),
                  child: SearchableDropdown.single(
                    iconDisabledColor: Colors.grey,
                    iconEnabledColor: Colors.indigo,
                    items: caritems,
                    value: selectedCarfrom,
                    hint: "Select car",
                    searchHint: "Select car",
                    onChanged: (value) {
                      selectedCarfrom = value;
                      numberofseatsControllerfrom.text=value[1];
                    },
                    isExpanded: true,

                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Number of seats available:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: Colors.grey[200])),
                    ),
                    child: TextField(
                      keyboardType: TextInputType.number,
                      controller: numberofseatsControllerfrom,
                      maxLength: 30,
                      decoration: InputDecoration(
                        counterText: "",
                        hintText: "Number of seats",
                        hintStyle: TextStyle(color:Colors.grey),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
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
                    value: selectedOrgfrom,
                    hint: "Select organization",
                    searchHint: "Select organization",
                    onChanged: (value) {
                      setState(() {
                        selectedOrgfrom = value;
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
                      width: 213,
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
                                dateselectedfrom= DateFormat('yyyy-MM-dd').format(datepick).toString();
                                datefrom= DateFormat('dd-MM-yyyy').format(datepick).toString();
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
                    datefrom == ""? "Please, pick date." : datefrom,
                    style: TextStyle(
                      color: Colors.blueGrey,
                      fontFamily: "Kodchasan",
                      fontSize: 15.0,
                    ),
                  ),
                ),
                SizedBox(
                  height: 5,
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,22,0),
                      child: Text("Departure time:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    SizedBox(
                      width: 137,
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
                  height: 5,
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,22,0),
                      child: Text("Latest time possible to go home:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    SizedBox(
                      width: 12,
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
                  height: 5,
                ),
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,0,0),
                      child: Text("Ride with:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Radio(
                          activeColor: Colors.indigo[400],
                          value: 1,
                          groupValue: ridewithselectedfrom,
                          onChanged: (T){
                            setState(() {
                              ridewithselectedfrom=T;
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
                          groupValue: ridewithselectedfrom,
                          onChanged: (T){
                            setState(() {
                              ridewithselectedfrom=T;
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
                          groupValue: ridewithselectedfrom,
                          onChanged: (T){
                            setState(() {
                              ridewithselectedfrom=T;
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
                Row(
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.fromLTRB(33,0,0,0),
                      child: Text("Smoking:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                    ),
                    SizedBox(
                      width: 5,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        Radio(
                          activeColor: Colors.indigo[400],
                          value: 1,
                          groupValue: smokingselectedfrom,
                          onChanged: (T){
                            setState(() {
                              smokingselectedfrom=T;
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
                        SizedBox(
                          width: 10,
                        ),
                        Radio(
                          activeColor: Colors.indigo[400],
                          value: 2,
                          groupValue: smokingselectedfrom,
                          onChanged: (T){
                            setState(() {
                              smokingselectedfrom=T;
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
                        SizedBox(
                          width: 30,
                        ),
                        Radio(
                          activeColor: Colors.indigo[400],
                          value: 3,
                          groupValue: smokingselectedfrom,
                          onChanged: (T){
                            setState(() {
                              smokingselectedfrom=T;
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
              ],
            ),
            SizedBox(height: 5,),
            Padding(
              padding: const EdgeInsets.fromLTRB(33,0,33,0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  MaterialButton(
                    child: Text("Offer",
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
                      String noofseats=numberofseatsControllerfrom.text;
                      bool Valid= true;
                      //Car validation
                      if(selectedCarfrom.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Car"),
                                alertSubtitle: richSubtitle("Car is required"),
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
                      //Number of seats
                      else if(noofseats.isEmpty)
                      {
                        Valid = false;
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Number of seats"),
                                alertSubtitle: richSubtitle("Number of seats is required"),
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
                      //To validation validations:
                      else if(selectedOrgfrom.isEmpty)
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
                      else if(dateselectedfrom.isEmpty)
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
                      //Date validations:
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
                      //Earliest validations:
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
                          if(ridewithselectedfrom==1)
                          {
                            r="male";
                          }
                          else if(ridewithselectedfrom==2)
                          {
                            r="female";
                          }
                          else{
                            r="any";
                          }
                          if(smokingselectedfrom==1)
                          {
                            s="yes";
                          }
                          else if(smokingselectedfrom==2)
                          {
                            s="no";
                          }
                          else{
                            s="any";
                          }
                          SharedPreferences prefs = await SharedPreferences.getInstance();
                          String token = await (prefs.getString('token')??'');
                          Map<String, String> body = {
                            'carid' : selectedCarfrom,
                            'numberofseats': noofseats,
                            'fromorgid': selectedOrgfrom,
                            'date': dateselectedfrom,
                            'departuretime': departuretime,
                            'latesttime' : latesttime,
                            'ridewith': r,
                            'smoking' : s,
                          };
                          String url="http://3.81.22.120:3000/api/offerridefrom";
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
                            arrivaltime="";
                            earliesttime="";
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
                                    alertSubtitle: richSubtitle("Your offer will be processed."),
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
                                          Navigator.push(context, AnimatedPageRoute(widget: OfferRide()));
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
                          icon: Icon(Icons.arrow_forward,color: Colors.indigo,),
                          title: Text('Offer ride to organization', style: TextStyle(fontSize: 11,color: Colors.indigo),),
                        ),
                        FlashyTabBarItem(
                          icon: Icon(Icons.arrow_back,color: Colors.indigo,),
                          title: Text('Offer ride from organization', style: TextStyle(fontSize: 11,color: Colors.indigo),),
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
