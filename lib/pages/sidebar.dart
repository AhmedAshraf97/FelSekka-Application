import 'dart:convert';
import 'package:felsekka/pages/AnimatedPage%20Route.dart';
import 'package:felsekka/pages/homepage.dart';
import 'package:felsekka/pages/sidebar_layout.dart';
import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';
import 'package:felsekka/pages/signup3.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart';
import 'package:rxdart/rxdart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';

import 'funkyoverlay.dart';
import 'menu_item.dart';
import 'navigation_bloc.dart';

class SideBar extends StatefulWidget {
  @override
  _SideBarState createState() => _SideBarState();
}

class _SideBarState extends State<SideBar> with SingleTickerProviderStateMixin<SideBar> {
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
  AnimationController _animationController;
  StreamController<bool> isSidebarOpenedStreamController;
  Stream<bool> isSidebarOpenedStream;
  StreamSink<bool> isSidebarOpenedSink;
  final _animationDuration = const Duration(milliseconds: 500);
  static String getDisplayRating(double rating) {
    rating = rating.abs();
    final str = rating.toStringAsFixed(rating.truncateToDouble() ==rating ? 0 : 2);
    if (str == '0') return '0';
    if (str.endsWith('.0')) return str.substring(0, str.length - 2);
    if (str.endsWith('0')) return str.substring(0, str.length -1);
    return str;
  }
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
      }
    }
    getData();
    super.initState();
    _animationController = AnimationController(vsync: this, duration: _animationDuration);
    isSidebarOpenedStreamController = PublishSubject<bool>();
    isSidebarOpenedStream = isSidebarOpenedStreamController.stream;
    isSidebarOpenedSink = isSidebarOpenedStreamController.sink;
  }

  @override
  void dispose() {
    _animationController.dispose();
    isSidebarOpenedStreamController.close();
    isSidebarOpenedSink.close();
    super.dispose();
  }

  void onIconPressed() {
    final animationStatus = _animationController.status;
    final isAnimationCompleted = animationStatus == AnimationStatus.completed;

    if (isAnimationCompleted) {
      isSidebarOpenedSink.add(false);
      _animationController.reverse();
    } else {
      isSidebarOpenedSink.add(true);
      _animationController.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return StreamBuilder<bool>(
      initialData: false,
      stream: isSidebarOpenedStream,
      builder: (context, isSideBarOpenedAsync) {
        return AnimatedPositioned(
          duration: _animationDuration,
          top: 0,
          bottom: 0,
          left: isSideBarOpenedAsync.data ? 0 : -screenWidth,
          right: isSideBarOpenedAsync.data ? 0 : screenWidth - 42,
          child: Row(
            children: <Widget>[
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                      gradient: LinearGradient(
                          begin: Alignment.center,
                          colors: [
                            Colors.indigo[800],
                            Colors.indigo[700],
                            Colors.indigo[600],
                            Colors.indigo[500],
                          ]
                      )
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 5),
                  //color: const Color(0xFF262AAA),
                  child: Column(
                    children: <Widget>[
                      SizedBox(
                        height: 20,
                      ),
                      GestureDetector(
                        onTap: (){
                          //BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.HomePageClickedEvent);
                        },
                        child: CircleAvatar(
                          child: Image.asset("images/avatarfemale.png"),
                          radius: 35,
                        ),
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      GestureDetector(
                        onTap: (){
                          print("Dodo amar");
                          //BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.HomePageClickedEvent);
                        },
                        child: Text(
                          fullname,
                          style: TextStyle(
                              color: Colors.white,
                              fontSize: 20),
                        ),
                      ),
                      SizedBox(
                        width: 5,
                      ),
                      Center(
                        child: Row(
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
                              "5",
                              style: TextStyle(
                                color: Colors.grey,
                                fontSize: 18,
                              ),
                            ),
                            Icon(
                              Icons.group,
                              color: Colors.grey,
                              size: 18,
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.only(topLeft: Radius.circular(60),topRight: Radius.circular(60))
                          ),
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(15.0,5,0,0),
                            child: Column(
                              children: <Widget>[
                                MenuItem(
                                  icon: Icons.home,
                                  title: "Home",
                                  onTap: () {
                                    onIconPressed();
                                    BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.HomePageClickedEvent);
                                  },
                                ),
                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
                                ),
                                MenuItem(
                                  icon: Icons.place,
                                  title: "My Rides",
                                  onTap: () {
                                    onIconPressed();
                                    //BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.MyAccountClickedEvent);
                                  },
                                ),
                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
                                ),
                                MenuItem(
                                  icon: Icons.alarm,
                                  title: "Rides Alerts",
                                  onTap: () {
                                    onIconPressed();
                                    //BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.MyOrdersClickedEvent);
                                  },
                                ),
                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
                                ),
                                MenuItem(
                                  icon: Icons.time_to_leave,
                                  title: "My Cars",
                                  onTap: () {
                                    onIconPressed();
                                    //BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.MyOrdersClickedEvent);
                                  },
                                ),
                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
                                ),
                                MenuItem(
                                  icon: Icons.store_mall_directory,
                                  title: "Organizations",
                                  onTap: () {
                                    onIconPressed();
                                    //BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.MyOrdersClickedEvent);
                                  },
                                ),
                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
                                ),
                                MenuItem(
                                  icon: Icons.people,
                                  title: "People",
                                  onTap: () {
                                    onIconPressed();
                                    //BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.MyOrdersClickedEvent);
                                  },
                                ),
                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
                                ),
                                MenuItem(
                                  icon: Icons.monetization_on,
                                  title: "Payment",
                                  onTap: () {
                                    onIconPressed();
                                    //BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.MyOrdersClickedEvent);
                                  },
                                ),
                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
                                ),
                                MenuItem(
                                  icon: Icons.phone_in_talk,
                                  title: "Contact us",
                                  onTap: () {
                                    onIconPressed();
                                    //BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.MyOrdersClickedEvent);
                                  },
                                ),
                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
                                ),
                                MenuItem(
                                  icon: Icons.settings,
                                  title: "Settings",
                                ),
                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
                                ),
                                MenuItem(
                                  icon: Icons.exit_to_app,
                                  title: "Logout",
                                ),

                                Divider(
                                  height: 5,
                                  thickness: 0.4,
                                  color: Colors.indigo.withOpacity(0.3),
                                  indent: 32,
                                  endIndent: 32,
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
              Align(
                alignment: Alignment(0, -0.9),
                child: GestureDetector(
                  onTap: () {
                    onIconPressed();
                  },
                  child: ClipPath(
                    clipper: CustomMenuClipper(),
                    child: Container(
                      width: 35,
                      height: 110,
                      color: Colors.indigo[500],
                      alignment: Alignment.centerLeft,
                      child: AnimatedIcon(
                        progress: _animationController.view,
                        icon: AnimatedIcons.menu_close,
                        color: Colors.white,
                        size: 25,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class CustomMenuClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    Paint paint = Paint();
    paint.color = Colors.white;

    final width = size.width;
    final height = size.height;

    Path path = Path();
    path.moveTo(0, 0);
    path.quadraticBezierTo(0, 8, 10, 16);
    path.quadraticBezierTo(width - 1, height / 2 - 20, width, height / 2);
    path.quadraticBezierTo(width + 1, height / 2 + 20, 10, height - 16);
    path.quadraticBezierTo(0, height - 8, 0, height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(CustomClipper<Path> oldClipper) {
    return true;
  }
}
