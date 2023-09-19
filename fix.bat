@echo off

:: Windows script to copy built goofmod into the scripts folder
:: Also, copy all files from the "./patches" folder to the destination

set "source_goofmod=.\dist\0_goofmod.js"
set "source_patches=.\patches"
set "destination_goofmod=C:\Users\Administrator\AppData\Roaming\GoofCord\scripts"


:: Copy goofmod.js
copy "%source_goofmod%" "%destination_goofmod%"

:: Copy all files from the "patches" folder
xcopy "%source_patches%" "%destination_goofmod%" /E /Y