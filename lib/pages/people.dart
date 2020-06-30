import 'dart:convert';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/profiletrust.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flashy_tab_bar/flashy_tab_bar.dart';
import 'package:http/http.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'AnimatedPage Route.dart';
import 'ScheduledRide.dart';

class UserITrust{
  int id=0;
  int trust=0;
  String username="";
  String firstname="";
  String lastname="";
  String gender="";
  String rating="";
  int trust12=0;
  int trust21=0;
  String trimrating="";
  double doublerating=0;
  String fullname="";
  UserITrust(this.id,this.trust);
  factory UserITrust.fromJson(dynamic json) {
    return UserITrust(json['user1id'] as int,json['trust'] as int);
  }
}


class UserTrustMe{
  int id=0;
  int trust=0;
  String username="";
  String firstname="";
  String lastname="";
  String gender="";
  String rating="";
  int trust12=0;
  int trust21=0;
  String trimrating="";
  double doublerating=0;
  String fullname="";
  UserTrustMe(this.id,this.trust);
  factory UserTrustMe.fromJson(dynamic json) {
    return UserTrustMe(json['user2id'] as int,json['trust'] as int);
  }
}


class People extends StatefulWidget with NavigationStates{
  @override
  _PeopleState createState() => _PeopleState();
}



class _PeopleState extends State<People> {
  List<Card> ListTrustedBy=[];
  List<Card> ListITrust=[];
  int _selectedIndex = 0;
  int noTrustedBy=0;
  int noITrust=0;
  String token;

