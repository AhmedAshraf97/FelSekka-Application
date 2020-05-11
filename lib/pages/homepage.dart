import 'dart:convert';
import 'package:felsekka/pages/AnimatedPage%20Route.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/sidebar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';
import 'package:http/http.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
class HomePage extends StatefulWidget with NavigationStates{
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String token="";
  @override
  void initState() {
    void getData() async{
      SharedPreferences prefs = await SharedPreferences.getInstance();
      token = (prefs.getString('token')??'');
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
        Map data= jsonDecode(response.body);
        Map userinfo = data['decoded'];
        int id = userinfo['id'];
        String firstname = userinfo['firstname'];
        String lastname = userinfo['lastname'];
        String phonenumber = userinfo['phonenumber'];
        String gender = userinfo['gender'];
        String password = userinfo['password'];
        String birthdate = userinfo['birthdate'];
        String ridewith = userinfo['ridewith'];
        String smoking = userinfo['smoking'];
        String rating = userinfo['rating'];
        String status = userinfo['status'];
        String email = userinfo['email'];
        String latitude = userinfo['latitude'];
        String longitude = userinfo['longitude'];
        String username = userinfo['username'];
        /*String token= data['token'];
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);*/
      }
    }
    getData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
          children: <Widget>[
            Center(
              child: Text( "Home page", style: TextStyle(
                fontSize: 50,
              ),),
            )
      ],
    )
    );
  }
}
