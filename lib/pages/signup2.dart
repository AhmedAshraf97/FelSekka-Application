import 'package:auto_size_text/auto_size_text.dart';
import 'package:felsekka/pages/signin.dart';
import 'package:felsekka/pages/signup3.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:gender_selector/gender_selector.dart';
import 'package:http/http.dart';
import 'package:rich_alert/rich_alert.dart';
import 'AnimatedPage Route.dart';
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
  String date = null; //To show date
  String dateSelected=""; //To sign up
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
                  Colors.indigo[500],
                  Colors.indigo[400],
                  Colors.indigo[300]
                ]
            )
        ),
        child: Column(
          children: <Widget>[
            Image.asset(
              "images/felsekkalogowhitenobg.png",
              height: 50.0,
            ),
            AutoSizeText(
              "Sign Up & Carpool!",
              minFontSize: 2.0,
              maxLines: 1,
              style: TextStyle(
                color: Colors.white,
                fontFamily: "Kodchasan",
                fontSize: 10.0,
              ),
            ),
            SizedBox(
              height: 5.0,
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
                        femaleimg: "https://github.com/dhruvemod/gender_selector_flutter/blob/master/assets/female.png?raw=true",
                        maleimg: "https://github.com/dhruvemod/gender_selector_flutter/blob/master/assets/male.png?raw=true",
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
                        height: 80,
                        child: CupertinoDatePicker(
                          mode: CupertinoDatePickerMode.date,
                          initialDateTime: DateTime.now(),
                          onDateTimeChanged: (DateTime newDateTime) {
                            date = DateFormat('dd-MM-yyyy').format(newDateTime);
                            setState(() {
                            });
                            dateSelected= DateFormat('yyyy-MM-dd').format(newDateTime);
                          },
                        ),
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      AutoSizeText(
                        "*You can change Ride with & Smoking on requesting/offering rides",
                        minFontSize: 2,
                        maxLines: 1,
                        style: TextStyle(
                          color: Colors.black,
                          fontFamily: "Kodchasan",
                          fontSize: 9.0,
                        ),
                      ),
                      SizedBox(
                        height: 3,
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
                            selectedGender=="female"? "Female" : "Male",
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
                          RegExp regExpBirthdate= new RegExp(r"([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))");
                          bool Valid=true;
                          //ridewith as string
                          if(ridewith==1)
                            {
                              ridewithSelected=selectedGender;
                            }
                          else if(ridewith==2)
                            {
                              ridewithSelected="any";
                            }
                          //smoking as string
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
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Gender"),
                                    alertSubtitle: richSubtitle("Gender is required"),
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
                          //Birthdate validations:
                          else if(dateSelected.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Birth date"),
                                    alertSubtitle: richSubtitle("Birth date is required"),
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
                          else if(!regExpBirthdate.hasMatch(dateSelected))
                          {
                            Valid = false;
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Birth date"),
                                    alertSubtitle: richSubtitle("Invalid birth date"),
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
                          //Ridewith validation
                          else if(ridewithSelected.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Ride with"),
                                    alertSubtitle: richSubtitle("Ride with is required"),
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
                          //Smoking validation
                          else if(smokingSelected.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Smoking"),
                                    alertSubtitle: richSubtitle("Smoking is required"),
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
                        child: AutoSizeText(
                          "Already have an account? Sign In.",
                          minFontSize: 2,
                          maxLines: 1,
                          style: TextStyle(
                            color: Colors.indigo[400],
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
