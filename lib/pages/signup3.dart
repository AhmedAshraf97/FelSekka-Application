import 'package:felsekka/pages/signin.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:http/http.dart';
import 'package:rich_alert/rich_alert.dart';
import 'AnimatedPage Route.dart';
import 'dart:convert';
import 'package:google_maps_place_picker/google_maps_place_picker.dart';

class SignUp3 extends StatefulWidget {
  final String firstname;
  final String lastname;
  final String username;
  final String email;
  final String phonenumber;
  final String password;
  final String confirmpassword;
  final String selectedGender;
  final String dateSelected;
  final String ridewithSelected;
  final String smokingSelected;
  SignUp3(this.firstname, this.lastname, this.username, this.email, this.phonenumber, this.password, this.confirmpassword, this.selectedGender, this.dateSelected, this.ridewithSelected, this.smokingSelected);
  @override
  _SignUp3State createState() => _SignUp3State();
}

class _SignUp3State extends State<SignUp3> with SingleTickerProviderStateMixin{
  PickResult selectedPlace;
  String latitude;
  String longitude;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.center,
                colors: [
                  Colors.indigo[700],
                  Colors.indigo[600],
                  Colors.deepPurple[800],
                  Colors.deepPurple[600],
                  Colors.indigo[500],
                  Colors.indigo[400]
                ]
            )
        ),
        child: Column(
          children: <Widget>[
            SizedBox(
              height: 10.0,
            ),
            Image.asset(
              "images/felsekkalogowhitenobg.png",
              height: 60.0,
            ),
            Text(
              "Sign Up & Carpool!",
              style: TextStyle(
                color: Colors.white,
                fontFamily: "Kodchasan",
                fontSize: 15.0,
              ),
            ),
            SizedBox(
              height: 10.0,
            ),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.only(topLeft: Radius.circular(60),topRight: Radius.circular(60))
                ),
                child: Padding(
                  padding: EdgeInsets.all(30.0),
                  child: Column(
                    children: <Widget>[
                      Image.asset(
                        "images/location.png",
                        height: 150.0,
                      ),
                      Text(
                        "Choose your home location.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.indigo,
                          fontFamily: "Kodchasan",
                          fontSize: 15.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        "You will go from and to this location.",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.indigo,
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
                            color: Colors.indigo,
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
                                  useCurrentLocation: true,
                                  onPlacePicked: (result) {
                                    selectedPlace = result;
                                    latitude=selectedPlace.geometry.location.lat.toString();
                                    longitude=selectedPlace.geometry.location.lng.toString();
                                    Navigator.of(context).pop();
                                    setState(() {});
                                  },
                                );
                              },
                            ),
                          );
                        },
                      ),
                      SizedBox(
                        height: 20.0,
                      ),
                      selectedPlace == null ? Container() : Text(selectedPlace.formattedAddress ?? "", textAlign: TextAlign.center,),
                      SizedBox(
                        height: 70.0,
                      ),
                      MaterialButton(
                        child: Text("Done",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20.0,
                            fontFamily: "Kodchasan",
                          ),
                        ),
                        height:40,
                        minWidth:100,
                        color: Colors.indigo,
                        elevation: 15,
                        highlightColor: Colors.grey,
                        splashColor: Colors.blueGrey,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(50),
                        ),
                        onPressed: (){
                          bool valid=true;
                          if(selectedPlace==null)
                          {
                            valid = false;
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Home location"),
                                    alertSubtitle: richSubtitle("Home location is required"),
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
                          if(valid==true)
                          {
                            void getData() async{
                              Map<String,String> body = {
                                'firstname': widget.firstname,
                                'lastname': widget.lastname,
                                'username': widget.username,
                                'email' : widget.email,
                                'phonenumber' : widget.phonenumber,
                                'password': widget.password,
                                'confirmpassword':widget.confirmpassword,
                                'gender': widget.selectedGender,
                                'birthdate': widget.dateSelected,
                                'ridewith': widget.ridewithSelected,
                                'smoking' : widget.smokingSelected,
                                'latitude': latitude,
                                'longitude': longitude,
                                'photo': "",
                              };
                              String url="http://3.81.22.120:3000/api/signup";
                              Response response =await post(url, body: body);
                              if(response.statusCode != 201)
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
                                Navigator.push(context, AnimatedPageRoute(widget: SignIn()));
                              }
                            }
                            getData();
                          }

                        },
                      ),
                      new FlatButton(
                        onPressed: () {
                          Navigator.pop(context);
                          Navigator.push(context, AnimatedPageRoute(widget: SignIn()));
                        },
                        child: Text(
                          "Already have an account? Sign In.",
                          style: TextStyle(
                            color: Colors.indigo,
                            fontFamily: "Kodchasan",
                            decoration: TextDecoration.underline,
                          ),
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
    );
  }
}