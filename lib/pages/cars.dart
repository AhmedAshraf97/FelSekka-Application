import 'dart:convert';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/signup2.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flashy_tab_bar/flashy_tab_bar.dart';
import 'package:flutter/services.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_maps_place_picker/google_maps_place_picker.dart';
import 'package:http/http.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'AnimatedPage Route.dart';

class Car{
  int id=0;
  String brand="";
  String model="";
  int year=0;
  String type="";
  String plateletters="";
  int platenumbers=0;
  int numberofseats=0;
  int nationalid=0;
  String carlicensefront="";
  String carlicenseback="";
  String driverlicensefront="";
  String driverlicenseback="";
  String color="";
  Car(this.id,this.brand,this.model,this.year,this.type,this.plateletters,this.platenumbers,this.numberofseats,this.nationalid,this.carlicensefront,this.carlicenseback,this.driverlicensefront,this.driverlicenseback,this.color);
  factory Car.fromJson(dynamic json) {
    return Car(json['id'] as int, json['brand'] as String,json['model'] as String, json['year'] as int,json['type'] as String,json['plateletters'] as String,json['platenumbers'] as int,json['numberofseats'] as int,json['nationalid'] as int,json['carlicensefront'] as String,json['carlicenseback'] as String,json['driverlicensefront'] as String,json['driverlicenseback'] as String,json['color'] as String);
  }
  @override
  String toString() {
    return '{ ${this.id}, ${this.brand},${this.model}, ${this.year},${this.type},${this.plateletters},${this.platenumbers},${this.numberofseats},${this.nationalid},${this.carlicensefront},${this.carlicenseback},${this.driverlicensefront},${this.driverlicenseback},${this.color}}';
  }
}
class Cars extends StatefulWidget with NavigationStates{
  @override
  _CarsState createState() => _CarsState();
}

class _CarsState extends State<Cars> {
  List<Card> ListCars=[];
  static TextEditingController nameController = new TextEditingController();
  static TextEditingController domainController = new TextEditingController();
  static TextEditingController emailController = new TextEditingController();
  int _selectedIndex = 0;
  PickResult selectedPlace;
  String latitude="";
  String longitude="";
  int noCars=0;
  String token;


