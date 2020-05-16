import 'dart:convert';
import 'package:felsekka/pages/homepage.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:felsekka/pages/sidebar_layout.dart';
import 'package:felsekka/pages/signup.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:http/http.dart';
import 'package:rich_alert/rich_alert.dart';
import 'AnimatedPage Route.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SignIn extends StatefulWidget with NavigationStates{
  @override
  _SignInState createState() => _SignInState();
}

class _SignInState extends State<SignIn> with TickerProviderStateMixin{
  AnimationController animationController;
  TextEditingController emailorphoneController = new TextEditingController();
  TextEditingController passwordController = new TextEditingController();
  @override
  void initState() {
    super.initState();
    animationController = new AnimationController(
        vsync: this, duration: new Duration(milliseconds: 1000));
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: BoxDecoration(
            gradient: LinearGradient(
                begin: Alignment.center,
                colors: [
                  Colors.indigo[700],
                  Colors.indigo[600],
                  Colors.deepPurple[800],
                  Colors.deepPurple[600],
                  Colors.indigo[500],
                  Colors.indigo[400]
                ]
            )
        ),
        child: Column(
          children: <Widget>[
            SizedBox(
              height: 20.0,
            ),
            Image.asset(
                "images/felsekkalogowhitenobg.png",
                height: 120.0,
            ),
            Padding(
              padding: EdgeInsets.all(15.0),
              child:Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  Text(
                    "Login",
                    style: TextStyle(
                      color: Colors.white,
                      fontFamily: "Kodchasan",
                      fontSize: 25.0,
                    ),
                  ),
                  SizedBox(
                    height: 10.0,
                  ),
                  Text(
                    "Let's carpool!",
                    style: TextStyle(
                      color: Colors.white,
                      fontFamily: "Kodchasan",
                      fontSize: 15.0,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 10.0,
            ),
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(topLeft: Radius.circular(60),topRight: Radius.circular(60))
                ),
                child: Padding(
                  padding: EdgeInsets.all(30.0),
                  child: SingleChildScrollView(
                    child: Column(
                      children: <Widget>[
                        SizedBox(
                          height: 20.0,
                        ),
                        Container(
                          height: 70.0,
                          padding: EdgeInsets.all(20.0),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [BoxShadow(
                              color: Color.fromRGBO(39, 78, 220, 0.3),
                              blurRadius: 20.0,
                              offset: Offset(0,10),
                            )],
                          ),
                          child: Container(
                                decoration: BoxDecoration(
                                  border: Border(bottom: BorderSide(color: Colors.grey[200])),
                                ),
                                child: TextField(
                                  controller: emailorphoneController,
                                  decoration: InputDecoration(
                                    hintText: "E-mail or Phone Number",
                                    hintStyle: TextStyle(color:Colors.grey),
                                    border: InputBorder.none,
                                  ),
                                ),
                          ),
                        ),
                        SizedBox(
                          height: 10.0,
                        ),
                        Container(
                          height: 70.0,
                          padding: EdgeInsets.all(20.0),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            boxShadow: [BoxShadow(
                              color: Color.fromRGBO(39, 78, 220, 0.3),
                              blurRadius: 20.0,
                              offset: Offset(0,10),
                            )],
                          ),
                          child: Container(
                            decoration: BoxDecoration(
                              border: Border(bottom: BorderSide(color: Colors.grey[200])),
                            ),
                            child: TextField(
                              obscureText: true,
                              controller: passwordController,
                              decoration: InputDecoration(
                                hintText: "Password",
                                hintStyle: TextStyle(color:Colors.grey),
                                border: InputBorder.none,
                              ),
                            ),
                          ),
                        ),
                        SizedBox(
                          height: 20.0,
                        ),
                        Text(
                          "Forgot password?",
                          style: TextStyle(
                            color: Colors.indigo,
                            fontFamily: "Kodchasan",
                          ),
                        ),
                        SizedBox(
                          height: 70.0,
                        ),
                        MaterialButton(
                          child: Text("Login",
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 20.0,
                              fontFamily: "Kodchasan",
                            ),
                          ),
                          height:40,
                          minWidth:100,
                          color: Colors.indigo,
                          elevation: 15,
                          highlightColor: Colors.grey,
                          splashColor: Colors.blueGrey,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(50),
                          ),
                          onPressed: (){
                            String EmailOrPhone= emailorphoneController.text;
                            String password= passwordController.text;
                            bool Valid= true;
                            //E-mail validations:
                            if(EmailOrPhone.isEmpty)
                            {
                              Valid = false;
                              showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    return RichAlertDialog(
                                      alertTitle: richTitle("E-mail or Phone number"),
                                      alertSubtitle: richSubtitle("E-mail or Phone number is required"),
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
                            //Password validations:
                            else if(password.isEmpty)
                            {
                              Valid = false;
                              showDialog(
                                  context: context,
                                  builder: (BuildContext context) {
                                    return RichAlertDialog(
                                      alertTitle: richTitle("Password"),
                                      alertSubtitle: richSubtitle("Password is required"),
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
                            if(Valid==true)
                            {
                              void getData() async{
                                Map<String, String> body = {
                                  'EmailOrPhone' : EmailOrPhone,
                                  'password': password,
                                };
                                String url="http://3.81.22.120:3000/api/signin";
                                Response response =await post(url, body: body);
                                if(response.statusCode != 200)
                                {
                                  Map data= jsonDecode(response.body);
                                  showDialog(
                                      context: context,
                                      builder: (BuildContext context) {
                                        return RichAlertDialog(
                                          alertTitle: richTitle(data['error']),
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
                                  Map data= jsonDecode(response.body);
                                  String token= data['token'];
                                  Map userInfo = data['userInfo'];
                                  SharedPreferences prefs = await SharedPreferences.getInstance();
                                  await prefs.setString('token', token);
                                  Navigator.push(context, AnimatedPageRoute(widget: SideBarLayout()));
                                }
                              }
                              getData();
                            }
                          },
                        ),
                        new FlatButton(
                          onPressed: () {
                            Navigator.push(context, AnimatedPageRoute(widget: SignUp()));
                          },
                          child: Text(
                            "Don't have an account? Sign Up.",
                            style: TextStyle(
                              color: Colors.indigo,
                              fontFamily: "Kodchasan",
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}