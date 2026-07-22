!macro customInit
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "Ohlala POS Desktop.exe"'
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "Ohlala POS.exe"'
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "Kitchen App.exe"'
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "ohlala-front.exe"'
  Sleep 1500
!macroend

!macro customInstall
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "Ohlala POS Desktop.exe"'
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "Ohlala POS.exe"'
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "Kitchen App.exe"'
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "ohlala-front.exe"'
  Sleep 1500
!macroend

!macro customUnInstall
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "Ohlala POS Desktop.exe"'
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "Ohlala POS.exe"'
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "Kitchen App.exe"'
  ExecWait '$SYSDIR\taskkill.exe /F /T /IM "ohlala-front.exe"'
  Sleep 1500
!macroend



