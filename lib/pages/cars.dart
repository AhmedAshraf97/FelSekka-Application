import 'dart:convert';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flashy_tab_bar/flashy_tab_bar.dart';
import 'package:google_maps_place_picker/google_maps_place_picker.dart';
import 'package:http/http.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:searchable_dropdown/searchable_dropdown.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'AnimatedPage Route.dart';

class Car{
  int id=0;
  String brand="";
  String model="";
  int year=0;
  String type="";
  String plateletters="";
  String platenumbers="";
  int numberofseats=0;
  int nationalid=0;
  String carlicensefront="";
  String carlicenseback="";
  String driverlicensefront="";
  String driverlicenseback="";
  String color="";
  Car(this.id,this.brand,this.model,this.year,this.type,this.plateletters,this.platenumbers,this.numberofseats,this.nationalid,this.carlicensefront,this.carlicenseback,this.driverlicensefront,this.driverlicenseback,this.color);
  factory Car.fromJson(dynamic json) {
    return Car(json['id'] as int, json['brand'] as String,json['model'] as String, json['year'] as int,json['type'] as String,json['plateletters'] as String,json['platenumbers'] as String,json['numberofseats'] as int,json['nationalid'] as int,json['carlicensefront'] as String,json['carlicenseback'] as String,json['driverlicensefront'] as String,json['driverlicenseback'] as String,json['color'] as String);
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
  String token;

  //Add car initializations:
  String selectedBrand="";
  String selectedType="";
  String selectedColor="";
  String selectedYear="";
  final List<DropdownMenuItem> yearitems = [
    DropdownMenuItem(
      child: Text("2020"),
      value: "2020",
    ),DropdownMenuItem(
      child: Text("2019"),
      value: "2019",
    ),DropdownMenuItem(
      child: Text("2018"),
      value: "2018",
    ),DropdownMenuItem(
      child: Text("2017"),
      value: "2017",
    ),DropdownMenuItem(
      child: Text("2016"),
      value: "2016",
    ),DropdownMenuItem(
      child: Text("2015"),
      value: "2015",
    ),DropdownMenuItem(
      child: Text("2014"),
      value: "2014",
    ),
    DropdownMenuItem(
      child: Text("2013"),
      value: "2013",
    ),DropdownMenuItem(
      child: Text("2012"),
      value: "2012",
    ),DropdownMenuItem(
      child: Text("2011"),
      value: "2011",
    ),DropdownMenuItem(
      child: Text("2010"),
      value: "2010",
    ),DropdownMenuItem(
      child: Text("2009"),
      value: "2009",
    ),DropdownMenuItem(
      child: Text("2008"),
      value: "2008",
    ),DropdownMenuItem(
      child: Text("2007"),
      value: "2007",
    ),
    DropdownMenuItem(
      child: Text("2006"),
      value: "2006",
    ),DropdownMenuItem(
      child: Text("2005"),
      value: "2005",
    ),DropdownMenuItem(
      child: Text("2004"),
      value: "2004",
    ),DropdownMenuItem(
      child: Text("2003"),
      value: "2003",
    ),DropdownMenuItem(
      child: Text("2002"),
      value: "2002",
    ),DropdownMenuItem(
      child: Text("2001"),
      value: "2001",
    ),DropdownMenuItem(
      child: Text("2000"),
      value: "2000",
    ),
    DropdownMenuItem(
      child: Text("1999"),
      value: "1999",
    ),DropdownMenuItem(
      child: Text("1998"),
      value: "1998",
    ),DropdownMenuItem(
      child: Text("1997"),
      value: "1997",
    ),DropdownMenuItem(
      child: Text("1996"),
      value: "1996",
    ),
    DropdownMenuItem(
      child: Text("1995"),
      value: "1995",
    ),DropdownMenuItem(
      child: Text("1994"),
      value: "1994",
    ),DropdownMenuItem(
      child: Text("1993"),
      value: "1993",
    ),DropdownMenuItem(
      child: Text("1992"),
      value: "1992",
    ),DropdownMenuItem(
      child: Text("1991"),
      value: "1991",
    ),DropdownMenuItem(
      child: Text("1990"),
      value: "1990",
    ),
  ];
  final List<DropdownMenuItem> typeitems = [
    DropdownMenuItem(
      child: Text("Coupe"),
      value: "Coupe",
    ),DropdownMenuItem(
      child: Text("Convertible"),
      value: "Convertible",
    ),DropdownMenuItem(
      child: Text("SUV"),
      value: "SUV",
    ),DropdownMenuItem(
      child: Text("Sedan"),
      value: "Sedan",
    ),DropdownMenuItem(
      child: Text("CUV"),
      value: "CUV",
    ),DropdownMenuItem(
      child: Text("Htachback"),
      value: "Hatchback",
    ),DropdownMenuItem(
      child: Text("Micro"),
      value: "Micro",
    ),
  ];
  final List<DropdownMenuItem> coloritems = [
    DropdownMenuItem(
      child: Text("Red"),
      value: "Red",
    ),DropdownMenuItem(
      child: Text("Blue"),
      value: "Blue",
    ),DropdownMenuItem(
      child: Text("Green"),
      value: "Greem",
    ),DropdownMenuItem(
      child: Text("Yellow"),
      value: "Yellow",
    ),DropdownMenuItem(
      child: Text("Black"),
      value: "Black",
    ),DropdownMenuItem(
      child: Text("White"),
      value: "White",
    ),DropdownMenuItem(
      child: Text("Grey"),
      value: "Grey",
    ),
    DropdownMenuItem(
      child: Text("Silver"),
      value: "Silver",
    ),
    DropdownMenuItem(
      child: Text("Gold"),
      value: "Gold",
    ),DropdownMenuItem(
      child: Text("Purple"),
      value: "Purple",
    ),DropdownMenuItem(
      child: Text("Beige"),
      value: "Beige",
    ),DropdownMenuItem(
      child: Text("Brown"),
      value: "Brown",
    ),DropdownMenuItem(
      child: Text("Orange"),
      value: "Orange",
    ),DropdownMenuItem(
      child: Text("Pink"),
      value: "Pink",
    ),DropdownMenuItem(
      child: Text("Light blue"),
      value: "Light blue",
    ),
  ];
  final List<DropdownMenuItem> branditems = [
    DropdownMenuItem(
      child: Text("Alfa Romeo"),
      value: "Alfa Romeo",
    ),
    DropdownMenuItem(
      child: Text("Aston Martin"),
      value: "Aston Martin",
    ),
    DropdownMenuItem(
      child: Text("Audi"),
      value: "Audi",
    ),
    DropdownMenuItem(
      child: Text("Baic"),
      value: "Baic",
    ),
    DropdownMenuItem(
      child: Text("Bentley"),
      value: "Bentley",
    ),
    DropdownMenuItem(
      child: Text("BMW"),
      value: "BMW",
    ),
    DropdownMenuItem(
      child: Text("Brilliance"),
      value: "Brilliance",
    ),
    DropdownMenuItem(
      child: Text("Bugatti"),
      value: "Bugatti",
    ),
    DropdownMenuItem(
      child: Text("Buick"),
      value: "Buic",
    ),
    DropdownMenuItem(
      child: Text("BYD"),
      value: "BYD",
    ),
    DropdownMenuItem(
      child: Text("Cadillac"),
      value: "Cadillac",
    ),
    DropdownMenuItem(
      child: Text("Chana"),
      value: "Chana",
    ),
    DropdownMenuItem(
      child: Text("Changan"),
      value: "Chnagan",
    ),
    DropdownMenuItem(
      child: Text("Canghe"),
      value: "Canghe",
    ),
    DropdownMenuItem(
      child: Text("Chery"),
      value: "Chery",
    ),
    DropdownMenuItem(
      child: Text("Chevrolet"),
      value: "Chevrolet",
    ),
    DropdownMenuItem(
      child: Text("Chrysler"),
      value: "Chrysler",
    ),
    DropdownMenuItem(
      child: Text("Citroën"),
      value: "Citroën",
    ),
    DropdownMenuItem(
      child: Text("Daewoo"),
      value: "Daewoo",
    ),
    DropdownMenuItem(
      child: Text("Daihatsu"),
      value: "Daihatsu",
    ),
    DropdownMenuItem(
      child: Text("Datsun"),
      value: "Datsun",
    ),
    DropdownMenuItem(
      child: Text("DFM"),
      value: "DFM",
    ),
    DropdownMenuItem(
      child: Text("DFSK"),
      value: "DFSK",
    ),
    DropdownMenuItem(
      child: Text("Dodge"),
      value: "Dodge",
    ),
    DropdownMenuItem(
      child: Text("Domy"),
      value: "Domy",
    ),
    DropdownMenuItem(
      child: Text("Ds"),
      value: "Ds",
    ),
    DropdownMenuItem(
      child: Text("Emgrand"),
      value: "Emgrand",
    ),
    DropdownMenuItem(
      child: Text("Faw"),
      value: "Faw",
    ),
    DropdownMenuItem(
      child: Text("Ferrari"),
      value: "Ferrari",
    ),
    DropdownMenuItem(
      child: Text("Flat"),
      value: "Flat",
    ),
    DropdownMenuItem(
      child: Text("Ford"),
      value: "Ford",
    ),
    DropdownMenuItem(
      child: Text("Foton"),
      value: "Foton",
    ),
    DropdownMenuItem(
      child: Text("Gac"),
      value: "Gac",
    ),
    DropdownMenuItem(
      child: Text("Gaz"),
      value: "Gaz",
    ),
    DropdownMenuItem(
      child: Text("Geely"),
      value: "Geely",
    ),
    DropdownMenuItem(
      child: Text("Gmc"),
      value: "Gmc",
    ),
    DropdownMenuItem(
      child: Text("Great wall"),
      value: "Great wall",
    ),
    DropdownMenuItem(
      child: Text("Hafei"),
      value: "Hafei",
    ),
    DropdownMenuItem(
      child: Text("Haima"),
      value: "Haima",
    ),
    DropdownMenuItem(
      child: Text("Haval"),
      value: "Haval",
    ),
    DropdownMenuItem(
      child: Text("Hawtai"),
      value: "Hawtai",
    ),
    DropdownMenuItem(
      child: Text("Honda"),
      value: "Honda",
    ),
    DropdownMenuItem(
      child: Text("Hummer"),
      value: "Hummer",
    ),
    DropdownMenuItem(
      child: Text("Hyundai"),
      value: "Hyundai",
    ),
    DropdownMenuItem(
      child: Text("Infiniti"),
      value: "Infiniti",
    ),
    DropdownMenuItem(
      child: Text("Isuzu"),
      value: "Isuzu",
    ),
    DropdownMenuItem(
      child: Text("Jac"),
      value: "Jac",
    ),
    DropdownMenuItem(
      child: Text("Jaguar"),
      value: "Jaguar",
    ),
    DropdownMenuItem(
      child: Text("Jeep"),
      value: "Jeep",
    ),
    DropdownMenuItem(
      child: Text("Jonway"),
      value: "Jonway",
    ),
    DropdownMenuItem(
      child: Text("Karry"),
      value: "Karry",
    ),
    DropdownMenuItem(
      child: Text("Kenbo"),
      value: "Kenbo",
    ),
    DropdownMenuItem(
      child: Text("Keyton"),
      value: "Keyton",
    ),
    DropdownMenuItem(
      child: Text("KIA"),
      value: "KIA",
    ),
    DropdownMenuItem(
      child: Text("Lada"),
      value: "Lada",
    ),
    DropdownMenuItem(
      child: Text("Lamborghini"),
      value: "Lamborghini",
    ),
    DropdownMenuItem(
      child: Text("Lancia"),
      value: "Lancia",
    ),
    DropdownMenuItem(
      child: Text("Land Rover"),
      value: "Land Rover",
    ),
    DropdownMenuItem(
      child: Text("Landwind"),
      value: "Landwind",
    ),
    DropdownMenuItem(
      child: Text("Lexus"),
      value: "Lexus",
    ),
    DropdownMenuItem(
      child: Text("Lifan"),
      value: "Lifan",
    ),
    DropdownMenuItem(
      child: Text("Lincoln"),
      value: "Lincoln",
    ),
    DropdownMenuItem(
      child: Text("Mahindra"),
      value: "Mahindra",
    ),
    DropdownMenuItem(
      child: Text("Maserati"),
      value: "Maserati",
    ),
    DropdownMenuItem(
      child: Text("Mzda"),
      value: "Mazda",
    ),
    DropdownMenuItem(
      child: Text("Mercedes"),
      value: "Mercedes",
    ),
    DropdownMenuItem(
      child: Text("Mercury"),
      value: "Mercury",
    ),
    DropdownMenuItem(
      child: Text("MG"),
      value: "MG",
    ),
    DropdownMenuItem(
      child: Text("Mini"),
      value: "Mini",
    ),
    DropdownMenuItem(
      child: Text("Mitsubishi"),
      value: "Mitsubishi",
    ),
    DropdownMenuItem(
      child: Text("Nissan"),
      value: "Nissan",
    ),
    DropdownMenuItem(
      child: Text("Opel"),
      value: "Opel",
    ),
    DropdownMenuItem(
      child: Text("Peugeot"),
      value: "Peugeot",
    ),
    DropdownMenuItem(
      child: Text("Pontiac"),
      value: "Pontiac",
    ),
    DropdownMenuItem(
      child: Text("Porsche"),
      value: "Porsche",
    ),
    DropdownMenuItem(
      child: Text("Proton"),
      value: "Proton",
    ),
    DropdownMenuItem(
      child: Text("Renault"),
      value: "Renault",
    ),
    DropdownMenuItem(
      child: Text("Saab"),
      value: "Saab",
    ),
    DropdownMenuItem(
      child: Text("Saipa"),
      value: "Saipa",
    ),
    DropdownMenuItem(
      child: Text("Scion"),
      value: "Scion",
    ),
    DropdownMenuItem(
      child: Text("Seat"),
      value: "Seat",
    ),
    DropdownMenuItem(
      child: Text("Senova"),
      value: "Senova",
    ),
    DropdownMenuItem(
      child: Text("Skoda"),
      value: "Skoda",
    ),
    DropdownMenuItem(
      child: Text("Smart"),
      value: "Smart",
    ),
    DropdownMenuItem(
      child: Text("Sokon"),
      value: "Sokon",
    ),
    DropdownMenuItem(
      child: Text("Soueast"),
      value: "Soueast",
    ),
    DropdownMenuItem(
      child: Text("Speranza"),
      value: "Speranza",
    ),
    DropdownMenuItem(
      child: Text("Ssang Yong"),
      value: "Ssang Yong",
    ),
    DropdownMenuItem(
      child: Text("Subaru"),
      value: "Subaru",
    ),
    DropdownMenuItem(
      child: Text("Suzuki"),
      value: "Suzuki",
    ),
    DropdownMenuItem(
      child: Text("Tata"),
      value: "Tata",
    ),
    DropdownMenuItem(
      child: Text("Tesla"),
      value: "Tesla",
    ),
    DropdownMenuItem(
      child: Text("Toyota"),
      value: "Toyota",
    ),
    DropdownMenuItem(
      child: Text("UFO"),
      value: "UFO",
    ),
    DropdownMenuItem(
      child: Text("Victory"),
      value: "Victory",
    ),
    DropdownMenuItem(
      child: Text("Volkswagen"),
      value: "Volkswagen",
    ),
    DropdownMenuItem(
      child: Text("Volvo"),
      value: "Volvo",
    ),
    DropdownMenuItem(
      child: Text("ZNA"),
      value: "ZNA",
    ),
    DropdownMenuItem(
      child: Text("Zotye"),
      value: "Zotye",
    ),
  ];
  static TextEditingController modelController = new TextEditingController();
  static TextEditingController domainController = new TextEditingController();
  static TextEditingController emailController = new TextEditingController();
  static TextEditingController platelettersController = new TextEditingController();
  static TextEditingController platenumbersController = new TextEditingController();
  static TextEditingController numberofseatsController = new TextEditingController();
  static TextEditingController nationalidController = new TextEditingController();

  //My cars initializations:
  List<Card> ListCars=[];
  int noCars=0;

  //Which tab:
  int _selectedIndex = 0;


  Future<String> getData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token') ?? '');

    //User cars
    String urlMyCars = "http://3.81.22.120:3000/api/showmycars";
    Response responseMyCars = await post(urlMyCars, headers: {'authorization': token});
    if (responseMyCars.statusCode == 409) {
      noCars = 1;
    }
    else if (responseMyCars.statusCode != 200) {
      Map data = jsonDecode(responseMyCars.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle("User error"),
              alertSubtitle: Text(data['message'] , maxLines: 1, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
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
                child: Image.asset("images/caricon.jpg", height: 200),
              ),
              title: AutoSizeText(up, style: TextStyle(color: Colors.indigo[400], fontSize: 15),maxLines: 1,minFontSize: 2,),
              subtitle: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  AutoSizeText(down, style: TextStyle(color: Colors.grey[500], fontSize: 11),maxLines: 1,minFontSize: 2,),
                  AutoSizeText(seats, style: TextStyle(color: Colors.grey[500], fontSize: 11),maxLines: 1,minFontSize: 2,),
                  AutoSizeText(plate, style: TextStyle(color: Colors.grey[500], fontSize: 11),maxLines: 1,minFontSize: 2,),
                ],
              ),
              trailing: IconButton(
                icon: Icon(
                  Icons.delete,
                  color: Colors.blueGrey[200],
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
                                if(response.statusCode == 404)
                                  {
                                    Map data= jsonDecode(response.body);
                                    showDialog(
                                        context: context,
                                        builder: (BuildContext context) {
                                          return RichAlertDialog(
                                            alertTitle: richTitle("Error"),
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
                                    Navigator.pop(context);
                                  }
                                else if(response.statusCode != 200)
                                {
                                  Map data= jsonDecode(response.body);
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
      // Tab 1
      FutureBuilder(
          future: getData(),
          builder: (BuildContext context, AsyncSnapshot<String> snapshot) {
            if(snapshot.connectionState == ConnectionState.done)
            {
              return Padding(
                padding: const EdgeInsets.fromLTRB(33, 0, 33, 0),
                child: Container(
                  child: noCars == 1 ? Center(child: AutoSizeText("No cars to show yet.",style: TextStyle(color: Colors.indigo, fontSize: 20,),maxLines: 1,minFontSize: 2,)) :
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


      // Tab 2: Add car:
      SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            SizedBox(
              height: 10,
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
                  height: 5,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Brand:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22.0,0,22,3),
                  child: SearchableDropdown.single(
                    iconDisabledColor: Colors.grey,
                    iconEnabledColor: Colors.indigo,
                    items: branditems,
                    value: selectedBrand,
                    hint: "Select brand",
                    searchHint: "Select brand",
                    onChanged: (value) {
                      setState(() {
                        selectedBrand = value;
                      });
                    },
                    isExpanded: true,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Model:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                SizedBox(
                  height: 3,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,5.0,22,13),
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border(bottom: BorderSide(color: Colors.grey[200])),
                    ),
                    child: TextField(
                      controller: modelController,
                      maxLength: 30,
                      decoration: InputDecoration(
                        counterText: "",
                        hintText: "Model",
                        hintStyle: TextStyle(color:Colors.grey),
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Type:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22.0,0,22,3),
                  child: SearchableDropdown.single(
                    iconDisabledColor: Colors.grey,
                    iconEnabledColor: Colors.indigo,
                    items: typeitems,
                    value: selectedType,
                    hint: "Select type",
                    searchHint: "Select type",
                    onChanged: (value) {
                      setState(() {
                        selectedType = value;
                      });
                    },
                    isExpanded: true,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Color:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22.0,0,22,3),
                  child: SearchableDropdown.single(
                    iconDisabledColor: Colors.grey,
                    iconEnabledColor: Colors.indigo,
                    items: coloritems,
                    value: selectedColor,
                    hint: "Select color",
                    searchHint: "Select color",
                    onChanged: (value) {
                      setState(() {
                        selectedColor = value;
                      });
                    },
                    isExpanded: true,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Year:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
                ),
                SizedBox(
                  height: 0,
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22.0,0,22,3),
                  child: SearchableDropdown.single(
                    iconDisabledColor: Colors.grey,
                    iconEnabledColor: Colors.indigo,
                    items: yearitems,
                    value: selectedYear,
                    hint: "Select year",
                    searchHint: "Select year",
                    onChanged: (value) {
                      setState(() {
                        selectedYear = value;
                      });
                    },
                    isExpanded: true,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Plate letters:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
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
                        controller: platelettersController,
                        maxLength: 30,
                        decoration: InputDecoration(
                          counterText: "",
                          hintText: "Plate letters",
                          hintStyle: TextStyle(color:Colors.grey),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Plate numbers:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
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
                        controller: platenumbersController,
                        maxLength: 30,
                        decoration: InputDecoration(
                          counterText: "",
                          hintText: "Plate numbers",
                          hintStyle: TextStyle(color:Colors.grey),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("Number of seats:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
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
                        controller: numberofseatsController,
                        maxLength: 30,
                        decoration: InputDecoration(
                          counterText: "",
                          hintText: "Number of seats",
                          hintStyle: TextStyle(color:Colors.grey),
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(33,0,22,0),
                  child: Text("National ID:", style: TextStyle(color:Colors.indigo,fontSize: 15)),
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
                        controller: nationalidController,
                        maxLength: 14,
                        decoration: InputDecoration(
                          counterText: "",
                          hintText: "National ID",
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
                  String modelAdd= modelController.text;
                  String platelettersAdd= platelettersController.text;
                  String platenumbersAdd= platenumbersController.text;
                  String numberofseatsAdd=numberofseatsController.text;
                  String nationalidAdd= nationalidController.text;
                  bool Valid= true;
                  //brand validations:
                  if(selectedBrand.isEmpty)
                  {
                    Valid = false;
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle("Brand"),
                            alertSubtitle: richSubtitle("Brand is required"),
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
                  //Model validations:
                  else if(modelAdd.isEmpty)
                  {
                    Valid = false;
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle("Model"),
                            alertSubtitle: richSubtitle("Model is required"),
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
                  //Type validations:
                  else if(selectedType.isEmpty)
                  {
                    Valid = false;
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle("Type"),
                            alertSubtitle: richSubtitle("Type is required"),
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
                  //Color validations:
                  else if(selectedColor.isEmpty)
                  {
                    Valid = false;
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle("Color"),
                            alertSubtitle: richSubtitle("Color is required"),
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
                  //year validation
                  else if(selectedYear.isEmpty)
                  {
                    Valid = false;
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle("Year"),
                            alertSubtitle: richSubtitle("Year is required"),
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
                  //Plate letters validations:
                  else if(platelettersAdd.isEmpty)
                  {
                    Valid = false;
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle("Plate letters"),
                            alertSubtitle: richSubtitle("Plate letters is required"),
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
                  //Plate numbers validations:
                  else if(platenumbersAdd.isEmpty)
                  {
                    Valid = false;
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle("Plate numbers"),
                            alertSubtitle: richSubtitle("Plate numbers is required"),
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
                  //Number of seats validations:
                  else if(numberofseatsAdd.isEmpty)
                  {
                    Valid = false;
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle("Number of seats"),
                            alertSubtitle: richSubtitle("Number of seats is required"),
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
                  //National ID validations:
                  else if(nationalidAdd.isEmpty)
                  {
                    Valid = false;
                    showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return RichAlertDialog(
                            alertTitle: richTitle("National ID"),
                            alertSubtitle: richSubtitle("National ID is required"),
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
                      Map<String,String> body = {
                        'brand': selectedBrand,
                        'model': modelAdd,
                        'type': selectedType,
                        'color' : selectedColor,
                        'year': selectedYear,
                        'plateletters': platelettersAdd,
                        'platenumbers': platenumbersAdd,
                        'numberofseats' : numberofseatsAdd,
                        'nationalid': nationalidAdd,
                        'carlicensefront' : "carlicense1",
                        'carlicenseback' : "carlicense2",
                        'driverlicensefront' : "driverlicense1",
                        'driverlicenseback' : "driverlicense2",
                      };
                      String url="http://3.81.22.120:3000/api/addcar";
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
                        setState(() {
                          selectedBrand="";
                          modelController.text="";
                          selectedType="";
                          selectedColor="";
                          selectedYear="";
                          platelettersController.text="";
                          platenumbersController.text="";
                          numberofseatsController.text="";
                          nationalidController.text="";
                          domainController.text="";
                        });
                        showDialog(
                            context: context,
                            builder: (BuildContext context) {
                              return RichAlertDialog(
                                alertTitle: richTitle("Done"),
                                alertSubtitle: richSubtitle("Car is added to your cars."),
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
                                      Navigator.pop(context);
                                      Navigator.push(context, AnimatedPageRoute(widget: Cars()));
                                    },
                                  ),
                                ],
                              );
                            });
                      }
                    }
                    getData();
                  }
                }),
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
                          title: Text('My Cars', style: TextStyle(fontSize: 12,color: Colors.indigo[400]),),
                        ),
                        FlashyTabBarItem(
                          icon: Icon(Icons.add),
                          title: Text('Add car', style: TextStyle(fontSize: 12,color: Colors.indigo[400]),),
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