@echo off

:: Windows script to copy built goofmod into the scripts folder

set "source=F:\Programming\GoofCord\Mod\dist\goofmod.js"
set "destination=C:\Users\Administrator\AppData\Roaming\GoofCord\scripts"

copy "%source%" "%destination%"