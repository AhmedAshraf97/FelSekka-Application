import 'dart:convert';

import 'package:felsekka/pages/AnimatedPage%20Route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';
import 'package:felsekka/pages/signup3.dart';
import 'package:http/http.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

import 'funkyoverlay.dart';
class HomePage extends StatefulWidget {
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
      print(response.statusCode);
      print(response.body);
      if(response.statusCode != 200)
      {
        Map data= jsonDecode(response.body);
        showDialog(
          context: context,
          builder: (_) => FunkyOverlay(text: data['message'],image: "images/errorsign.png"),
        );
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
      }
    }
    getData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Text(
        "Hi there"
      ),
    );
  }
}
