import 'dart:convert';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/signup2.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flashy_tab_bar/flashy_tab_bar.dart';
import 'package:flutter/services.dart';
import 'package:geocoder/geocoder.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_maps_place_picker/google_maps_place_picker.dart';
import 'package:http/http.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'AnimatedPage Route.dart';
import 'package:geolocator/geolocator.dart';

class Trip{
  String tofrom="";
  int tripid=0;
  String arrivaltime="";
  String departuretime="";
  int avaialbleseats=0;
  String date="";
  String ridewith="";
  String smoking="";
  int orgid=0;
  String orgname="";
  String latitude="";
  String longitude="";
  String datetrip="";
  String startloclat="";
  String startloclng="";
  String endloclat="";
  String endloclng="";
  Trip(this.tofrom,this.tripid,this.arrivaltime,this.departuretime,this.avaialbleseats,this.date,this.ridewith, this.smoking,this.orgid,this.orgname,this.latitude,this.longitude,this.datetrip,this.startloclat,this.startloclng,this.endloclat,this.endloclng);
  factory Trip.fromJson(dynamic json) {
    return Trip(json['tofrom'] as String, json['tripid'] as int,json['arrivaltime'] as String, json['departuretime'] as String,json['Availableseats'] as int,json['date'] as String,json['ridewith'] as String,json['smoking'] as String,json['orgid'] as int,json['orgname'] as String,json['orglatitude'] as String,json['orglongitude'] as String,json['date'] as String,json['startloclatitude'] as String,json['startloclongitude'] as String,json['endloclatitude'] as String,json['endloclongitude'] as String);
  }
  @override
  String toString() {
    return '{ ${this.tofrom}, ${this.tripid},${this.arrivaltime}, ${this.departuretime},${this.avaialbleseats},${this.date},${this.ridewith} ,${this.smoking}}';
  }
}

class Org{
  int id=0;
  String name="";
  String domain="";
  String latitude="";
  String longitude="";
  Org(this.id,this.name,this.domain,this.latitude,this.longitude);
  factory Org.fromJson(dynamic json) {
    return Org(json['id'] as int, json['name'] as String,json['domain'] as String, json['latitude'] as String,json['longitude'] as String);
  }
  @override
  String toString() {
    return '{ ${this.id}, ${this.name},${this.domain}, ${this.latitude},${this.longitude} }';
  }
}
class JoinRide extends StatefulWidget with NavigationStates{
  @override
  _JoinRideState createState() => _JoinRideState();
}

