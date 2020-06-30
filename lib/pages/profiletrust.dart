import 'dart:convert';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:cupertino_radio_choice/cupertino_radio_choice.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:smooth_star_rating/smooth_star_rating.dart';

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
class ProfileTrust extends StatefulWidget with NavigationStates{
  String username="";
  String firstname="";
  String lastname="";
  String gender="";
  int trust12=0;
  int trust21=0;
  String ratingtotal="";
  ProfileTrust(this.ratingtotal,this.username,this.firstname,this.lastname,this.gender,this.trust12,this.trust21);
  @override
  _ProfileTrustState createState() => _ProfileTrustState();
}

class _ProfileTrustState extends State<ProfileTrust> {
  TextEditingController reviewController = new TextEditingController();
  List<Card> ListReviews=[];
  String token;
  int noReviews=0;
  String imggender="";
  String changereview="";

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
    if(widget.gender=="female")
    {
      imggender="images/avatarfemale.png";
    }
    else{
      imggender="images/avatarmale.png";
    }
    //User reviews
    Map<String, String> body = {
      'username' : widget.username,
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
              alertTitle: richTitle("User error"),
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
                child: Image.asset(
                    img,
                    height: 40
                ),
              ),
              title: AutoSizeText(reviewtype,style: TextStyle(color: Colors.indigo[400], fontSize: 15),maxLines: 1,minFontSize: 2,),
              subtitle: AutoSizeText(reviewObjs[i].review,style: TextStyle(color: Colors.grey[600], fontSize: 13),maxLines: 5, minFontSize: 2,),
            ),
          ),
        );
      }
    }
    return null;
  }
  Future<Null>refreshpage() async{
    setState(() {
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
                                      radius: 50,
                                    ),
                                    SizedBox(
                                      height: 5,
                                    ),
                                    AutoSizeText(
                                      widget.firstname + " " + widget.lastname,
                                      style: TextStyle(
                                        color: Colors.indigo,
                                        fontSize: 25,
                                      ),
                                      maxLines: 1,
                                      minFontSize: 2,
                                    ),
                                    SizedBox(
                                      height: 2,
                                    ),
                                    widget.trust21==1?
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: <Widget>[
                                        Text(
                                          "trusts you ",
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
                                    )
                                        :
                                    Row(),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: <Widget>[
                                        Text(
                                          getDisplayRating(double.parse(widget.ratingtotal)),
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
                                      ],
                                    ),
                                    Divider(
                                      height: 5,
                                      thickness: 1,
                                      color: Colors.indigo,
                                      indent: 10,
                                      endIndent: 10,
                                    ),
                                    SizedBox(
                                      height: 10,
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.fromLTRB(33,0,0,0),
                                      child: Text("Trust this user?", style: TextStyle(color:Colors.indigo[400],fontSize: 16)),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.fromLTRB(15,0,15,0),
                                      child: AutoSizeText("By trusting this user, there will be higher probability of being matched together in your next rides.", maxLines:2,style: TextStyle(color:Colors.grey[400],fontSize: 10),textAlign: TextAlign.center,),
                                    ),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: <Widget>[
                                        Radio(
                                          activeColor: Colors.indigo[400],
                                          value: 1,
                                          groupValue: widget.trust12,
                                          onChanged: (T){
                                            setState(() {
                                              widget.trust12=T;
                                            });
                                          },
                                        ),
                                        Text(
                                          "Trust",
                                          style: TextStyle(
                                            color: Colors.blueGrey,
                                            fontFamily: "Kodchasan",
                                            fontSize: 15.0,
                                          ),
                                        ),
                                        Radio(
                                          activeColor: Colors.indigo[400],
                                          value: 0,
                                          groupValue: widget.trust12,
                                          onChanged: (T){
                                            setState(() {
                                              widget.trust12=T;
                                            });
                                          },
                                        ),
                                        Text(
                                          "Neutral",
                                          style: TextStyle(
                                            color: Colors.blueGrey,
                                            fontFamily: "Kodchasan",
                                            fontSize: 15.0,
                                          ),
                                        ),
                                        Radio(
                                          activeColor: Colors.indigo[400],
                                          value: -1,
                                          groupValue: widget.trust12,
                                          onChanged: (T){
                                            setState(() {
                                              widget.trust12=T;
                                            });
                                          },
                                        ),
                                        Text(
                                          "Untrust",
                                          style: TextStyle(
                                            color: Colors.blueGrey,
                                            fontFamily: "Kodchasan",
                                            fontSize: 15.0,
                                          ),
                                        ),
                                      ],
                                    ),
                                    SizedBox(
                                      height: 10,
                                    ),
                                    Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                        children: <Widget>[
                                          new OutlineButton(
                                            shape: StadiumBorder(),
                                            textColor: Colors.blue,
                                            child: Row(
                                              children: <Widget>[
                                                Icon(
                                                  Icons.comment,
                                                  color: Colors.indigo[400],
                                                  size: 18,
                                                ),
                                                SizedBox(
                                                  width: 2,
                                                ),
                                                Text(' View reviews', style: TextStyle(color: Colors.indigo[400],fontSize: 12),),
                                              ],
                                            ),
                                            borderSide: BorderSide(
                                                color: Colors.indigo[400], style: BorderStyle.solid,
                                                width: 1),
                                            onPressed: () {
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
                                                                  padding: const EdgeInsets.all(10.0),
                                                                  child: Container(
                                                                    decoration: BoxDecoration(
                                                                        color: Colors.white,
                                                                        borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30),bottomLeft:Radius.circular(30),bottomRight: Radius.circular(30) )
                                                                    ),
                                                                    child: noReviews == 1 ? Center(child: AutoSizeText("No reviews to show yet.",style: TextStyle(color: Colors.indigo, fontSize: 20,),maxLines: 1, minFontSize: 2,)) : Padding(
                                                                      padding: const EdgeInsets.all(15.0),
                                                                      child: ListView(
                                                                        children: ListReviews,
                                                                      ),
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
                                      height: 10,
                                    ),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                                      children: <Widget>[
                                        MaterialButton(
                                          child: Text("Back",
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 16.0,
                                              fontFamily: "Kodchasan",
                                            ),
                                          ),
                                          height:40,
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
                                          child: Text("Save",
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 16.0,
                                              fontFamily: "Kodchasan",
                                            ),
                                          ),
                                          height:40,
                                          minWidth:100,
                                          color: Colors.indigo[400],
                                          elevation: 15,
                                          highlightColor: Colors.grey,
                                          splashColor: Colors.blueGrey,
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(50),
                                          ),
                                          onPressed: (){
                                            void updatetrust() async {
                                              Map<String, String> body = {
                                                "trustedusername": widget.username,
                                                "trust": widget.trust12.toString(),
                                              };
                                              String url = "http://3.81.22.120:3000/api/updatetrust";
                                              Response response = await post(
                                                  url, body: body,
                                                  headers: {
                                                    'authorization': token
                                                  });
                                              if (response.statusCode != 200) {
                                                Map data = jsonDecode(
                                                    response.body);
                                                showDialog(
                                                    context: context,
                                                    builder: (
                                                        BuildContext context) {
                                                      return RichAlertDialog(
                                                        alertTitle: Text(
                                                          'User error',
                                                          maxLines: 1,
                                                          style: TextStyle(
                                                              color: Colors.black,
                                                              fontSize: 13),
                                                          textAlign: TextAlign
                                                              .center,),
                                                        alertSubtitle: Text(
                                                          data['message'],
                                                          maxLines: 2,
                                                          style: TextStyle(
                                                              color: Colors
                                                                  .grey[500],
                                                              fontSize: 12),
                                                          textAlign: TextAlign
                                                              .center,),
                                                        alertType: RichAlertType
                                                            .WARNING,
                                                        dialogIcon: Icon(
                                                          Icons.warning,
                                                          color: Colors.red,
                                                          size: 80,
                                                        ),
                                                        actions: <Widget>[
                                                          new OutlineButton(
                                                            shape: StadiumBorder(),
                                                            textColor: Colors
                                                                .blue,
                                                            child: Text('Ok',
                                                              style: TextStyle(
                                                                  color: Colors
                                                                      .indigo[400],
                                                                  fontSize: 30),),
                                                            borderSide: BorderSide(
                                                                color: Colors
                                                                    .indigo[400],
                                                                style: BorderStyle
                                                                    .solid,
                                                                width: 1),
                                                            onPressed: () {
                                                              Navigator.pop(
                                                                  context);
                                                            },
                                                          ),
                                                        ],
                                                      );
                                                    });
                                              }
                                              else {
                                              }
                                            }
                                            updatetrust();
                                            Navigator.pop(context);
                                          },
                                        ),
                                      ],
                                    ),
                                    SizedBox(
                                      height: 50,
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
