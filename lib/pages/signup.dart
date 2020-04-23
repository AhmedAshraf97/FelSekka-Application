import 'package:felsekka/pages/signin.dart';
import 'package:felsekka/pages/signup2.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart';
import 'AnimatedPage Route.dart';
import 'funkyoverlay.dart';
import 'dart:convert';

class SignUp extends StatefulWidget {
  @override
  _SignUpState createState() => _SignUpState();
}

class _SignUpState extends State<SignUp> with SingleTickerProviderStateMixin{
  TextEditingController firstnameController = new TextEditingController();
  TextEditingController lastnameController = new TextEditingController();
  TextEditingController usernameController = new TextEditingController();
  TextEditingController emailController = new TextEditingController();
  TextEditingController phonenumberController = new TextEditingController();
  TextEditingController passwordController = new TextEditingController();
  TextEditingController confirmpasswordController = new TextEditingController();
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
              height: 10.0,
            ),
            Image.asset(
              "images/felsekkalogowhitenobg.png",
              height: 70.0,
            ),
            Text(
              "Sign Up & Carpool!",
              style: TextStyle(
                color: Colors.white,
                fontFamily: "Kodchasan",
                fontSize: 15.0,
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
                  child: Column(
                    children: <Widget>[
                      Container(
                        height: 50.0,
                        padding: EdgeInsets.all(15.0),
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
                            controller: firstnameController,
                            maxLength: 15,
                            inputFormatters: [new WhitelistingTextInputFormatter(RegExp("[a-zA-Z]")),],
                            decoration: InputDecoration(
                                counterText: "",
                                hintText: "First name",
                                hintStyle: TextStyle(color:Colors.grey),
                                border: InputBorder.none,
                                ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 5.0,
                      ),
                      Container(
                        height: 50.0,
                        padding: EdgeInsets.all(15.0),
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
                            controller: lastnameController,
                            maxLength: 15,
                            inputFormatters: [new WhitelistingTextInputFormatter(RegExp("[a-zA-Z]")),],
                            decoration: InputDecoration(
                              hintText: "Last name",
                              hintStyle: TextStyle(color:Colors.grey),
                              counterText: "",
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 5.0,
                      ),
                      Container(
                        height: 50.0,
                        padding: EdgeInsets.all(15.0),
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
                            controller: usernameController,
                            maxLength: 20,
                            inputFormatters: [BlacklistingTextInputFormatter(new RegExp('[ ]'))],
                            decoration: InputDecoration(
                              hintText: "Username",
                              hintStyle: TextStyle(color:Colors.grey),
                              counterText: "",
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 5.0,
                      ),
                      Container(
                        height: 50.0,
                        padding: EdgeInsets.all(15.0),
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
                            keyboardType: TextInputType.emailAddress,
                            controller: emailController,
                            inputFormatters: [BlacklistingTextInputFormatter(new RegExp('[ ]'))],
                            decoration: InputDecoration(
                              hintText: "E-mail",
                              hintStyle: TextStyle(color:Colors.grey),
                              counterText: "",
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 5.0,
                      ),
                      Container(
                        height: 50.0,
                        padding: EdgeInsets.all(15.0),
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
                            keyboardType: TextInputType.number,
                            controller: phonenumberController,
                            maxLength: 11,
                            inputFormatters:[new WhitelistingTextInputFormatter(RegExp("[0-9]")),],
                            decoration: InputDecoration(
                              hintText: "Phone number",
                              hintStyle: TextStyle(color:Colors.grey),
                              counterText: "",
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 5.0,
                      ),
                      Text(
                        "Password must be 8-15 characters, It should include at least 1 letter, 1 number and 1 special character",
                        style: TextStyle(
                          color: Colors.indigo,
                          fontFamily: "Kodchasan",
                          fontSize: 10.0,
                        ),
                      ),
                      SizedBox(
                        height: 5.0,
                      ),
                      Container(
                        height: 50.0,
                        padding: EdgeInsets.all(15.0),
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
                            maxLength: 15,
                            decoration: InputDecoration(
                              hintText: "Password",
                              hintStyle: TextStyle(color:Colors.grey),
                              counterText: "",
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 5.0,
                      ),
                      Container(
                        height: 50.0,
                        padding: EdgeInsets.all(15.0),
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
                            controller: confirmpasswordController,
                            maxLength: 15,
                            decoration: InputDecoration(
                              hintText: "Confirm Password",
                              hintStyle: TextStyle(color:Colors.grey),
                              counterText: "",
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(
                        height: 5.0,
                      ),
                      MaterialButton(
                        child: Text("Next",
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
                          String firstname= firstnameController.text;
                          String lastname= lastnameController.text;
                          String username= usernameController.text;
                          String email= emailController.text;
                          String phonenumber= phonenumberController.text;
                          String password= passwordController.text;
                          String confirmpassword= confirmpasswordController.text;
                          bool Valid= true;
                          RegExp regExpFirstname= new RegExp(r"^[a-zA-Z ]*$");
                          RegExp regExpUsername= new RegExp(r"^\S+$");
                          RegExp regExpEmail= new RegExp(r"^\S+@\S+\.\S+$");
                          RegExp regExpPhonenumber= new RegExp(r"[0-9]{11}");
                          RegExp regExpPassword= new RegExp(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.-])[A-Za-z\d@$!%*#?&.-]{8,15}$");
                          //First name validations:
                          if(firstname.isEmpty)
                            {
                              Valid = false;
                              showDialog(
                                context: context,
                                builder: (_) => FunkyOverlay(text: "First name is required",image: "images/errorsign.png"),
                              );
                            }
                          else if(!regExpFirstname.hasMatch(firstname))
                            {
                              Valid = false;
                              showDialog(
                                context: context,
                                builder: (_) => FunkyOverlay(text: "First name has to be letters only",image: "images/errorsign.png"),
                              );
                            }
                          else if(firstname.length>15)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "First name is max of 15 characters",image: "images/errorsign.png"),
                            );
                          }
                          //Last name validations:
                          else if(lastname.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Last name is required",image: "images/errorsign.png"),
                            );
                          }
                          else if(!regExpFirstname.hasMatch(lastname))
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Last name has to be letters only",image: "images/errorsign.png"),
                            );
                          }
                          else if(lastname.length>15)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Last name is max of 15 characters",image: "images/errorsign.png"),
                            );
                          }
                          //Username validations:
                          else if(username.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Username is required",image: "images/errorsign.png"),
                            );
                          }
                          else if(!regExpUsername.hasMatch(username))
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Username can't contain spaces",image: "images/errorsign.png"),
                            );
                          }
                          else if(username.length>20)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Username is max of 20 characters",image: "images/errorsign.png"),
                            );
                          }
                          //E-mail validations:
                          else if(email.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "E-mail is required",image: "images/errorsign.png"),
                            );
                          }
                          else if(!regExpEmail.hasMatch(email))
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Invalid e-mail",image: "images/errorsign.png"),
                            );
                          }
                          //Phone number validations:
                          else if(phonenumber.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Phone number is required",image: "images/errorsign.png"),
                            );
                          }
                          else if(!regExpPhonenumber.hasMatch(phonenumber))
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Phone number has to be 11 numbers",image: "images/errorsign.png"),
                            );
                          }
                          else if(phonenumber.length!=11)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Phone number must be 11 numbers",image: "images/errorsign.png"),
                            );
                          }
                          //Password validations:
                          else if(password.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Password is required",image: "images/errorsign.png"),
                            );
                          }
                          else if(!regExpPassword.hasMatch(password))
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Password must be minimum eight characters,maximum 15 characters and should include at least one letter, one number and one special character",image: "images/errorsign.png"),
                            );
                          }
                          else if(password.length<8 || password.length>15)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Password must be 8-15 characters",image: "images/errorsign.png"),
                            );
                          }
                          //Confirm password validations:
                          else if(confirmpassword.isEmpty)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Confirm password is required",image: "images/errorsign.png"),
                            );
                          }
                          else if(confirmpassword!=password)
                          {
                            Valid = false;
                            showDialog(
                              context: context,
                              builder: (_) => FunkyOverlay(text: "Password and Confirm password aren't matching",image: "images/errorsign.png"),
                            );
                          }
                          if(Valid==true)
                          {
                             void getData() async{
                               Map<String, String> body = {
                               'username': username,
                               'email' : email,
                               'phonenumber' : phonenumber
                               };
                               String url="http://3.81.22.120:3000/api/userexists";
                               Response response =await post(url, body: body);
                               if(response.statusCode != 200)
                                 {
                                   Map data= jsonDecode(response.body);
                                   showDialog(
                                     context: context,
                                     builder: (_) => FunkyOverlay(text: data['message'],image: "images/errorsign.png"),
                                   );
                                 }
                               else{
                                 Navigator.push(context, AnimatedPageRoute(widget: SignUp2()));
                               }
                             }
                             getData();
                          }
                        },
                      ),
                      new FlatButton(
                        onPressed: () {
                          Navigator.push(context, AnimatedPageRoute(widget: SignIn()));
                        },
                        child: Text(
                          "Already have an account? Sign In.",
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
          ],
        ),
      ),
    );
  }
}