class _JoinRideState extends State<JoinRide> {
  String selectedOrg="";
  final List<DropdownMenuItem> orgitems = [];
  List<Card> ListOrgs=[];
  List<Card> ListRides=[];
  int _selectedIndex = 0;
  int noOrgs=0;
  int noRides=0;
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
  String countTrust="";
  int countTrustint=0;
  String date="";
  String dateselected="";
  String earliesttime="";
  String earliesttimeselected="";
  String arrivaltime="";
  String arrivaltimeselected="";
  int ridewithselected=1;
  int smokingselected=1;
  String latesttime="";
  String latesttimeselected="";
  String departuretime="";
  String departuretimeselected="";
  final TimeOfDay _time = new TimeOfDay.now();
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
    //retrieve user data
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
        Map userInfo = data['decoded'];
        id = userInfo['id'];
        firstname = userInfo['firstname'];
        lastname = userInfo['lastname'];
        phonenumber = userInfo['phonenumber'];
        gender = userInfo['gender'];
        password = userInfo['password'];
        birthdate = userInfo['birthdate'];
        ridewith = userInfo['ridewith'];
        smoking = userInfo['smoking'];
        rating = userInfo['rating'];
        status = userInfo['status'];
        email = userInfo['email'];
        latitude = userInfo['latitude'];
        longitude = userInfo['longitude'];
        username = userInfo['username'];
        fullname = firstname + " "+ lastname;
        doubleRating = double.parse(rating);
        trimRating = getDisplayRating(doubleRating);
        if(ridewith=="female")
        {
          ridewithselected=2;
        }
        else if(ridewith=="male")
        {
          ridewithselected=1;
        }
        else
        {
          ridewithselected=3;
        }
        if(smoking=="yes")
        {
          smokingselected=1;
        }
        else if(smoking=="no")
        {
          smokingselected=2;
        }
        else
        {
          smokingselected=3;
        }
    }
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
      ListOrgs=[];
      Map data= jsonDecode(responseMyOrgs.body);
      var orgObjsJson = data['organizations'] as List;
      List<Org> orgObjs = orgObjsJson.map((reviewJson) => Org.fromJson(reviewJson)).toList();
      for(int i=0; i<orgObjs.length; i++)
      {
        orgitems.add(
            DropdownMenuItem(
              child: ListTile(
                contentPadding: EdgeInsets.all(10),
                leading: CircleAvatar(
                  backgroundColor: Colors.white,
                  child: Image.asset("images/org.png",height: 100,),
                ),
                title: Text(orgObjs[i].name,style: TextStyle(color: Colors.indigo),),
                subtitle: Text(orgObjs[i].domain),
                trailing: IconButton(
                  icon: Icon(
                    Icons.location_on,
                    color:Colors.redAccent,
                  ),
                  onPressed: (){
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
                              position: LatLng(double.parse(orgObjs[i].latitude), double.parse(orgObjs[i].longitude))));
                          return Scaffold(
                              body: GoogleMap(
                                initialCameraPosition: CameraPosition(
                                  target: LatLng(double.parse(orgObjs[i].latitude), double.parse(orgObjs[i].longitude)),
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
              ),
              value: orgObjs[i].id.toString(),
            )
        );
      }
    }






    ////////////////////////////////////////////////////////////////////////////////////////
    Map<String, String> body = {
      'tofrom' : "",
      'toorgid': "",
      'fromorgid': "",
      'departuretime': "",
      'arrivaltime' : "",
      'ridewith': "",
      'smoking' : "",
      'date' : ""
    };
    String urlTrips="http://3.81.22.120:3000/api/searchtrip";
    Response responseMyTrips =await post(urlTrips, headers:{'authorization': token},body: body);
    if(responseMyTrips.statusCode==409)
    {
      noRides=1;
    }
    else if(responseMyTrips.statusCode != 200)
    {
      Map data= jsonDecode(responseMyTrips.body);
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
      noRides=0;
      ListRides=[];
      Map data= jsonDecode(responseMyTrips.body);
      var tripObjsJson = data['Trips'] as List;
      List<Trip> tripObjs = tripObjsJson.map((reviewJson) => Trip.fromJson(reviewJson)).toList();
      for(int i=0; i<tripObjs.length; i++)
      {
        double lat=0;
        double lng=0;
        String datetimetrip;
        String tofromorg="";
        Coordinates coordinates;
        String tofromhome="";

        if(tripObjs[i].departuretime=="")
        {
          coordinates = new Coordinates(double.parse(tripObjs[i].startloclat), double.parse(tripObjs[i].startloclng));
          tofromorg="To: ";
          tofromhome="From: ";
          datetimetrip=tripObjs[i].arrivaltime;
          lat= double.parse(tripObjs[i].startloclat);
          lng= double.parse(tripObjs[i].startloclng);
        }
        else
        {
          coordinates = new Coordinates(double.parse(tripObjs[i].endloclat), double.parse(tripObjs[i].endloclng));
          tofromorg="From: ";
          tofromhome="To: ";
          datetimetrip=tripObjs[i].departuretime;
          lat= double.parse(tripObjs[i].endloclat);
          lng= double.parse(tripObjs[i].endloclng);
        }
        List<Placemark> newPlace = await Geolocator().placemarkFromCoordinates(lat, lng);
        Placemark placeMark  = newPlace[0];
        String name = placeMark.name;
        String locality = placeMark.locality;
        String administrativeArea = placeMark.administrativeArea;
        String country = placeMark.country;
        String address= name +" - "+locality+" - "+administrativeArea+" - " +country;
        ListRides.add(
          Card(
            margin: EdgeInsets.fromLTRB(0, 10, 0, 10),
            elevation: 14,
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(15.0),
            ),
            child: Row(
              children: <Widget>[
                Image.asset(
                  "images/bluelogonobg.png",
                  height: 70,
                  width: 70,
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Text(
                          tofromorg ,
                          style: TextStyle(color: Colors.indigo[400],
                              fontSize: 15
                          ),
                        ),
                        Text(
                          tripObjs[i].orgname ,
                          style: TextStyle(color: Colors.blueGrey,
                              fontSize: 14
                          ),
                        ),

                        IconButton(
                          alignment: Alignment.topRight,
                          splashColor: Colors.grey,
                          icon: Icon(
                            Icons.location_on,
                            color:Colors.blueGrey[400],
                          ),
                          onPressed: (){
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
                                      position: LatLng(double.parse(tripObjs[i].latitude), double.parse(tripObjs[i].longitude))));
                                  return Scaffold(
                                      body: GoogleMap(
                                        initialCameraPosition: CameraPosition(
                                          target: LatLng(double.parse(tripObjs[i].latitude), double.parse(tripObjs[i].longitude)),
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
                      ],
                    ),

                    Row(
                      children: <Widget>[
                        Container(
                            width: 220,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  tofromhome ,
                                  style: TextStyle(color: Colors.indigo[400],
                                      fontSize: 15
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                  maxLines: 5,
                                ),
                                Flexible(
                                  child: Text(
                                    address ,
                                    style: TextStyle(color: Colors.blueGrey,
                                        fontSize: 14
                                    ),
                                  ),
                                ),
                              ],
                            )
                        ),
                        /*IconButton(
                          splashColor: Colors.grey,
                          icon: Icon(
                            Icons.location_on,
                            color:Colors.blueGrey,
                          ),
                          onPressed: (){
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
                                      position: LatLng(lat,lng)));
                                  return Scaffold(
                                      body: GoogleMap(
                                        initialCameraPosition: CameraPosition(
                                          target: LatLng(lat,lng),
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
                        ),*/
                      ],
                    ),
                    Row(
                      children: <Widget>[
                        Text(
                          "Date: " ,
                          style: TextStyle(color: Colors.indigo[400],
                              fontSize: 15
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                        Text(
                          tripObjs[i].datetrip ,
                          style: TextStyle(color: Colors.blueGrey,
                              fontSize: 14
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                      ],
                    ),
                    Row(
                      children: <Widget>[
                        Text(
                          "Time: " ,
                          style: TextStyle(color: Colors.indigo[400],
                              fontSize: 15
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                        Text(
                          datetimetrip,
                          style: TextStyle(color: Colors.blueGrey,
                              fontSize: 14
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                      ],
                    ),
                    Row(
                      children: <Widget>[
                        Text(
                          "Ride with: " ,
                          style: TextStyle(color: Colors.indigo[400],
                              fontSize: 15
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                        Text(
                          tripObjs[i].ridewith ,
                          style: TextStyle(color: Colors.blueGrey,
                              fontSize: 14
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                      ],
                    ),
                    Row(
                      children: <Widget>[
                        Text(
                          "Smoking: " ,
                          style: TextStyle(color: Colors.indigo[400],
                              fontSize: 15
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                        Text(
                          tripObjs[i].smoking,
                          style: TextStyle(color: Colors.blueGrey,
                              fontSize: 14
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                      ],
                    ),
                    Row(
                      children: <Widget>[
                        Text(
                          "Number of available seats: " ,
                          style: TextStyle(color: Colors.indigo[400],
                              fontSize: 15
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                        Text(
                          tripObjs[i].avaialbleseats.toString(),
                          style: TextStyle(color: Colors.blueGrey,
                              fontSize: 14
                          ),
                          overflow: TextOverflow.ellipsis,
                          maxLines: 5,
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      }
    }
    return null;
  }


  @override
  Widget build(BuildContext context) {
    final tabs=[
      FutureBuilder(
          future: getData(),
          builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
            print(snapshot.connectionState);
            if(snapshot.connectionState == ConnectionState.done)
            {
              return Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                child: Container(
                  child: noRides == 1 ? Center(child: Text("No rides to show yet.",style: TextStyle(color: Colors.indigo, fontSize: 20,),)) :
                  Column(

                    children: <Widget>[
                      SizedBox(
                        height: 20,
                      ),
                      Text(
                        "Tap to join ride.",
                        style: TextStyle(
                          color: Colors.blueGrey,
                          fontSize: 15,
                        ),
                      ),
                      Expanded(
                        child: ListView(
                          children: ListRides,
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
   Container(
     child: Center(
       child: Text("hi"),
     ),
   )
    ];
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
                          icon: Icon(Icons.directions_run,color: Colors.indigo,),
                          title: Text('Join ride', style: TextStyle(fontSize: 15,color: Colors.indigo),),
                        ),
                        FlashyTabBarItem(
                          icon: Icon(Icons.search,color: Colors.indigo,),
                          title: Text('Search for ride', style: TextStyle(fontSize: 15,color: Colors.indigo),),
                        ),
                      ],
                    ),
                    body: tabs[_selectedIndex],
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
