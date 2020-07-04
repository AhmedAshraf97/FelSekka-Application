import 'package:auto_size_text/auto_size_text.dart';
import 'package:felsekka/pages/signin.dart';
import 'package:felsekka/pages/signup2.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'AnimatedPage Route.dart';
import 'dart:convert';
import 'package:dbcrypt/dbcrypt.dart';
import 'editprofile2.dart';
import 'navigation_bloc.dart';

class EditProfile extends StatefulWidget with NavigationStates{
  @override
  _EditProfileState createState() => _EditProfileState();
}

class _EditProfileState extends State<EditProfile> with SingleTickerProviderStateMixin{
  TextEditingController firstnameController = new TextEditingController();
  TextEditingController lastnameController = new TextEditingController();
  TextEditingController oldpasswordController = new TextEditingController();
  TextEditingController newpasswordController = new TextEditingController();
  TextEditingController confirmpasswordController = new TextEditingController();
  int id;
  String firstname="";
  String lastname="";
  String phonenumber="";
  String gender="";
  String password="";
  String birthdate="";
  String ridewith="";
  String smoking="";
  String rating="";
  String status="";
  String email="";
  String latitude="";
  String longitude="";
  String username="";
  String fullname="";
  double doubleRating=0;
  String trimRating="";
  String imggender="";
  String countTrust="";
  int countTrustint=0;
  String datetoshow="";
  String ridewithtoshow="";
  String smokingtoshow="";
  String token="";
  Future<String> getData() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token')??'');
    String url="http://3.81.22.120:3000/api/retrieveuserdata";
    Response response =await post(url, headers:{'authorization': token});
    if(response.statusCode != 200)
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: Text(data['error'], maxLines: 1, style: TextStyle(color: Colors.black, fontSize: 12),textAlign: TextAlign.center,),
              alertSubtitle: Text(data['message'], maxLines: 1, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
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
      Map userInfo = data['decoded'];
      id = userInfo['id'];
      firstname = userInfo['firstname'];
      firstnameController.text=firstname;
      lastname = userInfo['lastname'];
      lastnameController.text=lastname;
      phonenumber = userInfo['phonenumber'];
      gender = userInfo['gender'];
      password = userInfo['password'];
      birthdate = userInfo['birthdate'];
      ridewith = userInfo['ridewith'];
      smoking = userInfo['smoking'];
      rating = userInfo['rating'];
      status = userInfo['status'];
      email = userInfo['email'];
      latitude = userInfo['latitude'];
      longitude = userInfo['longitude'];
      username = userInfo['username'];
      datetoshow = DateFormat('dd-MM-yyyy').format(DateTime.parse(birthdate));
      fullname = firstname + " "+ lastname;
      if(ridewith=="female")
      {
        ridewithtoshow="Female";
      }
      else if(ridewith == "male")
      {
        ridewithtoshow="Male";
      }
      else
      {
        ridewithtoshow="Any";
      }
      if(smoking=="yes")
      {
        smokingtoshow="Yes";
      }
      else if(smoking=="no")
      {
        smokingtoshow="No";
      }
      else
      {
        smokingtoshow="Any";
      }
      if(gender=="female")
      {
        imggender="images/avatarfemale.png";
      }
      else if(gender=="male")
      {
        imggender="images/avatarmale.png";
      }
    }
    return null;
  }


  @override
  void initState() {
    getData();
    super.initState();
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: <Widget>[
          Expanded(
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                  gradient: LinearGradient(
                      begin: Alignment.center,
                      colors: [
                        Colors.indigo[600],
                        Colors.indigo[500],
                        Colors.indigo[400],
                        Colors.indigo[300]
                      ]
                  )
              ),
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Container(
                  decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.all(Radius.circular(30))
                  ),
                  child: Column(
                    children: <Widget>[
                      Padding(
                        padding: const EdgeInsets.all(5.0),
                        child: AutoSizeText(
                          "Edit profile",
                          minFontSize: 2.0,
                          maxLines: 1,
                          style: TextStyle(
                            color: Colors.indigo,
                            fontFamily: "Kodchasan",
                            fontSize: 20.0,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.all(Radius.circular(30))
                          ),
                          child: Padding(
                            padding: EdgeInsets.fromLTRB(35.0,0,35,0),
                            child: SingleChildScrollView(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: <Widget>[
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(10.0,0,0,3),
                                        child: AutoSizeText(
                                          "First name:",
                                          maxLines: 1,
                                          style: TextStyle(
                                            color: Colors.indigo[400],
                                            fontFamily: "Kodchasan",
                                            fontSize: 15.0,
                                          ),
                                          textAlign: TextAlign.start,
                                        ),
                                      ),
                                      Container(
                                        height: 50.0,
                                        padding: EdgeInsets.fromLTRB(15, 10, 15, 10),
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
                                              hintStyle: TextStyle(color:Colors.grey, fontSize: 12),
                                              border: InputBorder.none,
                                            ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        height:  15.0,
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(10.0,0,0,3),
                                        child: AutoSizeText(
                                          "Last name:",
                                          maxLines: 1,
                                          style: TextStyle(
                                            color: Colors.indigo[400],
                                            fontFamily: "Kodchasan",
                                            fontSize: 15.0,
                                          ),
                                          textAlign: TextAlign.start,
                                        ),
                                      ),
                                      Container(
                                        height: 50.0,
                                        padding: EdgeInsets.fromLTRB(15, 10, 15, 10),
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
                                              hintStyle: TextStyle(color:Colors.grey,fontSize: 12),
                                              counterText: "",
                                              border: InputBorder.none,
                                            ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        height: 15.0,
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(10, 0, 0, 0),
                                        child: AutoSizeText(
                                          "Password must be 8-15 characters, It should include at least 1 letter, 1 number and 1 special character",
                                          style: TextStyle(
                                            color: Colors.indigo,
                                            fontFamily: "Kodchasan",
                                            fontSize: 10.0,
                                          ),
                                          maxLines: 2,
                                          minFontSize: 2.0,
                                        ),
                                      ),
                                      SizedBox(
                                        height: 7.0,
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(10.0,0,0,3),
                                        child: AutoSizeText(
                                          "Old password:",
                                          maxLines: 1,
                                          style: TextStyle(
                                            color: Colors.indigo[400],
                                            fontFamily: "Kodchasan",
                                            fontSize: 15.0,
                                          ),
                                          textAlign: TextAlign.start,
                                        ),
                                      ),
                                      Container(
                                        height: 50.0,
                                        padding: EdgeInsets.fromLTRB(15, 10, 15, 10),
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
                                            controller: oldpasswordController,
                                            maxLength: 15,
                                            decoration: InputDecoration(
                                              hintText: "Old password",
                                              hintStyle: TextStyle(color:Colors.grey,fontSize: 12),
                                              counterText: "",
                                              border: InputBorder.none,
                                            ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        height: 15.0,
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(10.0,0,0,3),
                                        child: AutoSizeText(
                                          "New password:",
                                          maxLines: 1,
                                          style: TextStyle(
                                            color: Colors.indigo[400],
                                            fontFamily: "Kodchasan",
                                            fontSize: 15.0,
                                          ),
                                          textAlign: TextAlign.start,
                                        ),
                                      ),
                                      Container(
                                        height: 50.0,
                                        padding: EdgeInsets.fromLTRB(15, 10, 15, 10),
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
                                            controller: newpasswordController,
                                            maxLength: 15,
                                            decoration: InputDecoration(
                                              hintText: "New password",
                                              hintStyle: TextStyle(color:Colors.grey,fontSize: 12),
                                              counterText: "",
                                              border: InputBorder.none,
                                            ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        height: 15.0,
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(10.0,0,0,3),
                                        child: AutoSizeText(
                                          "Confirm password:",
                                          maxLines: 1,
                                          style: TextStyle(
                                            color: Colors.indigo[400],
                                            fontFamily: "Kodchasan",
                                            fontSize: 15.0,
                                          ),
                                          textAlign: TextAlign.start,
                                        ),
                                      ),
                                      Container(
                                        height: 50.0,
                                        padding: EdgeInsets.fromLTRB(15, 10, 15, 10),
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
                                              hintStyle: TextStyle(color:Colors.grey,fontSize: 12),
                                              counterText: "",
                                              border: InputBorder.none,
                                            ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        height: 20.0,
                                      ),
                                    ],
                                  ),
                                  MaterialButton(
                                    child: Text("Next",
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 15.0,
                                        fontFamily: "Kodchasan",
                                      ),
                                    ),
                                    height:35,
                                    minWidth:100,
                                    color: Colors.indigo[400],
                                    elevation: 15,
                                    highlightColor: Colors.grey,
                                    splashColor: Colors.blueGrey,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(50),
                                    ),
                                    onPressed: (){
                                      String firstnameAfter= firstnameController.text;
                                      String lastnameAfter= lastnameController.text;
                                      String oldpasswordAfter= oldpasswordController.text;
                                      String newpasswordAfter= newpasswordController.text;
                                      String confirmpasswordAfter= confirmpasswordController.text;
                                      bool Valid= true;
                                      RegExp regExpFirstname= new RegExp(r"^[a-zA-Z ]*$");
                                      RegExp regExpUsername= new RegExp(r"^\S+$");
                                      RegExp regExpEmail= new RegExp(r"^\S+@\S+\.\S+$");
                                      RegExp regExpPhonenumber= new RegExp(r"[0-9]{11}");
                                      RegExp regExpPassword= new RegExp(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&.-])[A-Za-z\d@$!%*#?&.-]{8,15}$");
                                      //First name validations:
                                      if(firstname != firstnameAfter)
                                      {
                                        if(firstnameAfter.isEmpty)
                                          {
                                            Valid = false;
                                            showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return RichAlertDialog(
                                                    alertTitle: richTitle("First name"),
                                                    alertSubtitle: richSubtitle("First name is required"),
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
                                        else if(!regExpFirstname.hasMatch(firstnameAfter))
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("First name"),
                                                  alertSubtitle: richSubtitle("First name has to be letters only"),
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
                                        else if(firstnameAfter.length>15)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("First name"),
                                                  alertSubtitle: richSubtitle("First name is max of 15 characters"),
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
                                      }
                                      //Last name validations:
                                       if(lastname != lastnameAfter && Valid==true)
                                        {
                                          if(lastnameAfter.isEmpty)
                                          {
                                            Valid = false;
                                            showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return RichAlertDialog(
                                                    alertTitle: richTitle("Last name"),
                                                    alertSubtitle: richSubtitle("Last name is required"),
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
                                          else if(!regExpFirstname.hasMatch(lastnameAfter))
                                          {
                                            Valid = false;
                                            showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return RichAlertDialog(
                                                    alertTitle: richTitle("Last name"),
                                                    alertSubtitle: richSubtitle("Last name has to be letters only"),
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
                                          else if(lastnameAfter.length>15)
                                          {
                                            Valid = false;
                                            showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return RichAlertDialog(
                                                    alertTitle: richTitle("Last name"),
                                                    alertSubtitle: richSubtitle("Last name is max of 15 characters"),
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
                                        }
                                      //Old Password validations:
                                       if(oldpasswordAfter.isNotEmpty && Valid==true)
                                      {
                                        if(DBCrypt().checkpw(oldpasswordAfter, password) == false)
                                          {
                                            Valid = false;
                                            showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return RichAlertDialog(
                                                    alertTitle: richTitle("Old password"),
                                                    alertSubtitle: richSubtitle("Old password is incorrect"),
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
                                        else if(newpasswordAfter.isEmpty)
                                          {
                                            Valid = false;
                                            showDialog(
                                                context: context,
                                                builder: (BuildContext context) {
                                                  return RichAlertDialog(
                                                    alertTitle: richTitle("New password"),
                                                    alertSubtitle: richSubtitle("New password is required"),
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
                                        else if(!regExpPassword.hasMatch(newpasswordAfter))
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("New password"),
                                                  alertSubtitle: Text("Password must be minimum eight characters, maximum 15 characters and should include at least one letter, one number and one special character.", textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey[500]),),
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
                                        else if(newpasswordAfter.length<8 || newpasswordAfter.length>15)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("New password"),
                                                  alertSubtitle: richSubtitle("Password must be 8-15 characters"),
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
                                        else if(confirmpasswordAfter.isEmpty)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("Confirm password"),
                                                  alertSubtitle: richSubtitle("Confirm password is required"),
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
                                        else if(confirmpasswordAfter!=newpasswordAfter)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("Password"),
                                                  alertSubtitle: Text("Password & Confirm password don't match", maxLines: 1,textAlign: TextAlign.center,style: TextStyle(fontSize: 13, color: Colors.grey[500]),),
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
                                      }
                                       if(newpasswordAfter.isNotEmpty && Valid==true)
                                      {
                                        if(DBCrypt().checkpw(oldpasswordAfter, password) == false)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("Old password"),
                                                  alertSubtitle: richSubtitle("Old password is incorrect"),
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
                                        else if(newpasswordAfter.isEmpty)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("New password"),
                                                  alertSubtitle: richSubtitle("New password is required"),
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
                                        else if(!regExpPassword.hasMatch(newpasswordAfter))
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("New password"),
                                                  alertSubtitle: Text("Password must be minimum eight characters, maximum 15 characters and should include at least one letter, one number and one special character.", textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey[500]),),
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
                                        else if(newpasswordAfter.length<8 || newpasswordAfter.length>15)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("New password"),
                                                  alertSubtitle: richSubtitle("Password must be 8-15 characters"),
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
                                        else if(confirmpasswordAfter.isEmpty)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("Confirm password"),
                                                  alertSubtitle: richSubtitle("Confirm password is required"),
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
                                        else if(confirmpasswordAfter!=newpasswordAfter)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("Password"),
                                                  alertSubtitle: Text("Password & Confirm password don't match", maxLines: 1,textAlign: TextAlign.center,style: TextStyle(fontSize: 13, color: Colors.grey[500]),),
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
                                      }
                                       if(confirmpasswordAfter.isNotEmpty && Valid==true)
                                      {
                                        if(DBCrypt().checkpw(oldpasswordAfter, password) == false)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("Old password"),
                                                  alertSubtitle: richSubtitle("Old password is incorrect"),
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
                                        else if(newpasswordAfter.isEmpty)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("New password"),
                                                  alertSubtitle: richSubtitle("New password is required"),
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
                                        else if(!regExpPassword.hasMatch(newpasswordAfter))
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("New password"),
                                                  alertSubtitle: Text("Password must be minimum eight characters, maximum 15 characters and should include at least one letter, one number and one special character.", textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey[500]),),
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
                                        else if(newpasswordAfter.length<8 || newpasswordAfter.length>15)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("New password"),
                                                  alertSubtitle: richSubtitle("Password must be 8-15 characters"),
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
                                        else if(confirmpasswordAfter.isEmpty)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("Confirm password"),
                                                  alertSubtitle: richSubtitle("Confirm password is required"),
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
                                        else if(confirmpasswordAfter!=newpasswordAfter)
                                        {
                                          Valid = false;
                                          showDialog(
                                              context: context,
                                              builder: (BuildContext context) {
                                                return RichAlertDialog(
                                                  alertTitle: richTitle("Password"),
                                                  alertSubtitle: Text("Password & Confirm password don't match", maxLines: 1,textAlign: TextAlign.center,style: TextStyle(fontSize: 13, color: Colors.grey[500]),),
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
                                      }
                                      if(Valid==true)
                                      {
                                        String firstnamesend="";
                                        String lastnamesend="";
                                        String oldpasswordsend="";
                                        String newpasswordsend="";
                                        String confirmpasswordsend="";
                                        if(firstname!=firstnameAfter)
                                          {
                                            firstnamesend=firstnameAfter;
                                          }
                                         if(lastname!=lastnameAfter)
                                        {
                                          lastnamesend=lastnameAfter;
                                        }
                                         if(oldpasswordAfter!="")
                                          {
                                            oldpasswordsend=oldpasswordAfter;
                                            newpasswordsend=newpasswordAfter;
                                            confirmpasswordsend=confirmpasswordAfter;
                                          }
                                        Navigator.push(context, AnimatedPageRoute(widget: EditProfile2(firstnamesend, lastnamesend, oldpasswordsend, newpasswordsend, confirmpasswordsend, token)));
                                      }
                                    },
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
              ),
            ),
          ),
        ],
      ),
    );
  }
}
