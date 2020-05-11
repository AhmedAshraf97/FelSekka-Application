import 'package:bloc/bloc.dart';
import 'package:felsekka/pages/profile.dart';
import 'package:felsekka/pages/signin.dart';
import 'homepage.dart';

enum NavigationEvents {
  HomePageClickedEvent,
  ProfileClickedEvent,
  MyOrdersClickedEvent,
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
      case NavigationEvents.MyOrdersClickedEvent:
        yield HomePage();
        break;
    }
  }
}
