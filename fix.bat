@echo off

:: Windows script to copy patches into the scripts folder

set "source_patches=.\patches"
set "destination_goofmod=C:\Users\Administrator\AppData\Roaming\GoofCord\scripts"

:: Copy all files from the "patches" folder
xcopy "%source_patches%" "%destination_goofmod%" /E /Y