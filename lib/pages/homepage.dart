import 'dart:convert';
import 'package:felsekka/pages/AnimatedPage%20Route.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/offerride.dart';
import 'package:felsekka/pages/requestride.dart';
import 'package:felsekka/pages/sidebar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';
import 'package:http/http.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

import 'joinride.dart';
class HomePage extends StatefulWidget with NavigationStates{
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String token="";
  int noOrgs=0;
  int noCars=0;
  Future<String> getData() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token')??'');
    //User orgs
    String urlMyOrgs="http://3.81.22.120:3000/api/showmyorg";
    Response responseMyOrgs =await post(urlMyOrgs, headers:{'authorization': token});
    if(responseMyOrgs.statusCode==409)
    {
      noOrgs=1;
    }
    else if(responseMyOrgs.statusCode != 200)
    {
      Map data= jsonDecode(responseMyOrgs.body);
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
      noOrgs=0;
    }






    //User cars
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
      }
    setState(() {
    });
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
                          if(noOrgs==1 && noCars==1)
                          {
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Can't offer ride."),
                                    alertSubtitle: richSubtitle("You have to join an organization and add a car."),
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
                          else if(noOrgs==1)
                          {
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Can't offer ride."),
                                    alertSubtitle: richSubtitle("You have to join an organization to offer ride."),
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
                          else if(noCars==1)
                          {
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Can't offer ride."),
                                    alertSubtitle: richSubtitle("You have to add a car to offer ride."),
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
                          else
                          {
                            Navigator.push(context, AnimatedPageRoute(widget: OfferRide()));
                          }
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
                          if(noOrgs==1)
                            {
                              showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    return RichAlertDialog(
                                      alertTitle: richTitle("Can't request ride."),
                                      alertSubtitle: richSubtitle("You have to join an organization to request ride."),
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
                          else
                            {
                              Navigator.push(context, AnimatedPageRoute(widget: RequestRide()));
                            }
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
                          if(noOrgs==1)
                          {
                            showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return RichAlertDialog(
                                    alertTitle: richTitle("Can't join ride."),
                                    alertSubtitle: richSubtitle("You have to join an organization to join ride."),
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
                          else
                          {
                            Navigator.push(context, AnimatedPageRoute(widget: JoinRide()));
                          }
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