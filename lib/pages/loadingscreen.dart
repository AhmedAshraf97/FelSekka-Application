import 'package:felsekka/pages/AnimatedPage%20Route.dart';
import 'package:felsekka/pages/homepage.dart';
import 'package:felsekka/pages/sidebar_layout.dart';
import 'package:felsekka/pages/signin.dart';
import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoadingScreen extends StatefulWidget {
  @override
  _LoadingScreenState createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen>
    with TickerProviderStateMixin {
  AnimationController controller;
  Animation animation;
  String token="";
  _loadToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      token = (prefs.getString('token')??'');
    });
  }
  @override
  void initState() {
    _loadToken();
    controller = AnimationController(
        vsync: this,
        duration: Duration(seconds: 2)
    );
    animation = Tween(
      begin: 0.0,
      end: 1.0,
    ).animate(controller);
    Future.delayed(const Duration(seconds: 4), () {
      setState(() {
        Navigator.pop(context);
        if(token!="") // Already logged in
        {
          Navigator.push(context, AnimatedPageRoute(widget: SideBarLayout()));
        }
        else
        {
          Navigator.push(context, AnimatedPageRoute(widget: SignIn()));
        }
      });
    });
  }

  @override
  dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    controller.forward();
    return Scaffold(
      backgroundColor: Colors.white,
      body: Container(
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
        width: double.infinity,
        height: double.infinity,
        child: Center(
          child: FadeTransition(
            opacity: animation,
            child: Container(
                height: 200.0,
                decoration: BoxDecoration(
                  boxShadow: [BoxShadow(
                    color: Color.fromRGBO(39, 78, 220, 0.3),
                    blurRadius: 20.0,
                    offset: Offset(0,10),
                  )],
                ),
                child: Material( // with Material
                  child: Image.asset("images/bgblue.png"),
                  elevation: 18.0,
                  shape: CircleBorder(),
                  clipBehavior: Clip.antiAlias,
                )
            ),
          ),
        ),
      ),
    );
  }
}

