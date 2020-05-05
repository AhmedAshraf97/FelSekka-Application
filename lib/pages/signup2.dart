import 'package:felsekka/pages/signin.dart';
import 'package:felsekka/pages/signup3.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:gender_selector/gender_selector.dart';
import 'package:http/http.dart';
import 'AnimatedPage Route.dart';
import 'funkyoverlay.dart';
import 'dart:convert';
import 'package:intl/intl.dart';

class SignUp2 extends StatefulWidget {
  final String firstname;
  final String lastname;
  final String username;
  final String email;
  final String phonenumber;
  final String password;
  final String confirmpassword;
  SignUp2(this.firstname, this.lastname, this.username, this.email, this.phonenumber, this.password, this.confirmpassword);
  @override
  _SignUp2State createState() => _SignUp2State();
}

class _SignUp2State extends State<SignUp2> with SingleTickerProviderStateMixin{
  String selectedGender="female";
  String date = null;
  String dateSelected="";
  int ridewith=1;
  int smoking=1;
  String ridewithSelected="";
  String smokingSelected="";
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
                  padding: EdgeInsets.all(20.0),
                  child: Column(
                    children: <Widget>[
                      GenderSelector(
                        margin: EdgeInsets.only(left: 10, top: 0, right: 10, bottom: 5,),
                        selectedGender: selectedGender == "female"
                            ? Gender.FEMALE
                            : Gender.MALE,
                        onChanged: (gender) async {
                          setState(() {
                            if(gender == Gender.FEMALE) {
                              selectedGender = "female";
                            } else {
                              selectedGender = "male";
                            }
                          });
                        },
                      ),
                      SizedBox(
                        height:10,
                      ),
                      Text(
                        "Birth date",
                        style: TextStyle(
                          color: Colors.indigo,
                          fontFamily: "Kodchasan",
                          fontSize: 15.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        date == null? "Please, pick your birthdate" : date,
                        style: TextStyle(
                          color: Colors.blueGrey,
                          fontFamily: "Kodchasan",
                          fontSize: 15.0,
                        ),
                      ),
                      Container(
                        height: 70,
                        child: CupertinoDatePicker(
                          mode: CupertinoDatePickerMode.date,
                          initialDateTime: DateTime(1997, 10, 5),
                          onDateTimeChanged: (DateTime newDateTime) {
                            date = DateFormat('dd-MM-yyyy').format(newDateTime);
                            dateSelected= DateFormat('yyyy-MM-dd').format(newDateTime);
                          },
                        ),
                      ),
                      Text(
                        "*You can change Ride with & Smoking on requesting/offering rides",
                        style: TextStyle(
                          color: Colors.black,
                          fontFamily: "Kodchasan",
                          fontSize: 9.0,
                        ),
                      ),
                      Text(
                        "Ride with:",
                        style: TextStyle(
                          color: Colors.indigo,
                          fontFamily: "Kodchasan",
                          fontSize: 15.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          Radio(
                            activeColor: Colors.indigo,
                            value: 1,
                            groupValue: ridewith,
                            onChanged: (T){
                              setState(() {
                                ridewith=T;
                              });
                            },
                          ),
                          Text(
                            "Men",
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontFamily: "Kodchasan",
                              fontSize: 15.0,
                            ),
                          ),
                          Radio(
                            activeColor: Colors.indigo,
                            value: 2,
                            groupValue: ridewith,
                            onChanged: (T){
                              setState(() {
                                ridewith=T;
                              });
                            },
                          ),
                          Text(
                            "Women",
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontFamily: "Kodchasan",
                              fontSize: 15.0,
                            ),
                          ),
                          Radio(
                            activeColor: Colors.indigo,
                            value: 3,
                            groupValue: ridewith,
                            onChanged: (T){
                              setState(() {
                                ridewith=T;
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
                      Text(
                        "Smoking:",
                        style: TextStyle(
                          color: Colors.indigo,
                          fontFamily: "Kodchasan",
                          fontSize: 15.0,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          Radio(
                            activeColor: Colors.indigo,
                            value: 1,
                            groupValue: smoking,
                            onChanged: (T){
                              setState(() {
                                smoking=T;
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
                            activeColor: Colors.indigo,
                            value: 2,
                            groupValue: smoking,
                            onChanged: (T){
                              setState(() {
                                smoking=T;
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
                            activeColor: Colors.indigo,
                            value: 3,
                            groupValue: smoking,
                            onChanged: (T){
                              setState(() {
                                smoking=T;
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
                      MaterialButton(
                        child: Text("Next",
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
                          RegExp regExpBirthdate= new RegExp(r"([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))");
                          bool Valid=true;
                          //ridewith
                          if(ridewith==1)
                            {
                              ridewithSelected="men";
                            }
                          else if(ridewith==2)
                            {
                              ridewithSelected="women";
                            }
                          else if(ridewith==3)
                            {
                              ridewithSelected="any";
                            }
                          //smoking
                          if(smoking==1)
                          {
                            smokingSelected="yes";
                          }
                          else if(smoking==2)
                          {
                            smokingSelected="no";
                          }
                          else if(smoking==3)
                          {
                            smokingSelected="any";
                          }
                          //Gender validations:
                          if(selectedGender.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Gender is required",image: "images/errorsign.png"),
                            );
                          }
                          //Birthdate validations:
                          else if(dateSelected.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Birth date is required",image: "images/errorsign.png"),
                            );
                          }
                          else if(!regExpBirthdate.hasMatch(dateSelected))
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Invalid Birth date",image: "images/errorsign.png"),
                            );
                          }
                          //Ridewith validation
                          else if(ridewithSelected.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Ride with is required",image: "images/errorsign.png"),
                            );
                          }
                          //Smoking validation
                          else if(smokingSelected.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Smoking is required",image: "images/errorsign.png"),
                            );
                          }
                          if(Valid==true)
                            {
                              void getData() async{
                                Map<String, String> body = {
                                  'gender': selectedGender,
                                  'birthdate': dateSelected,
                                  'ridewith': ridewithSelected,
                                  'smoking' : smokingSelected,
                                };
                                String url="http://3.81.22.120:3000/api/verifytwo";
                                Response response =await post(url, body: body);
                                if(response.statusCode != 200)
                                {
                                  Map data= jsonDecode(response.body);
                                  showDialog(
                                    context: context,
                                    builder: (_) => FunkyOverlay(text: data['message'],image: "images/errorsign.png"),
                                  );
                                }
                                else{
                                  Navigator.push(context, AnimatedPageRoute(widget: SignUp3( widget.firstname, widget.lastname, widget.username, widget.email, widget.phonenumber, widget.password, widget.confirmpassword,this.selectedGender, this.dateSelected, this.ridewithSelected, this.smokingSelected)));
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
