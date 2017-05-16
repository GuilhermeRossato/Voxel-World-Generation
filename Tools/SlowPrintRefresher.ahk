Esc::
BreakLoop = 1
return

^y::
BreakLoop = 0
Send #{r}
sleep, 120
sendinput, mspaint
sleep, 120
send, {Return down}
sleep, 60
send, {Return up}
sleep, 900
send, {Alt down}
sleep, 120
send, {Tab down}
sleep, 120
send, {Tab up}
sleep, 120
send, {Alt up}
sleep, 300
if (BreakLoop = 1)
{
	MsgBox, Manual exit7
	Return
}
sleep, 300
if (BreakLoop = 1)
{
	MsgBox, Manual exit8
	Return
}
Loop, 200
{
	if (BreakLoop = 1)
	{
		MsgBox, Manual exit17
		Return
	}
	send, !{PrintScreen}
	sleep, 10
	send, {Alt down}
	sleep, 10
	send, {Tab down}
	sleep, 70
	send, {Tab up}
	sleep, 10
	send, {Alt up}
	sleep, 200
	send, {LCtrl down}
	sleep, 40
	send, {v down}
	sleep, 80
	send, {v up}
	sleep, 120
	send, {LCtrl up}
	sleep, 110
	send, {F12 down}
	sleep, 50
	send, {F12 up}
	sleep, 400
	if (BreakLoop = 1)
	{
		MsgBox, Manual exit10
		Return
	}
	sendinput, i
	sendinput, m
	sendinput, g
	sleep, 10
	sendinput, %A_Index%
	sleep, 40
	send, {NumpadEnter down}{NumpadEnter up}
	WinWaitClose
	if (BreakLoop = 1)
	{
		MsgBox, Manual exit11
		Return
	}
	if ErrorLevel
	{
	  MsgBox, WinWaitClose timed out
	  Return
	}
	sleep, 110
	send, {Alt down}
	sleep, 110
	send, {Tab down}
	sleep, 110
	send, {Tab up}
	sleep, 110
	send, {Alt up}
	sleep, 280
	send, {F5 down}{F5 up}
	sleep, 3000
	if (BreakLoop = 1)
	{
		MsgBox, Manual exit
		Return
	}
}
MsgBox, Finished
Return