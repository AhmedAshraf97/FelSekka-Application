import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_maps_place_picker/google_maps_place_picker.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'navigation_bloc.dart';

class EditProfile3 extends StatefulWidget with NavigationStates{
  String firstname="";
  String lastname="";
  String oldpassword="";
  String newpassword="";
  String confirmpassword="";
  String token="";
  String gender="";
  String birthdate="";
  String ridewith="";
  String smoking="";
  EditProfile3(this.firstname, this.lastname, this.oldpassword, this.newpassword, this.confirmpassword, this.token, this.gender, this.birthdate, this.ridewith, this.smoking);
  @override
  _EditProfile3State createState() => _EditProfile3State();
}

class _EditProfile3State extends State<EditProfile3> with SingleTickerProviderStateMixin{
  String selectedGender="female";
  String date = null; //To show date
  String dateSelected=""; //To sign up
  int ridewith=1;
  int smoking=1;
  String ridewithSelected="";
  String smokingSelected="";
  String address="";
  ////////////////////////////////////
  int id;
  String firstname="";
  String lastname="";
  String phonenumber="";
  String gender="";
  String password="";
  String birthdate="";
  String ridewithget="";
  String smokingget="";
  String rating="";
  String status="";
  String email="";
  String latitudeget="";
  String longitudeget="";
  String username="";
  String fullname="";
  double doubleRating=0;
  String trimRating="";
  String imggender="";
  String countTrust="";
  int countTrustint=0;
  String datetoshow="";
  String ridewithtoshow="";
  String smokingtoshow="";
  String token="";
  PickResult selectedPlace;
  String latitude;
  String longitude;
  Position position;
  LatLng currentlocation;
  //LocationResult result;
  void getlocation() async{
    final Geolocator geolocator = Geolocator()..forceAndroidLocationManager = true;
    position = await geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
  }

