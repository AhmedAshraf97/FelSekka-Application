import 'package:felsekka/pages/loadingscreen.dart';
import 'package:felsekka/pages/signin.dart';
import 'package:flutter/material.dart';

void main() => runApp(MaterialApp(
    theme: ThemeData(fontFamily: 'Kodchasan'),
    initialRoute: "loadingscreen",
    routes: {
      "loadingscreen": (context) => LoadingScreen(),
      "signin": (context) => SignIn(),
    }
));