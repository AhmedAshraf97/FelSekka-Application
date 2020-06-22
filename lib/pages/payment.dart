import 'dart:convert';
import 'package:auto_size_text/auto_size_text.dart';
import 'package:credit_card/credit_card_widget.dart';
import 'package:felsekka/pages/navigation_bloc.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:awesome_card/awesome_card.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart';
import 'package:intl/intl.dart';
import 'package:progress_indicators/progress_indicators.dart';
import 'package:rich_alert/rich_alert.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Payment extends StatefulWidget with NavigationStates{
  @override
  _PaymentState createState() => _PaymentState();
}

class _PaymentState extends State<Payment> {
  String token="";
  int noCard=0;
  String cardNumber = "";
  String cardHolderName = "";
  String expiryDate = "";
  String cvv = "";
  bool showBack = false;
  FocusNode _focusNode;
  TextEditingController cardnumberController = new TextEditingController();
  TextEditingController cardexpiryController = new TextEditingController();
  TextEditingController cvvController = new TextEditingController();
  String addedit="Add card";
  @override
  void initState() {
    super.initState();
    _focusNode = new FocusNode();
    _focusNode.addListener(() {
      setState(() {
        _focusNode.hasFocus ? showBack = true : showBack = false;
      });
    });
    getcard();
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  Future<String> getcard() async{
    SharedPreferences prefs = await SharedPreferences.getInstance();
    token = await (prefs.getString('token')??'');
    String urlUser="http://3.81.22.120:3000/api/retrieveuserdata";
    Response responseUser =await post(urlUser, headers:{'authorization': token});
    if(responseUser.statusCode != 200)
    {
      Map data= jsonDecode(responseUser.body);
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
      Map data= jsonDecode(responseUser.body);
      Map userInfo = data['decoded'];
      setState(() {
        cardHolderName = userInfo['firstname'] + " " + userInfo['lastname'];
      });
    }

    String url="http://3.81.22.120:3000/api/getcreditcardinfo";
    Response response =await post(url, headers:{'authorization': token});
    if(response.statusCode == 400)
    {
      setState(() {
        noCard=1;
        addedit="Add card";
      });
    }
    else if(response.statusCode != 200)
    {
      Map data= jsonDecode(response.body);
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return RichAlertDialog(
              alertTitle: richTitle('User error'),
              alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
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
    else {
      Map data= jsonDecode(response.body);
      setState(() {
        cardnumberController.text=data['data']['cardnumber'];
        cardexpiryController.text=data['data']['expirationdate'];
        cvvController.text=data['data']['cvv'];
        noCard=0;
        addedit="Edit card";
      });
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;
    double screenFont= MediaQuery.of(context).textScaleFactor;
          return Scaffold(
            body: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.center,
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
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(10.0),
                      child: Container(
                          decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.only(topLeft: Radius.circular(30),topRight: Radius.circular(30),bottomLeft:Radius.circular(30),bottomRight: Radius.circular(30) )
                          ),
                          child:
                          SingleChildScrollView(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: <Widget>[
                                SizedBox(
                                  height: 40,
                                ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: <Widget>[
                                    Icon(
                                      Icons.monetization_on,
                                      color:Colors.indigo[400],
                                    ),
                                    SizedBox(width:5,),
                                    Text(
                                      "Add Card",
                                      style: TextStyle(
                                        color: Colors.indigo[400],
                                        fontSize: 20,
                                      ),
                                    )
                                  ],
                                ),
                                Center(
                                  child: Text(
                                    "to offer/ request/ join ride.",
                                    style: TextStyle(
                                      color: Colors.indigo[400],
                                      fontSize: 20,
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  height: 25,
                                ),
                                Center(
                                  child: CreditCard(
                                    height: screenHeight/4,
                                    width: screenWidth/1.2,
                                    cardNumber: cardnumberController.text,
                                    cardExpiry: cardexpiryController.text,
                                    cardHolderName: cardHolderName,
                                    cvv: cvvController.text,
                                    bankName: "Bank",
                                    showBackSide: showBack,
                                    frontBackground: CardBackgrounds.black,
                                    backBackground: CardBackgrounds.white,
                                    showShadow: true,
                                  ),
                                ),
                                SizedBox(
                                  height: 20,
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(10.0),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.start,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(10.0,0,0,3),
                                        child: AutoSizeText(
                                          "Card number:",
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
                                            controller: cardnumberController,
                                            maxLength: 16,
                                            onChanged: (value) {
                                              setState(() {
                                              });
                                            },
                                            inputFormatters: [new WhitelistingTextInputFormatter(RegExp("[0-9]")),],
                                            decoration: InputDecoration(
                                              hintText: "Card number",
                                              hintStyle: TextStyle(color:Colors.grey,fontSize: 12),
                                              counterText: "",
                                              border: InputBorder.none,
                                            ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        height: 15,
                                      ),
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(10.0,0,0,3),
                                        child: AutoSizeText(
                                          "Card expiration date:",
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
                                            controller: cardexpiryController,
                                            maxLength: 5,
                                            onChanged: (value) {
                                              setState(() {
                                              });
                                            },
                                            decoration: InputDecoration(
                                              hintText: "Card expiration date",
                                              hintStyle: TextStyle(color:Colors.grey,fontSize: 12),
                                              counterText: "",
                                              border: InputBorder.none,
                                            ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(height: 15,),
                                      Padding(
                                        padding: const EdgeInsets.fromLTRB(10.0,0,0,3),
                                        child: AutoSizeText(
                                          "CVV:",
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
                                            controller: cvvController,
                                            maxLength: 3,
                                            onChanged: (value) {
                                              setState(() {
                                              });
                                            },
                                            focusNode: _focusNode,
                                            inputFormatters: [new WhitelistingTextInputFormatter(RegExp("[0-9]")),],
                                            decoration: InputDecoration(
                                              hintText: "CVV",
                                              hintStyle: TextStyle(color:Colors.grey,fontSize: 12),
                                              counterText: "",
                                              border: InputBorder.none,
                                            ),
                                          ),
                                        ),
                                      ),
                                      SizedBox(
                                        height: 15,
                                      ),
                                      Center(
                                        child: MaterialButton(
                                          child: Text(addedit,
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
                                            String addCardNumber= cardnumberController.text;
                                            String addCardExpiry= cardexpiryController.text;
                                            String addCVV= cvvController.text;
                                            bool Valid= true;
                                            RegExp regExpCard= new RegExp(r"[0-9]");
                                            //Card number validations:
                                            if(addCardNumber.isEmpty)
                                            {
                                              Valid = false;
                                              showDialog(
                                                  context: context,
                                                  builder: (BuildContext context) {
                                                    return RichAlertDialog(
                                                      alertTitle: richTitle("Card number"),
                                                      alertSubtitle: richSubtitle("Card number is required"),
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
                                            else if(!regExpCard.hasMatch(addCardNumber))
                                            {
                                              Valid = false;
                                              showDialog(
                                                  context: context,
                                                  builder: (BuildContext context) {
                                                    return RichAlertDialog(
                                                      alertTitle: richTitle("Card number"),
                                                      alertSubtitle: richSubtitle("Card number has to be 16 numbers."),
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
                                            else if(addCardNumber.length>16)
                                            {
                                              Valid = false;
                                              showDialog(
                                                  context: context,
                                                  builder: (BuildContext context) {
                                                    return RichAlertDialog(
                                                      alertTitle: richTitle("Card number"),
                                                      alertSubtitle: richSubtitle("Card number is max of 16 numbers"),
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
                                            //Card expiry validations:
                                            else if(addCardExpiry.isEmpty)
                                            {
                                              Valid = false;
                                              showDialog(
                                                  context: context,
                                                  builder: (BuildContext context) {
                                                    return RichAlertDialog(
                                                      alertTitle: richTitle("Card expiration"),
                                                      alertSubtitle: richSubtitle("Card expiration is required"),
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
                                            else if(addCardExpiry.length>15)
                                            {
                                              Valid = false;
                                              showDialog(
                                                  context: context,
                                                  builder: (BuildContext context) {
                                                    return RichAlertDialog(
                                                      alertTitle: richTitle("Card expiration"),
                                                      alertSubtitle: richSubtitle("Card expiration is max of 5 characters"),
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
                                            //CVV validations:
                                            else if(addCVV.isEmpty)
                                            {
                                              Valid = false;
                                              showDialog(
                                                  context: context,
                                                  builder: (BuildContext context) {
                                                    return RichAlertDialog(
                                                      alertTitle: richTitle("CVV"),
                                                      alertSubtitle: richSubtitle("CVV is required"),
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
                                            else if(!regExpCard.hasMatch(addCVV))
                                            {
                                              Valid = false;
                                              showDialog(
                                                  context: context,
                                                  builder: (BuildContext context) {
                                                    return RichAlertDialog(
                                                      alertTitle: richTitle("CVV"),
                                                      alertSubtitle: richSubtitle("CVV has to be 3 numbers"),
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
                                            else if(addCVV.length>3)
                                            {
                                              Valid = false;
                                              showDialog(
                                                  context: context,
                                                  builder: (BuildContext context) {
                                                    return RichAlertDialog(
                                                      alertTitle: richTitle("CVV"),
                                                      alertSubtitle: richSubtitle("CVV is max of 3 numbers"),
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
                                                  'cardnumber': addCardNumber,
                                                  'cvv': addCVV,
                                                  'expirationdate': addCardExpiry,
                                                };
                                                String url="http://3.81.22.120:3000/api/addcreditcardinfo";
                                                Response response =await post(url, headers:{'authorization': token},body: body);
                                                print(response.body);
                                                if(response.statusCode == 400)
                                                {
                                                  Map data= jsonDecode(response.body);
                                                  showDialog(
                                                      context: context,
                                                      builder: (BuildContext context) {
                                                        return RichAlertDialog(
                                                          alertTitle: richTitle(data['error']),
                                                          alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
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
                                                else if(response.statusCode != 200)
                                                {
                                                  Map data= jsonDecode(response.body);
                                                  showDialog(
                                                      context: context,
                                                      builder: (BuildContext context) {
                                                        return RichAlertDialog(
                                                          alertTitle: richTitle('User error'),
                                                          alertSubtitle: Text(data['message'], maxLines: 2, style: TextStyle(color: Colors.grey[500], fontSize: 12),textAlign: TextAlign.center,),
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
                                                else {
                                                  Map data= jsonDecode(response.body);
                                                  noCard==1?
                                                  showDialog(
                                                      context: context,
                                                      builder: (BuildContext context) {
                                                        return RichAlertDialog(
                                                          alertTitle: richTitle("Done"),
                                                          alertSubtitle: richSubtitle("Card is added successfully"),
                                                          alertType: RichAlertType.SUCCESS,
                                                          dialogIcon: Icon(
                                                            Icons.check,
                                                            color: Colors.green,
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
                                                      })
                                                  :
                                                  showDialog(
                                                      context: context,
                                                      builder: (BuildContext context) {
                                                        return RichAlertDialog(
                                                          alertTitle: richTitle("Done"),
                                                          alertSubtitle: richSubtitle("Card is edited successfully"),
                                                          alertType: RichAlertType.SUCCESS,
                                                          dialogIcon: Icon(
                                                            Icons.check,
                                                            color: Colors.green,
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
                                                  setState(() {
                                                  });
                                                }
                                              }
                                              getData();
                                            }
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                )
                              ],
                            ),
                          )
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
  }
}
