import 'dart:convert';
import 'package:felsekka/pages/AnimatedPage%20Route.dart';
import 'package:felsekka/pages/homepage.dart';
import 'package:felsekka/pages/sidebar_layout.dart';
import 'package:felsekka/pages/signin.dart';
import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';
import 'package:felsekka/pages/signup3.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:http/http.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:rxdart/rxdart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import 'menu_item.dart';
import 'navigation_bloc.dart';

class SideBar extends StatefulWidget {
  @override
  _SideBarState createState() => _SideBarState();
}

class _SideBarState extends State<SideBar> with SingleTickerProviderStateMixin<SideBar> {
  int Logout=0;
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
  int countTrustint=10;
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
  void getData() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = (prefs.getString('token')??'');
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
      setState(() {
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
      });
    }
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
      setState(() {
        Map data= jsonDecode(responsetrust.body);
        countTrustint = data['count'];
        countTrust = countTrustint.toString();
      });
    }
  }
  @override
  void initState() {
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
    getData();
    setState(() {
      int x=0;
    });
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
          right: isSideBarOpenedAsync.data ? 0 : screenWidth - 40,
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
                          BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.ProfileClickedEvent);
                          onIconPressed();
                        },
                        child: CircleAvatar(
                          child: gender == "female"? Image.asset("images/avatarfemale.png") : Image.asset("images/avatarmale.png"),
                          radius: 35,
                        ),
                      ),
                      SizedBox(
                        height: 10,
                      ),
                      GestureDetector(
                        onTap: (){
                          BlocProvider.of<NavigationBloc>(context).add(NavigationEvents.ProfileClickedEvent);
                          onIconPressed();
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
                                  onTap: (){
                                    showDialog(
                                        context: context,
                                        builder: (BuildContext context) {
                                          return RichAlertDialog(
                                            alertTitle: richTitle("Logout"),
                                            alertSubtitle: richSubtitle("Are you sure you want to logout?"),
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
                                                  String url="http://3.81.22.120:3000/api/signout";
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
                                                    Navigator.pop(context);
                                                  }
                                                  else{
                                                    final pref = await SharedPreferences.getInstance();
                                                    await pref.clear();
                                                    Logout=1;
                                                    Navigator.push(context,AnimatedPageRoute(widget: SignIn()));
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
