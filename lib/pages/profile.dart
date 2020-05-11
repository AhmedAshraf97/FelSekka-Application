import 'dart:convert';
import 'package:felsekka/pages/homepage.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/sidebar_layout.dart';
import 'package:felsekka/pages/signup.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:http/http.dart';
import 'package:jiffy/jiffy.dart';
import 'package:rich_alert/rich_alert.dart';
import 'AnimatedPage Route.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Profile extends StatefulWidget with NavigationStates{
  @override
  _ProfileState createState() => _ProfileState();
}

class _ProfileState extends State<Profile> {
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
  String imggender="";
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
    String url="http://3.81.22.120:3000/api/retrieveuserdata";
    Response response =await post(url, headers:{'authorization': token});
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
      setState(() {
        Map data= jsonDecode(response.body);
        Map userInfo = data['decoded'];
        id = userInfo['id'];//
        firstname = userInfo['firstname'];//
        lastname = userInfo['lastname'];//
        phonenumber = userInfo['phonenumber'];//
        gender = userInfo['gender'];//
        password = userInfo['password'];//
        birthdate = userInfo['birthdate'];//
        ridewith = userInfo['ridewith'];
        smoking = userInfo['smoking'];
        rating = userInfo['rating'];//
        status = userInfo['status'];//
        email = userInfo['email'];//
        latitude = userInfo['latitude'];
        longitude = userInfo['longitude'];
        username = userInfo['username'];//
        fullname = firstname + " "+ lastname;
        doubleRating = double.parse(rating);
        trimRating = getDisplayRating(doubleRating);
        if(gender=="female")
          {
            imggender="images/avatarfemale.png";
          }
        else if(gender=="male")
          {
            imggender="images/avatarmale.png";
          }
      });
    }
  }
  @override
  void initState(){
    setState(() {
      getData();
    });
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
                color: Colors.indigo,
              ),
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Container(
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30),bottomLeft:Radius.circular(30),bottomRight: Radius.circular(30) )
                  ),
                  child: Column(
                    children: <Widget>[
                      SizedBox(
                        height:10.0,
                      ),
                      CircleAvatar(
                        child: Image.asset(imggender),
                        radius: 60,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Text(
                        fullname,
                        style: TextStyle(
                            color: Colors.indigo,
                            fontSize: 25,
                        ),
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          Text(
                            trimRating,
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 18,
                            ),
                          ),
                          Icon(
                            Icons.star,
                            color: Colors.grey,
                            size: 18,
                          ),
                          SizedBox(
                            width: 10,
                          ),
                          Text(
                            "5",
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 18,
                            ),
                          ),
                          Icon(
                            Icons.check_box,
                            color: Colors.grey,
                            size: 18,
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: <Widget>[
                          SizedBox(
                            width: 20,
                          ),
                          Text(
                            "First name:",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontSize: 18,
                            ),
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text(
                            firstname,
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: <Widget>[
                          SizedBox(
                            width: 20,
                          ),
                          Text(
                            "Last name:",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontSize: 18,
                            ),
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text(
                            lastname,
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: <Widget>[
                          SizedBox(
                            width: 20,
                          ),
                          Text(
                            "Username:",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontSize: 18,
                            ),
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text(
                            username,
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: <Widget>[
                          SizedBox(
                            width: 20,
                          ),
                          Text(
                            "E-mail:",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontSize: 18,
                            ),
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text(
                            email,
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: <Widget>[
                          SizedBox(
                            width: 20,
                          ),
                          Text(
                            "Phone number:",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontSize: 18,
                            ),
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text(
                            phonenumber,
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: <Widget>[
                          SizedBox(
                            width: 20,
                          ),
                          Text(
                            "Birthdate:",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontSize: 18,
                            ),
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text(
                            birthdate,
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: <Widget>[
                          SizedBox(
                            width: 20,
                          ),
                          Text(
                            "Gender:",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontSize: 18,
                            ),
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text(
                            gender == "female"? "Female" : "Male",
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: <Widget>[
                          SizedBox(
                            width: 20,
                          ),
                          Text(
                            "Ride with:",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontSize: 18,
                            ),
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text(
                            ridewith,
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 5,
                      ),
                      Row(
                        children: <Widget>[
                          SizedBox(
                            width: 20,
                          ),
                          Text(
                            "Smoking:",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontSize: 18,
                            ),
                          ),
                          SizedBox(
                            width: 5,
                          ),
                          Text(
                            smoking,
                            style: TextStyle(
                              color: Colors.blueGrey,
                              fontSize: 18,
                            ),
                          ),
                        ],
                      ),
                      Divider(
                        height: 5,
                        thickness: 1,
                        color: Colors.indigo.withOpacity(0.3),
                        indent: 15,
                        endIndent: 15,
                      ),
                      SizedBox(
                        height: 15,
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: <Widget>[
                          new OutlineButton(
                            shape: StadiumBorder(),
                            textColor: Colors.blue,
                            child: Text('View home location', style: TextStyle(color: Colors.indigo[400]),),
                            borderSide: BorderSide(
                                color: Colors.indigo[400], style: BorderStyle.solid,
                                width: 1),
                            onPressed: () {},
                          ),
                          new OutlineButton(
                            shape: StadiumBorder(),
                            textColor: Colors.blue,
                            child: Text('View reviews', style: TextStyle(color: Colors.indigo[400]),),
                            borderSide: BorderSide(
                                color: Colors.indigo[400], style: BorderStyle.solid,
                                width: 1),
                            onPressed: () {},
                          )
                        ]
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