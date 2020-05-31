import 'package:bloc/bloc.dart';
import 'package:felsekka/pages/profile.dart';
import 'package:felsekka/pages/ridealerts.dart';
import 'cars.dart';
import 'homepage.dart';
import 'organizations.dart';

enum NavigationEvents {
  HomePageClickedEvent,
  ProfileClickedEvent,
  OrgsClickedEvent,
  CarsClickedEvent,
  RideAlertsClickedEvent
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
    }
  }
}
