import 'dart:convert';
import 'package:felsekka/pages/AnimatedPage%20Route.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/requestride.dart';
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
                      image: DecorationImage(
                        image: AssetImage("images/map.png"),
                        fit: BoxFit.cover,
                      ),
                      borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30),bottomLeft:Radius.circular(30),bottomRight: Radius.circular(30) )
                  ),
                  child: Column(
                    children: <Widget>[
                      SizedBox(
                        height: 30,
                      ),
                      GestureDetector(
                        onTap: (){
                          print("Offer ride");
                        },
                        child: Container(
                          width: 320,
                          height: 180,
                          decoration: BoxDecoration(
                              gradient: LinearGradient(
                                  begin: Alignment.center,
                                  colors: [
                                    Colors.indigo[500],
                                    Colors.indigo[400],
                                    Colors.indigo[300]
                                  ]
                              ),
                              boxShadow: [BoxShadow(
                                color: Color.fromRGBO(39, 78, 220, 0.3),
                                blurRadius: 20.0,
                                offset: Offset(0,10),
                              )],
                              borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30),bottomLeft:Radius.circular(30),bottomRight: Radius.circular(30) )
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(18.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Row(
                                  children: <Widget>[
                                    Image.asset(
                                        "images/driver.png",
                                      height: 60,
                                      width: 60,
                                    ),
                                    SizedBox(
                                      width: 10,
                                    ),
                                    Text("Offer ride.",
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 25
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: 8,
                                ),
                                Text("Do you have a car? Offer ride to any of your organizations. Try offering rides before 8 pm for higher probability of riders being matched to your offer.",
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 30,
                      ),
                      GestureDetector(
                        onTap: (){
                          Navigator.push(context, AnimatedPageRoute(widget: RequestRide()));
                        },
                        child: Container(
                          width: 320,
                          height: 180,
                          decoration: BoxDecoration(
                              gradient: LinearGradient(
                                  begin: Alignment.center,
                                  colors: [
                                    Colors.red[500],
                                    Colors.red[400],
                                    Colors.red[300]
                                  ]
                              ),
                              boxShadow: [BoxShadow(
                                color: Color.fromRGBO(39, 78, 220, 0.3),
                                blurRadius: 20.0,
                                offset: Offset(0,10),
                              )],
                              borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30),bottomLeft:Radius.circular(30),bottomRight: Radius.circular(30) )
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(18.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Row(
                                  children: <Widget>[
                                    Image.asset(
                                      "images/rider.png",
                                      height: 60,
                                      width: 60,
                                    ),
                                    SizedBox(
                                      width: 10,
                                    ),
                                    Text("Request ride.",
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 25
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: 8,
                                ),
                                Text("Don't have a car? Request ride to any of your organizations. Try requesting rides before 8 pm for higher probability of being matched to an offer.",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 30,
                      ),
                      GestureDetector(
                        onTap: (){
                          print("Join ride");
                        },
                        child: Container(
                          width: 320,
                          height: 180,
                          decoration: BoxDecoration(
                              gradient: LinearGradient(
                                  begin: Alignment.center,
                                  colors: [
                                    Colors.yellow[700],
                                    Colors.yellow[600],
                                    Colors.yellow[500],
                                  ]
                              ),
                              boxShadow: [BoxShadow(
                                color: Color.fromRGBO(39, 78, 220, 0.3),
                                blurRadius: 20.0,
                                offset: Offset(0,10),
                              )],
                              borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30),bottomLeft:Radius.circular(30),bottomRight: Radius.circular(30) )
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(18.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Row(
                                  children: <Widget>[
                                    Image.asset(
                                      "images/holdphone.png",
                                      height: 60,
                                      width: 60,
                                    ),
                                    SizedBox(
                                      width: 10,
                                    ),
                                    Text("Join ride.",
                                      style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 25
                                      ),
                                    ),
                                  ],
                                ),
                                SizedBox(
                                  height: 8,
                                ),
                                Text("Join one of the scheduled rides to any of your organizations. Try joining rides quickly for higher probability of finding a seat.",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
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
              ),
            ),
          ),
        ],
      ),
    );
  }
}
