#!/bin/sh
echo "Phonegap to Signed APK ---- b@agencys.eu // Benjamin Rathelot\n"
printf "Project dir : "
read DIR
printf "Version: "
read VER
printf "Project key alias : "
read ALIAS
cd $DIR/
cordova build --release android
cd platforms/android/build/outputs/apk/
keytool -genkey -v -keystore my-release-key.keystore -alias $ALIAS -keyalg RSA -keysize 2048 -validity 10000
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore android-release-unsigned.apk $ALIAS
~/Library/Android/sdk/build-tools/24.0.0/zipalign -v 4 android-release-unsigned.apk HappyLeaf-$VER-signed.apk