  Future<String> getData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token') ?? '');
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
      ListCars = [];
      Map data = jsonDecode(responseMyCars.body);
      var carObjsJson = data['Cars'] as List;
      List<Car> carObjs = carObjsJson.map((reviewJson) =>
          Car.fromJson(reviewJson)).toList();
      for (int i = 0; i < carObjs.length; i++) {
        String up = carObjs[i].color;
        up = up + " ";
        up = up + carObjs[i].brand;
        up = up + " ";
        up = up + carObjs[i].model;
        String down = carObjs[i].type;
        down = down + " - ";
        down = down + carObjs[i].year.toString();
        String seats = "Number of seats: ";
        seats = seats + carObjs[i].numberofseats.toString();
        String plate = carObjs[i].plateletters;
        plate = plate + " - ";
        plate = plate + carObjs[i].platenumbers.toString();
        ListCars.add(
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
                child: Image.asset("images/caricon.jpg", height: 200,),
              ),
              title: Text(up, style: TextStyle(color: Colors.indigo),),
              subtitle: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(down),
                  Text(seats),
                  Text(plate),
                ],
              ),
              trailing: IconButton(
                icon: Icon(
                  Icons.delete,
                  color: Colors.blueGrey,
                ),
                onPressed: () {
                  showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return RichAlertDialog(
                          alertTitle: richTitle("Delete car"),
                          alertSubtitle: richSubtitle("Are you sure you want to delete car?"),
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
                              child: Text('Yes', style: TextStyle(color: Colors.indigo[400],fontSize: 30),),
                              borderSide: BorderSide(
                                  color: Colors.indigo[400], style: BorderStyle.solid,
                                  width: 1),
                              onPressed: () async{
                                String url="http://3.81.22.120:3000/api/deletecar";
                                Response response =await post(url, headers:{'authorization': token}, body:{'carid': carObjs[i].id.toString()});
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
                                  Navigator.pop(context);
                                }
                                else{
                                  Navigator.pop(context);
                                  setState(() {
                                  });
                                  showDialog(
                                      context: context,
                                      builder: (BuildContext context) {
                                        return RichAlertDialog(
                                          alertTitle: richTitle("Done"),
                                          alertSubtitle: richSubtitle("You deleted this car."),
                                          alertType: RichAlertType.SUCCESS,
                                          dialogIcon: Icon(
                                            Icons.check,
                                            color: Colors.green,
                                            size: 100,
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
                              },
                            ),
                            SizedBox(width: 20,),
                            new OutlineButton(
                              shape: StadiumBorder(),
                              textColor: Colors.blue,
                              child: Text('No', style: TextStyle(color: Colors.red[400],fontSize: 30),),
                              borderSide: BorderSide(
                                  color: Colors.red[400], style: BorderStyle.solid,
                                  width: 1),
                              onPressed: () {
                                Navigator.pop(context);
                              },
                            ),
                          ],
                        );
                      });
                },
              ),
              onTap: () {},
            ),
          ),
        );
      }
      return null;
    }
  }
  @override
  Widget build(BuildContext context) {
    final tabs=[
      //tab1
      FutureBuilder(
          future: getData(),
          builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
            if(snapshot.connectionState == ConnectionState.done)
            {
              return Padding(
                padding: const EdgeInsets.fromLTRB(33, 0, 33, 0),
                child: Container(
                  child: noCars == 1 ? Center(child: Text("No cars to show yet.",style: TextStyle(color: Colors.indigo, fontSize: 20,),)) :
                  Column(
                    children: <Widget>[
                      Expanded(
                        child: ListView(
                          children: ListCars,
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















      //tab2
      SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            SizedBox(
              height: 20,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Icon(
                  Icons.add_circle,
                  color:Colors.redAccent,
                ),
                Text(
                  "Add Car:",
                  style: TextStyle(
                    color: Colors.indigo,
                    fontSize: 20,
                  ),
                ),
              ],
            ),
            Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                SizedBox(
                  height: 20,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Organization name:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                SizedBox(
                  height: 3,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22,5.0,22,13),
                  child: Container(
                    height: 55.0,
                    padding: EdgeInsets.all(15.0),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [BoxShadow(
                        color: Color.fromRGBO(39, 78, 220, 0.3),
                        blurRadius: 20.0,
                        offset: Offset(0,10),
                      )],
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border(bottom: BorderSide(color: Colors.grey[200])),
                      ),
                      child: TextField(
                        controller: nameController,
                        maxLength: 30,
                        decoration: InputDecoration(
                          counterText: "",
                          hintText: "Organization name",
                          hintStyle: TextStyle(color:Colors.grey),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("E-mail domain:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                SizedBox(
                  height: 3,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22,5.0,22,13),
                  child: Container(
                    height: 55.0,
                    padding: EdgeInsets.all(15.0),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [BoxShadow(
                        color: Color.fromRGBO(39, 78, 220, 0.3),
                        blurRadius: 20.0,
                        offset: Offset(0,10),
                      )],
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border(bottom: BorderSide(color: Colors.grey[200])),
                      ),
                      child: TextField(
                        controller: domainController,
                        maxLength: 30,
                        decoration: InputDecoration(
                          counterText: "",
                          hintText: "E-mail domain:",
                          hintStyle: TextStyle(color:Colors.grey),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            MaterialButton(
              child: Text("Choose location",
                style: TextStyle(
                  color: Colors.indigo,
                  fontSize: 20.0,
                  fontFamily: "Kodchasan",
                ),
              ),
              height:40,
              minWidth:100,
              color: Colors.white,
              elevation: 15,
              highlightColor: Colors.grey,
              splashColor: Colors.blueGrey,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(50),
              ),
              onPressed: (){
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) {
                      return PlacePicker(
                        apiKey: "AIzaSyC6NQ_ODwiORDBTsuB5k9J8prDQ_MTZgB4",
                        useCurrentLocation: true,
                        onPlacePicked: (result) {
                          selectedPlace = result;
                          latitude=selectedPlace.geometry.location.lat.toString();
                          longitude=selectedPlace.geometry.location.lng.toString();
                          Navigator.of(context).pop();
                          setState(() {});
                        },
                      );
                    },
                  ),
                );
              },
            ),
            selectedPlace == null ? Container() : Text(selectedPlace.formattedAddress ?? "", textAlign: TextAlign.center,),

            Padding(
              padding: const EdgeInsets.fromLTRB(25, 15, 25, 50),
              child: Text("Your request for adding this organization will be processed and if it is accepted, you will be able to join this organization in Join Organization tab.", textAlign: TextAlign.center, style:TextStyle(color: Colors.blueGrey)),
            ),
            MaterialButton(
              child: Text("Add",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20.0,
                  fontFamily: "Kodchasan",
                ),
              ),
              height:40,
              minWidth:100,
              color: Colors.indigo,
              elevation: 15,
              highlightColor: Colors.grey,
              splashColor: Colors.blueGrey,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(50),
              ),
              onPressed: (){
                String name= nameController.text;
                String domain= domainController.text;
                bool Valid= true;
                //Name validations:
                if(name.isEmpty)
                {
                  Valid = false;
                  showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return RichAlertDialog(
                          alertTitle: richTitle("Organization name"),
                          alertSubtitle: richSubtitle("Organization name is required"),
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
                //Domain validations:
                else if(domain.isEmpty)
                {
                  Valid = false;
                  showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return RichAlertDialog(
                          alertTitle: richTitle("E-mail domain"),
                          alertSubtitle: richSubtitle("E-mail domain is required"),
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
                else if(selectedPlace==null)
                {
                  Valid = false;
                  showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return RichAlertDialog(
                          alertTitle: richTitle("Location"),
                          alertSubtitle: richSubtitle("Location is required"),
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
                if(Valid==true)
                {
                  void getData() async{
                    SharedPreferences prefs = await SharedPreferences.getInstance();
                    String token = await (prefs.getString('token')??'');
                    Map<String, String> body = {
                      'name': name,
                      'domain': domain,
                      'latitude': latitude,
                      'longitude' : longitude,
                    };
                    String url="http://3.81.22.120:3000/api/addorg";
                    Response response =await post(url, headers:{'authorization': token}, body: body);
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
                      nameController.text="";
                      domainController.text="";
                      selectedPlace=null;
                      setState(() {
                      });
                      showDialog(
                          context: context,
                          builder: (BuildContext context) {
                            return RichAlertDialog(
                              alertTitle: richTitle("Done"),
                              alertSubtitle: richSubtitle("Your request will be processed."),
                              alertType: RichAlertType.SUCCESS,
                              dialogIcon: Icon(
                                Icons.check,
                                color: Colors.green,
                                size: 100,
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
                  }
                  getData();
                }
              },
            ),
          ],
        ),
      ),
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
                          icon: Icon(Icons.time_to_leave),
                          title: Text('My Cars', style: TextStyle(fontSize: 16,color: Colors.indigo),),
                        ),
                        FlashyTabBarItem(
                          icon: Icon(Icons.add),
                          title: Text('Add car', style: TextStyle(fontSize: 16,color: Colors.indigo),),
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