  Future<String> getData1() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token')??'');
    ListITrust=[];
    //People I trust
    String urlITrust="http://3.81.22.120:3000/api/peopleItrust";
    Response responseITrust =await post(urlITrust, headers:{'authorization': token});
    if(responseITrust.statusCode != 200)
    {
      Map data= jsonDecode(responseITrust.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle('User error'),
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
      Map data= jsonDecode(responseITrust.body);
      var count=data['count'];
      if(count==0)
        {
          noITrust=1;
        }
      else
        {
          noITrust=0;
          ListITrust=[];
          var ITrustObjsJson = data['rows'] as List;
          List<UserTrustMe> ITrustObjs = ITrustObjsJson.map((reviewJson) => UserTrustMe.fromJson(reviewJson)).toList();
          for(int i=0; i<ITrustObjs.length; i++)
          {
            String url="http://3.81.22.120:3000/api/showprofileextra";
            Map<String,String> body =
            {
              "id": ITrustObjs[i].id.toString(),
            };
            Response response =await post(url, headers:{'authorization': token}, body: body);
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
              Map userInfo= jsonDecode(response.body);
              ITrustObjs[i].firstname = userInfo['firstname'];
              ITrustObjs[i].lastname = userInfo['lastname'];
              ITrustObjs[i].gender = userInfo['gender'];
              ITrustObjs[i].rating = userInfo['rating'];
              ITrustObjs[i].username = userInfo['username'];
              ITrustObjs[i].fullname = ITrustObjs[i].firstname + " "+ ITrustObjs[i].lastname;
              ITrustObjs[i].doublerating = double.parse(ITrustObjs[i].rating);
              ITrustObjs[i].trimrating = getDisplayRating(ITrustObjs[i].doublerating);
            }
            ListITrust.add(
              Card(
                elevation: 4,
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15.0),
                ),
                child: ListTile(
                  contentPadding: EdgeInsets.all(10),
                  leading: CircleAvatar(
                    backgroundColor: Colors.white,
                    child: ITrustObjs[i].gender=="female"? Image.asset("images/avatarfemale.png",height: 100,) : Image.asset("images/avatarmale.png",height: 100,),
                  ),
                  title: AutoSizeText(ITrustObjs[i].fullname, maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400], fontSize: 13)),
                  subtitle: Row(
                    children: <Widget>[
                      AutoSizeText(ITrustObjs[i].trimrating, maxLines: 1, minFontSize:2,style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                      Icon(
                        Icons.star,
                        color: Colors.grey[500],
                        size: 20,
                      ),
                    ],
                  ),
                  onTap: () async{
                    Map<String,String> body={
                      "username": ITrustObjs[i].username,
                    };
                    String urlTrust="http://3.81.22.120:3000/api/showTrust";
                    Response responseTrust =await post(urlTrust, headers:{'authorization': token}, body: body);
                    if(responseTrust.statusCode != 200)
                    {
                      Map data= jsonDecode(responseTrust.body);
                      showDialog(
                          context: context,
                          builder: (BuildContext context) {
                            return RichAlertDialog(
                              alertTitle: richTitle('User error'),
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
                      Map data= jsonDecode(responseTrust.body);
                      var trustJson = data['trustArr'] as List;
                      ITrustObjs[i].trust12= trustJson[0]['trust'];
                      ITrustObjs[i].trust21= trustJson[1]['trust'];
                    }
                    Navigator.push(context, AnimatedPageRoute(widget: ProfileTrust(ITrustObjs[i].trimrating,ITrustObjs[i].username,ITrustObjs[i].firstname,ITrustObjs[i].lastname,ITrustObjs[i].gender,ITrustObjs[i].trust12,ITrustObjs[i].trust21)));
                  },
                ),
              ),
            );
          }
        }
    }
    return null;
  }


  Future<String> getData2() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token')??'');
    ListTrustedBy=[];

    //People trust me
    String urlTrustMe="http://3.81.22.120:3000/api/peopletrustme";
    Response responseTrustMe =await post(urlTrustMe, headers:{'authorization': token});
    if(responseTrustMe.statusCode != 200)
    {
      Map data= jsonDecode(responseTrustMe.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle('User error'),
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
      Map data= jsonDecode(responseTrustMe.body);
      var count=data['count'];
      if(count==0)
      {
        noTrustedBy=1;
      }
      else
      {
        noTrustedBy=0;
        ListTrustedBy=[];
        var ITrustObjsJson = data['rows'] as List;
        List<UserITrust> ITrustObjs = ITrustObjsJson.map((reviewJson) => UserITrust.fromJson(reviewJson)).toList();
        for(int i=0; i<ITrustObjs.length; i++)
        {
          String url="http://3.81.22.120:3000/api/showprofileextra";
          Map<String,String> body =
          {
            "id": ITrustObjs[i].id.toString(),
          };
          Response response =await post(url, headers:{'authorization': token}, body: body);
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
            Map userInfo= jsonDecode(response.body);
            ITrustObjs[i].firstname = userInfo['firstname'];
            ITrustObjs[i].lastname = userInfo['lastname'];
            ITrustObjs[i].gender = userInfo['gender'];
            ITrustObjs[i].rating = userInfo['rating'];
            ITrustObjs[i].username = userInfo['username'];
            ITrustObjs[i].fullname = ITrustObjs[i].firstname + " "+ ITrustObjs[i].lastname;
            ITrustObjs[i].doublerating = double.parse(ITrustObjs[i].rating);
            ITrustObjs[i].trimrating = getDisplayRating(ITrustObjs[i].doublerating);
          }
          ListTrustedBy.add(
            Card(
              elevation: 4,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15.0),
              ),
              child: ListTile(
                contentPadding: EdgeInsets.all(10),
                leading: CircleAvatar(
                  backgroundColor: Colors.white,
                  child: ITrustObjs[i].gender=="female"? Image.asset("images/avatarfemale.png",height: 100,) : Image.asset("images/avatarmale.png",height: 100,),
                ),
                title: AutoSizeText(ITrustObjs[i].fullname, maxLines: 1,minFontSize: 2, style: TextStyle(color: Colors.indigo[400], fontSize: 13)),
                subtitle: Row(
                  children: <Widget>[
                    AutoSizeText(ITrustObjs[i].trimrating, maxLines: 1, minFontSize:2,style: TextStyle(color: Colors.grey[500], fontSize: 13)),
                    Icon(
                      Icons.star,
                      color: Colors.grey[500],
                      size: 20,
                    ),
                  ],
                ),
                onTap: () async{
                  String urlTrust="http://3.81.22.120:3000/api/showTrust";
                  Map<String,String> body={
                    "username": ITrustObjs[i].username,
                  };
                  Response responseTrust =await post(urlTrust, headers:{'authorization': token}, body: body);
                  if(responseTrust.statusCode != 200)
                  {
                    Map data= jsonDecode(responseTrust.body);
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle('User error'),
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
                    Map data= jsonDecode(responseTrust.body);
                    var trustJson = data['trustArr'] as List;
                    ITrustObjs[i].trust12= trustJson[0]['trust'];
                    ITrustObjs[i].trust21= trustJson[1]['trust'];
                  }
                  Navigator.push(context, AnimatedPageRoute(widget: ProfileTrust(ITrustObjs[i].trimrating,ITrustObjs[i].username,ITrustObjs[i].firstname,ITrustObjs[i].lastname,ITrustObjs[i].gender,ITrustObjs[i].trust12,ITrustObjs[i].trust21)));
                },
              ),
            ),
          );
        }
      }
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final tabs=[
      FutureBuilder(
          future: getData1(),
          builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
            if(snapshot.connectionState == ConnectionState.done)
            {
              return Padding(
                padding: const EdgeInsets.fromLTRB(30, 0, 30, 0),
                child: Container(
                  child: noITrust == 1 ? Center(child: AutoSizeText("No trusted people yet.",style: TextStyle(color: Colors.indigo, fontSize: 20,),maxLines: 1,minFontSize: 2,)) :
                  Column(
                    children: <Widget>[
                      SizedBox(
                        height: 20,
                      ),
                      /*AutoSizeText(
                        "Tap to leave Organization.",
                        style: TextStyle(
                          color: Colors.blueGrey,
                          fontSize: 15,
                        ),
                        minFontSize: 2,
                        maxLines: 1,
                      ),*/
                      Expanded(
                        child: ListView(
                          children: ListITrust,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }
            else{
              return Container(
                  child:Center(
                    child: GlowingProgressIndicator(
                      child: Image.asset("images/bluelogonobg.png", width: 150, height: 150,),
                    ),
                  )
              );
            }
          }
      ),
      FutureBuilder(
          future: getData2(),
          builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
            if(snapshot.connectionState == ConnectionState.done)
            {
              return Padding(
                padding: const EdgeInsets.fromLTRB(30, 0, 30, 0),
                child: Container(
                  child: noTrustedBy == 1 ? Center(child: AutoSizeText("No one trusted you yet.",minFontSize:2,maxLines:1,style: TextStyle(color: Colors.indigo, fontSize: 20,),)) :
                  Column(
                    children: <Widget>[
                      SizedBox(
                        height: 20,
                      ),
                      /*AutoSizeText(
                        "Tap to join Organization.",
                        style: TextStyle(
                          color: Colors.blueGrey,
                          fontSize: 15,
                        ),
                        minFontSize: 2,
                        maxLines: 1,
                      ),*/
                      Expanded(
                        child: ListView(
                          children: ListTrustedBy,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }
            else{
              return Container(
                  child:Center(
                    child: GlowingProgressIndicator(
                      child: Image.asset("images/bluelogonobg.png", width: 150, height: 150,),
                    ),
                  )
              );
            }
          }
      ),
    ];
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
                      Colors.indigo[600],
                      Colors.indigo[500],
                      Colors.indigo[400],
                      Colors.indigo[300]
                    ]
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10.0,10,10,0),
                child: Container(
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30))
                  ),
                  child:Scaffold(
                    bottomNavigationBar: FlashyTabBar(
                      animationCurve: Curves.linear,
                      selectedIndex: _selectedIndex,
                      showElevation: true, // use this to remove appBar's elevation
                      onItemSelected: (index) => setState(() {
                        _selectedIndex = index;
                      }),
                      items: [
                        FlashyTabBarItem(
                          icon: Icon(Icons.people),
                          title: Text('I trust', style: TextStyle(fontSize: 12,color: Colors.indigo[400]),),
                        ),
                        FlashyTabBarItem(
                          icon: Icon(Icons.people),
                          title: Text('Trusted by', style: TextStyle(fontSize: 12,color: Colors.indigo[400]),),
                        ),
                      ],
                    ),
                    body: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: tabs[_selectedIndex],
                    ),
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
