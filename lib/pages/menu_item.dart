import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';

class MenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final Function onTap;

  const MenuItem({Key key, this.icon, this.title, this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16,17,0,0),
        child: Row(
          children: <Widget>[
            Icon(
              icon,
              color: Colors.indigo[400],
              size: 25,
            ),
            SizedBox(
              width: 15,
            ),
            AutoSizeText(
              title,
              minFontSize: 2,
              maxLines: 1,
              style: TextStyle(fontSize: 17, color: Colors.indigo[400]),
            )
          ],
        ),
      ),
    );
  }
}