  Future<String> getData() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token')??'');
    String url="http://3.81.22.120:3000/api/retrieveuserdata";
    Response response =await post(url, headers:{'authorization': token});
    if(response.statusCode != 200)
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: Text(data['error'], maxLines: 1, style: TextStyle(color: Colors.black, fontSize: 12),textAlign: TextAlign.center,),
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
      Map data= jsonDecode(response.body);
      Map userInfo = data['decoded'];
      id = userInfo['id'];
      firstname = userInfo['firstname'];
      lastname = userInfo['lastname'];
      phonenumber = userInfo['phonenumber'];
      gender = userInfo['gender'];
      password = userInfo['password'];
      birthdate = userInfo['birthdate'];
      ridewithget = userInfo['ridewith'];
      smokingget = userInfo['smoking'];
      rating = userInfo['rating'];
      status = userInfo['status'];
      email = userInfo['email'];
      latitudeget = userInfo['latitude'];
      longitudeget = userInfo['longitude'];
      username = userInfo['username'];
      datetoshow = DateFormat('dd-MM-yyyy').format(DateTime.parse(birthdate));
      List<Placemark> newPlace = await Geolocator().placemarkFromCoordinates(double.parse(latitudeget), double.parse(longitudeget));
      Placemark placeMark  = newPlace[0];
      String name = placeMark.name;
      String locality = placeMark.locality;
      String administrativeArea = placeMark.administrativeArea;
      String country = placeMark.country;
      address= name +" - "+locality+" - "+administrativeArea+" - " +country;
      setState(() {
        currentlocation=LatLng(double.parse(latitudeget), double.parse(longitudeget));
      });
    }
    return null;
  }


  @override
  void initState() {
    getData();
    getlocation();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
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
                        Colors.indigo[500],
                        Colors.indigo[400],
                        Colors.indigo[300]
                      ]
                  )
              ),
              child: Padding(
                padding: EdgeInsets.all(10.0),
                child: Container(
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30),bottomLeft:Radius.circular(30),bottomRight: Radius.circular(30) )
                  ),
                  child: Column(
                    children: <Widget>[
                      Padding(
                        padding: const EdgeInsets.all(5.0),
                        child: AutoSizeText(
                          "Edit profile",
                          minFontSize: 2.0,
                          maxLines: 1,
                          style: TextStyle(
                            color: Colors.indigo,
                            fontFamily: "Kodchasan",
                            fontSize: 20.0,
                          ),
                        ),
                      ),
                      Image.asset(
                        "images/location.png",
                        height: 130.0,
                      ),
                      AutoSizeText(
                        "Choose your home location.",
                        minFontSize: 2,
                        maxLines: 1,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.indigo[400],
                          fontFamily: "Kodchasan",
                          fontSize: 15.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      AutoSizeText(
                        "You will go from and to this location.",
                        textAlign: TextAlign.center,
                        minFontSize: 2,
                        maxLines: 1,
                        style: TextStyle(
                          color: Colors.indigo[400],
                          fontFamily: "Kodchasan",
                          fontSize: 15.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(
                        height: 20.0,
                      ),
                      MaterialButton(
                        child: Text("Choose location",
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
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) {
                                return PlacePicker(
                                  apiKey: "AIzaSyC6NQ_ODwiORDBTsuB5k9J8prDQ_MTZgB4",
                                  useCurrentLocation: false,
                                  enableMyLocationButton: true,
                                  initialMapType: MapType.normal,
                                  onPlacePicked: (result) {
                                    selectedPlace = result;
                                    latitude=selectedPlace.geometry.location.lat.toString();
                                    longitude=selectedPlace.geometry.location.lng.toString();
                                    Navigator.of(context).pop();
                                    setState(() {
                                      address=selectedPlace.formattedAddress;
                                    });
                                  },
                                  initialPosition: currentlocation,
                                );
                              },
                            ),
                          );
                        },
                      ),
                      SizedBox(
                        height: 20.0,
                      ),
                      Text(address, textAlign: TextAlign.center,),
                      SizedBox(
                        height: 70.0,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: <Widget>[
                          MaterialButton(
                            child: Text("Back",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 15.0,
                                fontFamily: "Kodchasan",
                              ),
                            ),
                            height:35,
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
                          MaterialButton(
                            child: Text("Next",
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 15.0,
                                fontFamily: "Kodchasan",
                              ),
                            ),
                            height:35,
                            minWidth:100,
                            color: Colors.indigo[400],
                            elevation: 15,
                            highlightColor: Colors.grey,
                            splashColor: Colors.blueGrey,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(50),
                            ),
                            onPressed: (){
                              bool Valid=true;
                              if(Valid==true)
                              {
                                String latitudeafter="";
                                String longitudeafter="";
                                if(latitude!=latitudeget)
                                {
                                  latitudeafter=latitude;
                                }
                                if(longitude!=longitudeget)
                                {
                                  longitudeafter=longitude;
                                }
                                void getData() async{
                                  Map<String,String> body = {
                                    'firstname': widget.firstname,
                                    'lastname': widget.lastname,
                                    'oldpassword': widget.oldpassword,
                                    'newpassword': widget.newpassword,
                                    'confirmpassword':widget.confirmpassword,
                                    'gender': widget.gender,
                                    'birthdate': widget.birthdate,
                                    'ridewith': widget.ridewith,
                                    'smoking' : widget.smoking,
                                    'latitude': latitudeafter==null? "" : latitudeafter,
                                    'longitude': longitudeafter==null? "" : longitudeafter,
                                  };
                                  String url="http://3.81.22.120:3000/api/editprofile";
                                  Response response =await post(url, body: body, headers: {"authorization": token});
                                  if(response.statusCode != 200)
                                  {
                                    Map data= jsonDecode(response.body);
                                    showDialog(
                                        context: context,
                                        builder: (BuildContext context) {
                                          return RichAlertDialog(
                                            alertTitle: Text('Error', maxLines: 1, style: TextStyle(color: Colors.black, fontSize: 13),textAlign: TextAlign.center,),
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
                                    print(response.body);
                                    showDialog(
                                        context: context,
                                        builder: (BuildContext context) {
                                          return RichAlertDialog(
                                            alertTitle: richTitle("Done"),
                                            alertSubtitle: richSubtitle("Profile is updated successfully!"),
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
                                                  setState(() {
                                                    Navigator.pop(context);
                                                    Navigator.pop(context);
                                                    Navigator.pop(context);
                                                    Navigator.pop(context);
                                                  });
                                                },
                                              ),
                                            ],
                                          );
                                        });
                                  }
                                }
                                showDialog(
                                    context: context,
                                    builder: (BuildContext context) {
                                      return RichAlertDialog(
                                        alertTitle: richTitle("Save changes"),
                                        alertSubtitle: richSubtitle("Are you sure you want to save changes?"),
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
                                              getData();
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
                              }
                            },
                          ),
                        ],
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
}
