import 'package:flutter/material.dart';
import 'package:flutter/animation.dart';

class LoadingScreen extends StatefulWidget {
  @override
  _LoadingScreenState createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen> with TickerProviderStateMixin{
  AnimationController controller;
  Animation animation;
  @override
  void initState(){
    controller= AnimationController(
        vsync: this,
        duration: Duration(seconds: 3)
    );
    animation= Tween(
      begin: 0.0,
      end: 1.0,
    ).animate(controller);
  }

  @override
  dispose(){
    controller.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    controller.forward();
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: FadeTransition(
          opacity: animation,
          child: Container(
            height: 250.0,
            child:Image.asset("images/felsekkalogo2nobg.png"),
          ),
        ),
      )
    );
  }
}

