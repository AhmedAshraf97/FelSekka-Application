import 'package:flutter/cupertino.dart';

class AnimatedPageRoute extends PageRouteBuilder{
  final Widget widget;
  AnimatedPageRoute({this.widget}):super(
        transitionDuration: Duration(seconds: 3),
        pageBuilder: (BuildContext context,
            Animation<double> animation, Animation<double> secanimation) {
          return widget;
        },
        transitionsBuilder: (BuildContext context,
            Animation<double> animation, Animation<double> secanimation,
            Widget child) {
          animation= CurvedAnimation(parent:animation, curve:Curves.fastLinearToSlowEaseIn);
          return ScaleTransition(
            alignment: Alignment.center,
            scale: animation,
            child:child,
          );
        },
  );
}