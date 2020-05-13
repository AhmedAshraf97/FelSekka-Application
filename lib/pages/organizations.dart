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
class Organizations extends StatefulWidget with NavigationStates{
  @override
  _OrganizationsState createState() => _OrganizationsState();
}

class _OrganizationsState extends State<Organizations> {
  List<Card> ListOrgs=[];
  static TextEditingController nameController = new TextEditingController();
  static TextEditingController domainController = new TextEditingController();
  int _selectedIndex = 0;
  PickResult selectedPlace;
  String latitude="";
  String longitude="";
  int noOrgs=0;
  String token;


  Future<String> getData() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token')??'');
    //User orgs
    String urlMyOrgs="http://3.81.22.120:3000/api/showmyorg";
    Response responseMyOrgs =await post(urlMyOrgs, headers:{'authorization': token});
    print(responseMyOrgs.body);
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
        ListOrgs.add(
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
                child: Image.asset("images/org.png",height: 100,),
              ),
              title: Text(orgObjs[i].name,style: TextStyle(color: Colors.indigo),),
              subtitle: Text(orgObjs[i].domain),
              trailing: Icon(
                Icons.location_on,
                color:Colors.redAccent,
              ),
              onTap: (){
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
          if(snapshot.connectionState == ConnectionState.done)
          {
            return Padding(
              padding: const EdgeInsets.fromLTRB(30, 0, 30, 0),
              child: Container(
                child: noOrgs == 1 ? Center(child: Text("No organizations to show yet.",style: TextStyle(color: Colors.indigo, fontSize: 20,),)) : ListView(
                  children: ListOrgs,
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
      Center(child: Text("Join orgs")),
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
                  "Add Organization:",
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
                    print(body);
                    String url="http://3.81.22.120:3000/api/addorg";
                    Response response =await post(url, headers:{'authorization': token}, body: body);
                    print(response.body);
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
                            icon: Icon(Icons.location_city),
                            title: Text('My Organizations', style: TextStyle(fontSize: 12,color: Colors.indigo),),
                          ),
                          FlashyTabBarItem(
                            icon: Icon(Icons.search),
                            title: Text('Join Organization', style: TextStyle(fontSize: 12,color: Colors.indigo),),
                          ),
                          FlashyTabBarItem(
                            icon: Icon(Icons.add),
                            title: Text('Add Organization', style: TextStyle(fontSize: 12,color: Colors.indigo),),
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
