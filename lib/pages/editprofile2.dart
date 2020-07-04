import 'package:auto_size_text/auto_size_text.dart';
import 'package:felsekka/pages/signin.dart';
import 'package:felsekka/pages/signup2.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:gender_selector/gender_selector.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'AnimatedPage Route.dart';
import 'dart:convert';

import 'editprofile3.dart';
import 'navigation_bloc.dart';

class EditProfile2 extends StatefulWidget with NavigationStates{
  String firstname="";
  String lastname="";
  String oldpassword="";
  String newpassword="";
  String confirmpassword="";
  String token="";
  EditProfile2(this.firstname, this.lastname, this.oldpassword, this.newpassword, this.confirmpassword, this.token);
  @override
  _EditProfile2State createState() => _EditProfile2State();
}

class _EditProfile2State extends State<EditProfile2> with SingleTickerProviderStateMixin{
  String selectedGender="female";
  String date = null; //To show date
  String dateSelected=""; //To sign up
  int ridewith=1;
  int smoking=1;
  String ridewithSelected="";
  String smokingSelected="";
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
  String latitude="";
  String longitude="";
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
      latitude = userInfo['latitude'];
      longitude = userInfo['longitude'];
      username = userInfo['username'];
      datetoshow = DateFormat('dd-MM-yyyy').format(DateTime.parse(birthdate));
      setState(() {
        if(ridewithget=="female")
        {
          ridewith=2;
          ridewithtoshow="Female";
        }
        else if(ridewithget == "male")
        {
          ridewith=1;
          ridewithtoshow="Male";
        }
        else
        {
          ridewith=3;
          ridewithtoshow="Any";
        }
        if(smokingget=="yes")
        {
          smoking=1;
          smokingtoshow="Yes";
        }
        else if(smokingget=="no")
        {
          smoking=2;
          smokingtoshow="No";
        }
        else
        {
          smoking=3;
          smokingtoshow="Any";
        }
        selectedGender=gender;
        date=datetoshow;
      });
    }
    return null;
  }


  @override
  void initState() {
    getData();
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
                          initialDateTime: DateTime.parse(birthdate),
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
                            "Male",
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
                            "Female",
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
                              RegExp regExpBirthdate= new RegExp(r"([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))");
                              bool Valid=true;
                              //ridewith as string
                              if(ridewith==1)
                              {
                                ridewithSelected="male";
                              }
                              else if(ridewith==2)
                              {
                                ridewithSelected="female";
                              }
                              else if(ridewith==3)
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
                              if(Valid==true)
                              {
                                String genderAfter="";
                                String dateAfter="";
                                String ridewithAfter="";
                                String smokingAfter="";
                                if(gender!=selectedGender)
                                  {
                                    genderAfter=selectedGender;
                                  }
                                if(date!=datetoshow)
                                  {
                                    dateAfter=dateSelected;
                                  }
                                if(ridewithget!=ridewithSelected)
                                  {
                                    ridewithAfter=ridewithSelected;
                                  }
                                if(smokingget!=smokingSelected)
                                  {
                                    smokingAfter=smokingSelected;
                                  }
                                Navigator.push(context, AnimatedPageRoute(widget: EditProfile3(widget.firstname, widget.lastname, widget.oldpassword, widget.newpassword, widget.confirmpassword, token, genderAfter, dateAfter, ridewithAfter, smokingAfter)));
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
