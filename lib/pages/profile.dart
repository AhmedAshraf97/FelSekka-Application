import 'dart:convert';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Review{
  String type="";
  String review="";
  Review(this.type,this.review);
    factory Review.fromJson(dynamic json) {
      return Review(json['type'] as String, json['review'] as String);
    }
  @override
  String toString() {
      return '{ ${this.type}, ${this.review} }';
    }
  }
class Profile extends StatefulWidget with NavigationStates{
  @override
  _ProfileState createState() => _ProfileState();
}

class _ProfileState extends State<Profile> {
  List<Card> ListReviews=[];
  String token;
  int noReviews=0;
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
  String countTrust="";
  int countTrustint=0;
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
    }
    //Trust
    String urltrust = "http://3.81.22.120:3000/api/peopletrustme";
    Response responsetrust = await post(urltrust, headers:{'authorization': token});
    if(responsetrust.statusCode != 200)
    {
      Map data= jsonDecode(responsetrust.body);
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
        Map data= jsonDecode(responsetrust.body);
        countTrustint = data['count'];
        countTrust = countTrustint.toString();
    }
    //User reviews
    Map<String, String> body = {
      'username' : username,
    };
    String urlReviews="http://3.81.22.120:3000/api/getreviews";
    Response responseReviews =await post(urlReviews, headers:{'authorization': token}, body:body );
    if(responseReviews.statusCode==409)
    {
      noReviews=1;
    }
    else if(responseReviews.statusCode != 200)
    {
      Map data= jsonDecode(responseReviews.body);
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
      noReviews=0;
      ListReviews=[];
      Map data= jsonDecode(responseReviews.body);
      var reviewObjsJson = data['reviews'] as List;
      List<Review> reviewObjs = reviewObjsJson.map((reviewJson) => Review.fromJson(reviewJson)).toList();
      for(int i=0; i<reviewObjs.length; i++)
        {
          String img="";
          String reviewtype="";
          if(reviewObjs[i].type=="driver")
            {
              img="images/driver.png";
              reviewtype="Review as a driver:";
            }
          else{
            img="images/rider.png";
            reviewtype="Review as a rider:";
          }
          ListReviews.add(
            Card(
              elevation: 4,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15.0),
              ),
              child: ListTile(
                contentPadding: EdgeInsets.all(10),
                leading: CircleAvatar(
                  child: Image.asset(img,height: 50,),
                ),
                title: Text(reviewtype,style: TextStyle(color: Colors.indigo),),
                subtitle: Text(reviewObjs[i].review),
              ),
            ),
          );
        }
    }
    return null;
  }
  Future<Null>refreshpage(){
    setState(() {
      int z=0;
    });
    return null;
  }
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: getData(),
      builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
        if(snapshot.connectionState == ConnectionState.done)
          {
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
                        child: RefreshIndicator(
                          onRefresh: refreshpage,
                          child: ListView(
                            children: <Widget>[
                              Container(
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
                                          countTrust,
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
                                      height: 10,
                                    ),
                                    Row(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 20,
                                        ),
                                        Icon(
                                          Icons.person,
                                          color: Colors.indigo,
                                        ),
                                        SizedBox(
                                          width: 2,
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
                                      height: 10,
                                    ),
                                    Row(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 20,
                                        ),
                                        Icon(
                                          Icons.person,
                                          color: Colors.indigo,
                                        ),
                                        SizedBox(
                                          width: 2,
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
                                      height: 10,
                                    ),
                                    Row(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 20,
                                        ),
                                        Icon(
                                          Icons.person,
                                          color: Colors.indigo,
                                        ),
                                        SizedBox(
                                          width: 2,
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
                                      height: 10,
                                    ),
                                    Row(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 20,
                                        ),
                                        Icon(
                                          Icons.mail,
                                          color: Colors.indigo,
                                        ),
                                        SizedBox(
                                          width: 2,
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
                                      height: 10,
                                    ),
                                    Row(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 20,
                                        ),
                                        Icon(
                                          Icons.phone_in_talk,
                                          color: Colors.indigo,
                                        ),
                                        SizedBox(
                                          width: 2,
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
                                      height: 10,
                                    ),
                                    Row(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 20,
                                        ),
                                        Icon(
                                          Icons.cake,
                                          color: Colors.indigo,
                                        ),
                                        SizedBox(
                                          width: 2,
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
                                      height: 10,
                                    ),
                                    Row(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 20,
                                        ),
                                        Icon(
                                          Icons.people,
                                          color: Colors.indigo,
                                        ),
                                        SizedBox(
                                          width: 2,
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
                                      height: 10,
                                    ),
                                    Row(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 20,
                                        ),
                                        Icon(
                                          Icons.time_to_leave,
                                          color: Colors.indigo,
                                        ),
                                        SizedBox(
                                          width: 2,
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
                                      height: 10,
                                    ),
                                    Row(
                                      children: <Widget>[
                                        SizedBox(
                                          width: 20,
                                        ),
                                        Icon(
                                          Icons.smoking_rooms,
                                          color: Colors.indigo,
                                        ),
                                        SizedBox(
                                          width: 2,
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
                                      height: 20,
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
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) {
                                                    List<Marker> allMarkers = [];
                                                    allMarkers.add(Marker(
                                                        markerId: MarkerId('myMarker'),
                                                        draggable: true,
                                                        onTap: () {
                                                          print('Marker Tapped');
                                                        },
                                                        position: LatLng(double.parse(latitude), double.parse(longitude))));
                                                    return Scaffold(
                                                      body: GoogleMap(
                                                        initialCameraPosition: CameraPosition(
                                                          target: LatLng(double.parse(latitude) , double.parse(longitude)),
                                                          zoom: 16,
                                                        ),
                                                        markers: Set.from(allMarkers),
                                                      ),
                                                        floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
                                                        floatingActionButton: new FloatingActionButton(
                                                            elevation: 0.0,
                                                            child: new Icon(Icons.close),
                                                            backgroundColor: Colors.indigo[400],
                                                            onPressed: (){
                                                              Navigator.pop(context);
                                                            }
                                                        )
                                                    );
                                                  },
                                                ),
                                              );
                                            },
                                          ),
                                          new OutlineButton(
                                            shape: StadiumBorder(),
                                            textColor: Colors.blue,
                                            child: Text('View reviews', style: TextStyle(color: Colors.indigo[400]),),
                                            borderSide: BorderSide(
                                                color: Colors.indigo[400], style: BorderStyle.solid,
                                                width: 1),
                                            onPressed: () {
                                              //////////////////////////////////////////////
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) {
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
                                                                      child: noReviews == 1 ? Center(child: Text("No reviews to show yet.",style: TextStyle(color: Colors.indigo, fontSize: 20,),)) : ListView(
                                                                        children: ListReviews,
                                                                      ),
                                                                  ),
                                                                ),
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                        floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
                                                        floatingActionButton: new FloatingActionButton(
                                                            elevation: 0.0,
                                                            child: new Icon(Icons.close),
                                                            backgroundColor: Colors.indigo[400],
                                                            onPressed: (){
                                                              Navigator.pop(context);
                                                            }
                                                        )
                                                    );
                                                  },
                                                ),
                                              );
                                            },
                                          )
                                        ]
                                    ),
                                    SizedBox(
                                      height: 25,
                                    )
                                  ],
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
        else{
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
                        child:Center(
                          child: GlowingProgressIndicator(
                          child: Image.asset("images/bluelogonobg.png", width: 150, height: 150,),
                        ),
                        )
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }
      }
    );
  }
}
