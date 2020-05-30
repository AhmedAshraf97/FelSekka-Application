import 'dart:convert';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/signup2.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flashy_tab_bar/flashy_tab_bar.dart';
import 'package:flutter/services.dart';
import 'package:flutter_datetime_picker/flutter_datetime_picker.dart';
import 'package:geocoder/geocoder.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_maps_place_picker/google_maps_place_picker.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:searchable_dropdown/searchable_dropdown.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'AnimatedPage Route.dart';
import 'package:geolocator/geolocator.dart';

class RideAlerts extends StatefulWidget with NavigationStates{
  @override
  _RideAlertsState createState() => _RideAlertsState();
}

class _RideAlertsState extends State<RideAlerts>{
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text(
            "Ride alerts"
        ),
      ),
    );
  }
}
