import 'package:bloc/bloc.dart';
import 'package:felsekka/pages/payment.dart';
import 'package:felsekka/pages/pendingrides.dart';
import 'package:felsekka/pages/people.dart';
import 'package:felsekka/pages/profile.dart';
import 'package:felsekka/pages/ridealerts.dart';
import 'package:felsekka/pages/editprofile.dart';
import 'cars.dart';
import 'homepage.dart';
import 'myrides.dart';
import 'organizations.dart';

enum NavigationEvents {
  HomePageClickedEvent,
  ProfileClickedEvent,
  OrgsClickedEvent,
  CarsClickedEvent,
  RideAlertsClickedEvent,
  PaymentClickedEvent,
  MyRidesClickedEvent,
  PendingRidesClickedEvent,
  PeopleClickedEvent,
  EditProfileClickedEvent,
}

abstract class NavigationStates {}

class NavigationBloc extends Bloc<NavigationEvents, NavigationStates> {
  @override
  NavigationStates get initialState => HomePage();

  @override
  Stream<NavigationStates> mapEventToState(NavigationEvents event) async* {
    switch (event) {
      case NavigationEvents.HomePageClickedEvent:
        yield HomePage();
        break;
      case NavigationEvents.ProfileClickedEvent:
        yield Profile();
        break;
      case NavigationEvents.OrgsClickedEvent:
        yield Organizations();
        break;
      case NavigationEvents.CarsClickedEvent:
        yield Cars();
        break;
      case NavigationEvents.RideAlertsClickedEvent:
        yield RideAlerts();
        break;
        case NavigationEvents.PaymentClickedEvent:
        yield Payment();
        break;
      case NavigationEvents.MyRidesClickedEvent:
        yield MyRides();
        break;
      case NavigationEvents.PeopleClickedEvent:
        yield People();
        break;
      case NavigationEvents.PendingRidesClickedEvent:
        yield PendingRides();
        break;
      case NavigationEvents.EditProfileClickedEvent:
        yield EditProfile();
        break;
    }
  }
}
